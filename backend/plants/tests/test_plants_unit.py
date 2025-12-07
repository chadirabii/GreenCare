import pytest
from django.core.exceptions import ValidationError
from plants.models import Plants
from plants.serializers import PlantSerializer
from authentication.models import CustomUser
from django.utils import timezone

pytestmark = pytest.mark.django_db


# ------------------------------------------------------
# Model Tests
# ------------------------------------------------------

class TestPlantsModel:
    """Test the Plants model"""

    def test_create_plant_successfully(self):
        """Test creating a plant with valid data"""
        plant = Plants.objects.create(
            name="Monstera Deliciosa",
            species="Monstera",
            age=2,
            height=45.5,
            width=30.2,
            description="Beautiful tropical plant"
        )
        
        assert plant.id is not None
        assert plant.name == "Monstera Deliciosa"
        assert plant.species == "Monstera"
        assert plant.age == 2
        assert plant.height == 45.5
        assert plant.width == 30.2

    def test_plant_string_representation(self):
        """Test the __str__ method of Plants model"""
        plant = Plants.objects.create(
            name="Fiddle Leaf Fig",
            species="Ficus lyrata",
            age=3,
            height=120.0,
            width=50.0,
            description="Popular indoor plant"
        )
        
        expected_str = "Fiddle Leaf Fig - Ficus lyrata"
        assert str(plant) == expected_str

    def test_plant_with_optional_image(self):
        """Test creating a plant with an image URL"""
        plant = Plants.objects.create(
            name="Snake Plant",
            species="Sansevieria",
            age=1,
            height=40.0,
            width=20.0,
            description="Low maintenance",
            image="https://example.com/snake-plant.jpg"
        )
        
        assert plant.image == "https://example.com/snake-plant.jpg"

    def test_plant_without_image(self):
        """Test creating a plant without an image (should be allowed)"""
        plant = Plants.objects.create(
            name="Pothos",
            species="Epipremnum aureum",
            age=1,
            height=25.0,
            width=35.0,
            description="Easy trailing plant"
        )
        
        assert plant.image is None or plant.image == ""

    def test_plant_age_is_positive(self):
        """Test that plant age should be positive"""
        plant = Plants.objects.create(
            name="Test Plant",
            species="Test Species",
            age=5,
            height=10.0,
            width=10.0,
            description="Test"
        )
        
        assert plant.age > 0

    def test_plant_dimensions_are_positive(self):
        """Test that height and width are positive"""
        plant = Plants.objects.create(
            name="Test Plant",
            species="Test Species",
            age=2,
            height=50.0,
            width=30.0,
            description="Test"
        )
        
        assert plant.height > 0
        assert plant.width > 0


# ------------------------------------------------------
# Serializer Tests
# ------------------------------------------------------

class TestPlantSerializer:
    """Test the PlantSerializer"""

    def test_serialize_plant(self):
        """Test serializing a plant instance"""
        plant = Plants.objects.create(
            name="Rubber Plant",
            species="Ficus elastica",
            age=2,
            height=80.0,
            width=40.0,
            description="Shiny leaves",
            image="https://example.com/rubber.jpg"
        )
        
        serializer = PlantSerializer(plant)
        data = serializer.data
        
        assert data['name'] == "Rubber Plant"
        assert data['species'] == "Ficus elastica"
        assert data['age'] == 2
        assert float(data['height']) == 80.0
        assert float(data['width']) == 40.0
        assert data['description'] == "Shiny leaves"
        assert data['image'] == "https://example.com/rubber.jpg"

    def test_deserialize_valid_plant_data(self):
        """Test deserializing valid plant data"""
        data = {
            "name": "Spider Plant",
            "species": "Chlorophytum comosum",
            "age": 1,
            "height": 15.0,
            "width": 25.0,
            "description": "Air purifying plant"
        }
        
        serializer = PlantSerializer(data=data)
        assert serializer.is_valid()
        
        plant = serializer.save()
        assert plant.name == "Spider Plant"
        assert plant.species == "Chlorophytum comosum"

    def test_deserialize_invalid_data_missing_name(self):
        """Test validation fails when name is missing"""
        data = {
            "species": "Test Species",
            "age": 1,
            "height": 10.0,
            "width": 10.0,
            "description": "Test"
        }
        
        serializer = PlantSerializer(data=data)
        assert not serializer.is_valid()
        assert 'name' in serializer.errors

    def test_deserialize_invalid_data_missing_species(self):
        """Test validation fails when species is missing"""
        data = {
            "name": "Test Plant",
            "age": 1,
            "height": 10.0,
            "width": 10.0,
            "description": "Test"
        }
        
        serializer = PlantSerializer(data=data)
        assert not serializer.is_valid()
        assert 'species' in serializer.errors

    def test_update_plant_via_serializer(self):
        """Test updating a plant using the serializer"""
        plant = Plants.objects.create(
            name="Original Name",
            species="Original Species",
            age=1,
            height=10.0,
            width=10.0,
            description="Original description"
        )
        
        update_data = {
            "name": "Updated Name",
            "species": "Updated Species",
            "age": 2,
            "height": 20.0,
            "width": 15.0,
            "description": "Updated description"
        }
        
        serializer = PlantSerializer(plant, data=update_data)
        assert serializer.is_valid()
        
        updated_plant = serializer.save()
        assert updated_plant.name == "Updated Name"
        assert updated_plant.species == "Updated Species"
        assert updated_plant.age == 2

    def test_partial_update_plant(self):
        """Test partial update (PATCH) via serializer"""
        plant = Plants.objects.create(
            name="Test Plant",
            species="Test Species",
            age=1,
            height=10.0,
            width=10.0,
            description="Test"
        )
        
        partial_data = {
            "height": 50.0
        }
        
        serializer = PlantSerializer(plant, data=partial_data, partial=True)
        assert serializer.is_valid()
        
        updated_plant = serializer.save()
        assert updated_plant.height == 50.0
        assert updated_plant.name == "Test Plant"  # Should remain unchanged


