from django.db import models


class Plants(models.Model):
    name = models.CharField(max_length=100)
    species = models.CharField(max_length=100)
    age = models.IntegerField()
    height = models.FloatField()
    width = models.FloatField()
    description = models.TextField()
    image = models.URLField(max_length=500, blank=True, null=True)

    def __str__(self):
        return f"{self.name} - {self.species}"
