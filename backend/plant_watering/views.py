from rest_framework import viewsets, status
from .models import PlantWatering
from .serializers import PlantWateringSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from .services import WeatherService

class PlantWateringViewSet(viewsets.ModelViewSet):
    queryset = PlantWatering.objects.all()
    serializer_class = PlantWateringSerializer
    
    @action(detail=False, methods=['GET'])
    def weather_forecast(self, request):
        """
        Get weather forecast and watering recommendations
        GET /api/plant-watering/weather_forecast/?latitude=36.8065&longitude=10.1815
        """
        latitude = request.query_params.get('latitude')
        longitude = request.query_params.get('longitude')
        
        if not latitude or not longitude:
            return Response(
                {"error": "Latitude and longitude are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            latitude = float(latitude)
            longitude = float(longitude)
        except ValueError:
            return Response(
                {"error": "Invalid latitude or longitude format"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        weather_data = WeatherService.get_weather_forecast(latitude, longitude)
        
        if weather_data is None:
            return Response(
                {"error": "Failed to fetch weather data"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
            
        return Response(weather_data)
