# app/api/routes.py
from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List
from app.models.schemas import FlightRequest, FlightResponse, AirportBase
from app.services.flight import FlightRouteService
from app.services.airport import AirportService

router = APIRouter()
flight_service = FlightRouteService()

@router.post("/calculate-seat", response_model=FlightResponse)
async def calculate_best_seat(request: FlightRequest):
    """
    Oblicza najlepsze miejsce w samolocie do obserwacji wschodu/zachodu słońca
    """
    try:
        result = flight_service.get_seat_recommendation(request)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # W wersji produkcyjnej należy dodać logowanie błędów
        raise HTTPException(status_code=500, detail="Błąd podczas obliczania")

@router.get("/airports/search", response_model=List[AirportBase])
async def search_airports(query: str = Query(..., min_length=2), limit: int = Query(10, ge=1, le=50)):
    """
    Wyszukuje lotniska na podstawie kodu IATA, nazwy lub miasta
    """
    results = AirportService.search_airports(query, limit)
    return results

@router.get("/airports/{code}", response_model=AirportBase)
async def get_airport(code: str):
    """
    Pobiera szczegółowe informacje o lotnisku na podstawie kodu IATA
    """
    airport = AirportService.get_airport(code)
    if not airport:
        raise HTTPException(status_code=404, detail=f"Lotnisko o kodzie {code} nie zostało znalezione")
    return airport



# app/api/routes.py
from datetime import datetime
from skyfield.api import utc  # Dodajemy import utc
from app.services.astronomy import AstronomyService

astronomy_service = AstronomyService()

@router.get("/test-sun-position")
async def test_sun_position():
    """Endpoint testowy do sprawdzenia obliczeń pozycji słońca"""
    try:
        # Przykładowe współrzędne (Warszawa)
        lat = 52.2297
        lon = 21.0122
        alt = 100  # wysokość nad poziomem morza w metrach
        
        # Aktualny czas z określoną strefą czasową UTC
        now = datetime.now(tz=utc)
        
        # Oblicz pozycję słońca
        sun_pos = astronomy_service.sun_position(lat, lon, alt, now)
        
        return {
            "location": {
                "latitude": lat,
                "longitude": lon,
                "altitude_m": alt
            },
            "time_utc": now.isoformat(),
            "sun_position": sun_pos
        }
    except Exception as e:
        return {"error": str(e)}