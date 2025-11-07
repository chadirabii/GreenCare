from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PlantWateringViewSet
from .swagger import schema_view   

router = DefaultRouter()
router.register(r'', PlantWateringViewSet, basename='plant-watering')

urlpatterns = [
    path('', include(router.urls)),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
]