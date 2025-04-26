# app/models/schemas.py
from pydantic import BaseModel, Field, validator
from datetime import datetime, date, time
from typing import Optional, List, Dict, Any

class AirportBase(BaseModel):
    code: str = Field(..., description="Kod IATA lotniska, np. WAW")
    name: str = Field(..., description="Pełna nazwa lotniska")
    city: str = Field(..., description="Miasto")
    country: str = Field(..., description="Kraj")
    latitude: float = Field(..., description="Szerokość geograficzna")
    longitude: float = Field(..., description="Długość geograficzna")
    timezone: str = Field(..., description="Strefa czasowa")

class AirlineBase(BaseModel):
    code: str = Field(..., description="Kod IATA linii lotniczej")
    name: str = Field(..., description="Nazwa linii lotniczej")
    aircraft_models: Dict[str, Any] = Field(..., description="Modele samolotów używane przez linię")

class FlightRequest(BaseModel):
    departure_airport: str = Field(..., description="Kod IATA lotniska wylotu")
    arrival_airport: str = Field(..., description="Kod IATA lotniska przylotu")
    departure_date: date = Field(..., description="Data wylotu")
    departure_time: time = Field(..., description="Czas wylotu (lokalny)")
    airline: Optional[str] = Field(None, description="Kod IATA linii lotniczej (opcjonalnie)")
    sun_preference: str = Field(..., description="Preferencja: 'sunrise' (wschód) lub 'sunset' (zachód)")
    
    @validator('sun_preference')
    def validate_sun_preference(cls, v):
        if v not in ["sunrise", "sunset"]:
            raise ValueError('sun_preference musi być "sunrise" lub "sunset"')
        return v

class SunPositionData(BaseModel):
    datetime: datetime
    altitude: float = Field(..., description="Wysokość słońca nad horyzontem w stopniach")
    azimuth: float = Field(..., description="Azymut słońca w stopniach od północy")
    is_visible: bool = Field(..., description="Czy słońce jest widoczne z samolotu")

class FlightRoutePoint(BaseModel):
    latitude: float
    longitude: float
    altitude: float = Field(..., description="Wysokość lotu w metrach")
    time_from_departure: float = Field(..., description="Czas od wylotu w godzinach")

class SeatRecommendation(BaseModel):
    seat_code: str = Field(..., description="Kod miejsca (np. A23)")
    seat_side: str = Field(..., description="Strona samolotu (lewa/prawa)")
    best_time: datetime = Field(..., description="Najlepszy czas na obserwację")
    sun_event: str = Field(..., description="Wydarzenie (sunrise/sunset)")
    quality_score: float = Field(..., description="Ocena jakości widoku (0-100)")
    flight_direction: str = Field(..., description="Kierunek lotu podczas wydarzenia")

class FlightResponse(BaseModel):
    departure_airport: AirportBase
    arrival_airport: AirportBase
    departure_time: datetime
    arrival_time: datetime
    flight_duration: float = Field(..., description="Czas lotu w godzinach")
    airline: Optional[AirlineBase] = None
    aircraft_model: Optional[str] = None
    recommendation: SeatRecommendation
    route_preview: List[FlightRoutePoint] = Field([], description="Uproszczona trasa lotu")