from django.db import models
from django.conf import settings


class Rating(models.Model):
    """Buyer rates a seller after a transaction."""

    listing = models.ForeignKey(
        'listings.Listing',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='ratings',
    )
    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='ratings_given',
    )
    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='ratings_received',
    )
    score = models.IntegerField(help_text="1-5 star rating")
    review = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['listing', 'buyer']

    def __str__(self):
        return f"{self.buyer.username} → {self.seller.username}: {self.score}★"
