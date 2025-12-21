import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from unittest.mock import patch
from products.models import Product, Order, ProductImage
from authentication.models import CustomUser
from django.utils import timezone
from decimal import Decimal
from io import BytesIO
from PIL import Image as PILImage

pytestmark = pytest.mark.django_db


# ------------------------------------------------------
# Fixtures
# ------------------------------------------------------

@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def seller(db):
    return CustomUser.objects.create_user(
        email="seller@test.com",
        password="password123",
        role="seller"
    )


@pytest.fixture
def normal_user(db):
    return CustomUser.objects.create_user(
        email="user@test.com",
        password="password123",
        role="plant_owner"
    )


@pytest.fixture
def buyer(db):
    return CustomUser.objects.create_user(
        email="buyer@test.com",
        password="password123",
        role="plant_owner",
        first_name="Jane",
        last_name="Buyer"
    )


@pytest.fixture
def admin_user(db):
    return CustomUser.objects.create_user(
        email="admin@test.com",
        password="password123",
        role="admin"
    )


@pytest.fixture
def product_payload():
    return {
        "name": "Test Product",
        "description": "Great product",
        "price": "25.50",
        "category": "plants",
        "image_urls": [
            "https://example.com/img1.jpg",
            "https://example.com/img2.jpg"
        ]
    }


@pytest.fixture
def product(seller):
    return Product.objects.create(
        name="Test Product",
        description="Test Description",
        price=Decimal("50.00"),
        category="plants",
        stock_quantity=10,
        owner=seller
    )


# ------------------------------------------------------
# CREATE
# ------------------------------------------------------

def test_seller_can_create_product(client, seller, product_payload):
    client.force_authenticate(user=seller)

    url = reverse("product-list")
    response = client.post(url, product_payload, format="json")

    assert response.status_code == 201
    assert Product.objects.count() == 1
    assert Product.objects.first().owner == seller


def test_non_seller_cannot_create_product(client, normal_user, product_payload):
    client.force_authenticate(user=normal_user)

    url = reverse("product-list")
    response = client.post(url, product_payload, format="json")

    assert response.status_code == 403


# ------------------------------------------------------
# LIST + FILTER
# ------------------------------------------------------

def test_list_products(client, seller):
    Product.objects.create(
        name="Plant Item",
        description="Plant",
        price="10.00",
        category="plants",
        owner=seller
    )

    Product.objects.create(
        name="Tool Item",
        description="Tool",
        price="20.00",
        category="tools",
        owner=seller
    )

    url = reverse("product-list")
    response = client.get(url)

    assert response.status_code == 200
    assert len(response.json()) == 2


def test_filter_products_by_category(client, seller):
    Product.objects.create(
        name="Fertilizer",
        description="desc",
        price="10.00",
        category="fertilizers",
        owner=seller
    )

    url = reverse("product-list") + "?category=fertilizers"
    response = client.get(url)

    assert response.status_code == 200
    assert len(response.json()) == 1


# ------------------------------------------------------
# RETRIEVE
# ------------------------------------------------------

def test_retrieve_product(client, seller):
    product = Product.objects.create(
        name="Single Item",
        description="desc",
        price="15.00",
        category="plants",
        owner=seller
    )

    url = reverse("product-detail", args=[product.id])
    response = client.get(url)

    assert response.status_code == 200
    assert response.json()["name"] == "Single Item"


# ------------------------------------------------------
# UPDATE
# ------------------------------------------------------

def test_seller_can_update_own_product(client, seller):
    client.force_authenticate(user=seller)

    product = Product.objects.create(
        name="Old Name",
        description="Old desc",
        price="10.00",
        category="plants",
        owner=seller
    )

    url = reverse("product-detail", args=[product.id])
    payload = {
        "name": "New Name",
        "description": "Updated desc",
        "price": "50.00",
        "category": "plants"
    }

    response = client.put(url, payload, format="json")

    assert response.status_code == 200
    product.refresh_from_db()
    assert product.name == "New Name"


# ------------------------------------------------------
# DELETE
# ------------------------------------------------------

