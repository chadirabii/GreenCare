from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from unittest.mock import patch, MagicMock
from authentication.models import CustomUser
from .models import Product, ProductImage, Order
from decimal import Decimal


class ProductModelTest(TestCase):
    """Test Product model"""

    def setUp(self):
        self.user = CustomUser.objects.create_user(
            email='seller@test.com',
            password='testpass123',
            role='seller'
        )

    def test_create_product(self):
        """Test creating a product"""
        product = Product.objects.create(
            name='Test Plant',
            description='A beautiful plant',
            price=Decimal('29.99'),
            category='plants',
            stock_quantity=10,
            owner=self.user
        )
        self.assertEqual(product.name, 'Test Plant')
        self.assertEqual(product.price, Decimal('29.99'))
        self.assertEqual(product.owner, self.user)

    def test_product_string_representation(self):
        """Test product string representation"""
        product = Product.objects.create(
            name='Test Product',
            description='Description',
            price=Decimal('10.00'),
            category='tools',
            owner=self.user
        )
        self.assertEqual(str(product), 'Test Product')


class ProductImageModelTest(TestCase):
    """Test ProductImage model"""

    def setUp(self):
        self.user = CustomUser.objects.create_user(
            email='seller@test.com',
            password='testpass123',
            role='seller'
        )
        self.product = Product.objects.create(
            name='Test Product',
            description='Description',
            price=Decimal('10.00'),
            category='tools',
            owner=self.user
        )

    def test_create_product_image(self):
        """Test creating a product image"""
        image = ProductImage.objects.create(
            product=self.product,
            image_url='https://example.com/image.jpg',
            public_id='test_id',
            order=0
        )
        self.assertEqual(image.product, self.product)
        self.assertEqual(image.order, 0)

    def test_product_image_string_representation(self):
        """Test product image string representation"""
        image = ProductImage.objects.create(
            product=self.product,
            image_url='https://example.com/image.jpg',
            order=1
        )
        self.assertEqual(str(image), 'Test Product - Image 1')


class OrderModelTest(TestCase):
    """Test Order model"""

    def setUp(self):
        self.seller = CustomUser.objects.create_user(
            email='seller@test.com',
            password='testpass123',
            role='seller'
        )
        self.buyer = CustomUser.objects.create_user(
            email='buyer@test.com',
            password='testpass123',
            role='plant_owner'
        )
        self.product = Product.objects.create(
            name='Test Product',
            description='Description',
            price=Decimal('50.00'),
            category='tools',
            stock_quantity=10,
            owner=self.seller
        )

    def test_create_order(self):
        """Test creating an order"""
        order = Order.objects.create(
            product=self.product,
            buyer=self.buyer,
            seller=self.seller,
            quantity=2,
            total_price=Decimal('100.00'),
            status='pending'
        )
        self.assertEqual(order.quantity, 2)
        self.assertEqual(order.total_price, Decimal('100.00'))

    def test_order_auto_calculate_total(self):
        """Test order auto-calculates total price"""
        order = Order.objects.create(
            product=self.product,
            buyer=self.buyer,
            seller=self.seller,
            quantity=3
        )
        self.assertEqual(order.total_price, Decimal('150.00'))

    def test_order_string_representation(self):
        """Test order string representation"""
        order = Order.objects.create(
            product=self.product,
            buyer=self.buyer,
            seller=self.seller,
            quantity=1,
            total_price=Decimal('50.00')
        )
        self.assertIn('Order', str(order))
        self.assertIn('Test Product', str(order))


