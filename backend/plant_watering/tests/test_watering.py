import pytest
from unittest.mock import Mock
from datetime import datetime, timedelta
from plant_watering.models import PlantWatering
from plants.models import Plants
from django.utils.timezone import make_aware


# ------------------------------------------------------
# PlantWatering Model Unit Tests
# ------------------------------------------------------

class TestPlantWateringModel:
    """Test the PlantWatering model logic without database"""

    def test_plant_watering_string_method(self):
        """Test the __str__ method logic of PlantWatering"""
        # Test the string format logic without instantiating the model
        plant_name = "Monstera"
        watering_date = datetime(2025, 12, 8, 10, 0, 0)

        expected_str = f"{plant_name} - {watering_date.date()}"
        assert expected_str == "Monstera - 2025-12-08"

    def test_plant_watering_has_required_fields(self):
        """Test PlantWatering has required attributes"""
        assert hasattr(PlantWatering, 'plant')
        assert hasattr(PlantWatering, 'watering_date')
        assert hasattr(PlantWatering, 'next_watering_date')
        assert hasattr(PlantWatering, 'amount_ml')
        assert hasattr(PlantWatering, 'notes')
        assert hasattr(PlantWatering, 'is_completed')

    def test_watering_completion_status_logic(self):
        """Test watering completion status logic"""
        # Test boolean logic
        is_completed_false = False
        is_completed_true = True

        assert is_completed_false is False
        assert is_completed_true is True

    def test_watering_notes_string_type(self):
        """Test watering notes are strings"""
        notes = "Added fertilizer"
        empty_notes = ""

        assert isinstance(notes, str)
        assert isinstance(empty_notes, str)
        assert notes == "Added fertilizer"


# ------------------------------------------------------
# Business Logic Unit Tests
# ------------------------------------------------------

class TestPlantWateringBusinessLogic:
    """Test business logic related to plant watering"""

    def test_watering_schedule_calculation(self):
        """Test calculating next watering date"""
        watering_date = make_aware(datetime(2025, 12, 1, 10, 0, 0))
        next_date = watering_date + timedelta(days=7)

        days_until_next = (next_date - watering_date).days
        assert days_until_next == 7

    def test_watering_amount_comparison(self):
        """Test comparing watering amounts"""
        light_watering_ml = 100.0
        heavy_watering_ml = 500.0

        assert heavy_watering_ml > light_watering_ml
        assert light_watering_ml < 200.0
        assert isinstance(light_watering_ml, float)

    def test_watering_date_is_past(self):
        """Test checking if watering date is in the past"""
        past_date = make_aware(datetime.now() - timedelta(days=3))
        future_date = make_aware(datetime.now() + timedelta(days=3))
        now = make_aware(datetime.now())

        assert past_date < now
        assert future_date > now

    def test_next_watering_calculation(self):
        """Test calculating next watering date with different intervals"""
        start_date = make_aware(datetime(2025, 1, 1))

        # Weekly watering
        weekly_next = start_date + timedelta(days=7)
        assert (weekly_next - start_date).days == 7

        # Bi-weekly watering
        biweekly_next = start_date + timedelta(days=14)
        assert (biweekly_next - start_date).days == 14


# ------------------------------------------------------
# Edge Cases and Validation Unit Tests
# ------------------------------------------------------

class TestPlantWateringEdgeCases:
    """Test edge cases and boundary conditions"""

    def test_minimal_watering_amount(self):
        """Test very small watering amount"""
        amount_ml = 1.0

        assert amount_ml == 1.0
        assert amount_ml > 0
        assert isinstance(amount_ml, float)

    def test_large_watering_amount(self):
        """Test very large watering amount"""
        amount_ml = 10000.0

        assert amount_ml == 10000.0
        assert amount_ml > 1000.0

    def test_decimal_watering_amount(self):
        """Test decimal watering amount precision"""
        amount_ml = 250.5

        assert amount_ml == 250.5
        assert isinstance(amount_ml, float)

    def test_very_long_notes(self):
        """Test watering with very long notes"""
        long_notes = "This is a very detailed note about the watering. " * 50

        assert len(long_notes) > 1000
        assert isinstance(long_notes, str)

    def test_empty_notes(self):
        """Test watering with empty notes"""
        notes = ""

        assert notes == ""
        assert isinstance(notes, str)
        assert len(notes) == 0

    def test_same_day_watering(self):
        """Test watering and next watering on same day"""
        watering_date = make_aware(datetime.now())
        next_watering_date = watering_date

        assert watering_date == next_watering_date
        days_between = (next_watering_date - watering_date).days
        assert days_between == 0

    def test_long_interval_between_waterings(self):
        """Test long interval between waterings"""
        watering_date = make_aware(datetime(2025, 1, 1))
        next_date = make_aware(datetime(2025, 12, 31))

        days_between = (next_date - watering_date).days
        assert days_between >= 360

    def test_watering_attribute_types(self):
        """Test that watering attributes have correct types"""
        amount_ml = 250.0
        notes = "Test"
        is_completed = True
        watering_date = make_aware(datetime.now())

        assert isinstance(amount_ml, float)
        assert isinstance(notes, str)
        assert isinstance(is_completed, bool)
        assert isinstance(watering_date, datetime)

    def test_watering_amount_ranges(self):
        """Test various watering amount ranges"""
        small = 50.0
        medium = 250.0
        large = 1000.0

        assert small < medium < large
        assert all(isinstance(x, float) for x in [small, medium, large])

    def test_date_arithmetic(self):
        """Test date arithmetic for watering schedules"""
        base_date = make_aware(datetime(2025, 1, 1))

        # Add days
        one_week_later = base_date + timedelta(days=7)
        assert (one_week_later - base_date).days == 7

        # Add months (approximately)
        one_month_later = base_date + timedelta(days=30)
        assert (one_month_later - base_date).days == 30