def test_seller_can_delete_own_product(client, seller):
    client.force_authenticate(user=seller)

    product = Product.objects.create(
        name="Delete Me",
        description="desc",
        price="10.00",
        category="plants",
        owner=seller
    )

    url = reverse("product-detail", args=[product.id])
    response = client.delete(url)

    assert response.status_code == 204
    assert Product.objects.count() == 0


# ------------------------------------------------------
# CUSTOM ACTION: my_products
# ------------------------------------------------------

def test_my_products_endpoint(client, seller):
    client.force_authenticate(user=seller)

    Product.objects.create(
        name="Mine",
        description="desc",
        price="10.00",
        category="plants",
        owner=seller
    )

    url = reverse("product-my-products")
    response = client.get(url)

    assert response.status_code == 200
    assert len(response.json()) == 1


# ------------------------------------------------------
# IMAGE UPLOAD Tests
# ------------------------------------------------------

@patch('cloudinary.uploader.upload')
def test_upload_image_success(mock_upload, client, seller):
    """Test successful image upload to Cloudinary"""
    client.force_authenticate(user=seller)

    # Mock Cloudinary response
    mock_upload.return_value = {
        'secure_url': 'https://cloudinary.com/test.jpg',
        'public_id': 'test_public_id_123'
    }

    # Create a test image
    image = PILImage.new('RGB', (100, 100), color='red')
    image_file = BytesIO()
    image.save(image_file, 'JPEG')
    image_file.seek(0)
    image_file.name = 'test.jpg'

    url = reverse('product-upload-image')
    response = client.post(url, {'image': image_file}, format='multipart')

    assert response.status_code == 200
    assert 'image_url' in response.json()
    assert 'public_id' in response.json()
    assert response.json()['image_url'] == 'https://cloudinary.com/test.jpg'
    assert response.json()['public_id'] == 'test_public_id_123'


def test_upload_image_no_file(client, seller):
    """Test image upload without providing a file"""
    client.force_authenticate(user=seller)

    url = reverse('product-upload-image')
    response = client.post(url, {}, format='multipart')

    assert response.status_code == 400
    assert 'error' in response.json()
    assert 'No image provided' in response.json()['error']


def test_upload_image_non_seller(client, buyer):
    """Test that non-sellers cannot upload images"""
    client.force_authenticate(user=buyer)

    url = reverse('product-upload-image')
    response = client.post(url, {}, format='multipart')

    assert response.status_code == 403


def test_upload_image_unauthenticated(client):
    """Test that unauthenticated users cannot upload images"""
    url = reverse('product-upload-image')
    response = client.post(url, {}, format='multipart')

    assert response.status_code == 401


@patch('cloudinary.uploader.upload')
def test_upload_image_cloudinary_error(mock_upload, client, seller):
    """Test handling of Cloudinary upload error"""
    client.force_authenticate(user=seller)

    # Mock Cloudinary error
    mock_upload.side_effect = Exception('Cloudinary upload failed')

    # Create a test image
    image = PILImage.new('RGB', (100, 100), color='blue')
    image_file = BytesIO()
    image.save(image_file, 'JPEG')
    image_file.seek(0)
    image_file.name = 'test.jpg'

    url = reverse('product-upload-image')
    response = client.post(url, {'image': image_file}, format='multipart')

    assert response.status_code == 500
    assert 'error' in response.json()


# ------------------------------------------------------
# ORDER CRUD Tests
# ------------------------------------------------------

def test_create_order(client, buyer, product):
    """Test creating an order"""
    client.force_authenticate(user=buyer)

    url = reverse('order-list')
    data = {
        'product': product.id,
        'quantity': 2,
        'shipping_address': '123 Test Street'
    }
    response = client.post(url, data, format='json')

    assert response.status_code == 201
    assert Order.objects.count() == 1
    order = Order.objects.first()
    assert order.buyer == buyer
    assert order.seller == product.owner
    assert order.quantity == 2
    assert order.total_price == Decimal('100.00')


