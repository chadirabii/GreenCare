from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from authentication.models import CustomUser
from .models import Plants
from plant_watering.models import PlantWatering
from datetime import datetime, timedelta


class PlantWateringEndpointTests(APITestCase):
    def setUp(self):
        from django.utils import timezone
        # Create a test user
        import uuid
        self.user = CustomUser.objects.create_user(
            email=f'testuser_{uuid.uuid4().hex[:8]}@example.com',
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
        # Create some watering records
        now = timezone.now()
        self.watering1 = PlantWatering.objects.create(
            plant=self.plant,
            watering_date=now,
            next_watering_date=now + timedelta(days=7),
            amount_ml=200.0,
            notes='First watering',
            is_completed=False
        )
        self.watering2 = PlantWatering.objects.create(
            plant=self.plant,
            watering_date=now + timedelta(days=7),
            next_watering_date=now + timedelta(days=14),
            amount_ml=250.0,
            notes='Second watering',
            is_completed=False
        )
        
    def test_get_plant_watering_records(self):
        """Test getting watering records for a specific plant."""
        # Get the URL for the plant's watering records
        url = reverse('plant-watering-record', kwargs={'pk': self.plant.pk})
        
        # Make the request
        response = self.client.get(url)
        
        # Check that the request was successful
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check that we got both watering records
        self.assertEqual(len(response.data), 2)
        
        # Verify the data includes our watering records
        watering_ids = {item['id'] for item in response.data}
        self.assertIn(self.watering1.id, watering_ids)
        self.assertIn(self.watering2.id, watering_ids)
