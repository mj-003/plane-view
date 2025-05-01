# app/services/weather.py
import httpx
import asyncio
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import json
import os

class WeatherService:
    """Serwis do pobierania danych pogodowych wzdłuż trasy lotu"""
    
    # Możesz użyć jednego z tych API - wybierz to, które preferujesz i uzyskaj klucz API
    OPENWEATHERMAP_API_KEY = os.getenv('OPENWEATHERMAP_API_KEY', '')
    # WEATHERAPI_KEY = os.getenv('WEATHERAPI_KEY', '')
    WEATHERAPI_KEY = "9d1035aa7ee7449790c115750250105"

    print(WEATHERAPI_KEY)
    
    @classmethod
    async def get_weather(cls, lat: float, lon: float, time_utc: datetime) -> Optional[Dict[str, Any]]:
        """
        Pobiera prognozę pogody dla danej lokalizacji i czasu
        
        Args:
            lat: Szerokość geograficzna
            lon: Długość geograficzna
            time_utc: Czas w UTC
            
        Returns:
            Słownik z danymi pogodowymi lub None w przypadku błędu
        """
        print(f"WEATHERAPI_KEY: {cls.WEATHERAPI_KEY}")

        try:
            
            # Jeśli OpenWeatherMap nie zadziałał, spróbujmy WeatherAPI
            if cls.WEATHERAPI_KEY:
                print(cls.WEATHERAPI_KEY)
                weather_data = await cls._fetch_weatherapi(lat, lon, time_utc)
                if weather_data:
                    return weather_data
            
            # Jeśli żadne API nie zadziałało lub nie mamy kluczy, zwróć domyślne dane
            return cls._generate_default_weather(lat, lon, time_utc)
            
        except Exception as e:
            print(f"Błąd podczas pobierania danych pogodowych: {str(e)}")
            return cls._generate_default_weather(lat, lon, time_utc)
    
    @classmethod
    async def _fetch_weatherapi(cls, lat: float, lon: float, time_utc: datetime) -> Optional[Dict[str, Any]]:
        """Pobiera dane z WeatherAPI.com"""
        if not cls.WEATHERAPI_KEY:
            return None
            
        # Formatujemy datę zgodnie z wymaganiami API
        date_str = time_utc.strftime('%Y-%m-%d')
        
        try:
            async with httpx.AsyncClient() as client:
                url = f"https://api.weatherapi.com/v1/forecast.json?key={cls.WEATHERAPI_KEY}&q={lat},{lon}&days=7&dt={date_str}"
                response = await client.get(url)
                data = response.json()
                
                # Sprawdzamy czy mamy dane dla żądanego dnia
                forecast_day = None
                for day in data.get('forecast', {}).get('forecastday', []):
                    if day['date'] == date_str:
                        forecast_day = day
                        break
                
                if forecast_day:
                    # Znajdź najbliższą godzinę w danych godzinowych
                    target_hour = time_utc.hour
                    hour_data = None
                    
                    for hour in forecast_day.get('hour', []):
                        hour_time = datetime.strptime(hour['time'], '%Y-%m-%d %H:%M')
                        if hour_time.hour == target_hour:
                            hour_data = hour
                            break
                    
                    if hour_data:
                        return {
                            "provider": "WeatherAPI",
                            "clouds": hour_data.get('cloud', 0),  # % zachmurzenia
                            "precipitation": hour_data.get('chance_of_rain', 0),  # prawdopodobieństwo opadów w %
                            "visibility": hour_data.get('vis_km', 10),  # widoczność w km
                            "temp": hour_data.get('temp_c', 20),  # temperatura w °C
                            "description": hour_data.get('condition', {}).get('text', 'brak danych'),
                            "is_forecast": True
                        }
                
                return None
                
        except Exception as e:
            print(f"Błąd podczas pobierania danych z WeatherAPI: {str(e)}")
            return None
    
    @classmethod
    def _generate_default_weather(cls, lat: float, lon: float, time_utc: datetime) -> Dict[str, Any]:
        """
        Generuje domyślne dane pogodowe, gdy API nie są dostępne.
        Implementuje proste reguły bazujące na lokalizacji i porze roku.
        """
        # Określ porę roku na podstawie miesiąca (dla półkuli północnej)
        month = time_utc.month
        is_summer = 5 <= month <= 8
        is_winter = month in [12, 1, 2]
        
        # Szerokość geograficzna determinuje klimat (uproszczenie)
        is_tropical = -23.5 <= lat <= 23.5
        is_polar = abs(lat) >= 66.5
        is_temperate = not is_tropical and not is_polar
        
        # Domyślne wartości bazujące na powyższych czynnikach
        clouds = 30  # domyślne zachmurzenie 30%
        precipitation = 20  # domyślne prawdopodobieństwo opadów 20%
        visibility = 10  # domyślna widoczność 10 km
        temp = 20  # domyślna temperatura 20°C
        description = "partly cloudy"  # domyślny opis
        
        # Modyfikacje na podstawie pory roku i klimatu
        if is_tropical:
            temp = 28
            if 6 <= month <= 9:  # pora deszczowa w wielu regionach tropikalnych
                clouds = 70
                precipitation = 60
                visibility = 5
                description = "rain showers"
        elif is_polar:
            if is_winter:
                temp = -15
                clouds = 40
                description = "snow showers"
            else:
                temp = 5
                clouds = 60
                description = "cloudy"
        elif is_temperate:
            if is_summer:
                temp = 25
                clouds = 30
                description = "mostly sunny"
            elif is_winter:
                temp = 0
                clouds = 70
                precipitation = 40
                description = "snow or rain"
                
        # Dodatkowe modyfikacje na podstawie godziny
        hour = time_utc.hour
        if 5 <= hour <= 8:  # poranek
            clouds = max(10, clouds - 20)  # zwykle mniej chmur rano
            visibility = min(15, visibility + 2)  # lepsza widoczność rano
            description = "morning " + description
        elif 18 <= hour <= 20:  # wieczór
            clouds = min(90, clouds + 10)  # zwykle więcej chmur wieczorem
            description = "evening " + description
            
        return {
            "provider": "Default",
            "clouds": clouds,
            "precipitation": precipitation,
            "visibility": visibility,
            "temp": temp,
            "description": description,
            "is_forecast": True
        }
    
    @classmethod
    async def evaluate_conditions_for_sun_viewing(cls, lat: float, lon: float, time_utc: datetime) -> Dict[str, Any]:
        """
        Ocenia warunki pogodowe do obserwacji wschodu/zachodu słońca
        
        Returns:
            Słownik z oceną i danymi pogodowymi
        """
        weather = await cls.get_weather(lat, lon, time_utc)
        

        
        # Oceń warunki
        viewing_score = 100  # Maksymalna ocena
        
        # Zachmurzenie jest najważniejszym czynnikiem
        clouds = weather.get('clouds', 0)
        if clouds > 80:
            viewing_score -= 70  # Bardzo duże zachmurzenie
        elif clouds > 60:
            viewing_score -= 50  # Duże zachmurzenie
        elif clouds > 40:
            viewing_score -= 30  # Średnie zachmurzenie
        elif clouds > 20:
            viewing_score -= 10  # Niewielkie zachmurzenie
            
        # Opady zmniejszają widoczność
        precipitation = weather.get('precipitation', 0)
        if precipitation > 80:
            viewing_score -= 40
        elif precipitation > 50:
            viewing_score -= 25
        elif precipitation > 30:
            viewing_score -= 15
            
        # Widoczność
        visibility = weather.get('visibility', 10)
        if visibility < 1:
            viewing_score -= 50
        elif visibility < 5:
            viewing_score -= 30
        elif visibility < 8:
            viewing_score -= 10
            
        # Zapewnij, że ocena jest w zakresie 0-100
        viewing_score = max(0, min(100, viewing_score))
        
        # Utwórz opis jakości warunków
        quality_description = "doskonałe"
        if viewing_score < 20:
            quality_description = "bardzo złe"
        elif viewing_score < 40:
            quality_description = "słabe"
        elif viewing_score < 60:
            quality_description = "umiarkowane"
        elif viewing_score < 80:
            quality_description = "dobre"
            
        return {
            "viewing_score": viewing_score,
            "quality_description": quality_description,
            "weather": weather
        }
    

if __name__ == "__main__":
    import asyncio
    test_lat = 50.47848910687199
    test_lon = 8.890003465399879
    test_time = datetime.utcnow()
    print(test_time)
    result = asyncio.run(WeatherService.evaluate_conditions_for_sun_viewing(test_lat, test_lon, test_time))
    print(json.dumps(result, indent=2, ensure_ascii=False))

