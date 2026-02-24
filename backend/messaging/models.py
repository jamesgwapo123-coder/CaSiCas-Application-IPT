from django.db import models
from django.conf import settings


class Conversation(models.Model):
    """A chat thread between two users, optionally tied to a listing."""

    listing = models.ForeignKey(
        'listings.Listing',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='conversations',
    )
    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='conversations_as_buyer',
    )
    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='conversations_as_seller',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']
        unique_together = ['buyer', 'seller', 'listing']

    def __str__(self):
        listing_title = self.listing.title if self.listing else 'General'
        return f"{self.buyer.username} ↔ {self.seller.username} ({listing_title})"

    @property
    def last_message(self):
        return self.messages.order_by('-created_at').first()


class Message(models.Model):
    """A single message within a conversation."""

    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages',
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_messages',
    )
    text = models.TextField(blank=True)
    image = models.ImageField(upload_to='chat/', blank=True, null=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.sender.username}: {self.text[:50] or '[image]'}"


REACTION_CHOICES = [
    ('❤️', 'Heart'),
    ('👍', 'Thumbs Up'),
    ('😂', 'Laugh'),
    ('😮', 'Wow'),
    ('😢', 'Sad'),
]


class Reaction(models.Model):
    """Emoji reaction on a message."""

    message = models.ForeignKey(
        Message,
        on_delete=models.CASCADE,
        related_name='reactions',
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reactions',
    )
    emoji = models.CharField(max_length=4, choices=REACTION_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['message', 'user', 'emoji']

    def __str__(self):
        return f"{self.user.username} → {self.emoji} on message #{self.message.id}"
