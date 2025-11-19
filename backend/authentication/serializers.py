from rest_framework import serializers

from authentication.models import CustomUser


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField() 
    password = serializers.CharField(write_only=True)   


class RegisterSerializer(serializers.Serializer):
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    profile_picture = serializers.ImageField(required=False)
    
    role = serializers.ChoiceField(
        choices=['admin', 'farmer', 'plant_owner', 'seller'],
        default='plant_owner'
    )
    

# Serializer to return user data 
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        
        # Fields returned in API responses
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'profile_picture', 'created_at']
        
        # FIelds that can't be changed through the API
        read_only_fields = ['id', 'created_at']


# Forgot password:
# - validate email request
class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


# - handle actual password reset
class PasswordResetConfirmSerializer(serializers.Serializer):
    new_password = serializers.CharField(write_only=True)
    uid = serializers.CharField()
    token = serializers.CharField()