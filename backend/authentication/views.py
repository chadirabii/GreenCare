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
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings

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


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    Logout user by invalidating the refresh token
    """
    try:
        logout(request)
        return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data, status=status.HTTP_200_OK)



# Forgot password
# @swagger_auto_schema(request_body=PasswordResetRequestSerializer, method='post')
@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    serializer = PasswordResetRequestSerializer(data=request.data)
    
    if serializer.is_valid():
        email = serializer.validated_data['email']
        
        try:
            user = CustomUser.objects.get(email = email)
            
            # Generate a unique token and ID for the user
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            reset_link = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"
            
            send_mail(
                subject= "Password Reset Request",
                message=f"Click the link to reset your password: {reset_link}",
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[email],
                fail_silently=False
            )
            
            return Response({"message": "Password reset link sent to email", "uid": uid, "token": token}, status=status.HTTP_200_OK)
            
        except CustomUser.DoesNotExist:
            return Response({"message": "Invalid email"}, status=status.HTTP_404_NOT_FOUND)
        
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    serializer = PasswordResetConfirmSerializer(data = request.data)
    
    if serializer.is_valid():
        uid = serializer.validated_data['uid']
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']        
        
        try:
            # Decode id
            user_id = force_str(urlsafe_base64_decode(uid))
            user = CustomUser.objects.get(pk = user_id)
            
            if default_token_generator.check_token(user, token):
                user.set_password(new_password)
                user.save()    
            
            return Response({"message": "Password has been reset successfully"}, status=status.HTTP_200_OK)
        
        except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
            return Response({"error": "Invalid user ID"}, status=status.HTTP_400_BAD_REQUEST)             
        
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    