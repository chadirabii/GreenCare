from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import Group
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from authentication.models import CustomUser
from authentication.serializers import *
from drf_yasg.utils import swagger_auto_schema
from rest_framework_simplejwt.tokens import RefreshToken


@swagger_auto_schema(request_body=LoginSerializer, method="post")
@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)

    if serializer.is_valid():
        email = serializer.validated_data['email']
        password = serializer.validated_data["password"]

        # check if user exists
        if not CustomUser.objects.filter(email=email).exists():
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)

        # authenticate
        user = authenticate(request, username=email, password=password)

        if user is None:
            return Response({"error": "Invalid credentials"}, status=400)

        # Create JWT token
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "message": "Login successful",
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "role": user.role,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                },
            },
            status=status.HTTP_200_OK,
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@swagger_auto_schema(request_body=RegisterSerializer, method="post")
@api_view(["POST"])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)

    if serializer.is_valid():
        data = serializer.validated_data

        # check if user exists
        if CustomUser.objects.filter(email=data['email']).exists():
            return Response({'error': 'Email already registered!'}, status=status.HTTP_400_BAD_REQUEST)
    
        user = CustomUser.objects.create_user(
            first_name=data["first_name"],
            last_name=data["last_name"],
            email=data['email'],
            profile_picture=data.get("profile_picture"),
            role=data.get("role", "plant_owner"),
        )
        user.set_password(data["password"])

        user.save()

        # Create token
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "message": "Account created successfully!",
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "role": user.role,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                },
            },
            status=status.HTTP_201_CREATED,
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data, status=status.HTTP_200_OK)
