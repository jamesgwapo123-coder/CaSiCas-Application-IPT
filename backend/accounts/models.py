from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    """Custom user with role-based access for the marketplace."""

    ROLE_CHOICES = [
        ('buyer', 'Buyer'),
        ('seller', 'Seller'),
        ('admin', 'Admin'),
    ]

    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='buyer')
    phone = models.CharField(max_length=20, blank=True)
    bio = models.TextField(blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    latitude = models.FloatField(null=True, blank=True, help_text="User's default location lat")
    longitude = models.FloatField(null=True, blank=True, help_text="User's default location lng")
    rating = models.FloatField(default=0)
    rating_count = models.IntegerField(default=0)
    total_sales = models.IntegerField(default=0)
    total_purchases = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
