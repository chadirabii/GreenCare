from rest_framework import viewsets
from .models import Plants
from .serializers import PlantSerializer


class PlantViewSet(viewsets.ModelViewSet):
    queryset = Plants.objects.all()
    serializer_class = PlantSerializer
