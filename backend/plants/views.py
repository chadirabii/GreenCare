from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Plants
from .serializers import PlantSerializer
from plant_watering.serializers import PlantWateringSerializer


class PlantViewSet(viewsets.ModelViewSet):
    queryset = Plants.objects.all()
    serializer_class = PlantSerializer

    @action(detail=True, methods=["get"])
    def watering_record(self, request, pk=None):
        """
        Return watering records for this plant.

        URL: GET /api/plants/{pk}/watering_record/
        Returns watering records ordered by date (newest first).
        """
        plant = self.get_object()
        records = plant.watering_schedules.all().order_by('-watering_date')
        serializer = PlantWateringSerializer(records, many=True)
        return Response(serializer.data)
