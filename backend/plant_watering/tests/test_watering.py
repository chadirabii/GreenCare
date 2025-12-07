# plant_watering/tests/test_watering.py
import pytest
from datetime import datetime, timedelta
from plant_watering.models import Plants, PlantWatering
from django.utils.timezone import make_aware


# 🌱 Fixture 1 — Reusable plant for all tests
@pytest.fixture
def test_plant(db):
    """
    Creates and returns a reusable Plant instance.
    """
    return Plants.objects.create(
        name="Generic Plant",
        species="TestSpecies",
        age=2,
        height=10.0,
        width=5.0,
        description="Reusable test plant"
    )


# 💧 Fixture 2 — Reusable watering record
@pytest.fixture
def watering_record(test_plant):
    """
    Creates a watering record for the test_plant fixture.
    """
    watering_date = make_aware(datetime.now())
    next_date = watering_date + timedelta(days=7)

    return PlantWatering.objects.create(
        plant=test_plant,
        watering_date=watering_date,
        next_watering_date=next_date,
        amount_ml=250.0,
        notes="Weekly watering",
        is_completed=False
    )


# ---------------------------------------------------
# 🧪 TEST 1 — CREATE a PlantWatering record (CRUD: C)
# ---------------------------------------------------
@pytest.mark.django_db
def test_create_plant_watering(watering_record):
    """
    Test creating a PlantWatering record using the fixture.
    """

    # Assertions (verify creation)
    assert PlantWatering.objects.count() == 1
    assert watering_record.amount_ml == 250.0
    assert watering_record.notes == "Weekly watering"
    assert watering_record.is_completed is False
    assert str(watering_record) == f"{watering_record.plant.name} - {watering_record.watering_date.date()}"


# ---------------------------------------------------
# 🧪 TEST 2 — READ all PlantWatering records (CRUD: R)
# ---------------------------------------------------
@pytest.mark.django_db
def test_get_all_plant_watering(test_plant):
    """
    Test retrieving all watering records for a plant.
    """

    # Create multiple watering records using the fixture data pattern
    PlantWatering.objects.create(
        plant=test_plant,
        watering_date=make_aware(datetime.now()),
        next_watering_date=make_aware(datetime.now() + timedelta(days=5)),
        amount_ml=200.0,
        notes="Morning watering",
        is_completed=True
    )

    PlantWatering.objects.create(
        plant=test_plant,
        watering_date=make_aware(datetime.now() - timedelta(days=3)),
        next_watering_date=make_aware(datetime.now() + timedelta(days=4)),
        amount_ml=300.0,
        notes="Afternoon watering",
        is_completed=False
    )

    all_watering = PlantWatering.objects.all()

    assert all_watering.count() == 2
    notes = [w.notes for w in all_watering]
    assert "Morning watering" in notes
    assert "Afternoon watering" in notes


# ----------------------------------------------------
# 🧪 TEST 3 — UPDATE a PlantWatering record (CRUD: U)
# ----------------------------------------------------
@pytest.mark.django_db
def test_update_plant_watering(watering_record):
    """
    Test updating an existing PlantWatering record.
    """

    # Update fields
    watering_record.amount_ml = 300.0
    watering_record.notes = "Updated watering amount"
    watering_record.is_completed = True
    watering_record.save()

    # Fetch updated version
    updated = PlantWatering.objects.get(id=watering_record.id)

    assert updated.amount_ml == 300.0
    assert updated.notes == "Updated watering amount"
    assert updated.is_completed is True


# ----------------------------------------------------
# 🧪 TEST 4 — DELETE a PlantWatering record (CRUD: D)
# ----------------------------------------------------
@pytest.mark.django_db
def test_delete_plant_watering(watering_record):
    """
    Test deleting a PlantWatering record.
    """

    assert PlantWatering.objects.count() == 1

    watering_record.delete()

    assert PlantWatering.objects.count() == 0
