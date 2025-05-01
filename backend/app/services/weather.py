# app/services/weather.py
import httpx
import asyncio
from typing import Dict, Any, Optional, List
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
    async def get_sun_events(cls, lat: float, lon: float, date_utc: datetime) -> Dict[str, datetime]:
        """
        Pobiera czasy wschodu i zachodu słońca z API pogodowego
        
        Args:
            lat: Szerokość geograficzna
            lon: Długość geograficzna
            date_utc: Data w UTC
            
        Returns:
            Słownik zawierający czasy wschodu i zachodu słońca
        """
        try:
            if cls.WEATHERAPI_KEY:
                # Formatujemy datę zgodnie z wymaganiami API
                date_str = date_utc.strftime('%Y-%m-%d')
                
                async with httpx.AsyncClient() as client:
                    url = f"https://api.weatherapi.com/v1/astronomy.json?key={cls.WEATHERAPI_KEY}&q={lat},{lon}&dt={date_str}"
                    response = await client.get(url)
                    
                    if response.status_code == 200:
                        data = response.json()
                        astronomy = data.get('astronomy', {}).get('astro', {})
                        
                        # API zwraca godziny w formacie "HH:MM AM/PM"
                        sunrise_str = astronomy.get('sunrise')
                        sunset_str = astronomy.get('sunset')
                        
                        # Konwertuj stringi na obiekty datetime
                        if sunrise_str and sunset_str:
                            sunrise_time = cls._parse_time_12h(sunrise_str, date_utc)
                            sunset_time = cls._parse_time_12h(sunset_str, date_utc)
                            
                            return {
                                "sunrise": sunrise_time,
                                "sunset": sunset_time
                            }
            
            # Jeśli API nie zadziałało, zwróć domyślne wartości
            return cls._generate_default_sun_times(lat, lon, date_utc)
            
        except Exception as e:
            print(f"Błąd podczas pobierania danych o wschodzie/zachodzie słońca: {str(e)}")
            return cls._generate_default_sun_times(lat, lon, date_utc)
    
    @classmethod
    def _parse_time_12h(cls, time_str: str, date: datetime) -> datetime:
        """Parsuje czas w formacie 12-godzinnym (HH:MM AM/PM) i łączy z datą"""
        try:
            # Oczekujemy formatu typu "06:20 AM" lub "07:15 PM"
            time_parts = time_str.split()
            if len(time_parts) != 2:
                raise ValueError(f"Nieprawidłowy format czasu: {time_str}")
                
            hour_min = time_parts[0].split(':')
            if len(hour_min) != 2:
                raise ValueError(f"Nieprawidłowy format godziny: {time_parts[0]}")
                
            hour = int(hour_min[0])
            minute = int(hour_min[1])
            
            # Konwersja AM/PM
            if time_parts[1].upper() == 'PM' and hour < 12:
                hour += 12
            elif time_parts[1].upper() == 'AM' and hour == 12:
                hour = 0
                
            return datetime(
                date.year, date.month, date.day,
                hour, minute, 0, tzinfo=date.tzinfo
            )
        except Exception as e:
            print(f"Błąd parsowania czasu '{time_str}': {str(e)}")
            # Domyślne wartości
            if 'AM' in time_str:
                return datetime(date.year, date.month, date.day, 6, 0, 0, tzinfo=date.tzinfo)
            else:
                return datetime(date.year, date.month, date.day, 18, 0, 0, tzinfo=date.tzinfo)
    
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
                        # Pobierz także dane astronomiczne (wschód/zachód słońca)
                        astro_data = forecast_day.get('astro', {})
                        sunrise_str = astro_data.get('sunrise')
                        sunset_str = astro_data.get('sunset')
                        
                        # Parsuj czasy wschodu/zachodu
                        sunrise_time = None
                        sunset_time = None
                        
                        if sunrise_str:
                            try:
                                sunrise_time = cls._parse_time_12h(sunrise_str, time_utc)
                            except Exception as e:
                                print(f"Błąd parsowania wschodu słońca: {e}")
                                
                        if sunset_str:
                            try:
                                sunset_time = cls._parse_time_12h(sunset_str, time_utc)
                            except Exception as e:
                                print(f"Błąd parsowania zachodu słońca: {e}")
                        
                        return {
                            "provider": "WeatherAPI",
                            "clouds": hour_data.get('cloud', 0),  # % zachmurzenia
                            "precipitation": hour_data.get('chance_of_rain', 0),  # prawdopodobieństwo opadów w %
                            "visibility": hour_data.get('vis_km', 10),  # widoczność w km
                            "temp": hour_data.get('temp_c', 20),  # temperatura w °C
                            "description": hour_data.get('condition', {}).get('text', 'brak danych'),
                            "is_forecast": True,
                            "sunrise_time": sunrise_time.isoformat() if sunrise_time else None,
                            "sunset_time": sunset_time.isoformat() if sunset_time else None
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
        
        # Wygeneruj domyślne czasy wschodu/zachodu słońca
        sunrise_sunset = cls._generate_default_sun_times(lat, lon, time_utc)
            
        return {
            "provider": "Default",
            "clouds": clouds,
            "precipitation": precipitation,
            "visibility": visibility,
            "temp": temp,
            "description": description,
            "is_forecast": True,
            "sunrise_time": sunrise_sunset.get("sunrise").isoformat() if sunrise_sunset.get("sunrise") else None,
            "sunset_time": sunrise_sunset.get("sunset").isoformat() if sunrise_sunset.get("sunset") else None
        }
    
    @classmethod
    def _generate_default_sun_times(cls, lat: float, lon: float, date_utc: datetime) -> Dict[str, datetime]:
        """
        Generuje domyślne czasy wschodu i zachodu słońca na podstawie lokalizacji i daty.
        Jest to bardzo uproszczone - w rzeczywistym projekcie należałoby użyć dokładniejszych obliczeń.
        """
        # Zgrubne przybliżenie czasów wschodu/zachodu na podstawie szerokości geograficznej i pory roku
        
        # Baza dla średnich szerokości geograficznych (np. Europa Środkowa)
        base_sunrise_hour = 6  # 6:00 rano
        base_sunset_hour = 18  # 18:00 wieczorem
        
        # Korekta na podstawie pory roku
        month = date_utc.month
        
        # Lato (dni dłuższe)
        if 4 <= month <= 9:
            # Na półkuli północnej lato = wcześniejszy wschód, późniejszy zachód
            if lat > 0:
                base_sunrise_hour = max(4, base_sunrise_hour - (month - 3) // 2)
                base_sunset_hour = min(22, base_sunset_hour + (month - 3) // 2)
            # Na półkuli południowej odwrotnie
            else:
                base_sunrise_hour = min(8, base_sunrise_hour + (month - 3) // 2)
                base_sunset_hour = max(16, base_sunset_hour - (month - 3) // 2)
        # Zima (dni krótsze)
        else:
            # Na półkuli północnej zima = późniejszy wschód, wcześniejszy zachód
            if lat > 0:
                month_offset = month if month <= 2 else (month - 12)
                base_sunrise_hour = min(8, base_sunrise_hour - month_offset // 2)
                base_sunset_hour = max(16, base_sunset_hour + month_offset // 2)
            # Na półkuli południowej odwrotnie
            else:
                month_offset = month if month <= 2 else (month - 12)
                base_sunrise_hour = max(4, base_sunrise_hour + month_offset // 2)
                base_sunset_hour = min(22, base_sunset_hour - month_offset // 2)
        
        # Korekta na podstawie szerokości geograficznej
        lat_abs = abs(lat)
        if lat_abs > 60:  # bliżej biegunów, większa różnica między latem a zimą
            if (lat > 0 and 3 <= month <= 9) or (lat < 0 and (month < 3 or month > 9)):
                # Lato blisko bieguna - bardzo wczesny wschód, bardzo późny zachód
                base_sunrise_hour = max(3, base_sunrise_hour - 2)
                base_sunset_hour = min(23, base_sunset_hour + 2)
            else:
                # Zima blisko bieguna - bardzo późny wschód, bardzo wczesny zachód
                base_sunrise_hour = min(10, base_sunrise_hour + 2)
                base_sunset_hour = max(14, base_sunset_hour - 2)
        
        # Korekta na podstawie długości geograficznej (przybliżenie)
        # Dla uproszczenia przyjmujemy, że UTC jest na długości 0°
        # i każde 15° to 1 godzina różnicy
        lon_hour_offset = round(lon / 15)
        
        # Utwórz obiekty datetime
        sunrise_time = datetime(
            date_utc.year, date_utc.month, date_utc.day,
            (base_sunrise_hour + lon_hour_offset) % 24, 0, 0,
            tzinfo=date_utc.tzinfo
        )
        
        sunset_time = datetime(
            date_utc.year, date_utc.month, date_utc.day,
            (base_sunset_hour + lon_hour_offset) % 24, 0, 0,
            tzinfo=date_utc.tzinfo
        )
        
        return {
            "sunrise": sunrise_time,
            "sunset": sunset_time
        }
    
    @classmethod
    async def evaluate_conditions_for_sun_viewing(cls, lat: float, lon: float, time_utc: datetime) -> Dict[str, Any]:
        """
        Ocenia warunki pogodowe do obserwacji wschodu/zachodu słońca
        
        Returns:
            Słownik z oceną i danymi pogodowymi
        """
        weather = await cls.get_weather(lat, lon, time_utc)
        
        # Pobierz czasy wschodu/zachodu słońca dla tej lokalizacji i daty
        sun_times = await cls.get_sun_events(lat, lon, time_utc)
        print("*******suntimes")
        print(sun_times)
        
        # Dodaj czasy do danych pogodowych, jeśli nie zostały już dodane przez API
        if "sunrise_time" not in weather and "sunrise" in sun_times:
            weather["sunrise_time"] = sun_times["sunrise"].isoformat()
        if "sunset_time" not in weather and "sunset" in sun_times:
            weather["sunset_time"] = sun_times["sunset"].isoformat()
        
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
            "weather": weather,
            "sun_times": {
                "sunrise": weather.get("sunrise_time"),
                "sunset": weather.get("sunset_time")
            }
        }
    

if __name__ == "__main__":
    import asyncio
    test_lat = 50.47848910687199
    test_lon = 8.890003465399879
    test_time = datetime.utcnow()
    print(test_time)
    result = asyncio.run(WeatherService.evaluate_conditions_for_sun_viewing(test_lat, test_lon, test_time))
    print(json.dumps(result, indent=2, ensure_ascii=False))