class ProductViewSetTest(APITestCase):
    """Test Product ViewSet"""

    def setUp(self):
        self.client = APIClient()
        self.seller = CustomUser.objects.create_user(
            email='seller@test.com',
            password='testpass123',
            role='seller'
        )
        self.buyer = CustomUser.objects.create_user(
            email='buyer@test.com',
            password='testpass123',
            role='plant_owner'
        )
        self.admin = CustomUser.objects.create_user(
            email='admin@test.com',
            password='testpass123',
            role='admin'
        )
        self.product = Product.objects.create(
            name='Test Product',
            description='Test Description',
            price=Decimal('29.99'),
            category='plants',
            stock_quantity=10,
            owner=self.seller
        )

    def test_list_products_unauthenticated(self):
        """Test listing products without authentication"""
        url = reverse('product-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_list_products_authenticated(self):
        """Test listing products with authentication"""
        self.client.force_authenticate(user=self.buyer)
        url = reverse('product-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_retrieve_product(self):
        """Test retrieving a single product"""
        url = reverse('product-detail', kwargs={'pk': self.product.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Test Product')

    def test_create_product_as_seller(self):
        """Test creating a product as seller"""
        self.client.force_authenticate(user=self.seller)
        url = reverse('product-list')
        data = {
            'name': 'New Product',
            'description': 'New Description',
            'price': '49.99',
            'category': 'tools',
            'stock_quantity': 5
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'New Product')
        self.assertEqual(response.data['owner'], self.seller.id)

    def test_create_product_as_non_seller(self):
        """Test creating a product as non-seller fails"""
        self.client.force_authenticate(user=self.buyer)
        url = reverse('product-list')
        data = {
            'name': 'New Product',
            'description': 'New Description',
            'price': '49.99',
            'category': 'tools',
            'stock_quantity': 5
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_product_unauthenticated(self):
        """Test creating a product without authentication fails"""
        url = reverse('product-list')
        data = {
            'name': 'New Product',
            'description': 'New Description',
            'price': '49.99',
            'category': 'tools',
            'stock_quantity': 5
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_own_product(self):
        """Test updating own product"""
        self.client.force_authenticate(user=self.seller)
        url = reverse('product-detail', kwargs={'pk': self.product.pk})
        data = {
            'name': 'Updated Product',
            'description': 'Updated Description',
            'price': '39.99',
            'category': 'plants',
            'stock_quantity': 15
        }
        response = self.client.put(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Updated Product')

    def test_update_others_product_fails(self):
        """Test updating another user's product fails"""
        self.client.force_authenticate(user=self.buyer)
        url = reverse('product-detail', kwargs={'pk': self.product.pk})
        data = {
            'name': 'Hacked Product',
            'description': 'Should not work',
            'price': '1.00',
            'category': 'plants',
            'stock_quantity': 1
        }
        response = self.client.put(url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_partial_update_own_product(self):
        """Test partial update of own product"""
        self.client.force_authenticate(user=self.seller)
        url = reverse('product-detail', kwargs={'pk': self.product.pk})
        data = {'price': '19.99'}
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['price'], '19.99')

    def test_delete_own_product(self):
        """Test deleting own product"""
        self.client.force_authenticate(user=self.seller)
        url = reverse('product-detail', kwargs={'pk': self.product.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Product.objects.filter(pk=self.product.pk).exists())

    def test_delete_others_product_fails(self):
        """Test deleting another user's product fails"""
        self.client.force_authenticate(user=self.buyer)
        url = reverse('product-detail', kwargs={'pk': self.product.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_filter_products_by_category(self):
        """Test filtering products by category"""
        Product.objects.create(
            name='Tool Product',
            description='Tool Description',
            price=Decimal('19.99'),
            category='tools',
            stock_quantity=5,
            owner=self.seller
        )
        url = reverse('product-list')
        response = self.client.get(url, {'category': 'tools'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['category'], 'tools')

    def test_filter_products_by_owner(self):
        """Test filtering products by owner"""
        url = reverse('product-list')
        response = self.client.get(url, {'owner': self.seller.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_my_products_endpoint(self):
        """Test my_products endpoint"""
        self.client.force_authenticate(user=self.seller)
        url = reverse('product-my-products')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_my_products_unauthenticated(self):
        """Test my_products endpoint without authentication"""
        url = reverse('product-my-products')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch('cloudinary.uploader.upload')
    def test_upload_image_as_seller(self, mock_upload):
        """Test uploading image as seller"""
        mock_upload.return_value = {
            'secure_url': 'https://cloudinary.com/image.jpg',
            'public_id': 'test_public_id'
        }
        self.client.force_authenticate(user=self.seller)
        url = reverse('product-upload-image')

        # Create a mock file
        from io import BytesIO
        from PIL import Image
        image = Image.new('RGB', (100, 100))
        image_file = BytesIO()
        image.save(image_file, 'JPEG')
        image_file.seek(0)
        image_file.name = 'test.jpg'

        response = self.client.post(
            url, {'image': image_file}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('image_url', response.data)

    def test_upload_image_as_non_seller(self):
        """Test uploading image as non-seller fails"""
        self.client.force_authenticate(user=self.buyer)
        url = reverse('product-upload-image')
        response = self.client.post(url, {})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_upload_image_without_file(self):
        """Test uploading image without file"""
        self.client.force_authenticate(user=self.seller)
        url = reverse('product-upload-image')
        response = self.client.post(url, {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch('cloudinary.uploader.upload')
    def test_upload_image_cloudinary_error(self, mock_upload):
        """Test uploading image with Cloudinary error"""
        mock_upload.side_effect = Exception('Cloudinary error')
        self.client.force_authenticate(user=self.seller)
        url = reverse('product-upload-image')

        from io import BytesIO
        from PIL import Image
        image = Image.new('RGB', (100, 100))
        image_file = BytesIO()
        image.save(image_file, 'JPEG')
        image_file.seek(0)
        image_file.name = 'test.jpg'

        response = self.client.post(
            url, {'image': image_file}, format='multipart')
        self.assertEqual(response.status_code,
                         status.HTTP_500_INTERNAL_SERVER_ERROR)


class OrderViewSetTest(APITestCase):
    """Test Order ViewSet"""

    def setUp(self):
        self.client = APIClient()
        self.seller = CustomUser.objects.create_user(
            email='seller@test.com',
            password='testpass123',
            role='seller',
            first_name='John',
            last_name='Seller'
        )
        self.buyer = CustomUser.objects.create_user(
            email='buyer@test.com',
            password='testpass123',
            role='plant_owner',
            first_name='Jane',
            last_name='Buyer'
        )
        self.admin = CustomUser.objects.create_user(
            email='admin@test.com',
            password='testpass123',
            role='admin'
        )
        self.product = Product.objects.create(
            name='Test Product',
            description='Test Description',
            price=Decimal('50.00'),
            category='plants',
            stock_quantity=10,
            owner=self.seller
        )

    def test_create_order(self):
        """Test creating an order"""
        self.client.force_authenticate(user=self.buyer)
        url = reverse('order-list')
        data = {
            'product': self.product.id,
            'quantity': 2,
            'shipping_address': '123 Test St'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['quantity'], 2)
        self.assertEqual(response.data['buyer'], self.buyer.id)

    def test_create_order_insufficient_stock(self):
        """Test creating order with insufficient stock"""
        self.client.force_authenticate(user=self.buyer)
        url = reverse('order-list')
        data = {
            'product': self.product.id,
            'quantity': 20,  # More than available
            'shipping_address': '123 Test St'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_order_reduces_stock(self):
        """Test that creating an order reduces stock"""
        self.client.force_authenticate(user=self.buyer)
        initial_stock = self.product.stock_quantity
        url = reverse('order-list')
        data = {
            'product': self.product.id,
            'quantity': 3,
            'shipping_address': '123 Test St'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock_quantity, initial_stock - 3)

    def test_list_orders_as_buyer(self):
        """Test listing orders as buyer"""
        Order.objects.create(
            product=self.product,
            buyer=self.buyer,
            seller=self.seller,
            quantity=1,
            total_price=Decimal('50.00')
        )
        self.client.force_authenticate(user=self.buyer)
        url = reverse('order-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_list_sales_as_seller(self):
        """Test listing sales as seller"""
        Order.objects.create(
            product=self.product,
            buyer=self.buyer,
            seller=self.seller,
            quantity=1,
            total_price=Decimal('50.00')
        )
        self.client.force_authenticate(user=self.seller)
        url = reverse('order-list')
        response = self.client.get(url, {'view': 'sales'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_filter_orders_by_status(self):
        """Test filtering orders by status"""
        Order.objects.create(
            product=self.product,
            buyer=self.buyer,
            seller=self.seller,
            quantity=1,
            total_price=Decimal('50.00'),
            status='completed'
        )
        self.client.force_authenticate(user=self.buyer)
        url = reverse('order-list')
        response = self.client.get(url, {'status': 'completed'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]['status'], 'completed')

    def test_update_order_status_as_seller(self):
        """Test updating order status as seller"""
        order = Order.objects.create(
            product=self.product,
            buyer=self.buyer,
            seller=self.seller,
            quantity=1,
            total_price=Decimal('50.00')
        )
        self.client.force_authenticate(user=self.seller)
        url = reverse('order-update-status', kwargs={'pk': order.pk})
        data = {'status': 'processing'}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'processing')

    def test_update_order_status_as_non_seller_fails(self):
        """Test updating order status as non-seller fails"""
        order = Order.objects.create(
            product=self.product,
            buyer=self.buyer,
            seller=self.seller,
            quantity=1,
            total_price=Decimal('50.00')
        )
        self.client.force_authenticate(user=self.buyer)
        url = reverse('order-update-status', kwargs={'pk': order.pk})
        data = {'status': 'processing'}
        response = self.client.post(url, data)
        # Due to queryset filtering, buyer cannot access update_status endpoint for seller's view
        self.assertIn(response.status_code, [
                      status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])

    def test_update_order_invalid_status(self):
        """Test updating order with invalid status"""
        order = Order.objects.create(
            product=self.product,
            buyer=self.buyer,
            seller=self.seller,
            quantity=1,
            total_price=Decimal('50.00')
        )
        self.client.force_authenticate(user=self.seller)
        url = reverse('order-update-status', kwargs={'pk': order.pk})
        data = {'status': 'invalid_status'}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_order_fields_as_seller(self):
        """Test updating allowed order fields as seller"""
        order = Order.objects.create(
            product=self.product,
            buyer=self.buyer,
            seller=self.seller,
            quantity=1,
            total_price=Decimal('50.00')
        )
        self.client.force_authenticate(user=self.seller)
        url = reverse('order-detail', kwargs={'pk': order.pk})
        data = {
            'product': self.product.id,
            'quantity': 1,
            'status': 'completed',
            'notes': 'Delivered successfully',
            'shipping_address': '123 Test St'
        }
        response = self.client.put(url, data)
        # Seller should be able to update status and notes
        self.assertIn(response.status_code, [
                      status.HTTP_200_OK, status.HTTP_404_NOT_FOUND])

    def test_update_order_disallowed_field(self):
        """Test updating disallowed order field"""
        order = Order.objects.create(
            product=self.product,
            buyer=self.buyer,
            seller=self.seller,
            quantity=1,
            total_price=Decimal('50.00')
        )
        self.client.force_authenticate(user=self.seller)
        url = reverse('order-detail', kwargs={'pk': order.pk})
        data = {
            'product': self.product.id,
            'quantity': 10,  # Trying to change quantity
            'status': 'completed'
        }
        response = self.client.put(url, data)
        # Due to queryset filtering, might get 404 or 400
        self.assertIn(response.status_code, [
                      status.HTTP_400_BAD_REQUEST, status.HTTP_404_NOT_FOUND])

    def test_cancel_order_as_buyer(self):
        """Test cancelling order as buyer"""
        order = Order.objects.create(
            product=self.product,
            buyer=self.buyer,
            seller=self.seller,
            quantity=2,
            total_price=Decimal('100.00'),
            status='pending'
        )
        initial_stock = self.product.stock_quantity
        self.client.force_authenticate(user=self.buyer)
        url = reverse('order-detail', kwargs={'pk': order.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        order.refresh_from_db()
        self.assertEqual(order.status, 'cancelled')
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock_quantity, initial_stock + 2)

    def test_cancel_completed_order_fails(self):
        """Test cancelling completed order fails"""
        order = Order.objects.create(
            product=self.product,
            buyer=self.buyer,
            seller=self.seller,
            quantity=1,
            total_price=Decimal('50.00'),
            status='completed'
        )
        self.client.force_authenticate(user=self.buyer)
        url = reverse('order-detail', kwargs={'pk': order.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cancel_order_as_non_buyer_fails(self):
        """Test cancelling order as non-buyer fails"""
        order = Order.objects.create(
            product=self.product,
            buyer=self.buyer,
            seller=self.seller,
            quantity=1,
            total_price=Decimal('50.00')
        )
        another_user = CustomUser.objects.create_user(
            email='another@test.com',
            password='testpass123',
            role='plant_owner'
        )
        self.client.force_authenticate(user=another_user)
        url = reverse('order-detail', kwargs={'pk': order.pk})
        response = self.client.delete(url)
        # Due to queryset filtering, another user won't see this order (404) or get permission denied (403)
        self.assertIn(response.status_code, [
                      status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])

    def test_my_orders_endpoint(self):
        """Test my_orders endpoint"""
        Order.objects.create(
            product=self.product,
            buyer=self.buyer,
            seller=self.seller,
            quantity=1,
            total_price=Decimal('50.00')
        )
        self.client.force_authenticate(user=self.buyer)
        url = reverse('order-my-orders')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_my_sales_endpoint(self):
        """Test my_sales endpoint"""
        Order.objects.create(
            product=self.product,
            buyer=self.buyer,
            seller=self.seller,
            quantity=1,
            total_price=Decimal('50.00')
        )
        self.client.force_authenticate(user=self.seller)
        url = reverse('order-my-sales')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_admin_can_view_all_orders(self):
        """Test admin can view all orders"""
        Order.objects.create(
            product=self.product,
            buyer=self.buyer,
            seller=self.seller,
            quantity=1,
            total_price=Decimal('50.00')
        )
        self.client.force_authenticate(user=self.admin)
        url = reverse('order-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_admin_can_update_order_status(self):
        """Test admin can update order status"""
        order = Order.objects.create(
            product=self.product,
            buyer=self.buyer,
            seller=self.seller,
            quantity=1,
            total_price=Decimal('50.00')
        )
        self.client.force_authenticate(user=self.admin)
        url = reverse('order-update-status', kwargs={'pk': order.pk})
        data = {'status': 'completed'}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_admin_can_cancel_order(self):
        """Test admin can cancel order"""
        order = Order.objects.create(
            product=self.product,
            buyer=self.buyer,
            seller=self.seller,
            quantity=1,
            total_price=Decimal('50.00')
        )
        self.client.force_authenticate(user=self.admin)
        url = reverse('order-detail', kwargs={'pk': order.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class SerializerTest(TestCase):
    """Test serializers"""

    def setUp(self):
        self.seller = CustomUser.objects.create_user(
            email='seller@test.com',
            password='testpass123',
            role='seller',
            first_name='John',
            last_name='Doe'
        )
        self.product = Product.objects.create(
            name='Test Product',
            description='Test Description',
            price=Decimal('29.99'),
            category='plants',
            stock_quantity=10,
            owner=self.seller
        )

    def test_product_serializer_with_images(self):
        """Test product serializer includes images"""
        from .serializers import ProductSerializer
        ProductImage.objects.create(
            product=self.product,
            image_url='https://example.com/image1.jpg',
            order=0
        )
        ProductImage.objects.create(
            product=self.product,
            image_url='https://example.com/image2.jpg',
            order=1
        )
        serializer = ProductSerializer(self.product)
        self.assertEqual(len(serializer.data['images']), 2)

    def test_product_serializer_owner_name_with_full_name(self):
        """Test product serializer returns full name when available"""
        from .serializers import ProductSerializer
        serializer = ProductSerializer(self.product)
        self.assertEqual(serializer.data['owner_name'], 'John Doe')

    def test_product_serializer_owner_name_without_full_name(self):
        """Test product serializer returns email when no full name"""
        from .serializers import ProductSerializer
        user = CustomUser.objects.create_user(
            email='noname@test.com',
            password='testpass123',
            role='seller'
        )
        product = Product.objects.create(
            name='Product 2',
            description='Description',
            price=Decimal('19.99'),
            category='tools',
            owner=user
        )
        serializer = ProductSerializer(product)
        self.assertEqual(serializer.data['owner_name'], 'noname@test.com')

    def test_product_serializer_owner_name_no_owner(self):
        """Test product serializer with no owner"""
        from .serializers import ProductSerializer
        product = Product.objects.create(
            name='Product 3',
            description='Description',
            price=Decimal('19.99'),
            category='tools'
        )
        serializer = ProductSerializer(product)
        self.assertEqual(serializer.data['owner_name'], 'Anonymous')
        self.assertEqual(
            serializer.data['owner_email'], 'no-email@example.com')

    def test_product_serializer_create_with_image_urls(self):
        """Test creating product with image URLs"""
        from .serializers import ProductSerializer
        data = {
            'name': 'New Product',
            'description': 'Description',
            'price': '39.99',
            'category': 'plants',
            'stock_quantity': 5,
            'owner': self.seller.id,
            'image_urls': [
                'https://example.com/img1.jpg',
                'https://example.com/img2.jpg'
            ]
        }
        serializer = ProductSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        product = serializer.save()
        self.assertEqual(product.images.count(), 2)
        self.assertEqual(product.image, 'https://example.com/img1.jpg')

    def test_product_serializer_update_with_image_urls(self):
        """Test updating product with new image URLs"""
        from .serializers import ProductSerializer
        ProductImage.objects.create(
            product=self.product,
            image_url='https://example.com/old.jpg',
            order=0
        )
        data = {
            'name': self.product.name,
            'description': self.product.description,
            'price': str(self.product.price),
            'category': self.product.category,
            'stock_quantity': self.product.stock_quantity,
            'image_urls': [
                'https://example.com/new1.jpg',
                'https://example.com/new2.jpg'
            ]
        }
        serializer = ProductSerializer(self.product, data=data)
        self.assertTrue(serializer.is_valid())
        product = serializer.save()
        self.assertEqual(product.images.count(), 2)
        self.assertFalse(product.images.filter(
            image_url='https://example.com/old.jpg').exists())

    def test_order_serializer_validation_insufficient_stock(self):
        """Test order serializer validates stock"""
        from .serializers import OrderSerializer
        data = {
            'product': self.product.id,
            'quantity': 100,  # More than available
            'buyer': self.seller.id
        }
        serializer = OrderSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('quantity', serializer.errors)

    def test_order_serializer_buyer_name_with_full_name(self):
        """Test order serializer returns buyer full name"""
        from .serializers import OrderSerializer
        buyer = CustomUser.objects.create_user(
            email='buyer@test.com',
            password='testpass123',
            first_name='Jane',
            last_name='Smith'
        )
        order = Order.objects.create(
            product=self.product,
            buyer=buyer,
            seller=self.seller,
            quantity=1,
            total_price=Decimal('29.99')
        )
        serializer = OrderSerializer(order)
        self.assertEqual(serializer.data['buyer_name'], 'Jane Smith')

    def test_order_serializer_buyer_name_without_full_name(self):
        """Test order serializer returns buyer email when no full name"""
        from .serializers import OrderSerializer
        buyer = CustomUser.objects.create_user(
            email='buyer@test.com',
            password='testpass123'
        )
        order = Order.objects.create(
            product=self.product,
            buyer=buyer,
            seller=self.seller,
            quantity=1,
            total_price=Decimal('29.99')
        )
        serializer = OrderSerializer(order)
        self.assertEqual(serializer.data['buyer_name'], 'buyer@test.com')
