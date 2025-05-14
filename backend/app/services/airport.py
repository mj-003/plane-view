# app/services/airport.py
import pandas as pd
from pathlib import Path
from typing import Dict, List, Optional
from app.core.config import settings
from app.models.schemas import AirportBase

class AirportService:
    _airports: Dict[str, AirportBase] = {}
    
    @classmethod
    def load_airports(cls) -> None:
        """Ładuje dane lotnisk z pliku CSV"""
        try:
            df = pd.read_csv(settings.AIRPORTS_DATA_PATH)
            for _, row in df.iterrows():
                airport = AirportBase(
                    code=row['iata_code'],
                    name=row['name'],
                    city=row['city'],
                    country=row['country'],
                    latitude=row['latitude'],
                    longitude=row['longitude'],
                    timezone=row['timezone']
                )
                cls._airports[airport.code] = airport
        except Exception as e:
            print(f"Błąd podczas ładowania lotnisk: {e}")
    
    @classmethod
    def get_airport(cls, code: str) -> Optional[AirportBase]:
        """Pobiera informacje o lotnisku na podstawie kodu IATA"""
        if not cls._airports:
            cls.load_airports()
        return cls._airports.get(code.upper())
    
    @classmethod
    def search_airports(cls, query: str, limit: int = 10) -> List[AirportBase]:
        """Wyszukuje lotniska na podstawie kodu, nazwy lub miasta"""
        if not cls._airports:
            cls.load_airports()
        
        query = query.lower()
        results = []
        
        for airport in cls._airports.values():
            if (query in airport.code.lower() or 
                query in airport.name.lower() or 
                query in airport.city.lower()):
                results.append(airport)
                if len(results) >= limit:
                    break
        
        return results

AirportService.load_airports()