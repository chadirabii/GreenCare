from django.db import models
from plants.models import Plants
from authentication.models import CustomUser


class PlantWatering(models.Model):
    class Meta:
        app_label = 'plant_watering'
    plant = models.ForeignKey(Plants, on_delete=models.CASCADE, related_name='watering_schedules')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    
    
    
    watering_date = models.DateTimeField()
    next_watering_date = models.DateTimeField(blank=True, null=True)

 
    amount_ml = models.FloatField()
    notes = models.TextField(blank=True, null=True)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.plant.name} - {self.watering_date.date()}"


    
