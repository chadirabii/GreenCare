import pytest
from rest_framework.test import APIClient
from datetime import datetime, timedelta
from unittest.mock import patch
from plant_watering.models import PlantWatering
from plants.models import Plants
from django.utils import timezone
from django.urls import reverse

pytestmark = pytest.mark.django_db

# ------------------------------------------------------
# Fixtures
# ------------------------------------------------------

@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def plant(db):
    return Plants.objects.create(
        name="Test Plant",
        species="Test Species",
        age=2,
        height=30.5,
        width=15.2,
        description="Test plant used in CRUD integration tests"
    )


@pytest.fixture
def payload(plant):
    """Valid full payload (used by POST + PUT)."""
    return {
        "plant": plant.id,
        "watering_date": timezone.now().isoformat(),
        "amount_ml": 200,
        "notes": "Test notes",
        "is_completed": False
    }


# ------------------------------------------------------
# CREATE
# ------------------------------------------------------

@patch("plant_watering.views.WeatherService.calculate_next_watering")
def test_create_watering_cycle(mock_weather, client, payload):
    fake_date = timezone.now() + timedelta(days=3)
    mock_weather.return_value = fake_date

    url = reverse("plant-watering-list")
    response = client.post(url, payload, format="json")

    assert response.status_code == 201
    data = response.json()

    assert data["amount_ml"] == 200
    assert data["plant"] == payload["plant"]
    assert "id" in data
    assert data["next_watering_date"].startswith(fake_date.date().isoformat())
    assert PlantWatering.objects.count() == 1


# ------------------------------------------------------
# LIST
# ------------------------------------------------------

def test_list_watering_cycles(client, plant):
    PlantWatering.objects.create(
        plant=plant,
        watering_date=timezone.now(),
        next_watering_date=timezone.now() + timedelta(days=1),
        amount_ml=100
    )

    url = reverse("plant-watering-list")
    response = client.get(url)

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1


# ------------------------------------------------------
# RETRIEVE
# ------------------------------------------------------

def test_retrieve_watering_cycle(client, plant):
    item = PlantWatering.objects.create(
        plant=plant,
        watering_date=timezone.now(),
        next_watering_date=timezone.now() + timedelta(days=2),
        amount_ml=300
    )

    url = reverse("plant-watering-detail", args=[item.id])
    response = client.get(url)

    assert response.status_code == 200
    assert response.json()["amount_ml"] == 300
    assert response.json()["id"] == item.id


# ------------------------------------------------------
# UPDATE (PUT requires full payload)
# ------------------------------------------------------

@patch("plant_watering.views.WeatherService.calculate_next_watering")
def test_update_watering_cycle(mock_weather, client, plant, payload):
    mock_weather.return_value = timezone.now() + timedelta(days=5)

    item = PlantWatering.objects.create(
        plant=plant,
        watering_date=timezone.now(),
        next_watering_date=timezone.now(),
        amount_ml=100,
        notes="Old notes"
    )

    url = reverse("plant-watering-detail", args=[item.id])

    updated = {
        "plant": plant.id,
        "watering_date": timezone.now().isoformat(),
        "amount_ml": 999,
        "notes": "Updated notes",
        "is_completed": True
    }

    response = client.put(url, updated, format="json")

    assert response.status_code == 200
    data = response.json()
    assert data["amount_ml"] == 999
    assert data["notes"] == "Updated notes"

    item.refresh_from_db()
    assert item.amount_ml == 999


# ------------------------------------------------------
# DELETE
# ------------------------------------------------------

def test_delete_watering_cycle(client, plant):
    item = PlantWatering.objects.create(
        plant=plant,
        watering_date=timezone.now(),
        next_watering_date=timezone.now(),
        amount_ml=123
    )

    url = reverse("plant-watering-detail", args=[item.id])
    response = client.delete(url)

    assert response.status_code == 204
    assert PlantWatering.objects.count() == 0


# ------------------------------------------------------
# WEATHER FORECAST
# ------------------------------------------------------

@patch("plant_watering.views.WeatherService.get_weather_forecast")
@patch("plant_watering.views.WeatherService.calculate_next_watering")
def test_weather_forecast(mock_calc, mock_weather, client):
    mock_weather.return_value = {"temp": 25, "humidity": 60}
    mock_calc.return_value = datetime(2025, 1, 10)

    url = reverse("plant-watering-weather-forecast")
    response = client.get(url)

    assert response.status_code == 200

    data = response.json()
    assert data["temp"] == 25
    assert data["humidity"] == 60
    assert data["next_recommended_watering"] == "2025-01-10"


# ------------------------------------------------------
# VALIDATION ERROR
# ------------------------------------------------------

def test_create_invalid_payload(client):
    url = reverse("plant-watering-list")

    bad_payload = {"amount_ml": 100}

    response = client.post(url, bad_payload, format="json")

    assert response.status_code == 400
