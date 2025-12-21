from django.db import models
from authentication.models import CustomUser


class Product(models.Model):
    CATEGORY_CHOICES = [
        ('plants', 'Plants'),
        ('medicines', 'Medicines'),
        ('tools', 'Tools'),
        ('fertilizers', 'Fertilizers'),
    ]

    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    image = models.URLField(max_length=500, blank=True, null=True)
    stock_quantity = models.PositiveIntegerField(
        default=0, help_text="Available stock quantity")
    owner = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name='products',
        null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['-created_at']


class ProductImage(models.Model):
    """Model to store multiple images for a product"""
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='images'
    )
    image_url = models.URLField(max_length=500)
    public_id = models.CharField(
        max_length=200, blank=True, null=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"{self.product.name} - Image {self.order}"


class Order(models.Model):
    """Model to store product orders"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='orders'
    )
    buyer = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='orders'
    )
    seller = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='sales'
    )
    quantity = models.PositiveIntegerField(default=1)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='pending')
    shipping_address = models.TextField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order {self.id} - {self.product.name} by {self.buyer.email}"

    def save(self, *args, **kwargs):
        # Calculate total price if not set
        if not self.total_price:
            self.total_price = self.product.price * self.quantity
        super().save(*args, **kwargs)
