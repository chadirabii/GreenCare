from rest_framework import viewsets, status
from datetime import datetime
from .models import PlantWatering
from .serializers import PlantWateringSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .services import WeatherService

 #CRUD logic actually lives
class PlantWateringViewSet(viewsets.ModelViewSet):
    queryset = PlantWatering.objects.all()
    serializer_class = PlantWateringSerializer
    permission_classes = [AllowAny]
    authentication_classes = []  # Disable authentication temporarily for development

    def create(self, request, *args, **kwargs):
        # Get the data from the request
        data = request.data.copy()

        # If watering_date is not provided, use current time
        if 'watering_date' not in data:
            data['watering_date'] = datetime.now().isoformat()

        # Calculate next watering date based on weather
        watering_date = datetime.fromisoformat(
            data['watering_date'].replace('Z', '+00:00'))
        next_watering = WeatherService.calculate_next_watering(watering_date)
        data['next_watering_date'] = next_watering.isoformat()

        # Create serializer with the modified data
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    
    
        """
        Get weather forecast and watering recommendations
        GET /api/watering/weather_forecast/
        """
    @action(detail=False, methods=['GET'])
    def weather_forecast(self, request):
        
        
        weather_data = WeatherService.get_weather_forecast()
        if weather_data is None:
            return Response(
                {"error": "Failed to fetch weather data"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        # Add watering recommendation
        next_watering = WeatherService.calculate_next_watering()
        weather_data['next_recommended_watering'] = next_watering.strftime(
            '%Y-%m-%d')

        if weather_data is None:
            return Response(
                {"error": "Failed to fetch weather data"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        return Response(weather_data)



