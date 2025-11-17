from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from authentication.permissions import IsSellerOrReadOnly
from .models import Product
from .serializers import ProductSerializer
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
            return [IsAuthenticated(), IsSellerOrReadOnly()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            # Only owners can update/delete their products
            return [IsAuthenticated()]
        elif self.action == 'my_products':
            # Only authenticated users can view their products
            return [IsAuthenticated()]
        else:
            # Everyone can list and view products
            return [IsAuthenticatedOrReadOnly()]

        return super().get_permissions()

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
            raise PermissionError("You can only update your own products")
        serializer.save()

    def perform_destroy(self, instance):
        """Only allow users to delete their own products"""
        if instance.owner != self.request.user:
            raise PermissionError("You can only delete your own products")
        instance.delete()

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_products(self, request):
        """Get products owned by the current user (sellers only)"""
        products = Product.objects.filter(owner=request.user)
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated, IsSellerOrReadOnly])
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
