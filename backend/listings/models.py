from django.db import models
from django.conf import settings


class Listing(models.Model):
    """A buy/sell listing anchored to a geographic location."""

    CATEGORY_CHOICES = [
        ('electronics', 'Electronics'),
        ('furniture', 'Furniture'),
        ('clothing', 'Clothing'),
        ('vehicles', 'Vehicles'),
        ('food', 'Food'),
        ('services', 'Services'),
        ('other', 'Other'),
    ]

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('sold', 'Sold'),
        ('expired', 'Expired'),
    ]

    LISTING_TYPE_CHOICES = [
        ('sell', 'For Sale'),
        ('buy', 'Want to Buy'),
    ]

    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='listings'
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=12, decimal_places=2)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    listing_type = models.CharField(max_length=4, choices=LISTING_TYPE_CHOICES, default='sell')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')

    # Location
    latitude = models.FloatField(help_text="Listing location latitude")
    longitude = models.FloatField(help_text="Listing location longitude")
    address = models.CharField(max_length=300, blank=True)

    # Image URL (simple — external link)
    image_url = models.URLField(blank=True)
    # Image upload (Phase 2)
    image = models.ImageField(upload_to='listings/', blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - ₱{self.price} ({self.get_listing_type_display()})"
