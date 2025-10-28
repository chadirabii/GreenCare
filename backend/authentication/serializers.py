from rest_framework import serializers

from authentication.models import CustomUser


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)   


class RegisterSerializer(serializers.Serializer):
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    username = serializers.CharField()
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
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'role', 'profile_picture', 'created_at']
        
        # FIelds that can't be changed through the API
        read_only_fields = ['id', 'created_at']
        