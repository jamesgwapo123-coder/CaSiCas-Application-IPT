from rest_framework import serializers
from .models import Rating


class RatingSerializer(serializers.ModelSerializer):
    buyer_username = serializers.CharField(source='buyer.username', read_only=True)

    class Meta:
        model = Rating
        fields = ['id', 'listing', 'buyer', 'buyer_username', 'seller',
                  'score', 'review', 'created_at']
        read_only_fields = ['id', 'buyer', 'created_at']
