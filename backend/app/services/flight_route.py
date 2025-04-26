# app/services/flight_route.py
import numpy as np
from typing import List, Dict, Any
from datetime import datetime, timedelta

class FlightRouteCalculator:
    """Kalkulator trasy lotu z uwzględnieniem zakrzywienia Ziemi i parametrów lotu"""
    
    def __init__(self):
        # Stałe
        self.earth_radius = 6371.0  # km
        self.typical_cruise_speed = 860.0  # km/h (typowa prędkość przelotowa)
        self.typical_cruise_altitude = 10668.0  # m (35,000 stóp)
        self.climb_rate = 5.0  # m/s (typowa prędkość wznoszenia)
        self.descent_rate = 3.0  # m/s (typowa prędkość opadania)
    
    def calculate_route(self, 
                       dep_lat: float, dep_lon: float,
                       arr_lat: float, arr_lon: float,
                       departure_time: datetime,
                       steps: int = 20) -> List[Dict[str, Any]]:
        """
        Oblicza trasę lotu między dwoma punktami z uwzględnieniem faz lotu
        
        Args:
            dep_lat, dep_lon: Współrzędne lotniska wylotu
            arr_lat, arr_lon: Współrzędne lotniska przylotu
            departure_time: Czas wylotu
            steps: Liczba punktów trasy
            
        Returns:
            Lista punktów trasy z pozycją, czasem i wysokością
        """
        # Oblicz odległość lotu po wielkim kole
        distance_km = self._haversine_distance(dep_lat, dep_lon, arr_lat, arr_lon)
        
        # Oblicz całkowity czas lotu
        flight_time_hours = self._estimate_flight_time(distance_km)
        
        # Oblicz czas wznoszenia i opadania
        climb_time_hours = self.typical_cruise_altitude / (self.climb_rate * 3600)
        descent_time_hours = self.typical_cruise_altitude / (self.descent_rate * 3600)
        cruise_time_hours = flight_time_hours - climb_time_hours - descent_time_hours
        
        # Oblicz dystans pokonany podczas wznoszenia i opadania
        climb_distance = (climb_time_hours * self.typical_cruise_speed) / 2  # średnia prędkość podczas wznoszenia
        descent_distance = (descent_time_hours * self.typical_cruise_speed) / 2  # średnia prędkość podczas opadania
        cruise_distance = distance_km - climb_distance - descent_distance
        
        # Generuj punkty trasy
        route_points = []
        
        for i in range(steps + 1):
            fraction = i / steps
            time_elapsed = flight_time_hours * fraction
            current_time = departure_time + timedelta(hours=time_elapsed)
            
            # Określ fazę lotu
            if time_elapsed <= climb_time_hours:
                # Faza wznoszenia
                phase_fraction = time_elapsed / climb_time_hours
                altitude = self.typical_cruise_altitude * phase_fraction
                distance_fraction = (climb_distance / distance_km) * phase_fraction
            elif time_elapsed >= flight_time_hours - descent_time_hours:
                # Faza opadania
                phase_fraction = (time_elapsed - (flight_time_hours - descent_time_hours)) / descent_time_hours
                altitude = self.typical_cruise_altitude * (1 - phase_fraction)
                cruise_distance_fraction = cruise_distance / distance_km
                climb_distance_fraction = climb_distance / distance_km
                distance_fraction = climb_distance_fraction + cruise_distance_fraction + \
                                   (descent_distance / distance_km) * phase_fraction
            else:
                # Faza przelotowa
                altitude = self.typical_cruise_altitude
                cruise_phase_fraction = (time_elapsed - climb_time_hours) / cruise_time_hours
                climb_distance_fraction = climb_distance / distance_km
                distance_fraction = climb_distance_fraction + (cruise_distance / distance_km) * cruise_phase_fraction
            
            # Oblicz pozycję na trasie
            position = self._intermediate_point(
                dep_lat, dep_lon, 
                arr_lat, arr_lon,
                distance_fraction
            )
            
            route_points.append({
                "lat": position["lat"],
                "lon": position["lon"],
                "alt": altitude,
                "time": current_time,
                "time_fraction": fraction,
                "total_duration_hours": flight_time_hours
            })
        
        return route_points
    
    def _haversine_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Oblicza odległość po wielkim kole między dwoma punktami (w km)
        """
        # Konwersja do radianów
        lat1_rad = np.radians(lat1)
        lon1_rad = np.radians(lon1)
        lat2_rad = np.radians(lat2)
        lon2_rad = np.radians(lon2)
        
        # Różnice
        dlat = lat2_rad - lat1_rad
        dlon = lon2_rad - lon1_rad
        
        # Wzór haversine
        a = np.sin(dlat/2)**2 + np.cos(lat1_rad) * np.cos(lat2_rad) * np.sin(dlon/2)**2
        c = 2 * np.arcsin(np.sqrt(a))
        
        return self.earth_radius * c
    
    def _estimate_flight_time(self, distance_km: float) -> float:
        """
        Szacuje czas lotu na podstawie odległości
        
        Args:
            distance_km: Odległość w kilometrach
            
        Returns:
            Szacowany czas lotu w godzinach
        """
        # Dodajemy stały czas na operacje naziemne (kołowanie itp.)
        ground_operations_time = 0.5  # godziny
        
        # Czas lotu = odległość / prędkość
        cruise_time = distance_km / self.typical_cruise_speed
        
        # Całkowity czas
        return cruise_time + ground_operations_time
    
    def _intermediate_point(self, lat1: float, lon1: float, 
                           lat2: float, lon2: float, 
                           fraction: float) -> Dict[str, float]:
        """
        Oblicza punkt pośredni na trasie po wielkim kole
        
        Args:
            lat1, lon1: Współrzędne punktu początkowego
            lat2, lon2: Współrzędne punktu końcowego
            fraction: Ułamek odległości (0.0 do 1.0)
            
        Returns:
            Słownik z szerokością i długością geograficzną punktu pośredniego
        """
        # Konwersja do radianów
        lat1_rad = np.radians(lat1)
        lon1_rad = np.radians(lon1)
        lat2_rad = np.radians(lat2)
        lon2_rad = np.radians(lon2)
        
        # Obliczenie odległości kątowej
        d = np.arccos(
            np.sin(lat1_rad) * np.sin(lat2_rad) + 
            np.cos(lat1_rad) * np.cos(lat2_rad) * np.cos(lon1_rad - lon2_rad)
        )
        
        # Współczynniki
        a = np.sin((1 - fraction) * d) / np.sin(d)
        b = np.sin(fraction * d) / np.sin(d)
        
        # Obliczanie współrzędnych punktu pośredniego
        x = a * np.cos(lat1_rad) * np.cos(lon1_rad) + b * np.cos(lat2_rad) * np.cos(lon2_rad)
        y = a * np.cos(lat1_rad) * np.sin(lon1_rad) + b * np.cos(lat2_rad) * np.sin(lon2_rad)
        z = a * np.sin(lat1_rad) + b * np.sin(lat2_rad)
        
        # Konwersja z powrotem do współrzędnych geograficznych
        lat = np.degrees(np.arctan2(z, np.sqrt(x**2 + y**2)))
        lon = np.degrees(np.arctan2(y, x))
        
        return {"lat": lat, "lon": lon}