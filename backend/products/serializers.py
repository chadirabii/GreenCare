from rest_framework import serializers
from .models import Product, ProductImage, Order
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
        # NOTE: This value (max_length=5) should match the MAX_IMAGES constant in the frontend ProductForm component.
        max_length=5,
        help_text="List of image URLs (max 5)"
    )

    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'category', 'image',
                  'images', 'image_urls', 'stock_quantity', 'owner', 'owner_name', 'owner_email',
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


class OrderSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_image = serializers.CharField(
        source='product.image', read_only=True)
    product_price = serializers.DecimalField(
        source='product.price', max_digits=10, decimal_places=2, read_only=True)
    buyer_name = serializers.SerializerMethodField()
    buyer_email = serializers.CharField(source='buyer.email', read_only=True)
    seller_name = serializers.SerializerMethodField()
    seller_email = serializers.CharField(source='seller.email', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'product', 'product_name', 'product_image', 'product_price',
            'buyer', 'buyer_name', 'buyer_email',
            'seller', 'seller_name', 'seller_email',
            'quantity', 'total_price', 'status',
            'shipping_address', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'buyer', 'seller',
                            'total_price', 'created_at', 'updated_at']

    def get_buyer_name(self, obj):
        if not obj.buyer:
            return "Anonymous"
        return f"{obj.buyer.first_name} {obj.buyer.last_name}" if obj.buyer.first_name else obj.buyer.email

    def get_seller_name(self, obj):
        if not obj.seller:
            return "Anonymous"
        return f"{obj.seller.first_name} {obj.seller.last_name}" if obj.seller.first_name else obj.seller.email

    def validate(self, data):
        product = data.get('product')
        quantity = data.get('quantity', 1)

        # Check if product has enough stock
        if product.stock_quantity < quantity:
            raise serializers.ValidationError({
                'quantity': f'Only {product.stock_quantity} items available in stock'
            })

        return data

    def create(self, validated_data):
        product = validated_data['product']
        quantity = validated_data.get('quantity', 1)

        # Set seller and calculate total price
        validated_data['seller'] = product.owner
        validated_data['total_price'] = product.price * quantity

        # Create order
        order = Order.objects.create(**validated_data)

        # Reduce stock
        product.stock_quantity -= quantity
        product.save()

        return order