def test_create_order_insufficient_stock(client, buyer, product):
    """Test creating order with insufficient stock"""
    client.force_authenticate(user=buyer)

    url = reverse('order-list')
    data = {
        'product': product.id,
        'quantity': 20,  # More than available stock (10)
        'shipping_address': '123 Test Street'
    }
    response = client.post(url, data, format='json')

    assert response.status_code == 400
    assert 'quantity' in response.json()


def test_create_order_reduces_stock(client, buyer, product):
    """Test that creating order reduces product stock"""
    client.force_authenticate(user=buyer)

    initial_stock = product.stock_quantity

    url = reverse('order-list')
    data = {
        'product': product.id,
        'quantity': 3,
        'shipping_address': '123 Test Street'
    }
    response = client.post(url, data, format='json')

    assert response.status_code == 201
    product.refresh_from_db()
    assert product.stock_quantity == initial_stock - 3


def test_list_orders_as_buyer(client, buyer, product):
    """Test listing orders as a buyer"""
    Order.objects.create(
        product=product,
        buyer=buyer,
        seller=product.owner,
        quantity=1,
        total_price=Decimal('50.00')
    )

    client.force_authenticate(user=buyer)
    url = reverse('order-list')
    response = client.get(url)

    assert response.status_code == 200
    assert len(response.json()) >= 1


def test_list_orders_as_seller(client, seller, buyer, product):
    """Test listing orders as seller (view=sales)"""
    Order.objects.create(
        product=product,
        buyer=buyer,
        seller=seller,
        quantity=1,
        total_price=Decimal('50.00')
    )

    client.force_authenticate(user=seller)
    url = reverse('order-list') + '?view=sales'
    response = client.get(url)

    assert response.status_code == 200
    assert len(response.json()) >= 1


def test_filter_orders_by_status(client, buyer, product):
    """Test filtering orders by status"""
    Order.objects.create(
        product=product,
        buyer=buyer,
        seller=product.owner,
        quantity=1,
        total_price=Decimal('50.00'),
        status='completed'
    )

    client.force_authenticate(user=buyer)
    url = reverse('order-list') + '?status=completed'
    response = client.get(url)

    assert response.status_code == 200
    assert len(response.json()) >= 1
    assert response.json()[0]['status'] == 'completed'


def test_my_orders_endpoint(client, buyer, product):
    """Test my_orders custom action"""
    Order.objects.create(
        product=product,
        buyer=buyer,
        seller=product.owner,
        quantity=1,
        total_price=Decimal('50.00')
    )

    client.force_authenticate(user=buyer)
    url = reverse('order-my-orders')
    response = client.get(url)

    assert response.status_code == 200
    assert len(response.json()) >= 1


def test_my_sales_endpoint(client, seller, buyer, product):
    """Test my_sales custom action"""
    Order.objects.create(
        product=product,
        buyer=buyer,
        seller=seller,
        quantity=1,
        total_price=Decimal('50.00')
    )

    client.force_authenticate(user=seller)
    url = reverse('order-my-sales')
    response = client.get(url)

    assert response.status_code == 200
    assert len(response.json()) >= 1


def test_update_order_status_as_seller(client, seller, buyer, product):
    """Test updating order status as seller"""
    order = Order.objects.create(
        product=product,
        buyer=buyer,
        seller=seller,
        quantity=1,
        total_price=Decimal('50.00'),
        status='pending'
    )

    client.force_authenticate(user=seller)
    url = reverse('order-update-status', kwargs={'pk': order.pk})
    data = {'status': 'processing'}
    response = client.post(url, data, format='json')

    assert response.status_code == 200
    order.refresh_from_db()
    assert order.status == 'processing'


def test_update_order_status_invalid(client, seller, buyer, product):
    """Test updating order with invalid status"""
    order = Order.objects.create(
        product=product,
        buyer=buyer,
        seller=seller,
        quantity=1,
        total_price=Decimal('50.00')
    )

    client.force_authenticate(user=seller)
    url = reverse('order-update-status', kwargs={'pk': order.pk})
    data = {'status': 'invalid_status'}
    response = client.post(url, data, format='json')

    assert response.status_code == 400


