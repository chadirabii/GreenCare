from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.


class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ("admin", "Admin"),
        ("farmer", "Farmer"),
        ("plant_owner", "Plant Owner"),
        ("seller", "Seller"),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="plant_owner")

    profile_picture = models.ImageField(upload_to="profiles/", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def get_role(self):
        return self.role
