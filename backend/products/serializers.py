from rest_framework import serializers
from .models import Product
from authentication.models import CustomUser


class ProductSerializer(serializers.ModelSerializer):
    owner_name = serializers.SerializerMethodField()
    owner_email = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'category', 'image',
                  'owner', 'owner_name', 'owner_email', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_owner_name(self, obj):
        # Handle case when owner is None (development mode)
        if not obj.owner:
            return "Anonymous"
        return f"{obj.owner.first_name} {obj.owner.last_name}" if obj.owner.first_name else obj.owner.username

    def get_owner_email(self, obj):
        # Handle case when owner is None (development mode)
        if not obj.owner:
            return "no-email@example.com"
        return obj.owner.email
