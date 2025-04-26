# app/services/sun.py
from datetime import datetime, timedelta
import pytz
from typing import List, Dict, Any, Tuple
from skyfield.api import load, wgs84, EarthSatellite
from skyfield.timelib import Time
from app.models.schemas import SunPositionData, FlightRoutePoint

class SunCalculationService:
    """Serwis do obliczania pozycji słońca w określonym miejscu i czasie"""
    
    def __init__(self):
        # Załaduj efemerydę słońca
        self.eph = load('de421.bsp')
        self.sun = self.eph['sun']
        self.earth = self.eph['earth']
        self.ts = load.timescale()
    
    def calculate_sun_position(self, lat: float, lon: float, alt: float, 
                              dt: datetime) -> SunPositionData:
        """
        Oblicza pozycję słońca dla podanej lokalizacji i czasu
        
        Args:
            lat: Szerokość geograficzna w stopniach
            lon: Długość geograficzna w stopniach
            alt: Wysokość w metrach nad poziomem morza
            dt: Czas w UTC
        
        Returns:
            SunPositionData z informacjami o pozycji słońca
        """
        # Konwersja na skalę czasu Skyfield
        t = self.ts.from_datetime(dt.replace(tzinfo=pytz.UTC))
        
        # Lokalizacja obserwatora
        location = wgs84.latlon(lat, lon, elevation_m=alt)
        
        # Poprawne utworzenie obserwatora - to była przyczyna błędu
        topos = self.earth + location
        
        # Obliczenie pozycji słońca
        astrometric = topos.at(t).observe(self.sun)
        alt, az, _ = astrometric.apparent().altaz()
        
        # Sprawdzenie, czy słońce jest widoczne (powyżej horyzontu)
        is_visible = alt.degrees > 0
        
        return SunPositionData(
            datetime=dt,
            altitude=alt.degrees,
            azimuth=az.degrees,
            is_visible=is_visible
        )
    
    def find_sun_events(self, route_points: List[FlightRoutePoint], 
                        departure_time: datetime,
                        preference: str) -> Tuple[int, SunPositionData]:
        """
        Znajduje najlepszy moment dla obserwacji wschodu/zachodu słońca
        podczas lotu
        
        Args:
            route_points: Lista punktów trasy lotu
            departure_time: Czas wylotu
            preference: "sunrise" lub "sunset"
        
        Returns:
            Indeks najlepszego punktu i dane pozycji słońca
        """
        best_point_idx = -1
        best_score = -float('inf')
        best_sun_position = None
        
        for i, point in enumerate(route_points):
            # Oblicz czas dla tego punktu trasy
            point_time = departure_time + timedelta(hours=point.time_from_departure)
            
            # Oblicz pozycję słońca
            sun_pos = self.calculate_sun_position(
                point.latitude, 
                point.longitude, 
                point.altitude,
                point_time
            )
            
            # Oblicz ocenę punktu (w zależności od preferencji)
            score = self._calculate_score(sun_pos, preference)
            
            if score > best_score:
                best_score = score
                best_point_idx = i
                best_sun_position = sun_pos
        
        return best_point_idx, best_sun_position
    
    def _calculate_score(self, sun_pos: SunPositionData, preference: str) -> float:
        """
        Oblicza ocenę jakości widoku dla danej pozycji słońca
        
        Wyższa ocena oznacza lepszy moment na obserwację wschodu/zachodu
        """
        altitude = sun_pos.altitude
        
        if preference == "sunrise":
            # Idealny wschód: słońce 2-5 stopni nad horyzontem
            if 0 <= altitude <= 8:
                # Im bliżej 4 stopni, tym lepiej
                return 100 - abs(altitude - 4) * 10
            return max(0, 50 - abs(altitude - 4) * 5)
        
        else:  # sunset
            # Idealny zachód: słońce 2-5 stopni nad horyzontem
            if 0 <= altitude <= 8:
                # Im bliżej 4 stopni, tym lepiej
                return 100 - abs(altitude - 4) * 10
            return max(0, 50 - abs(altitude - 4) * 5)