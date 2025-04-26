# app/services/astronomy.py
from datetime import datetime
from typing import Dict, Any, Optional
from skyfield.api import load, wgs84, utc
import numpy as np

class AstronomyService:
    """Serwis do obliczeń astronomicznych związanych z pozycją słońca"""
    
    def __init__(self):
        # Załadowanie danych astronomicznych (wykonywane raz podczas inicjalizacji)
        self.ts = load.timescale()
        self.eph = load('de421.bsp')
        self.sun = self.eph['sun']
        self.earth = self.eph['earth']
    
    def sun_position(self, 
                    latitude: float, 
                    longitude: float, 
                    altitude_m: float, 
                    time_utc: datetime) -> Dict[str, Any]:
        """
        Oblicza pozycję słońca (azymut i wysokość) dla określonej lokalizacji i czasu.
        
        Args:
            latitude: Szerokość geograficzna w stopniach
            longitude: Długość geograficzna w stopniach
            altitude_m: Wysokość w metrach nad poziomem morza
            time_utc: Czas obserwacji (zostanie przekonwertowany na UTC jeśli brak strefy)
            
        Returns:
            Słownik zawierający informacje o pozycji słońca
        """
        try:
            # Upewnij się, że czas ma przypisaną strefę czasową UTC
            if time_utc.tzinfo is None:
                time_utc = time_utc.replace(tzinfo=utc)
            
            # Konwersja czasu do formatu Skyfield
            t = self.ts.from_datetime(time_utc)
            
            # Utworzenie lokalizacji na Ziemi
            location = wgs84.latlon(latitude, longitude, elevation_m=altitude_m)
            
            # Kluczowa poprawka: Najpierw tworzenie obiektu topocentric (od Ziemi i lokalizacji)
            topos = self.earth + location
            
            # Obserwacja słońca z wybranej lokalizacji
            astrometric = topos.at(t).observe(self.sun)
            alt, az, distance = astrometric.apparent().altaz()
            
            # Konwersja wartości NumPy na standardowe typy Pythona
            altitude_deg = float(alt.degrees)
            azimuth_deg = float(az.degrees)
            distance_km = float(distance.km)
            
            # Obliczenie oceny optymalności widoku
            optimality = self._calculate_optimality(altitude_deg)
            
            # Zwróć słownik z danymi (wszystkie wartości jako standardowe typy Pythona)
            return {
                "azimuth": azimuth_deg,
                "altitude": altitude_deg,
                "distance_km": distance_km,
                "visible": bool(altitude_deg > 0),  # Konwersja na standardowy bool
                "optimality_score": optimality
            }
            
        except Exception as e:
            # Logowanie błędu (w produkcji użylibyśmy właściwego loggera)
            print(f"Błąd podczas obliczania pozycji słońca: {str(e)}")
            # Informacja zwrotna o błędzie
            return {
                "error": str(e),
                "error_type": str(type(e))
            }
    
    def _calculate_optimality(self, altitude: float) -> float:
        """
        Oblicza ocenę optymalności widoku dla danej wysokości słońca nad horyzontem.
        
        Najwyższa ocena (100) jest przyznawana, gdy słońce jest około 5 stopni nad horyzontem,
        co jest idealne dla obserwacji wschodu lub zachodu.
        
        Args:
            altitude: Wysokość słońca w stopniach
            
        Returns:
            Ocena w skali 0-100
        """
        if altitude < 0:
            # Słońce jest pod horyzontem
            return 0.0
        
        if 2 <= altitude <= 10:
            # Optymalna wysokość dla wschodu/zachodu
            # Im bliżej 5 stopni, tym lepiej
            return 100.0 - abs(altitude - 5.0) * 5.0
        
        if 0 <= altitude < 2:
            # Tuż nad horyzontem - dobry widok, ale nie idealny
            return 70.0 + altitude * 10.0
        
        # Słońce zbyt wysoko - im wyżej, tym gorzej
        return max(0.0, 70.0 - ((altitude - 10.0) * 2.0))
    
    def find_best_sun_view(self, 
                         route_points: list, 
                         departure_time: datetime, 
                         preference: str) -> Optional[Dict[str, Any]]:
        """
        Znajduje najlepszy moment i pozycję do obserwacji wschodu/zachodu słońca
        wzdłuż trasy lotu.
        
        Args:
            route_points: Lista punktów trasy (każdy punkt to słownik z lat, lon, alt, time_fraction)
            departure_time: Czas wylotu
            preference: "sunrise" lub "sunset"
            
        Returns:
            Słownik z najlepszym punktem i informacjami o pozycji słońca lub None w przypadku błędu
        """
        try:
            best_idx = -1
            best_score = -1.0
            best_sun_pos = None
            
            # Sprawdź każdy punkt trasy
            for i, point in enumerate(route_points):
                # Oblicz czas dla tego punktu trasy
                time_fraction = point.get("time_fraction", 0)
                duration_hours = point.get("duration_hours", 0)
                point_time = departure_time + datetime.timedelta(hours=time_fraction * duration_hours)
                
                # Oblicz pozycję słońca dla tego punktu
                sun_pos = self.sun_position(
                    latitude=point.get("lat", 0),
                    longitude=point.get("lon", 0),
                    altitude_m=point.get("alt", 10000),
                    time_utc=point_time
                )
                
                # Oceń ten punkt pod kątem preferencji
                score = sun_pos["optimality_score"]
                
                # Dodatkowo modyfikuj ocenę w zależności od preferencji (wschód/zachód)
                if preference == "sunrise" and i > 0 and i < len(route_points) - 1:
                    # Dla wschodu słońca preferujemy rosnącą wysokość
                    prev_alt = self.sun_position(
                        route_points[i-1].get("lat", 0),
                        route_points[i-1].get("lon", 0),
                        route_points[i-1].get("alt", 10000),
                        departure_time + datetime.timedelta(hours=route_points[i-1].get("time_fraction", 0) * duration_hours)
                    ).get("altitude", 0)
                    
                    next_alt = self.sun_position(
                        route_points[i+1].get("lat", 0),
                        route_points[i+1].get("lon", 0),
                        route_points[i+1].get("alt", 10000),
                        departure_time + datetime.timedelta(hours=route_points[i+1].get("time_fraction", 0) * duration_hours)
                    ).get("altitude", 0)
                    
                    # Bonus za rosnącą wysokość słońca (wschód)
                    if next_alt > sun_pos["altitude"] > prev_alt:
                        score += 20
                
                elif preference == "sunset" and i > 0 and i < len(route_points) - 1:
                    # Dla zachodu słońca preferujemy malejącą wysokość
                    prev_alt = self.sun_position(
                        route_points[i-1].get("lat", 0),
                        route_points[i-1].get("lon", 0),
                        route_points[i-1].get("alt", 10000),
                        departure_time + datetime.timedelta(hours=route_points[i-1].get("time_fraction", 0) * duration_hours)
                    ).get("altitude", 0)
                    
                    next_alt = self.sun_position(
                        route_points[i+1].get("lat", 0),
                        route_points[i+1].get("lon", 0),
                        route_points[i+1].get("alt", 10000),
                        departure_time + datetime.timedelta(hours=route_points[i+1].get("time_fraction", 0) * duration_hours)
                    ).get("altitude", 0)
                    
                    # Bonus za malejącą wysokość słońca (zachód)
                    if next_alt < sun_pos["altitude"] < prev_alt:
                        score += 20
                
                # Aktualizuj najlepszy punkt, jeśli znaleziono lepszy
                if score > best_score:
                    best_score = score
                    best_idx = i
                    best_sun_pos = sun_pos
            
            if best_idx >= 0:
                return {
                    "point_index": best_idx,
                    "route_point": route_points[best_idx],
                    "sun_position": best_sun_pos,
                    "score": best_score
                }
            else:
                return None
                
        except Exception as e:
            # Logowanie błędu
            print(f"Błąd podczas wyszukiwania najlepszego widoku: {str(e)}")
            return None