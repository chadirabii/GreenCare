from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DetectionResultViewSet

router = DefaultRouter()
router.register(r'', DetectionResultViewSet, basename='predict')

urlpatterns = [
    path('', include(router.urls)),
]
