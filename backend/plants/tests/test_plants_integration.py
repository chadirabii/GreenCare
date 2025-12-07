import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from unittest.mock import patch, MagicMock
from plants.models import Plants
from authentication.models import CustomUser
from plant_watering.models import PlantWatering
from django.utils import timezone
from datetime import timedelta

pytestmark = pytest.mark.django_db


# ------------------------------------------------------
# Fixtures
# ------------------------------------------------------

@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def authenticated_user(db):
    return CustomUser.objects.create_user(
        email="testuser@greencare.com",
        password="testpass123",
        role="buyer"
    )


@pytest.fixture
def plant_payload():
    return {
        "name": "Monstera Deliciosa",
        "species": "Monstera",
        "age": 2,
        "height": 45.5,
        "width": 30.2,
        "description": "Beautiful tropical plant with split leaves",
        "image": "https://example.com/monstera.jpg"
    }


# ------------------------------------------------------
# CREATE
# ------------------------------------------------------

def test_create_plant(client, authenticated_user, plant_payload):
    client.force_authenticate(user=authenticated_user)

    url = reverse("plant-list")
    response = client.post(url, plant_payload, format="json")

    assert response.status_code == 201
    assert Plants.objects.count() == 1
    
    plant = Plants.objects.first()
    assert plant.name == "Monstera Deliciosa"
    assert plant.species == "Monstera"
    assert plant.age == 2


def test_unauthenticated_cannot_create_plant(client, plant_payload):
    url = reverse("plant-list")
    response = client.post(url, plant_payload, format="json")

    assert response.status_code == 401
    assert Plants.objects.count() == 0


# ------------------------------------------------------
# LIST
# ------------------------------------------------------

def test_list_plants(client, authenticated_user):
    client.force_authenticate(user=authenticated_user)
    
    # Create multiple plants
    Plants.objects.create(
        name="Fiddle Leaf Fig",
        species="Ficus lyrata",
        age=3,
        height=120.0,
        width=50.0,
        description="Popular indoor plant"
    )
    
    Plants.objects.create(
        name="Snake Plant",
        species="Sansevieria",
        age=1,
        height=40.0,
        width=20.0,
        description="Low maintenance plant"
    )

    url = reverse("plant-list")
    response = client.get(url)

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


# ------------------------------------------------------
# RETRIEVE
# ------------------------------------------------------

def test_retrieve_plant(client, authenticated_user):
    client.force_authenticate(user=authenticated_user)
    
    plant = Plants.objects.create(
        name="Pothos",
        species="Epipremnum aureum",
        age=1,
        height=25.0,
        width=35.0,
        description="Easy trailing plant"
    )

    url = reverse("plant-detail", args=[plant.id])
    response = client.get(url)

    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Pothos"
    assert data["species"] == "Epipremnum aureum"
    assert data["id"] == plant.id


# ------------------------------------------------------
# UPDATE
# ------------------------------------------------------

def test_update_plant(client, authenticated_user):
    client.force_authenticate(user=authenticated_user)
    
    plant = Plants.objects.create(
        name="Old Name",
        species="Old Species",
        age=1,
        height=10.0,
        width=10.0,
        description="Old description"
    )

    url = reverse("plant-detail", args=[plant.id])
    updated_data = {
        "name": "Updated Plant Name",
        "species": "Updated Species",
        "age": 2,
        "height": 50.0,
        "width": 40.0,
        "description": "Updated description"
    }

    response = client.put(url, updated_data, format="json")

    assert response.status_code == 200
    plant.refresh_from_db()
    assert plant.name == "Updated Plant Name"
    assert plant.species == "Updated Species"
    assert plant.age == 2
    assert plant.height == 50.0


# ------------------------------------------------------
# DELETE
# ------------------------------------------------------

def test_delete_plant(client, authenticated_user):
    client.force_authenticate(user=authenticated_user)
    
    plant = Plants.objects.create(
        name="To Delete",
        species="Delete Species",
        age=1,
        height=10.0,
        width=10.0,
        description="Will be deleted"
    )

    url = reverse("plant-detail", args=[plant.id])
    response = client.delete(url)

    assert response.status_code == 204
    assert Plants.objects.count() == 0


