import pytest
from decimal import Decimal
from django.core.exceptions import ValidationError
from products.models import Product, ProductImage
from products.serializers import ProductSerializer, ProductImageSerializer
from authentication.models import CustomUser
from django.utils import timezone

pytestmark = pytest.mark.django_db


# ------------------------------------------------------
# Product Model Tests
# ------------------------------------------------------

class TestProductModel:
    """Test the Product model"""

    def test_create_product_successfully(self):
        """Test creating a product with valid data"""
        user = CustomUser.objects.create_user(
            email="seller@test.com",
            password="pass123",
            role="seller"
        )
        
        product = Product.objects.create(
            name="Organic Fertilizer",
            description="High quality organic fertilizer",
            price=Decimal("25.99"),
            category="fertilizers",
            owner=user
        )
        
        assert product.id is not None
        assert product.name == "Organic Fertilizer"
        assert product.price == Decimal("25.99")
        assert product.category == "fertilizers"
        assert product.owner == user

    def test_product_string_representation(self):
        """Test the __str__ method of Product model"""
        product = Product.objects.create(
            name="Garden Shovel",
            description="Sturdy garden shovel",
            price=Decimal("15.50"),
            category="tools"
        )
        
        assert str(product) == "Garden Shovel"

    def test_product_ordering(self):
        """Test that products are ordered by created_at descending"""
        import time
        
        product1 = Product.objects.create(
            name="Product 1",
            description="First product",
            price=Decimal("10.00"),
            category="plants"
        )
        
        # Small delay to ensure different timestamps
        time.sleep(0.01)
        
        product2 = Product.objects.create(
            name="Product 2",
            description="Second product",
            price=Decimal("20.00"),
            category="plants"
        )
        
        products = list(Product.objects.all())
        # Most recent first (product2 should be first)
        assert products[0].id == product2.id
        assert products[1].id == product1.id

    def test_product_with_owner(self):
        """Test product creation with owner"""
        user = CustomUser.objects.create_user(
            email="owner@test.com",
            password="pass123"
        )
        
        product = Product.objects.create(
            name="Test Product",
            description="Test",
            price=Decimal("10.00"),
            category="plants",
            owner=user
        )
        
        assert product.owner == user
        assert user.products.count() == 1

    def test_product_without_owner(self):
        """Test that product can be created without owner"""
        product = Product.objects.create(
            name="No Owner Product",
            description="Product without owner",
            price=Decimal("10.00"),
            category="plants"
        )
        
        assert product.owner is None

    def test_product_category_choices(self):
        """Test that category must be one of the valid choices"""
        product = Product.objects.create(
            name="Test",
            description="Test",
            price=Decimal("10.00"),
            category="plants"
        )
        
        assert product.category in ['plants', 'medicines', 'tools', 'fertilizers']

    def test_product_price_decimal(self):
        """Test that price is stored as decimal with 2 decimal places"""
        product = Product.objects.create(
            name="Test",
            description="Test",
            price=Decimal("19.99"),
            category="plants"
        )
        
        assert isinstance(product.price, Decimal)
        assert product.price == Decimal("19.99")

    def test_product_timestamps(self):
        """Test that created_at and updated_at are set automatically"""
        product = Product.objects.create(
            name="Test",
            description="Test",
            price=Decimal("10.00"),
            category="plants"
        )
        
        assert product.created_at is not None
        assert product.updated_at is not None
        assert product.created_at <= product.updated_at


# ------------------------------------------------------
# ProductImage Model Tests
# ------------------------------------------------------

class TestProductImageModel:
    """Test the ProductImage model"""

    def test_create_product_image(self):
        """Test creating a product image"""
        product = Product.objects.create(
            name="Test Product",
            description="Test",
            price=Decimal("10.00"),
            category="plants"
        )
        
        image = ProductImage.objects.create(
            product=product,
            image_url="https://example.com/image1.jpg",
            public_id="test_public_id",
            order=0
        )
        
        assert image.id is not None
        assert image.product == product
        assert image.image_url == "https://example.com/image1.jpg"
        assert image.public_id == "test_public_id"
        assert image.order == 0

    def test_product_image_string_representation(self):
        """Test the __str__ method of ProductImage"""
        product = Product.objects.create(
            name="Test Product",
            description="Test",
            price=Decimal("10.00"),
            category="plants"
        )
        
        image = ProductImage.objects.create(
            product=product,
            image_url="https://example.com/image.jpg",
            order=1
        )
        
        assert str(image) == "Test Product - Image 1"

    def test_product_images_ordering(self):
        """Test that images are ordered by order field then created_at"""
        product = Product.objects.create(
            name="Test Product",
            description="Test",
            price=Decimal("10.00"),
            category="plants"
        )
        
        image2 = ProductImage.objects.create(
            product=product,
            image_url="https://example.com/image2.jpg",
            order=2
        )
        
        image1 = ProductImage.objects.create(
            product=product,
            image_url="https://example.com/image1.jpg",
            order=1
        )
        
        images = product.images.all()
        assert images[0] == image1
        assert images[1] == image2

    def test_product_image_cascade_delete(self):
        """Test that images are deleted when product is deleted"""
        product = Product.objects.create(
            name="Test Product",
            description="Test",
            price=Decimal("10.00"),
            category="plants"
        )
        
        ProductImage.objects.create(
            product=product,
            image_url="https://example.com/image1.jpg"
        )
        
        ProductImage.objects.create(
            product=product,
            image_url="https://example.com/image2.jpg"
        )
        
        assert ProductImage.objects.count() == 2
        
        product.delete()
        
        assert ProductImage.objects.count() == 0


