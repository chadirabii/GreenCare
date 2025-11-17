from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import cloudinary.uploader
from .models import Plants
from .serializers import PlantSerializer
from plant_watering.serializers import PlantWateringSerializer


class PlantViewSet(viewsets.ModelViewSet):
    queryset = Plants.objects.all()
    serializer_class = PlantSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=["get"])
    def watering_record(self, request, pk=None):
        """
        Return watering records for this plant.

        URL: GET /api/plants/{pk}/watering_record/
        Returns watering records ordered by date (newest first).
        """
        plant = self.get_object()
        records = plant.watering_schedules.all().order_by('-watering_date')
        serializer = PlantWateringSerializer(records, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def upload_image(self, request):
        """Upload plant image to Cloudinary and return the URL"""
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
                folder='greencare/plants',
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
