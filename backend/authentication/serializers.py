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
        choices=['farmer', 'house_plant_owner'],
        default='house_plant_owner'
    )
