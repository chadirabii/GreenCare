from rest_framework import serializers
from .models import PlantWatering


class PlantWateringSerializer(serializers.ModelSerializer):
    # expose plant name for frontend convenience
    plant_name = serializers.CharField(source='plant.name', read_only=True)
    class Meta:
        model = PlantWatering
        fields = ['id', 'plant', 'plant_name', 'watering_date', 'next_watering_date', 'amount_ml', 'notes', 'is_completed', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']