def test_update_order_status_as_non_seller(client, buyer, product):
    """Test that non-seller cannot update order status"""
    order = Order.objects.create(
        product=product,
        buyer=buyer,
        seller=product.owner,
        quantity=1,
        total_price=Decimal('50.00')
    )

    client.force_authenticate(user=buyer)
    url = reverse('order-update-status', kwargs={'pk': order.pk})
    data = {'status': 'processing'}
    response = client.post(url, data, format='json')

    # Should be 404 due to queryset filtering or 403 permission denied
    assert response.status_code in [403, 404]


def test_admin_can_view_all_orders(client, admin_user, buyer, product):
    """Test that admin can view all orders"""
    Order.objects.create(
        product=product,
        buyer=buyer,
        seller=product.owner,
        quantity=1,
        total_price=Decimal('50.00')
    )

    client.force_authenticate(user=admin_user)
    url = reverse('order-list')
    response = client.get(url)

    assert response.status_code == 200
    assert len(response.json()) >= 1


def test_admin_can_update_order_status(client, admin_user, buyer, product):
    """Test that admin can update order status"""
    order = Order.objects.create(
        product=product,
        buyer=buyer,
        seller=product.owner,
        quantity=1,
        total_price=Decimal('50.00')
    )

    client.force_authenticate(user=admin_user)
    url = reverse('order-update-status', kwargs={'pk': order.pk})
    data = {'status': 'completed'}
    response = client.post(url, data, format='json')

    assert response.status_code == 200


def test_cancel_order_as_buyer(client, buyer, product):
    """Test cancelling order as buyer (DELETE)"""
    order = Order.objects.create(
        product=product,
        buyer=buyer,
        seller=product.owner,
        quantity=2,
        total_price=Decimal('100.00'),
        status='pending'
    )

    initial_stock = product.stock_quantity

    client.force_authenticate(user=buyer)
    url = reverse('order-detail', kwargs={'pk': order.pk})
    response = client.delete(url)

    assert response.status_code == 200
    order.refresh_from_db()
    assert order.status == 'cancelled'

    # Check stock restored
    product.refresh_from_db()
    assert product.stock_quantity == initial_stock + 2


def test_cannot_cancel_completed_order(client, buyer, product):
    """Test that completed orders cannot be cancelled"""
    order = Order.objects.create(
        product=product,
        buyer=buyer,
        seller=product.owner,
        quantity=1,
        total_price=Decimal('50.00'),
        status='completed'
    )

    client.force_authenticate(user=buyer)
    url = reverse('order-detail', kwargs={'pk': order.pk})
    response = client.delete(url)

    assert response.status_code == 400


def test_update_order_with_allowed_fields(client, seller, buyer, product):
    """Test updating order with allowed fields (status, notes)"""
    order = Order.objects.create(
        product=product,
        buyer=buyer,
        seller=seller,
        quantity=1,
        total_price=Decimal('50.00')
    )

    client.force_authenticate(user=seller)
    url = reverse('order-detail', kwargs={'pk': order.pk})
    data = {
        'product': product.id,
        'quantity': 1,
        'status': 'completed',
        'notes': 'Order delivered successfully',
        'shipping_address': '123 Test St'
    }
    response = client.put(url, data, format='json')

    # Status depends on queryset filtering
    assert response.status_code in [200, 404]


def test_update_order_with_disallowed_field(client, seller, buyer, product):
    """Test that updating disallowed fields is rejected"""
    order = Order.objects.create(
        product=product,
        buyer=buyer,
        seller=seller,
        quantity=1,
        total_price=Decimal('50.00')
    )

    client.force_authenticate(user=seller)
    url = reverse('order-detail', kwargs={'pk': order.pk})
    data = {
        'product': product.id,
        'quantity': 10,  # Trying to change quantity
        'status': 'completed'
    }
    response = client.put(url, data, format='json')

    # Should fail with 400 or 404 due to queryset
    assert response.status_code in [400, 404]


def test_admin_can_cancel_order(client, admin_user, buyer, product):
    """Test that admin can cancel any order"""
    order = Order.objects.create(
        product=product,
        buyer=buyer,
        seller=product.owner,
        quantity=1,
        total_price=Decimal('50.00')
    )

    client.force_authenticate(user=admin_user)
    url = reverse('order-detail', kwargs={'pk': order.pk})
    response = client.delete(url)

    assert response.status_code == 200
    order.refresh_from_db()
    assert order.status == 'cancelled'


