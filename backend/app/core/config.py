# app/core/config.py
import os
from pydantic_settings import BaseSettings
from pydantic import validator
from typing import List, Union

class Settings(BaseSettings):
    PROJECT_NAME: str = "SunFlight API"
    API_V1_STR: str = "/api/v1"
    
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",  # Frontend React
        "http://localhost:3001",  # Frontend React

        "http://127.0.0.1:3000",  # Alternatywny adres frontendu
        "http://127.0.0.1:3001",  # Alternatywny adres frontendu

        "http://localhost:8000",  # Backend podczas debugowania
        "http://127.0.0.1:8000",

       
    ]
    
    DATABASE_URL: str = "sqlite:///./sunflight.db"
    
    # Lotniska i dane - ścieżki do plików
    AIRPORTS_DATA_PATH: str = "data/airports.csv"
    AIRLINES_DATA_PATH: str = "data/airlines.csv"
    
    DEBUG: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()