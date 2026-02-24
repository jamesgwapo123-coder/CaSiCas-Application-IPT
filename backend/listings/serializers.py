from rest_framework import serializers
from .models import Listing


class ListingSerializer(serializers.ModelSerializer):
    seller_username = serializers.CharField(source='seller.username', read_only=True)
    listing_type_display = serializers.CharField(source='get_listing_type_display', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = Listing
        fields = [
            'id', 'seller', 'seller_username', 'title', 'description',
            'price', 'category', 'category_display', 'listing_type',
            'listing_type_display', 'status', 'latitude', 'longitude',
            'address', 'image_url', 'image', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'seller', 'created_at', 'updated_at']
