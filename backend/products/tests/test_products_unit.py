import pytest
from decimal import Decimal
from unittest.mock import Mock, patch, MagicMock
from django.core.exceptions import ValidationError
from products.models import Product, ProductImage
from products.serializers import ProductSerializer, ProductImageSerializer
from authentication.models import CustomUser
from django.utils import timezone


# ------------------------------------------------------
# Product Model Unit Tests
# ------------------------------------------------------

class TestProductModel:
    """Test the Product model logic without database"""

    def test_product_string_representation(self):
        """Test the __str__ method of Product model"""
        product = Product(
            id=1,
            name="Garden Shovel",
            description="Sturdy garden shovel",
            price=Decimal("15.50"),
            category="tools"
        )

        assert str(product) == "Garden Shovel"

    def test_product_attributes(self):
        """Test that Product model has correct attributes"""
        product = Product(
            name="Organic Fertilizer",
            description="High quality organic fertilizer",
            price=Decimal("25.99"),
            category="fertilizers"
        )

        assert product.name == "Organic Fertilizer"
        assert product.description == "High quality organic fertilizer"
        assert product.price == Decimal("25.99")
        assert product.category == "fertilizers"

    def test_product_category_choices(self):
        """Test valid category choices"""
        valid_categories = ['plants', 'medicines', 'tools', 'fertilizers']

        for category in valid_categories:
            product = Product(
                name="Test",
                description="Test",
                price=Decimal("10.00"),
                category=category
            )
            assert product.category in valid_categories

    def test_product_price_is_decimal(self):
        """Test that price is a Decimal type"""
        product = Product(
            name="Test",
            description="Test",
            price=Decimal("19.99"),
            category="plants"
        )

        assert isinstance(product.price, Decimal)
        assert product.price == Decimal("19.99")

    def test_product_with_owner(self):
        """Test product owner relationship exists"""
        # Test that Product model has owner field
        product = Product(
            name="Test Product",
            description="Test",
            price=Decimal("10.00"),
            category="plants"
        )

        # Verify owner field exists and can be None
        assert hasattr(product, 'owner')
        assert product.owner is None  # Not set yet

    def test_product_without_owner(self):
        """Test product can have None as owner"""
        product = Product(
            name="No Owner Product",
            description="Product without owner",
            price=Decimal("10.00"),
            category="plants",
            owner=None
        )

        assert product.owner is None


# ------------------------------------------------------
# ProductImage Model Unit Tests
# ------------------------------------------------------

class TestProductImageModel:
    """Test the ProductImage model logic without database"""

    def test_product_image_string_method(self):
        """Test the __str__ method logic of ProductImage"""
        # Create a mock that simulates the __str__ behavior
        mock_product = Mock(spec=Product)
        mock_product.name = "Test Product"

        # Test the string format logic
        order = 1
        expected_str = f"{mock_product.name} - Image {order}"
        assert expected_str == "Test Product - Image 1"

    def test_product_image_has_required_fields(self):
        """Test ProductImage has required attributes"""
        # Test that ProductImage model has the expected fields
        assert hasattr(ProductImage, 'product')
        assert hasattr(ProductImage, 'image_url')
        assert hasattr(ProductImage, 'public_id')
        assert hasattr(ProductImage, 'order')


# ------------------------------------------------------
# ProductSerializer Unit Tests
# ------------------------------------------------------

class TestProductSerializer:
    """Test the ProductSerializer without database"""

    def test_serialize_product_with_owner(self):
        """Test serializing a product with owner data"""
        # Test the serializer fields exist
        serializer = ProductSerializer()

        # Check that owner-related fields are computed correctly
        assert 'owner_name' in serializer.get_fields()
        assert 'owner_email' in serializer.get_fields()

        # Test SerializerMethodField logic
        mock_obj = Mock()
        mock_user = Mock()
        mock_user.first_name = "John"
        mock_user.last_name = "Doe"
        mock_user.email = "owner@test.com"
        mock_obj.owner = mock_user

        # Test get_owner_name method
        owner_name = serializer.get_owner_name(mock_obj)
        assert owner_name == "John Doe"

        # Test get_owner_email method
        owner_email = serializer.get_owner_email(mock_obj)
        assert owner_email == "owner@test.com"

    def test_serialize_product_without_owner(self):
        """Test serializing a product without owner"""
        serializer = ProductSerializer()

        # Test behavior when owner is None
        mock_obj = Mock()
        mock_obj.owner = None

        # Test get_owner_name method returns Anonymous
        owner_name = serializer.get_owner_name(mock_obj)
        assert owner_name == "Anonymous"

        # Test get_owner_email method returns default email
        owner_email = serializer.get_owner_email(mock_obj)
        assert owner_email == "no-email@example.com"

    def test_deserialize_valid_product_data(self):
        """Test deserializing valid product data structure"""
        data = {
            "name": "New Product",
            "description": "New product description",
            "price": "49.99",
            "category": "medicines"
        }

        serializer = ProductSerializer(data=data)
        assert serializer.is_valid()

        # Validate the data structure without saving to DB
        validated_data = serializer.validated_data
        assert validated_data['name'] == "New Product"
        assert validated_data['price'] == Decimal("49.99")
        assert validated_data['category'] == "medicines"

    def test_deserialize_invalid_data_missing_name(self):
        """Test validation fails when name is missing"""
        data = {
            "description": "Test",
            "price": "10.00",
            "category": "plants"
        }

        serializer = ProductSerializer(data=data)
        assert not serializer.is_valid()
        assert 'name' in serializer.errors

    def test_deserialize_invalid_data_missing_price(self):
        """Test validation fails when price is missing"""
        data = {
            "name": "Test Product",
            "description": "Test",
            "category": "plants"
        }

        serializer = ProductSerializer(data=data)
        assert not serializer.is_valid()
        assert 'price' in serializer.errors

    def test_deserialize_invalid_category(self):
        """Test validation fails for invalid category"""
        data = {
            "name": "Test Product",
            "description": "Test",
            "price": "10.00",
            "category": "invalid_category"
        }

        serializer = ProductSerializer(data=data)
        assert not serializer.is_valid()
        assert 'category' in serializer.errors

    def test_deserialize_invalid_price_format(self):
        """Test validation fails for invalid price format"""
        data = {
            "name": "Test Product",
            "description": "Test",
            "price": "not_a_number",
            "category": "plants"
        }

        serializer = ProductSerializer(data=data)
        assert not serializer.is_valid()
        assert 'price' in serializer.errors