# ------------------------------------------------------
# CUSTOM ACTION: watering_record
# ------------------------------------------------------

def test_watering_record_endpoint(client, authenticated_user):
    client.force_authenticate(user=authenticated_user)
    
    plant = Plants.objects.create(
        name="Test Plant",
        species="Test Species",
        age=1,
        height=30.0,
        width=20.0,
        description="Test plant for watering"
    )
    
    # Create watering records
    now = timezone.now()
    PlantWatering.objects.create(
        plant=plant,
        watering_date=now,
        next_watering_date=now + timedelta(days=7),
        amount_ml=200.0,
        notes="First watering"
    )
    
    PlantWatering.objects.create(
        plant=plant,
        watering_date=now + timedelta(days=7),
        next_watering_date=now + timedelta(days=14),
        amount_ml=250.0,
        notes="Second watering"
    )

    url = reverse("plant-watering-record", kwargs={"pk": plant.id})
    response = client.get(url)

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    # Should be ordered by date (newest first)
    assert data[0]["notes"] == "Second watering"
    assert data[1]["notes"] == "First watering"


# ------------------------------------------------------
# CUSTOM ACTION: upload_image
# ------------------------------------------------------

@patch('cloudinary.uploader.upload')
def test_upload_image_endpoint(mock_upload, client, authenticated_user):
    client.force_authenticate(user=authenticated_user)
    
    # Mock Cloudinary response
    mock_upload.return_value = {
        'secure_url': 'https://cloudinary.com/greencare/plants/test-image.jpg',
        'public_id': 'greencare/plants/test-image'
    }
    
    # Create a fake file
    from io import BytesIO
    from django.core.files.uploadedfile import SimpleUploadedFile
    
    fake_image = SimpleUploadedFile(
        "test_plant.jpg",
        b"fake image content",
        content_type="image/jpeg"
    )

    url = reverse("plant-upload-image")
    response = client.post(url, {'image': fake_image}, format='multipart')

    assert response.status_code == 200
    data = response.json()
    assert 'image_url' in data
    assert 'public_id' in data
    assert data['image_url'] == 'https://cloudinary.com/greencare/plants/test-image.jpg'
    assert mock_upload.called


def test_upload_image_without_file(client, authenticated_user):
    client.force_authenticate(user=authenticated_user)

    url = reverse("plant-upload-image")
    response = client.post(url, {}, format='multipart')

    assert response.status_code == 400
    data = response.json()
    assert 'error' in data
    assert data['error'] == 'No image provided'


# ------------------------------------------------------
# VALIDATION ERRORS
# ------------------------------------------------------

def test_create_plant_invalid_payload(client, authenticated_user):
    client.force_authenticate(user=authenticated_user)
    
    url = reverse("plant-list")
    
    # Missing required fields
    invalid_payload = {
        "name": "Incomplete Plant"
    }
    
    response = client.post(url, invalid_payload, format="json")
    
    assert response.status_code == 400


def test_create_plant_missing_required_fields(client, authenticated_user):
    client.force_authenticate(user=authenticated_user)
    
    url = reverse("plant-list")
    
    # Empty payload
    response = client.post(url, {}, format="json")
    
    assert response.status_code == 400
    data = response.json()
    # Should have errors for required fields
    assert 'name' in data or 'species' in data or 'age' in data


def test_update_plant_partial(client, authenticated_user):
    """Test partial update using PATCH"""
    client.force_authenticate(user=authenticated_user)
    
    plant = Plants.objects.create(
        name="Original Name",
        species="Original Species",
        age=1,
        height=10.0,
        width=10.0,
        description="Original description"
    )

    url = reverse("plant-detail", args=[plant.id])
    partial_data = {
        "name": "Partially Updated Name"
    }

    response = client.patch(url, partial_data, format="json")

    assert response.status_code == 200
    plant.refresh_from_db()
    assert plant.name == "Partially Updated Name"
    # Other fields should remain unchanged
    assert plant.species == "Original Species"
    assert plant.age == 1
