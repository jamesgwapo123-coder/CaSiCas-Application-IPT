from rest_framework import serializers
from .models import Conversation, Message, Reaction


class ReactionSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Reaction
        fields = ['id', 'emoji', 'user', 'username', 'created_at']
        read_only_fields = ['id', 'user', 'username', 'created_at']


class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    reactions = ReactionSerializer(many=True, read_only=True)
    # Group reactions for display: {"❤️": 2, "👍": 1}
    reaction_summary = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            'id', 'conversation', 'sender', 'sender_username',
            'text', 'image', 'is_read', 'created_at',
            'reactions', 'reaction_summary',
        ]
        read_only_fields = ['id', 'sender', 'sender_username', 'is_read', 'created_at']

    def get_reaction_summary(self, obj):
        summary = {}
        for reaction in obj.reactions.all():
            summary[reaction.emoji] = summary.get(reaction.emoji, 0) + 1
        return summary


class ConversationSerializer(serializers.ModelSerializer):
    buyer_username = serializers.CharField(source='buyer.username', read_only=True)
    seller_username = serializers.CharField(source='seller.username', read_only=True)
    listing_title = serializers.CharField(source='listing.title', read_only=True, default=None)
    last_message_text = serializers.SerializerMethodField()
    last_message_time = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            'id', 'listing', 'buyer', 'seller',
            'buyer_username', 'seller_username', 'listing_title',
            'last_message_text', 'last_message_time', 'unread_count',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'buyer', 'created_at', 'updated_at']

    def get_last_message_text(self, obj):
        msg = obj.last_message
        if msg:
            if msg.image:
                return '📷 Photo'
            return msg.text[:80]
        return None

    def get_last_message_time(self, obj):
        msg = obj.last_message
        return msg.created_at if msg else None

    def get_unread_count(self, obj):
        user = self.context.get('request')
        if user and hasattr(user, 'user'):
            return obj.messages.filter(is_read=False).exclude(sender=user.user).count()
        return 0