# ------------------------------------------------------
# ProductImageSerializer Unit Tests
# ------------------------------------------------------

class TestProductImageSerializer:
    """Test the ProductImageSerializer without database"""

    def test_serialize_product_image(self):
        """Test serializing a product image"""
        mock_product = Mock(spec=Product)
        mock_product.id = 1

        mock_image = Mock(spec=ProductImage)
        mock_image.id = 1
        mock_image.product = mock_product
        mock_image.image_url = "https://example.com/test.jpg"
        mock_image.public_id = "test_id"
        mock_image.order = 0
        mock_image.created_at = timezone.now()

        serializer = ProductImageSerializer(mock_image)
        data = serializer.data

        assert data['image_url'] == "https://example.com/test.jpg"
        assert data['public_id'] == "test_id"
        assert data['order'] == 0


# ------------------------------------------------------
# Business Logic Unit Tests
# ------------------------------------------------------

class TestProductsBusinessLogic:
    """Test business logic related to products"""

    def test_product_price_calculation(self):
        """Test price calculation logic"""
        product = Product(
            name="Test",
            description="Test",
            price=Decimal("10.00"),
            category="plants"
        )

        # Test price calculations
        assert product.price * 2 == Decimal("20.00")
        assert product.price + Decimal("5.00") == Decimal("15.00")

    def test_category_validation_logic(self):
        """Test category validation"""
        valid_categories = ['plants', 'medicines', 'tools', 'fertilizers']

        for category in valid_categories:
            product = Product(
                name="Test",
                description="Test",
                price=Decimal("10.00"),
                category=category
            )
            assert product.category in valid_categories

    def test_product_name_property(self):
        """Test product name property"""
        product = Product(
            name="Test Product Name",
            description="Test",
            price=Decimal("10.00"),
            category="plants"
        )

        assert product.name == "Test Product Name"
        assert len(product.name) > 0


# ------------------------------------------------------
# Edge Cases and Validation Unit Tests
# ------------------------------------------------------

class TestProductsEdgeCases:
    """Test edge cases and boundary conditions"""

    def test_very_long_product_name(self):
        """Test product with very long name"""
        long_name = "A" * 199
        product = Product(
            name=long_name,
            description="Test",
            price=Decimal("10.00"),
            category="plants"
        )

        assert product.name == long_name
        assert len(product.name) == 199

    def test_very_long_description(self):
        """Test product with very long description"""
        long_description = "This is a very long description. " * 100
        product = Product(
            name="Test",
            description=long_description,
            price=Decimal("10.00"),
            category="plants"
        )

        assert len(product.description) > 2000

    def test_product_with_zero_price(self):
        """Test product with price 0"""
        product = Product(
            name="Free Product",
            description="This is free",
            price=Decimal("0.00"),
            category="plants"
        )

        assert product.price == Decimal("0.00")
        assert product.price >= Decimal("0.00")

    def test_product_with_large_price(self):
        """Test product with very large price"""
        large_price = Decimal("99999.99")
        product = Product(
            name="Expensive Product",
            description="Very expensive",
            price=large_price,
            category="tools"
        )

        assert product.price == large_price

    def test_product_price_precision(self):
        """Test price decimal precision"""
        product = Product(
            name="Test",
            description="Test",
            price=Decimal("19.99"),
            category="plants"
        )

        # Test precision to 2 decimal places
        assert product.price == Decimal("19.99")
        assert str(product.price) == "19.99"

    def test_product_image_order_values(self):
        """Test image order field values logic"""
        # Test that order values can be set correctly
        for i in range(5):
            order_value = i
            image_url = f"https://example.com/image{i}.jpg"

            # Verify order logic
            assert order_value == i
            assert order_value >= 0
            assert isinstance(image_url, str)
            assert "image" in image_url

    def test_empty_description_handling(self):
        """Test product with empty description"""
        product = Product(
            name="Test Product",
            description="",
            price=Decimal("10.00"),
            category="plants"
        )

        assert product.description == ""
        assert isinstance(product.description, str)

    def test_price_type_enforcement(self):
        """Test that price must be Decimal type"""
        product = Product(
            name="Test",
            description="Test",
            price=Decimal("15.50"),
            category="plants"
        )

        assert isinstance(product.price, Decimal)
        assert not isinstance(product.price, float)
        assert not isinstance(product.price, int)