# ------------------------------------------------------
# ProductSerializer Tests
# ------------------------------------------------------

class TestProductSerializer:
    """Test the ProductSerializer"""

    def test_serialize_product(self):
        """Test serializing a product instance"""
        user = CustomUser.objects.create_user(
            email="owner@test.com",
            password="pass123",
            first_name="John",
            last_name="Doe"
        )
        
        product = Product.objects.create(
            name="Test Product",
            description="Test description",
            price=Decimal("29.99"),
            category="tools",
            owner=user
        )
        
        serializer = ProductSerializer(product)
        data = serializer.data
        
        assert data['name'] == "Test Product"
        assert data['description'] == "Test description"
        assert Decimal(data['price']) == Decimal("29.99")
        assert data['category'] == "tools"
        assert data['owner_name'] == "John Doe"
        assert data['owner_email'] == "owner@test.com"

    def test_serialize_product_without_owner(self):
        """Test serializing a product without owner"""
        product = Product.objects.create(
            name="No Owner",
            description="Test",
            price=Decimal("10.00"),
            category="plants"
        )
        
        serializer = ProductSerializer(product)
        data = serializer.data
        
        assert data['owner_name'] == "Anonymous"
        assert data['owner_email'] == "no-email@example.com"

    def test_deserialize_valid_product_data(self):
        """Test deserializing valid product data"""
        user = CustomUser.objects.create_user(
            email="seller@test.com",
            password="pass123"
        )
        
        data = {
            "name": "New Product",
            "description": "New product description",
            "price": "49.99",
            "category": "medicines",
            "owner": user.id
        }
        
        serializer = ProductSerializer(data=data)
        assert serializer.is_valid()
        
        product = serializer.save()
        assert product.name == "New Product"
        assert product.price == Decimal("49.99")

    def test_deserialize_with_image_urls(self):
        """Test creating product with multiple image URLs"""
        user = CustomUser.objects.create_user(
            email="seller@test.com",
            password="pass123"
        )
        
        data = {
            "name": "Product with Images",
            "description": "Test",
            "price": "25.00",
            "category": "plants",
            "owner": user.id,
            "image_urls": [
                "https://example.com/img1.jpg",
                "https://example.com/img2.jpg",
                "https://example.com/img3.jpg"
            ]
        }
        
        serializer = ProductSerializer(data=data)
        assert serializer.is_valid()
        
        product = serializer.save()
        assert product.images.count() == 3
        assert product.image == "https://example.com/img1.jpg"  # First image becomes main image

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

    def test_update_product_via_serializer(self):
        """Test updating a product using the serializer"""
        product = Product.objects.create(
            name="Original Name",
            description="Original description",
            price=Decimal("10.00"),
            category="plants"
        )
        
        update_data = {
            "name": "Updated Name",
            "description": "Updated description",
            "price": "99.99",
            "category": "tools"
        }
        
        serializer = ProductSerializer(product, data=update_data)
        assert serializer.is_valid()
        
        updated_product = serializer.save()
        assert updated_product.name == "Updated Name"
        assert updated_product.price == Decimal("99.99")
        assert updated_product.category == "tools"

    def test_update_product_images(self):
        """Test updating product images replaces old images"""
        product = Product.objects.create(
            name="Test Product",
            description="Test",
            price=Decimal("10.00"),
            category="plants"
        )
        
        # Add initial images
        ProductImage.objects.create(
            product=product,
            image_url="https://example.com/old1.jpg",
            order=0
        )
        
        assert product.images.count() == 1
        
        # Update with new images
        update_data = {
            "name": "Test Product",
            "description": "Test",
            "price": "10.00",
            "category": "plants",
            "image_urls": [
                "https://example.com/new1.jpg",
                "https://example.com/new2.jpg"
            ]
        }
        
        serializer = ProductSerializer(product, data=update_data)
        assert serializer.is_valid()
        
        updated_product = serializer.save()
        assert updated_product.images.count() == 2
        assert updated_product.image == "https://example.com/new1.jpg"


# ------------------------------------------------------
# ProductImageSerializer Tests
# ------------------------------------------------------

