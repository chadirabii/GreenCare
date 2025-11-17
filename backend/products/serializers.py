from rest_framework import serializers
from .models import Product, ProductImage
from authentication.models import CustomUser


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image_url', 'public_id', 'order']
        read_only_fields = ['id']


class ProductSerializer(serializers.ModelSerializer):
    owner_name = serializers.SerializerMethodField()
    owner_email = serializers.SerializerMethodField()
    images = ProductImageSerializer(many=True, read_only=True)
    image_urls = serializers.ListField(
        child=serializers.URLField(),
        write_only=True,
        required=False,
        max_length=5,
        help_text="List of image URLs (max 5)"
    )

    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'category', 'image',
                  'images', 'image_urls', 'owner', 'owner_name', 'owner_email',
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'images']

    def get_owner_name(self, obj):
        if not obj.owner:
            return "Anonymous"
        return f"{obj.owner.first_name} {obj.owner.last_name}" if obj.owner.first_name else obj.owner.email

    def get_owner_email(self, obj):
        if not obj.owner:
            return "no-email@example.com"
        return obj.owner.email

    def create(self, validated_data):
        image_urls = validated_data.pop('image_urls', [])
        product = Product.objects.create(**validated_data)

        for index, url in enumerate(image_urls):
            ProductImage.objects.create(
                product=product,
                image_url=url,
                order=index
            )

        if image_urls:
            product.image = image_urls[0]
            product.save()

        return product

    def update(self, instance, validated_data):
        image_urls = validated_data.pop('image_urls', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if image_urls is not None:
            instance.images.all().delete()

            for index, url in enumerate(image_urls):
                ProductImage.objects.create(
                    product=instance,
                    image_url=url,
                    order=index
                )

            if image_urls:
                instance.image = image_urls[0]

        instance.save()
        return instance
