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
    def get_weather_forecast(latitude: float = None, longitude: float = None):
        """
        Get weather forecast from Open-Meteo API using default location
        """
        if requests is None:
            # requests library not available (tests/env). Return None so callers fall back to defaults.
            return None

        lat = latitude if latitude is not None else WeatherService.DEFAULT_LATITUDE
        lon = longitude if longitude is not None else WeatherService.DEFAULT_LONGITUDE

        params = {
            'latitude': lat,
            'longitude': lon,
            'daily': [
                'precipitation_sum',
                'temperature_2m_max',
                'windspeed_10m_max',
                'relative_humidity_2m_max'
            ],
            'timezone': 'auto',
            'forecast_days': 7
        }

        try:
            response = requests.get(WeatherService.BASE_URL, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            daily = data.get('daily', {})  # safely get the 'daily' part

            return {
                'precipitation': daily.get('precipitation_sum', []),
                'temperature_max': daily.get('temperature_2m_max', []),
                'windspeed_max': daily.get('windspeed_10m_max', []),
                'relative_humidity_max': daily.get('relative_humidity_2m_max', []),
                'dates': daily.get('time', [])
            }

        except Exception as e:
            # Any error while fetching/parsing should cause a fallback to defaults
            print(f"Error fetching weather data: {e}")
            return None



 #calculate_next_watering
    @staticmethod
    def calculate_next_watering(current_date=None, latitude: float = None, longitude: float = None):
        """
        Calculate next watering date based on weather forecast
        """
        weather_data = WeatherService.get_weather_forecast(latitude=latitude, longitude=longitude)
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
