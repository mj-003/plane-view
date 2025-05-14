# app/api/routes.py
from fastapi import APIRouter, HTTPException, Query, Depends, status
from typing import List
from app.models.schemas import FlightRequest, FlightResponse, AirportBase
from app.services.flight import FlightRouteService
from app.services.airport import AirportService
from datetime import datetime

router = APIRouter()
flight_service = FlightRouteService()


@router.post("/calculate-seat", response_model=FlightResponse)
async def calculate_best_seat(request: FlightRequest):
    """
    Oblicza najlepsze miejsce w samolocie do obserwacji wschodu/zachodu słońca
    """
    try:
        print(f"Otrzymano żądanie: {request}")
        result = await flight_service.get_seat_recommendation(request)
        return result
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"BŁĄD: {str(e)}")
        print(f"STACKTRACE: {error_trace}")
        raise HTTPException(status_code=500, detail=f"Błąd podczas obliczania: {str(e)}")
    

@router.get("/airports/search", response_model=List[AirportBase])
async def search_airports(query: str = Query(..., min_length=2), limit: int = Query(10, ge=1, le=50)):
    """
    Wyszukuje lotniska na podstawie kodu IATA, nazwy lub miasta
    """
    try:
        results = AirportService.search_airports(query, limit)
        return results
    except Exception as e:
        print(f"Błąd podczas wyszukiwania lotnisk: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Błąd podczas wyszukiwania lotnisk")


@router.get("/airports/{code}", response_model=AirportBase)
async def get_airport(code: str):
    """
    Pobiera szczegółowe informacje o lotnisku na podstawie kodu IATA
    """
    airport = AirportService.get_airport(code)
    if not airport:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Lotnisko o kodzie {code} nie zostało znalezione")
    return airport

# testowe
@router.get("/health")
async def health_check():
    """Endpoint do sprawdzania stanu API"""
    return {
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "version": "0.1.0"
    }