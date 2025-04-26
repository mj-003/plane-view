# app/services/aircraft.py
from typing import Dict, List, Any, Optional

class AircraftService:
    """Serwis do obsługi informacji o samolotach"""
    
    # Dane o typowych układach siedzeń w samolotach
    _aircraft_data = {
        "B737": {
            "name": "Boeing 737",
            "seating_layout": "3-3",
            "window_seats_left": ["A"],
            "window_seats_right": ["F"],
            "aisle_seats": ["C", "D"],
            "middle_seats": ["B", "E"],
            "typical_airlines": ["Ryanair", "LOT", "Lufthansa"]
        },
        "A320": {
            "name": "Airbus A320",
            "seating_layout": "3-3",
            "window_seats_left": ["A"],
            "window_seats_right": ["F"],
            "aisle_seats": ["C", "D"],
            "middle_seats": ["B", "E"],
            "typical_airlines": ["Wizz Air", "Lufthansa", "EasyJet"]
        },
        "B787": {
            "name": "Boeing 787 Dreamliner",
            "seating_layout": "3-3-3",
            "window_seats_left": ["A"],
            "window_seats_right": ["K"],
            "aisle_seats": ["C", "D", "G", "H"],
            "middle_seats": ["B", "E", "F", "J"],
            "typical_airlines": ["LOT", "British Airways", "Qatar Airways"]
        },
        "A350": {
            "name": "Airbus A350",
            "seating_layout": "3-3-3",
            "window_seats_left": ["A"],
            "window_seats_right": ["K"],
            "aisle_seats": ["C", "D", "G", "H"],
            "middle_seats": ["B", "E", "F", "J"],
            "typical_airlines": ["Lufthansa", "Qatar Airways", "Singapore Airlines"]
        }
        # Można dodać więcej modeli samolotów
    }
    
    # Mapowanie linii lotniczych do typowych samolotów
    _airline_aircraft = {
        "LO": {"short_haul": ["B737", "E195"], "long_haul": ["B787"]},
        "LH": {"short_haul": ["A320", "A321"], "long_haul": ["A350", "B747"]},
        "FR": {"short_haul": ["B737"], "long_haul": []},
        "W6": {"short_haul": ["A320", "A321"], "long_haul": []},
        # Można dodać więcej linii lotniczych
    }
    
    @classmethod
    def get_aircraft_data(cls, aircraft_code: str) -> Optional[Dict[str, Any]]:
        """Pobiera dane o samolocie na podstawie kodu"""
        return cls._aircraft_data.get(aircraft_code)
    
    @classmethod
    def get_airline_aircraft(cls, airline_code: str, is_long_haul: bool = False) -> List[str]:
        """Pobiera listę samolotów typowych dla danej linii lotniczej"""
        airline_data = cls._airline_aircraft.get(airline_code, {})
        
        if is_long_haul:
            return airline_data.get("long_haul", [])
        else:
            return airline_data.get("short_haul", [])
    
    @classmethod
    def guess_aircraft(cls, airline_code: str, distance_km: float) -> str:
        """
        Wnioskuje prawdopodobny model samolotu na podstawie linii i odległości
        
        Args:
            airline_code: Kod IATA linii lotniczej
            distance_km: Odległość lotu w kilometrach
            
        Returns:
            Kod prawdopodobnego modelu samolotu
        """
        # Określ, czy to lot długodystansowy
        is_long_haul = distance_km > 3000
        
        # Pobierz samoloty dla tej linii
        aircraft_options = cls.get_airline_aircraft(airline_code, is_long_haul)
        
        # Jeśli brak danych lub brak samolotów, użyj domyślnych wartości
        if not aircraft_options:
            if is_long_haul:
                return "B787"  # Typowy samolot długodystansowy
            else:
                return "B737"  # Typowy samolot krótkodystansowy
        
        # Wybierz pierwszy samolot z listy (najpopularniejszy)
        return aircraft_options[0]
    
    @classmethod
    def get_window_seats(cls, aircraft_code: str, side: str) -> List[str]:
        """
        Pobiera kody siedzeń okiennych dla danego samolotu i strony
        
        Args:
            aircraft_code: Kod modelu samolotu
            side: "left" lub "right"
            
        Returns:
            Lista kodów siedzeń okiennych
        """
        aircraft_data = cls.get_aircraft_data(aircraft_code)
        
        if not aircraft_data:
            # Domyślne wartości dla nieznanego samolotu
            return ["A"] if side == "left" else ["F"]
        
        if side == "left":
            return aircraft_data.get("window_seats_left", ["A"])
        else:
            return aircraft_data.get("window_seats_right", ["F"])