class TestProductImageSerializer:
    """Test the ProductImageSerializer"""

    def test_serialize_product_image(self):
        """Test serializing a product image"""
        product = Product.objects.create(
            name="Test Product",
            description="Test",
            price=Decimal("10.00"),
            category="plants"
        )
        
        image = ProductImage.objects.create(
            product=product,
            image_url="https://example.com/test.jpg",
            public_id="test_id",
            order=0
        )
        
        serializer = ProductImageSerializer(image)
        data = serializer.data
        
        assert data['image_url'] == "https://example.com/test.jpg"
        assert data['public_id'] == "test_id"
        assert data['order'] == 0


# ------------------------------------------------------
# Business Logic Tests
# ------------------------------------------------------

class TestProductsBusinessLogic:
    """Test business logic related to products"""

    def test_filter_products_by_category(self):
        """Test filtering products by category"""
        Product.objects.create(
            name="Plant 1",
            description="Test",
            price=Decimal("10.00"),
            category="plants"
        )
        
        Product.objects.create(
            name="Tool 1",
            description="Test",
            price=Decimal("20.00"),
            category="tools"
        )
        
        Product.objects.create(
            name="Plant 2",
            description="Test",
            price=Decimal("15.00"),
            category="plants"
        )
        
        plant_products = Product.objects.filter(category="plants")
        assert plant_products.count() == 2

    def test_filter_products_by_owner(self):
        """Test filtering products by owner"""
        user1 = CustomUser.objects.create_user(
            email="user1@test.com",
            password="pass123"
        )
        
        user2 = CustomUser.objects.create_user(
            email="user2@test.com",
            password="pass123"
        )
        
        Product.objects.create(
            name="Product 1",
            description="Test",
            price=Decimal("10.00"),
            category="plants",
            owner=user1
        )
        
        Product.objects.create(
            name="Product 2",
            description="Test",
            price=Decimal("20.00"),
            category="tools",
            owner=user1
        )
        
        Product.objects.create(
            name="Product 3",
            description="Test",
            price=Decimal("15.00"),
            category="plants",
            owner=user2
        )
        
        user1_products = Product.objects.filter(owner=user1)
        assert user1_products.count() == 2

    def test_product_count_increases_on_create(self):
        """Test that product count increases when creating products"""
        initial_count = Product.objects.count()
        
        Product.objects.create(
            name="New Product",
            description="Test",
            price=Decimal("10.00"),
            category="plants"
        )
        
        assert Product.objects.count() == initial_count + 1

    def test_product_count_decreases_on_delete(self):
        """Test that product count decreases when deleting products"""
        product = Product.objects.create(
            name="To Delete",
            description="Test",
            price=Decimal("10.00"),
            category="plants"
        )
        
        count_before_delete = Product.objects.count()
        product.delete()
        
        assert Product.objects.count() == count_before_delete - 1


# ------------------------------------------------------
# Edge Cases and Validation Tests
# ------------------------------------------------------

class TestProductsEdgeCases:
    """Test edge cases and boundary conditions"""

    def test_very_long_product_name(self):
        """Test creating a product with a very long name"""
        long_name = "A" * 199  # Just under max_length of 200
        product = Product.objects.create(
            name=long_name,
            description="Test",
            price=Decimal("10.00"),
            category="plants"
        )
        
        assert product.name == long_name

    def test_very_long_description(self):
        """Test creating a product with a very long description"""
        long_description = "This is a very long description. " * 100
        product = Product.objects.create(
            name="Test",
            description=long_description,
            price=Decimal("10.00"),
            category="plants"
        )
        
        assert len(product.description) > 2000

    def test_product_with_zero_price(self):
        """Test creating a product with price 0 (free product)"""
        product = Product.objects.create(
            name="Free Product",
            description="This is free",
            price=Decimal("0.00"),
            category="plants"
        )
        
        assert product.price == Decimal("0.00")

    def test_product_with_large_price(self):
        """Test creating a product with a very large price"""
        product = Product.objects.create(
            name="Expensive Product",
            description="Very expensive",
            price=Decimal("99999999.99"),  # Max for decimal(10, 2)
            category="plants"
        )
        
        assert product.price == Decimal("99999999.99")

    def test_product_with_max_images(self):
        """Test creating a product with maximum number of images (5)"""
        user = CustomUser.objects.create_user(
            email="seller@test.com",
            password="pass123"
        )
        
        data = {
            "name": "Product with Max Images",
            "description": "Test",
            "price": "25.00",
            "category": "plants",
            "owner": user.id,
            "image_urls": [
                f"https://example.com/img{i}.jpg" for i in range(1, 6)
            ]
        }
        
        serializer = ProductSerializer(data=data)
        assert serializer.is_valid()
        
        product = serializer.save()
        assert product.images.count() == 5

    def test_product_image_order_values(self):
        """Test that image order values work correctly"""
        product = Product.objects.create(
            name="Test",
            description="Test",
            price=Decimal("10.00"),
            category="plants"
        )
        
        for i in range(10):
            ProductImage.objects.create(
                product=product,
                image_url=f"https://example.com/img{i}.jpg",
                order=i
            )
        
        images = product.images.all()
        for i, image in enumerate(images):
            assert image.order == i
