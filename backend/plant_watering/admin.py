from django.contrib import admin
from .models import PlantWatering

@admin.register(PlantWatering)
class PlantWateringAdmin(admin.ModelAdmin):
    list_display = ('plant', 'watering_date', 'next_watering_date', 'is_completed')
    list_filter = ('is_completed', 'plant')
    search_fields = ('plant__name', 'notes')
