from django.db import models
from authentication.models import CustomUser


class DetectionResult(models.Model):
    STATUS_CHOICES = [
        ('healthy', 'Healthy'),
        ('diseased', 'Diseased'),
    ]

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="detections")
    image_url = models.URLField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    disease = models.CharField(max_length=255, blank=True, null=True)
    confidence = models.FloatField()
    recommendations = models.JSONField(default=list)
    groq_raw_response = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.disease or 'Healthy'}"