# ------------------------------------------------------
# Business Logic Tests
# ------------------------------------------------------

class TestPlantsBusinessLogic:
    """Test business logic related to plants"""

    def test_plant_count_increases_on_create(self):
        """Test that plant count increases when creating plants"""
        initial_count = Plants.objects.count()
        
        Plants.objects.create(
            name="Plant 1",
            species="Species 1",
            age=1,
            height=10.0,
            width=10.0,
            description="Test"
        )
        
        assert Plants.objects.count() == initial_count + 1

    def test_plant_count_decreases_on_delete(self):
        """Test that plant count decreases when deleting plants"""
        plant = Plants.objects.create(
            name="To Delete",
            species="Delete Species",
            age=1,
            height=10.0,
            width=10.0,
            description="Will be deleted"
        )
        
        count_before_delete = Plants.objects.count()
        plant.delete()
        
        assert Plants.objects.count() == count_before_delete - 1

    def test_filter_plants_by_species(self):
        """Test filtering plants by species"""
        Plants.objects.create(
            name="Monstera 1",
            species="Monstera",
            age=1,
            height=10.0,
            width=10.0,
            description="Test"
        )
        
        Plants.objects.create(
            name="Ficus 1",
            species="Ficus",
            age=1,
            height=10.0,
            width=10.0,
            description="Test"
        )
        
        Plants.objects.create(
            name="Monstera 2",
            species="Monstera",
            age=2,
            height=20.0,
            width=15.0,
            description="Test"
        )
        
        monstera_plants = Plants.objects.filter(species="Monstera")
        assert monstera_plants.count() == 2

    def test_update_plant_attributes(self):
        """Test updating plant attributes"""
        plant = Plants.objects.create(
            name="Old Name",
            species="Old Species",
            age=1,
            height=10.0,
            width=10.0,
            description="Old description"
        )
        
        # Update attributes
        plant.name = "New Name"
        plant.age = 3
        plant.height = 50.0
        plant.save()
        
        # Refresh from database
        plant.refresh_from_db()
        
        assert plant.name == "New Name"
        assert plant.age == 3
        assert plant.height == 50.0

    def test_plant_ordering(self):
        """Test ordering plants by name"""
        Plants.objects.create(
            name="Zebra Plant",
            species="Aphelandra squarrosa",
            age=1,
            height=10.0,
            width=10.0,
            description="Test"
        )
        
        Plants.objects.create(
            name="Aloe Vera",
            species="Aloe",
            age=1,
            height=10.0,
            width=10.0,
            description="Test"
        )
        
        plants = Plants.objects.all().order_by('name')
        plant_names = [p.name for p in plants]
        
        assert plant_names == sorted(plant_names)


# ------------------------------------------------------
# Edge Cases and Validation Tests
# ------------------------------------------------------

class TestPlantsEdgeCases:
    """Test edge cases and boundary conditions"""

    def test_very_long_plant_name(self):
        """Test creating a plant with a very long name"""
        long_name = "A" * 99  # Just under max_length
        plant = Plants.objects.create(
            name=long_name,
            species="Test Species",
            age=1,
            height=10.0,
            width=10.0,
            description="Test"
        )
        
        assert plant.name == long_name

    def test_very_long_description(self):
        """Test creating a plant with a very long description"""
        long_description = "This is a very long description. " * 100
        plant = Plants.objects.create(
            name="Test Plant",
            species="Test Species",
            age=1,
            height=10.0,
            width=10.0,
            description=long_description
        )
        
        assert len(plant.description) > 1000

    def test_plant_with_zero_age(self):
        """Test creating a plant with age 0 (seedling)"""
        plant = Plants.objects.create(
            name="Seedling",
            species="Test Species",
            age=0,
            height=1.0,
            width=1.0,
            description="Just planted"
        )
        
        assert plant.age == 0

    def test_plant_with_large_dimensions(self):
        """Test creating a plant with very large dimensions"""
        plant = Plants.objects.create(
            name="Giant Tree",
            species="Sequoia",
            age=100,
            height=5000.0,
            width=1000.0,
            description="Very large tree"
        )
        
        assert plant.height == 5000.0
        assert plant.width == 1000.0

    def test_plant_with_decimal_dimensions(self):
        """Test that decimal dimensions are handled correctly"""
        plant = Plants.objects.create(
            name="Test Plant",
            species="Test Species",
            age=1,
            height=15.75,
            width=10.25,
            description="Test"
        )
        
        assert plant.height == 15.75
        assert plant.width == 10.25
