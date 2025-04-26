# app/services/flight.py
from datetime import datetime, timedelta
import numpy as np
from typing import List, Dict, Any, Tuple, Optional
from app.models.schemas import (
    FlightRequest, FlightResponse, FlightRoutePoint,
    SeatRecommendation, AirportBase, AirlineBase
)
from app.services.airport import AirportService
from app.services.sun import SunCalculationService

class FlightRouteService:
    """Serwis do obliczania trasy lotu i rekomendacji miejsc"""
    
    def __init__(self):
        self.sun_service = SunCalculationService()
        # Możesz dodać więcej usług, np. do pobierania danych o samolotach
    
    def calculate_flight_route(self, 
                              departure: AirportBase,
                              arrival: AirportBase,
                              steps: int = 20) -> List[FlightRoutePoint]:
        """
        Oblicza punkty trasy lotu między dwoma lotniskami
        
        W rzeczywistej aplikacji użyłbyś faktycznych danych
        o trasach lotniczych, uwzględniając korytarze powietrzne.
        To jest uproszczona wersja.
        """
        # Oblicz przybliżony czas lotu
        flight_duration = self._calculate_duration(departure, arrival)
        
        # Generuj punkty trasy
        route_points = []
        
        for i in range(steps + 1):
            fraction = i / steps
            
            # Interpolacja liniowa (uproszczenie)
            lat = departure.latitude + fraction * (arrival.latitude - departure.latitude)
            lon = departure.longitude + fraction * (arrival.longitude - departure.longitude)
            
            # Wysokość lotu (uproszczenie: wznoszenie, przelot, schodzenie)
            if fraction < 0.15:
                # Wznoszenie do 10 km
                altitude = fraction * 10000 / 0.15
            elif fraction > 0.85:
                # Schodzenie z 10 km
                altitude = 10000 * (1 - (fraction - 0.85) / 0.15)
            else:
                # Przelot na wysokości 10 km
                altitude = 10000
            
            # Czas od startu
            time_elapsed = fraction * flight_duration
            
            route_points.append(FlightRoutePoint(
                latitude=lat,
                longitude=lon,
                altitude=altitude,
                time_from_departure=time_elapsed
            ))
        
        return route_points
    
    def _calculate_duration(self, departure: AirportBase, arrival: AirportBase) -> float:
        """
        Oblicza przybliżony czas lotu na podstawie odległości między lotniskami
        
        Returns:
            Czas lotu w godzinach
        """
        # Oblicz odległość między lotniskami (wzór haversine)
        lat1, lon1 = np.radians(departure.latitude), np.radians(departure.longitude)
        lat2, lon2 = np.radians(arrival.latitude), np.radians(arrival.longitude)
        
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = np.sin(dlat/2)**2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon/2)**2
        c = 2 * np.arcsin(np.sqrt(a))
        distance_km = 6371 * c  # Promień Ziemi * c
        
        # Przybliżony czas lotu na podstawie odległości
        # Uproszczenie: faza startu/lądowania + prędkość przelotowa
        cruise_speed = 800  # km/h
        taxi_time = 0.5  # godziny (30 minut na start/lądowanie)
        
        flight_hours = distance_km / cruise_speed + taxi_time
        return flight_hours
    
    def get_seat_recommendation(self, request: FlightRequest) -> FlightResponse:
        """
        Główna metoda do generowania rekomendacji miejsc
        
        Returns:
            FlightResponse z rekomendacją najlepszego miejsca
        """
        # Pobierz informacje o lotniskach
        departure_airport = AirportService.get_airport(request.departure_airport)
        arrival_airport = AirportService.get_airport(request.arrival_airport)
        
        if not departure_airport or not arrival_airport:
            raise ValueError("Nieprawidłowe lotnisko wylotu lub przylotu")
        
        # Stwórz datetime z daty i czasu
        departure_time = datetime.combine(
            request.departure_date, 
            request.departure_time
        )
        
        # Oblicz trasę lotu
        route_points = self.calculate_flight_route(departure_airport, arrival_airport)
        
        # Znajdź najlepszy moment dla obserwacji słońca
        best_idx, best_sun = self.sun_service.find_sun_events(
            route_points, 
            departure_time, 
            request.sun_preference
        )
        
        # Oblicz czas przylotu i czas trwania lotu
        flight_duration = route_points[-1].time_from_departure
        arrival_time = departure_time + timedelta(hours=flight_duration)
        
        # Określ stronę samolotu na podstawie pozycji słońca i kierunku lotu
        seat_side, seat_code = self._determine_best_seat_side(
            route_points, best_idx, best_sun, request.sun_preference
        )
        
        # Utwórz rekomendację
        recommendation = SeatRecommendation(
            seat_code=seat_code,
            seat_side=seat_side,
            best_time=departure_time + timedelta(hours=route_points[best_idx].time_from_departure),
            sun_event=request.sun_preference,
            quality_score=self._calculate_view_quality(best_sun, request.sun_preference),
            flight_direction=self._get_flight_direction(route_points, best_idx)
        )
        
        # Utwórz odpowiedź
        response = FlightResponse(
            departure_airport=departure_airport,
            arrival_airport=arrival_airport,
            departure_time=departure_time,
            arrival_time=arrival_time,
            flight_duration=flight_duration,
            recommendation=recommendation,
            route_preview=route_points
        )
        
        # Opcjonalnie: dodaj informacje o linii lotniczej i modelu samolotu
        if request.airline:
            # Tutaj dodałbyś pobieranie informacji o linii lotniczej
            pass
        
        return response
    
    def _determine_best_seat_side(self, 
                                 route_points: List[FlightRoutePoint],
                                 best_idx: int,
                                 sun_position: Any,
                                 preference: str) -> Tuple[str, str]:
        """
        Określa najlepszą stronę samolotu do obserwacji wschodu/zachodu słońca
        
        Returns:
            Tuple[str, str]: (strona samolotu, kod miejsca)
        """
        # Oblicz kierunek lotu w punkcie
        flight_bearing = self._calculate_bearing(
            route_points[max(0, best_idx-1)],
            route_points[min(len(route_points)-1, best_idx+1)]
        )
        
        # Azymut słońca
        sun_azimuth = sun_position.azimuth
        
        # Oblicz kąt między kierunkiem lotu a pozycją słońca
        angle_diff = (sun_azimuth - flight_bearing) % 360
        
        if 0 <= angle_diff <= 180:
            # Słońce jest po prawej stronie samolotu
            seat_side = "prawa strona samolotu"
            seat_code = "F"  # Typowe oznaczenie okien po prawej stronie
        else:
            # Słońce jest po lewej stronie samolotu
            seat_side = "lewa strona samolotu"
            seat_code = "A"  # Typowe oznaczenie okien po lewej stronie
        
        # Dodaj numer rzędu (uproszczenie)
        row_number = 15  # Środek samolotu
        seat_code = f"{seat_code}{row_number}"
        
        return seat_side, seat_code
    
    def _calculate_bearing(self, 
                          point1: FlightRoutePoint, 
                          point2: FlightRoutePoint) -> float:
        """
        Oblicza kurs (bearing) między dwoma punktami na Ziemi
        
        Returns:
            Kurs w stopniach (0-360 od północy, zgodnie z ruchem wskazówek zegara)
        """
        lat1, lon1 = np.radians(point1.latitude), np.radians(point1.longitude)
        lat2, lon2 = np.radians(point2.latitude), np.radians(point2.longitude)
        
        dlon = lon2 - lon1
        
        y = np.sin(dlon) * np.cos(lat2)
        x = np.cos(lat1) * np.sin(lat2) - np.sin(lat1) * np.cos(lat2) * np.cos(dlon)
        
        bearing = np.degrees(np.arctan2(y, x))
        return (bearing + 360) % 360
    
    def _calculate_view_quality(self, sun_pos: Any, preference: str) -> float:
        """
        Oblicza jakość widoku (0-100) na podstawie pozycji słońca
        """
        # Uproszczona ocena - pełna implementacja uwzględniałaby więcej czynników
        altitude = sun_pos.altitude
        
        if preference == "sunrise":
            # Najlepszy wschód: 2-10 stopni nad horyzontem
            if 2 <= altitude <= 10:
                return 90 + (1 - abs(altitude - 5) / 5) * 10
            elif 0 <= altitude < 2:
                return 80 + altitude * 5
            else:
                return max(0, 80 - (altitude - 10) * 4)
        else:  # zachód
            # Najlepszy zachód: 2-10 stopni nad horyzontem
            if 2 <= altitude <= 10:
                return 90 + (1 - abs(altitude - 5) / 5) * 10
            elif 0 <= altitude < 2:
                return 80 + altitude * 5
            else:
                return max(0, 80 - (altitude - 10) * 4)
    
    def _get_flight_direction(self, 
                             route_points: List[FlightRoutePoint], 
                             idx: int) -> str:
        """
        Zwraca słowny opis kierunku lotu
        """
        if idx >= len(route_points) - 1:
            idx = len(route_points) - 2
        
        bearing = self._calculate_bearing(route_points[idx], route_points[idx+1])
        
        # Konwersja kąta na kierunek słowny
        directions = [
            "północny", "północno-wschodni", "wschodni", "południowo-wschodni",
            "południowy", "południowo-zachodni", "zachodni", "północno-zachodni", "północny"
        ]
        
        idx = round(bearing / 45)
        return directions[idx % 8]