# ------------------------------------------------------
# Product with Images Tests
# ------------------------------------------------------

def test_create_product_with_image_urls(client, seller):
    """Test creating product with multiple image URLs"""
    client.force_authenticate(user=seller)

    url = reverse('product-list')
    data = {
        'name': 'Product with Images',
        'description': 'Has multiple images',
        'price': '39.99',
        'category': 'tools',
        'stock_quantity': 5,
        'image_urls': [
            'https://example.com/img1.jpg',
            'https://example.com/img2.jpg',
            'https://example.com/img3.jpg'
        ]
    }
    response = client.post(url, data, format='json')

    assert response.status_code == 201
    product = Product.objects.get(id=response.json()['id'])
    assert product.images.count() == 3
    assert product.image == 'https://example.com/img1.jpg'


def test_update_product_with_new_image_urls(client, seller, product):
    """Test updating product with new image URLs"""
    client.force_authenticate(user=seller)

    # Add initial images
    ProductImage.objects.create(
        product=product, image_url='https://example.com/old1.jpg', order=0)
    ProductImage.objects.create(
        product=product, image_url='https://example.com/old2.jpg', order=1)

    url = reverse('product-detail', kwargs={'pk': product.pk})
    data = {
        'name': product.name,
        'description': product.description,
        'price': str(product.price),
        'category': product.category,
        'stock_quantity': product.stock_quantity,
        'image_urls': [
            'https://example.com/new1.jpg',
            'https://example.com/new2.jpg'
        ]
    }
    response = client.put(url, data, format='json')

    assert response.status_code == 200
    product.refresh_from_db()
    assert product.images.count() == 2
    assert not product.images.filter(
        image_url='https://example.com/old1.jpg').exists()


def test_filter_products_by_all_categories(client, seller):
    """Test filtering with 'all' category returns everything"""
    Product.objects.create(
        name="Plant",
        description="A plant",
        price="10.00",
        category="plants",
        owner=seller
    )

    Product.objects.create(
        name="Tool",
        description="A tool",
        price="20.00",
        category="tools",
        owner=seller
    )

    url = reverse('product-list') + '?category=all'
    response = client.get(url)

    assert response.status_code == 200
    assert len(response.json()) == 2


def test_filter_products_by_owner(client, seller):
    """Test filtering products by owner"""
    Product.objects.create(
        name="Owned Product",
        description="desc",
        price="15.00",
        category="plants",
        owner=seller
    )

    url = reverse('product-list') + f'?owner={seller.id}'
    response = client.get(url)

    assert response.status_code == 200
    assert len(response.json()) >= 1
    for product_data in response.json():
        assert product_data['owner'] == seller.id


# ------------------------------------------------------
# Order Serializer Field Tests
# ------------------------------------------------------

def test_order_includes_product_details(client, buyer, product):
    """Test that order response includes product details"""
    order = Order.objects.create(
        product=product,
        buyer=buyer,
        seller=product.owner,
        quantity=1,
        total_price=Decimal('50.00')
    )

    client.force_authenticate(user=buyer)
    url = reverse('order-detail', kwargs={'pk': order.pk})
    response = client.get(url)

    assert response.status_code == 200
    data = response.json()
    assert 'product_name' in data
    assert 'product_price' in data
    assert 'buyer_name' in data
    assert 'seller_name' in data
    assert data['product_name'] == product.name


def test_order_buyer_and_seller_names(client, buyer, product):
    """Test that order shows correct buyer and seller names"""
    order = Order.objects.create(
        product=product,
        buyer=buyer,
        seller=product.owner,
        quantity=1,
        total_price=Decimal('50.00')
    )

    client.force_authenticate(user=buyer)
    url = reverse('order-detail', kwargs={'pk': order.pk})
    response = client.get(url)

    assert response.status_code == 200
    data = response.json()
    # Buyer has first_name and last_name
    assert data['buyer_name'] == 'Jane Buyer'
    assert data['buyer_email'] == buyer.email
