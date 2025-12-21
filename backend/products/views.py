from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from django.core.exceptions import PermissionDenied
from authentication.permissions import IsSellerOrReadOnly, IsSeller
from .models import Product, Order
from .serializers import ProductSerializer, OrderSerializer
import cloudinary.uploader


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_permissions(self):
        """
        Set custom permissions based on action
        """
        if self.action in ['create', 'upload_image']:
            # Only sellers can create products and upload images
            return [IsAuthenticated(), IsSeller()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            # Only owners can update/delete their products
            return [IsAuthenticated()]
        elif self.action == 'my_products':
            # Only authenticated users can view their products
            return [IsAuthenticated()]
        else:
            # Everyone can list and view products
            return [IsAuthenticatedOrReadOnly()]

    def get_queryset(self):
        queryset = Product.objects.all()
        category = self.request.query_params.get('category', None)
        owner = self.request.query_params.get('owner', None)

        if category and category != 'all':
            queryset = queryset.filter(category=category)

        if owner:
            queryset = queryset.filter(owner_id=owner)

        return queryset

    def perform_create(self, serializer):
        """Automatically set the owner to the current user"""
        serializer.save(owner=self.request.user)

    def perform_update(self, serializer):
        """Only allow users to update their own products"""
        product = self.get_object()
        if product.owner != self.request.user:
            raise PermissionDenied("You can only update your own products")
        serializer.save()

    def perform_destroy(self, instance):
        """Only allow users to delete their own products"""
        if instance.owner != self.request.user:
            raise PermissionDenied("You can only delete your own products")
        instance.delete()

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_products(self, request):
        """Get products owned by the current user (sellers only)"""
        products = Product.objects.filter(owner=request.user)
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsSeller])
    def upload_image(self, request):
        """Upload image to Cloudinary and return the URL (sellers only)"""
        try:
            image_file = request.FILES.get('image')
            if not image_file:
                return Response(
                    {'error': 'No image provided'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Upload to Cloudinary
            upload_result = cloudinary.uploader.upload(
                image_file,
                folder='greencare/products',
                resource_type='image'
            )

            return Response({
                'image_url': upload_result['secure_url'],
                'public_id': upload_result['public_id']
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class OrderViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing orders
    """
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Filter orders based on user role
        """
        user = self.request.user
        queryset = Order.objects.all()

        # Filter by status if provided
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        # Admin can see all orders
        if user.role == 'admin':
            return queryset

        # For update_status action, allow sellers to access their sales
        if self.action == 'update_status':
            return queryset.filter(seller=user)

        # For regular users, show their orders (as buyer) or sales (as seller)
        view_type = self.request.query_params.get('view', 'orders')
        if view_type == 'sales':
            # Show orders where user is the seller
            return queryset.filter(seller=user)
        else:
            # Show orders where user is the buyer
            return queryset.filter(buyer=user)

    def perform_create(self, serializer):
        """
        Create a new order with the current user as buyer
        """
        serializer.save(buyer=self.request.user)

    def update(self, request, *args, **kwargs):
        """
        Only allow status updates
        """
        instance = self.get_object()

        # Only seller or admin can update order status
        if instance.seller != request.user and request.user.role != 'admin':
            raise PermissionDenied("Only the seller can update this order")

        # Only allow status field to be updated
        allowed_fields = ['status', 'notes']
        for field in request.data.keys():
            if field not in allowed_fields:
                return Response(
                    {'error': f'Field {field} cannot be updated'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """
        Only allow buyers to cancel their orders (if status is pending)
        """
        instance = self.get_object()

        if instance.buyer != request.user and request.user.role != 'admin':
            raise PermissionDenied("You can only cancel your own orders")

        if instance.status not in ['pending', 'processing']:
            return Response(
                {'error': 'Cannot cancel completed or already cancelled orders'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Restore stock when order is cancelled
        product = instance.product
        product.stock_quantity += instance.quantity
        product.save()

        # Mark as cancelled instead of deleting
        instance.status = 'cancelled'
        instance.save()

        return Response(
            {'message': 'Order cancelled successfully'},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_orders(self, request):
        """Get orders made by the current user"""
        orders = Order.objects.filter(buyer=request.user)
        serializer = self.get_serializer(orders, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_sales(self, request):
        """Get sales made to the current user (seller view)"""
        sales = Order.objects.filter(seller=request.user)
        serializer = self.get_serializer(sales, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated], url_path='update_status')
    def update_status(self, request, pk=None):
        """Update order status"""
        order = self.get_object()

        # Only seller or admin can update status
        if order.seller != request.user and request.user.role != 'admin':
            raise PermissionDenied("Only the seller can update order status")

        new_status = request.data.get('status')
        if new_status not in dict(Order.STATUS_CHOICES).keys():
            return Response(
                {'error': 'Invalid status'},
                status=status.HTTP_400_BAD_REQUEST
            )

        order.status = new_status
        order.save()

        serializer = self.get_serializer(order)
        return Response(serializer.data)
