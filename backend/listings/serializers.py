from rest_framework import serializers
from .models import Listing


class ListingSerializer(serializers.ModelSerializer):
    seller_username = serializers.CharField(source='seller.username', read_only=True)
    listing_type_display = serializers.CharField(source='get_listing_type_display', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    seller_rating = serializers.FloatField(source='seller.rating', read_only=True)
    seller_rating_count = serializers.IntegerField(source='seller.rating_count', read_only=True)
    seller_avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = Listing
        fields = [
            'id', 'seller', 'seller_username', 'title', 'description',
            'price', 'category', 'category_display', 'listing_type',
            'listing_type_display', 'status', 'latitude', 'longitude',
            'address', 'image_url', 'image', 'created_at', 'updated_at',
            'seller_rating', 'seller_rating_count', 'seller_avatar_url',
        ]
        read_only_fields = ['id', 'seller', 'created_at', 'updated_at']

    def get_seller_avatar_url(self, obj):
        if obj.seller.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.seller.avatar.url)
            return obj.seller.avatar.url
        return ''
