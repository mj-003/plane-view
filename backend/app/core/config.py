# app/core/config.py
import os
from pydantic_settings import BaseSettings
from pydantic import validator
from typing import List, Union

class Settings(BaseSettings):
    PROJECT_NAME: str = "SunFlight API"
    API_V1_STR: str = "/api/v1"
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000"]
    
    # Konfiguracja bazy danych (opcjonalna)
    DATABASE_URL: str = "sqlite:///./sunflight.db"
    
    # Lotniska i dane - ścieżki do plików
    AIRPORTS_DATA_PATH: str = "data/airports.csv"
    AIRLINES_DATA_PATH: str = "data/airlines.csv"
    
    # Dodatkowe ustawienia
    DEBUG: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()