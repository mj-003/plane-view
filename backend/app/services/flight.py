# app/services/flight.py
from datetime import datetime, timedelta
import numpy as np
from typing import List, Dict, Any, Tuple, Optional
import asyncio
from app.models.schemas import (
    FlightRequest, FlightResponse, FlightRoutePoint,
    SeatRecommendation, AirportBase, AirlineBase, WeatherData,
    SunEventTime
)
from app.services.airport import AirportService
from app.services.sun import SunCalculationService
from app.services.weather import WeatherService
from app.services.flight_route import FlightRouteCalculator
from app.services.aircraft import AircraftService

class FlightRouteService:
    """Serwis do obliczania trasy lotu i rekomendacji miejsc"""
    
    def __init__(self):
        self.sun_service = SunCalculationService()
        self.route_calculator = FlightRouteCalculator()
        # Możesz dodać więcej usług, np. do pobierania danych o samolotach
    
    def calculate_flight_route(self, 
                              departure: AirportBase,
                              arrival: AirportBase,
                              departure_time: datetime,
                              steps: int = 20) -> List[FlightRoutePoint]:
        """
        Oblicza punkty trasy lotu między dwoma lotniskami
        
        Używa dokładniejszego kalkulatora trasy uwzględniającego zakrzywienie Ziemi
        i fazy lotu.
        """
        # Używamy zewnętrznego kalkulatora trasy
        route_points_data = self.route_calculator.calculate_route(
            departure.latitude, departure.longitude,
            arrival.latitude, arrival.longitude,
            departure_time,
            steps
        )
        
        # Konwersja na obiekty FlightRoutePoint
        route_points = []
        for point_data in route_points_data:
            route_points.append(FlightRoutePoint(
                latitude=point_data["lat"],
                longitude=point_data["lon"],
                altitude=point_data["alt"],
                time_from_departure=point_data["time_fraction"] * point_data["total_duration_hours"]
            ))
        
        return route_points
    
    async def get_seat_recommendation_async(self, request: FlightRequest) -> FlightResponse:
        """
        Asynchroniczna wersja metody do generowania rekomendacji miejsc
        z uwzględnieniem danych pogodowych
        
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
        route_points = self.calculate_flight_route(departure_airport, arrival_airport, departure_time)
        
        # Znajdź wszystkie wydarzenia słoneczne (wschód/zachód) podczas lotu
        sun_events = self.sun_service.get_sun_events_for_flight(route_points, departure_time)
        
        # Sprawdź, czy preferowane wydarzenie jest widoczne
        preferred_events = [e for e in sun_events 
                          if e.event_type == request.sun_preference and e.is_visible_during_flight]
        
        sun_events_visible = len(preferred_events) > 0
        
        # Znajdź najlepszy moment dla obserwacji słońca
        best_idx, best_sun = self.sun_service.find_sun_events(
            route_points, 
            departure_time, 
            request.sun_preference
        )
        
        # Pobierz dane pogodowe dla najlepszego punktu
        best_point = route_points[best_idx]
        best_time = departure_time + timedelta(hours=best_point.time_from_departure)
        
        # Asynchronicznie pobierz dane pogodowe
        weather_conditions = await WeatherService.evaluate_conditions_for_sun_viewing(
            best_point.latitude,
            best_point.longitude,
            best_time
        )
        
        # Oblicz czas przylotu i czas trwania lotu
        flight_duration = route_points[-1].time_from_departure
        arrival_time = departure_time + timedelta(hours=flight_duration)
        
        # Określ stronę samolotu na podstawie pozycji słońca i kierunku lotu
        seat_side, seat_code = self._determine_best_seat_side(
            route_points, best_idx, best_sun, request.sun_preference
        )
        
        # Utwórz obiekt danych pogodowych
        weather_data = WeatherData(
            clouds_percent=weather_conditions["weather"]["clouds"],
            precipitation_percent=weather_conditions["weather"]["precipitation"],
            visibility_km=weather_conditions["weather"]["visibility"],
            temperature_celsius=weather_conditions["weather"]["temp"],
            description=weather_conditions["weather"]["description"],
            viewing_conditions=weather_conditions["quality_description"]
        )
        
        # Skoryguj ocenę jakości widoku o warunki pogodowe
        adjusted_quality_score = self._calculate_view_quality(best_sun, request.sun_preference)
        weather_factor = weather_conditions["viewing_score"] / 100
        final_quality_score = adjusted_quality_score * weather_factor
        
        # Przygotuj dodatkowe informacje tekstowe
        recommendation_notes = ""
        if not sun_events_visible:
            if request.sun_preference == "sunrise":
                recommendation_notes = "Wschód słońca nie będzie widoczny podczas tego lotu. "
                # Sprawdź czy zachód jest widoczny
                sunset_events = [e for e in sun_events if e.event_type == "sunset" and e.is_visible_during_flight]
                if sunset_events:
                    recommendation_notes += f"Możesz jednak obserwować zachód słońca około {sunset_events[0].event_time.strftime('%H:%M')}."
                else:
                    recommendation_notes += "Niestety, zachód słońca również nie będzie widoczny."
            else:  # zachód
                recommendation_notes = "Zachód słońca nie będzie widoczny podczas tego lotu. "
                # Sprawdź czy wschód jest widoczny
                sunrise_events = [e for e in sun_events if e.event_type == "sunrise" and e.is_visible_during_flight]
                if sunrise_events:
                    recommendation_notes += f"Możesz jednak obserwować wschód słońca około {sunrise_events[0].event_time.strftime('%H:%M')}."
                else:
                    recommendation_notes += "Niestety, wschód słońca również nie będzie widoczny."
        else:
            # Dodaj informacje o pogodzie
            if weather_factor < 0.5:
                recommendation_notes = f"Widoczność może być ograniczona przez {weather_data.description.lower()}. "
            
            # Dodaj informacje o najlepszym czasie
            for event in preferred_events:
                recommendation_notes += f"{event.event_type.capitalize()} nastąpi o {event.event_time.strftime('%H:%M')}. "
                
            recommendation_notes += f"Najlepszy widok będzie z {seat_side}, miejsce {seat_code}."
        
        # Utwórz rekomendację
        recommendation = SeatRecommendation(
            seat_code=seat_code,
            seat_side=seat_side,
            best_time=best_time,
            sun_event=request.sun_preference,
            quality_score=final_quality_score,
            flight_direction=self._get_flight_direction(route_points, best_idx),
            weather_data=weather_data,
            sun_event_times=sun_events,
            recommendation_notes=recommendation_notes
        )
        
        # Utwórz odpowiedź
        response = FlightResponse(
            departure_airport=departure_airport,
            arrival_airport=arrival_airport,
            departure_time=departure_time,
            arrival_time=arrival_time,
            flight_duration=flight_duration,
            recommendation=recommendation,
            route_preview=route_points,
            sun_events_visible=sun_events_visible
        )
        
        # Dodaj informacje o linii lotniczej i modelu samolotu
        if request.airline:
            # Tutaj dodajemy pobieranie informacji o linii lotniczej
            pass
        else:
            # Odgadnij model samolotu na podstawie odległości
            distance_km = self._calculate_distance(departure_airport, arrival_airport)
            aircraft_model = AircraftService.guess_aircraft(
                airline_code=request.airline or "LO",  # Domyślnie LOT
                distance_km=distance_km
            )
            response.aircraft_model = aircraft_model
        
        return response
    
    # def get_seat_recommendation(self, request: FlightRequest) -> FlightResponse:
    #     """
    #     Główna metoda do generowania rekomendacji miejsc.
    #     Uruchamia asynchroniczną wersję i czeka na wynik.
        
    #     Returns:
    #         FlightResponse z rekomendacją najlepszego miejsca
    #     """
    #     # Uruchomienie asynchronicznej wersji w pętli eventowej
    #     try:
    #         loop = asyncio.get_event_loop()
    #     except RuntimeError:
    #         # Jeśli nie mamy pętli, tworzymy nową
    #         loop = asyncio.new_event_loop()
    #         asyncio.set_event_loop(loop)
            
    #     result = loop.run_until_complete(self.get_seat_recommendation_async(request))
    #     return result

    async def get_seat_recommendation(self, request: FlightRequest) -> FlightResponse:
        """
        Główna metoda do generowania rekomendacji miejsc.
        W środowisku asynchronicznym (FastAPI) po prostu wywołuje asynchroniczną wersję.
        
        Returns:
            FlightResponse z rekomendacją najlepszego miejsca
        """
    # Bezpośrednie wywołanie wersji asynchronicznej
        result = await self.get_seat_recommendation_async(request)
        return result
    
    def _calculate_distance(self, departure: AirportBase, arrival: AirportBase) -> float:
        """
        Oblicza odległość między lotniskami w kilometrach
        
        Returns:
            Odległość w kilometrach
        """
        # Oblicz odległość między lotniskami (wzór haversine)
        lat1, lon1 = np.radians(departure.latitude), np.radians(departure.longitude)
        lat2, lon2 = np.radians(arrival.latitude), np.radians(arrival.longitude)
        
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = np.sin(dlat/2)**2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon/2)**2
        c = 2 * np.arcsin(np.sqrt(a))
        distance_km = 6371 * c  # Promień Ziemi * c
        
        return distance_km
    
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
        
        # Określ stronę samolotu
        if 0 <= angle_diff <= 180:
            # Słońce jest po prawej stronie samolotu
            seat_side = "prawa strona samolotu"
            seat_prefix = "F"  # Typowe oznaczenie okien po prawej stronie
        else:
            # Słońce jest po lewej stronie samolotu
            seat_side = "lewa strona samolotu"
            seat_prefix = "A"  # Typowe oznaczenie okien po lewej stronie
        
        # Dodaj numer rzędu (optymalizacja dla modelu samolotu)
        row_number = 15  # Domyślnie środek samolotu
        
        # Dostosuj do fazy lotu - dla wschodu lepiej z przodu, dla zachodu z tyłu
        if preference == "sunrise":
            row_number = 10  # Bardziej z przodu dla wschodu
        else:
            row_number = 20  # Bardziej z tyłu dla zachodu
        
        seat_code = f"{seat_prefix}{row_number}"
        
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