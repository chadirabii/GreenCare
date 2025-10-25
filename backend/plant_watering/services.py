import requests
from datetime import datetime, timedelta
from django.conf import settings

class WeatherService:
    BASE_URL = "https://api.open-meteo.com/v1/forecast"
    
    @staticmethod
    def get_weather_forecast(latitude, longitude):
        """
        Get weather forecast from Open-Meteo API
        """
        params = {
            'latitude': latitude,
            'longitude': longitude,
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
        except requests.RequestException as e:
            print(f"Error fetching weather data: {e}")
            return None

    @staticmethod
    def should_water_plant(plant, weather_data):
        """
        Determine if a plant should be watered based on weather conditions
        """
        if not weather_data:
            return True  # If we can't get weather data, default to regular watering
            
        # Get today's forecast
        today_precip = weather_data['precipitation'][0]
        today_temp = weather_data['temperature_max'][0]
        
        # Basic logic - adjust these thresholds based on your needs
        if today_precip > 5.0:  # More than 5mm rain expected
            return False
        
        if today_temp > 30:  # If it's very hot
            return True
            
        # Check if it's time for regular watering
        last_watering = plant.watering_schedules.filter(is_completed=True).order_by('-watering_date').first()
        if not last_watering:
            return True
            
        days_since_watering = (datetime.now().date() - last_watering.watering_date.date()).days
        return days_since_watering >= plant.watering_interval_days