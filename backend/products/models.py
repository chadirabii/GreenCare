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
    owner = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name='products',
        null=True, blank=True)  # Temporarily nullable for development
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['-created_at']
