import pytest
from unittest.mock import Mock, patch
from plants.models import Plants
from plants.serializers import PlantSerializer


# ------------------------------------------------------
# Plants Model Unit Tests
# ------------------------------------------------------

class TestPlantsModel:
    """Test the Plants model logic without database"""

    def test_plant_string_representation(self):
        """Test the __str__ method of Plants model"""
        plant = Plants(
            name="Fiddle Leaf Fig",
            species="Ficus lyrata",
            age=3,
            height=120.0,
            width=50.0,
            description="Popular indoor plant"
        )

        expected_str = "Fiddle Leaf Fig - Ficus lyrata"
        assert str(plant) == expected_str

    def test_plant_attributes(self):
        """Test that Plants model has correct attributes"""
        plant = Plants(
            name="Monstera Deliciosa",
            species="Monstera",
            age=2,
            height=45.5,
            width=30.2,
            description="Beautiful tropical plant"
        )

        assert plant.name == "Monstera Deliciosa"
        assert plant.species == "Monstera"
        assert plant.age == 2
        assert plant.height == 45.5
        assert plant.width == 30.2
        assert plant.description == "Beautiful tropical plant"

    def test_plant_with_image(self):
        """Test plant with image URL"""
        plant = Plants(
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
        """Test plant without image"""
        plant = Plants(
            name="Pothos",
            species="Epipremnum aureum",
            age=1,
            height=25.0,
            width=35.0,
            description="Easy trailing plant"
        )

        assert plant.image is None or plant.image == ""

    def test_plant_positive_dimensions(self):
        """Test that dimensions can be positive"""
        plant = Plants(
            name="Test Plant",
            species="Test Species",
            age=2,
            height=50.0,
            width=30.0,
            description="Test"
        )

        assert plant.height > 0
        assert plant.width > 0
        assert plant.age > 0


# ------------------------------------------------------
# PlantSerializer Unit Tests
# ------------------------------------------------------

class TestPlantSerializer:
    """Test the PlantSerializer without database"""

    def test_serialize_plant(self):
        """Test serializing a plant instance"""
        mock_plant = Mock(spec=Plants)
        mock_plant.id = 1
        mock_plant.name = "Rubber Plant"
        mock_plant.species = "Ficus elastica"
        mock_plant.age = 2
        mock_plant.height = 80.0
        mock_plant.width = 40.0
        mock_plant.description = "Shiny leaves"
        mock_plant.image = "https://example.com/rubber.jpg"

        serializer = PlantSerializer(mock_plant)
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

        validated_data = serializer.validated_data
        assert validated_data['name'] == "Spider Plant"
        assert validated_data['species'] == "Chlorophytum comosum"

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


# ------------------------------------------------------
# Business Logic Unit Tests
# ------------------------------------------------------

class TestPlantsBusinessLogic:
    """Test business logic related to plants"""

    def test_plant_age_comparison(self):
        """Test age comparison logic"""
        young_plant = Plants(
            name="Young Plant",
            species="Test",
            age=1,
            height=10.0,
            width=10.0,
            description="Young"
        )

        old_plant = Plants(
            name="Old Plant",
            species="Test",
            age=10,
            height=100.0,
            width=50.0,
            description="Old"
        )

        assert old_plant.age > young_plant.age
        assert young_plant.age < 5

    def test_plant_size_calculation(self):
        """Test size calculation logic"""
        plant = Plants(
            name="Test",
            species="Test",
            age=2,
            height=50.0,
            width=30.0,
            description="Test"
        )

        # Calculate approximate volume (simplified)
        volume = plant.height * plant.width
        assert volume == 1500.0

    def test_plant_name_concatenation(self):
        """Test name and species concatenation"""
        plant = Plants(
            name="Monstera",
            species="Deliciosa",
            age=2,
            height=50.0,
            width=30.0,
            description="Test"
        )

        full_name = f"{plant.name} - {plant.species}"
        assert full_name == "Monstera - Deliciosa"


# ------------------------------------------------------
# Edge Cases and Validation Unit Tests
# ------------------------------------------------------

class TestPlantsEdgeCases:
    """Test edge cases and boundary conditions"""

    def test_very_long_plant_name(self):
        """Test plant with very long name"""
        long_name = "A" * 99
        plant = Plants(
            name=long_name,
            species="Test Species",
            age=1,
            height=10.0,
            width=10.0,
            description="Test"
        )

        assert plant.name == long_name
        assert len(plant.name) == 99

    def test_very_long_description(self):
        """Test plant with very long description"""
        long_description = "This is a very long description. " * 100
        plant = Plants(
            name="Test Plant",
            species="Test Species",
            age=1,
            height=10.0,
            width=10.0,
            description=long_description
        )

        assert len(plant.description) > 1000

    def test_plant_with_zero_age(self):
        """Test plant with age 0 (seedling)"""
        plant = Plants(
            name="Seedling",
            species="Test Species",
            age=0,
            height=1.0,
            width=1.0,
            description="Just planted"
        )

        assert plant.age == 0
        assert plant.age >= 0

    def test_plant_with_large_dimensions(self):
        """Test plant with very large dimensions"""
        plant = Plants(
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
        """Test decimal dimensions are handled correctly"""
        plant = Plants(
            name="Test Plant",
            species="Test Species",
            age=1,
            height=15.75,
            width=10.25,
            description="Test"
        )

        assert plant.height == 15.75
        assert plant.width == 10.25

    def test_empty_description(self):
        """Test plant with empty description"""
        plant = Plants(
            name="No Description",
            species="Test",
            age=1,
            height=10.0,
            width=10.0,
            description=""
        )

        assert plant.description == ""
        assert isinstance(plant.description, str)

    def test_plant_attribute_types(self):
        """Test that plant attributes have correct types"""
        plant = Plants(
            name="Test",
            species="Test",
            age=5,
            height=50.5,
            width=30.3,
            description="Test"
        )

        assert isinstance(plant.name, str)
        assert isinstance(plant.species, str)
        assert isinstance(plant.age, int)
        assert isinstance(plant.height, float)
        assert isinstance(plant.width, float)
        assert isinstance(plant.description, str)
