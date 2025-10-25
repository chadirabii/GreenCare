from rest_framework import serializers
from .models import PlantWatering


class PlantWateringSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlantWatering
        fields = '__all__'