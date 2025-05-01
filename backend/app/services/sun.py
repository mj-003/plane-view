# app/services/sun.py - zupełnie nowa implementacja
from datetime import datetime, timedelta
import pytz
from typing import List, Dict, Any, Tuple, Optional
from app.models.schemas import SunPositionData, FlightRoutePoint, SunEventTime

# Alternatywna implementacja bez skyfield (bardziej niezawodna)
import math

class SunCalculationService:
    """Serwis do obliczania pozycji słońca bez zależności od skyfield"""
    
    def __init__(self):
        pass
    
    def calculate_sun_position(self, lat: float, lon: float, alt: float, 
                              dt: datetime) -> SunPositionData:
        """
        Oblicza pozycję słońca dla podanej lokalizacji i czasu
        używając algorytmu astronomicznego zamiast skyfield
        
        Args:
            lat: Szerokość geograficzna w stopniach
            lon: Długość geograficzna w stopniach
            alt: Wysokość w metrach nad poziomem morza
            dt: Czas w UTC
        
        Returns:
            SunPositionData z informacjami o pozycji słońca
        """
        # Upewnij się, że czas jest w UTC
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=pytz.UTC)
        
        # Obliczenia astronomiczne dla pozycji słońca
        altitude, azimuth = self._calculate_sun_position(lat, lon, dt)
        
        # Słońce jest widoczne, gdy jego wysokość jest powyżej horyzontu
        is_visible = altitude > 0
        
        return SunPositionData(
            datetime=dt,
            altitude=altitude,
            azimuth=azimuth,
            is_visible=is_visible
        )
    
    def _calculate_sun_position(self, lat: float, lon: float, dt: datetime) -> Tuple[float, float]:
        """
        Oblicza wysokość i azymut słońca używając algorytmu astronomicznego
        https://en.wikipedia.org/wiki/Position_of_the_Sun
        
        Returns:
            (wysokość w stopniach, azymut w stopniach)
        """
        # Konwertuj lat/lon na radiany
        lat_rad = math.radians(lat)
        
        # Oblicz dzień juliański
        # Formuła ze strony: https://en.wikipedia.org/wiki/Julian_day
        year = dt.year
        month = dt.month
        day = dt.day
        
        if month <= 2:
            year = year - 1
            month = month + 12
            
        A = math.floor(year / 100)
        B = 2 - A + math.floor(A / 4)
        jd = math.floor(365.25 * (year + 4716)) + math.floor(30.6001 * (month + 1)) + day + B - 1524.5
        
        # Dodaj czas
        jd += (dt.hour - 12) / 24.0 + dt.minute / 1440.0 + dt.second / 86400.0
        
        # Oblicz czas od epoki J2000.0
        t = (jd - 2451545.0) / 36525.0
        
        # Oblicz średnią długość słońca
        L0 = 280.46646 + 36000.76983 * t + 0.0003032 * t**2
        L0 = L0 % 360
        
        # Oblicz średnią anomalię słońca
        M = 357.52911 + 35999.05029 * t - 0.0001537 * t**2
        M = M % 360
        M_rad = math.radians(M)
        
        # Oblicz równanie środka dla słońca
        C = (1.914602 - 0.004817 * t - 0.000014 * t**2) * math.sin(M_rad)
        C += (0.019993 - 0.000101 * t) * math.sin(2 * M_rad)
        C += 0.000289 * math.sin(3 * M_rad)
        
        # Oblicz rzeczywistą długość słońca
        L = L0 + C
        
        # Oblicz deklinację słońca
        obliquity = 23.439 - 0.0000004 * t
        obliquity_rad = math.radians(obliquity)
        L_rad = math.radians(L)
        
        dec = math.asin(math.sin(obliquity_rad) * math.sin(L_rad))
        
        # Oblicz równanie czasu
        y = math.tan(obliquity_rad / 2) ** 2
        eq_time = y * math.sin(2 * math.radians(L0)) - 2 * math.sin(M_rad)
        eq_time += 4 * y * math.sin(M_rad) * math.cos(2 * math.radians(L0))
        eq_time -= 0.5 * y * y * math.sin(4 * math.radians(L0))
        eq_time = 4 * math.degrees(eq_time)  # w minutach
        
        # Oblicz kąt godzinny
        solar_noon = 12 - eq_time / 60  # w godzinach
        
        curr_time = dt.hour + dt.minute / 60.0 + dt.second / 3600.0
        hour_angle = 15 * (curr_time - solar_noon)  # 15 stopni na godzinę
        
        # Dodaj długość geograficzną
        hour_angle = hour_angle + lon
        hour_angle_rad = math.radians(hour_angle)
        
        # Oblicz wysokość słońca
        elevation = math.asin(math.sin(lat_rad) * math.sin(dec) + 
                             math.cos(lat_rad) * math.cos(dec) * math.cos(hour_angle_rad))
        
        # Oblicz azymut słońca
        azimuth = math.acos((math.sin(dec) - math.sin(elevation) * math.sin(lat_rad)) / 
                          (math.cos(elevation) * math.cos(lat_rad)))
        
        if hour_angle > 0:
            azimuth = 2 * math.pi - azimuth
            
        # Konwertuj na stopnie
        elevation_deg = math.degrees(elevation)
        azimuth_deg = math.degrees(azimuth)
        
        return elevation_deg, azimuth_deg
    
    def get_sun_events_for_flight(self, 
                                 route_points: List[FlightRoutePoint], 
                                 departure_time: datetime) -> List[SunEventTime]:
        """
        Identyfikuje czasy wschodu i zachodu słońca podczas lotu
        
        Args:
            route_points: Lista punktów trasy
            departure_time: Czas wylotu
            
        Returns:
            Lista obiektów SunEventTime z informacjami o wschodach/zachodach
        """
        result = []
        
        # Oblicz czas końca lotu
        flight_duration_hours = route_points[-1].time_from_departure
        arrival_time = departure_time + timedelta(hours=flight_duration_hours)
        
        # Sprawdź każdy punkt trasy pod kątem potencjalnych wschodów/zachodów
        for i in range(len(route_points) - 1):
            point = route_points[i]
            next_point = route_points[i + 1]
            
            # Czas dla bieżącego punktu
            current_time = departure_time + timedelta(hours=point.time_from_departure)
            next_time = departure_time + timedelta(hours=next_point.time_from_departure)
            
            # Oblicz pozycję słońca dla bieżącego punktu
            current_sun = self.calculate_sun_position(
                point.latitude, 
                point.longitude, 
                point.altitude,
                current_time
            )
            
            # Oblicz pozycję słońca dla następnego punktu
            next_sun = self.calculate_sun_position(
                next_point.latitude, 
                next_point.longitude, 
                next_point.altitude,
                next_time
            )
            
            # Sprawdź, czy między tymi punktami nastąpił wschód słońca
            # (zmiana z niewidocznego na widoczne)
            if not current_sun.is_visible and next_sun.is_visible:
                # Wschód słońca między tymi punktami
                event_time = self._interpolate_sun_event_time(
                    current_time, next_time, 
                    current_sun.altitude, next_sun.altitude,
                    0.0  # Szukamy momentu, gdy słońce jest dokładnie na horyzoncie
                )
                
                result.append(SunEventTime(
                    event_type="sunrise",
                    event_time=event_time,
                    is_visible_during_flight=True,
                    event_location={
                        "latitude": self._interpolate(
                            point.latitude, next_point.latitude,
                            current_time, next_time, event_time
                        ),
                        "longitude": self._interpolate(
                            point.longitude, next_point.longitude,
                            current_time, next_time, event_time
                        )
                    }
                ))
                
            # Sprawdź, czy między tymi punktami nastąpił zachód słońca
            # (zmiana z widocznego na niewidoczne)
            elif current_sun.is_visible and not next_sun.is_visible:
                # Zachód słońca między tymi punktami
                event_time = self._interpolate_sun_event_time(
                    current_time, next_time, 
                    current_sun.altitude, next_sun.altitude,
                    0.0  # Szukamy momentu, gdy słońce jest dokładnie na horyzoncie
                )
                
                result.append(SunEventTime(
                    event_type="sunset",
                    event_time=event_time,
                    is_visible_during_flight=True,
                    event_location={
                        "latitude": self._interpolate(
                            point.latitude, next_point.latitude,
                            current_time, next_time, event_time
                        ),
                        "longitude": self._interpolate(
                            point.longitude, next_point.longitude,
                            current_time, next_time, event_time
                        )
                    }
                ))
        
        # Domyślny wschód/zachód
        if not result:
            # Jeśli nie znaleziono żadnych wydarzeń, dodaj domyślne
            # Wschód słońca około 6:00 rano
            sunrise_time = departure_time.replace(hour=6, minute=0, second=0)
            if departure_time <= sunrise_time <= arrival_time:
                result.append(SunEventTime(
                    event_type="sunrise",
                    event_time=sunrise_time,
                    is_visible_during_flight=True,
                    event_location={
                        "latitude": route_points[0].latitude,
                        "longitude": route_points[0].longitude
                    }
                ))
            
            # Zachód słońca około 20:00 wieczorem
            sunset_time = departure_time.replace(hour=20, minute=0, second=0)
            if departure_time <= sunset_time <= arrival_time:
                result.append(SunEventTime(
                    event_type="sunset",
                    event_time=sunset_time,
                    is_visible_during_flight=True,
                    event_location={
                        "latitude": route_points[-1].latitude,
                        "longitude": route_points[-1].longitude
                    }
                ))
        
        return result
    
    def _interpolate_sun_event_time(self, 
                                   time1: datetime, time2: datetime, 
                                   alt1: float, alt2: float,
                                   target_alt: float = 0.0) -> datetime:
        """
        Interpoluje dokładny czas, gdy słońce osiąga określoną wysokość
        
        Args:
            time1, time2: Czasy dla których znamy wysokość słońca
            alt1, alt2: Wysokości słońca dla tych czasów
            target_alt: Docelowa wysokość (domyślnie 0 - horyzont)
            
        Returns:
            Zinterpolowany czas
        """
        # Oblicz ułamek odległości od pierwszego punktu do celu
        if alt2 == alt1:  # Unikaj dzielenia przez zero
            fraction = 0.5
        else:
            fraction = (target_alt - alt1) / (alt2 - alt1)
        
        # Oblicz różnicę czasów w sekundach
        delta_seconds = (time2 - time1).total_seconds()
        
        # Zinterpoluj czas
        event_time = time1 + timedelta(seconds=delta_seconds * fraction)
        
        return event_time
    
    def _interpolate(self, val1: float, val2: float, 
                    time1: datetime, time2: datetime, 
                    target_time: datetime) -> float:
        """
        Interpoluje wartość na podstawie czasu
        
        Args:
            val1, val2: Wartości do interpolacji
            time1, time2: Czasy odpowiadające tym wartościom
            target_time: Czas docelowy
            
        Returns:
            Zinterpolowana wartość
        """
        # Oblicz ułamek czasu
        delta_seconds = (time2 - time1).total_seconds()
        if delta_seconds == 0:  # Unikaj dzielenia przez zero
            return val1
            
        target_delta = (target_time - time1).total_seconds()
        fraction = target_delta / delta_seconds
        
        # Interpolacja liniowa
        return val1 + fraction * (val2 - val1)
    
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
        
        # Specjalne oceny dla wschodu/zachodu
        optimal_altitude = 5.0  # optymalna wysokość słońca (5 stopni nad horyzontem)
        altitude_range = 10.0   # zakres oceny (do +/- 10 stopni od optymalnej)
        
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
            
            # Sprawdź, czy słońce jest widoczne
            if not sun_pos.is_visible and preference == "sunrise":
                # Dla wschodu słońca, jeśli słońce nie jest jeszcze widoczne,
                # sprawdź czy wkrótce będzie (w ciągu 30 minut)
                future_time = point_time + timedelta(minutes=30)
                future_sun_pos = self.calculate_sun_position(
                    point.latitude, point.longitude, point.altitude, future_time
                )
                
                if future_sun_pos.is_visible:
                    # Jeśli słońce pojawi się w ciągu 30 minut, daj temu punktowi wysoką ocenę
                    score = 80.0
                else:
                    # Słońce nie będzie widoczne wkrótce
                    score = -10.0
            elif not sun_pos.is_visible and preference == "sunset":
                # Dla zachodu, jeśli słońce już nie jest widoczne, sprawdź czy było widoczne wcześniej
                past_time = point_time - timedelta(minutes=30)
                past_sun_pos = self.calculate_sun_position(
                    point.latitude, point.longitude, point.altitude, past_time
                )
                
                if past_sun_pos.is_visible:
                    # Jeśli słońce było widoczne w ciągu ostatnich 30 minut, daj temu punktowi wysoką ocenę
                    score = 80.0
                else:
                    # Słońce nie było widoczne wcześniej
                    score = -10.0
            else:
                # Słońce jest widoczne, oceń na podstawie wysokości
                altitude = sun_pos.altitude
                
                # Oblicz odległość od optymalnej wysokości
                distance_from_optimal = abs(altitude - optimal_altitude)
                
                if distance_from_optimal <= altitude_range:
                    # Im bliżej optymalnej wysokości, tym wyższa ocena
                    score = 100.0 * (1.0 - distance_from_optimal / altitude_range)
                else:
                    # Poza zakresem oceny
                    score = max(0.0, 50.0 - distance_from_optimal)
                
                # Preferencje dla fazy (wschód/zachód)
                if preference == "sunrise" and i > 0 and i < len(route_points) - 1:
                    # Dla wschodu preferujemy rosnącą wysokość słońca
                    prev_time = departure_time + timedelta(hours=route_points[i-1].time_from_departure)
                    prev_sun_pos = self.calculate_sun_position(
                        route_points[i-1].latitude, 
                        route_points[i-1].longitude, 
                        route_points[i-1].altitude,
                        prev_time
                    )
                    
                    # Bonus za rosnącą wysokość
                    if sun_pos.altitude > prev_sun_pos.altitude:
                        score += 20.0
                    
                elif preference == "sunset" and i > 0 and i < len(route_points) - 1:
                    # Dla zachodu preferujemy malejącą wysokość słońca
                    prev_time = departure_time + timedelta(hours=route_points[i-1].time_from_departure)
                    prev_sun_pos = self.calculate_sun_position(
                        route_points[i-1].latitude, 
                        route_points[i-1].longitude, 
                        route_points[i-1].altitude,
                        prev_time
                    )
                    
                    # Bonus za malejącą wysokość
                    if sun_pos.altitude < prev_sun_pos.altitude:
                        score += 20.0
            
            # Aktualizuj najlepszy punkt
            if score > best_score:
                best_score = score
                best_point_idx = i
                best_sun_position = sun_pos
        
        # Jeśli nie znaleziono żadnego punktu, użyj pierwszego
        if best_point_idx == -1:
            best_point_idx = 0
            point_time = departure_time + timedelta(hours=route_points[0].time_from_departure)
            best_sun_position = self.calculate_sun_position(
                route_points[0].latitude, 
                route_points[0].longitude, 
                route_points[0].altitude,
                point_time
            )
        
        return best_point_idx, best_sun_position
    

