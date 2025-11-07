try:
    import requests
except Exception:
    requests = None
from datetime import datetime, timedelta
from django.conf import settings

class WeatherService:
    BASE_URL = "https://api.open-meteo.com/v1/forecast"
    # Default location set to Tunisia, Tunis
    DEFAULT_LATITUDE = 36.8065
    DEFAULT_LONGITUDE = 10.1815
    
    @staticmethod
    def get_weather_forecast():
        """
        Get weather forecast from Open-Meteo API using default location
        """
        if requests is None:
            # requests library not available (tests/env). Return None so callers fall back to defaults.
            return None
        params = {
            'latitude': WeatherService.DEFAULT_LATITUDE,
            'longitude': WeatherService.DEFAULT_LONGITUDE,
            'daily': ['precipitation_sum', 'temperature_2m_max'],
            'timezone': 'auto',
            'forecast_days': 7
        }
        
        try:
            response = requests.get(WeatherService.BASE_URL, params=params)
            response.raise_for_status()
            data = response.json()

            return {
                'precipitation': data['daily']['precipitation_sum'],
                'temperature_max': data['daily']['temperature_2m_max'],
                'dates': data['daily']['time']
            }
        except Exception as e:
            # Any error while fetching/parsing should cause a fallback to defaults
            print(f"Error fetching weather data: {e}")
            return None

    @staticmethod
    def calculate_next_watering(current_date=None):
        """
        Calculate next watering date based on weather forecast
        """
        weather_data = WeatherService.get_weather_forecast()
        if not weather_data:
            # If weather data unavailable, default to 3 days
            return (current_date or datetime.now()) + timedelta(days=3)

        next_date = current_date or datetime.now()
        days_to_add = 3  # Default interval

        # Check next 7 days
        for i in range(7):
            precip = weather_data['precipitation'][i]
            temp = weather_data['temperature_max'][i]
            
            # Adjust watering schedule based on weather conditions
            if precip > 5.0:  # If significant rain is expected
                days_to_add = i + 2  # Skip rainy day and add one more
                break
            elif temp > 30:  # Hot weather
                days_to_add = 2  # Water more frequently
            elif temp < 20:  # Cool weather
                days_to_add = 4  # Water less frequently

        return next_date + timedelta(days=days_to_add)