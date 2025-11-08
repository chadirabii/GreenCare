from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from .models import Product
from .serializers import ProductSerializer
import cloudinary.uploader


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    # Temporarily allow all operations without auth for development
    permission_classes = [AllowAny]

    # Disable CSRF for this viewset during development
    authentication_classes = []

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
        # TODO: Re-enable when auth is connected
        # For now, create products without owner for development
        if self.request.user.is_authenticated:
            serializer.save(owner=self.request.user)
        else:
            # Skip owner requirement for mock auth development
            serializer.save()

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def my_products(self, request):
        # TODO: Re-enable authentication when auth is connected
        # For now, return all products for development
        if request.user.is_authenticated:
            products = Product.objects.filter(owner=request.user)
        else:
            # Return all products for mock auth development
            products = Product.objects.all()
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def upload_image(self, request):
        """Upload image to Cloudinary and return the URL"""
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
