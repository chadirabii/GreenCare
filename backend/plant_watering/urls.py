from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PlantWateringViewSet

router = DefaultRouter()
router.register(r'', PlantWateringViewSet, basename='plant-watering')

urlpatterns = [
    path('', include(router.urls)),
]