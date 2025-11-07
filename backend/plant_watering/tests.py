from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from authentication.models import CustomUser
from plants.models import Plants
from .models import PlantWatering
from datetime import datetime, timedelta


class PlantWateringTests(APITestCase):
    def setUp(self):
        # Create a test user
        self.user = CustomUser.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        
        # Create a test plant
        self.plant = Plants.objects.create(
            name='Test Plant',
            species='Test Species',
            age=1,
            height=10.0,
            width=5.0,
            description='Test description'
        )

    def test_create_watering(self):
        """Test creating a new watering schedule"""
        watering_date = datetime.now()
        next_date = watering_date + timedelta(days=7)
        
        data = {
            'plant': self.plant.id,
            'watering_date': watering_date.isoformat(),
            'next_watering_date': next_date.isoformat(),
            'amount_ml': 250.0,
            'notes': 'Test watering',
            'is_completed': False
        }
        
        url = reverse('plant-watering-list')
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(PlantWatering.objects.count(), 1)
        self.assertEqual(PlantWatering.objects.get().plant.id, self.plant.id)
