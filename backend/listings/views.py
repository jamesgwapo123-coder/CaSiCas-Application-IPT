import math
from rest_framework import viewsets, status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework.response import Response
from .models import Listing
from .serializers import ListingSerializer


def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate distance in km between two lat/lng points using Haversine formula."""
    R = 6371  # Earth's radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


class ListingViewSet(viewsets.ModelViewSet):
    """
    CRUD for listings with geo-filtering.

    Query params:
    - lat, lng: center point for radius filter
    - radius: distance in km (default: show all)
    - category: filter by category
    - listing_type: 'sell' or 'buy'
    - status: filter by listing status (default: 'active')
    """
    serializer_class = ListingSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Listing.objects.filter(status='active')
        params = self.request.query_params

        # Category filter
        category = params.get('category')
        if category:
            queryset = queryset.filter(category=category)

        # Listing type filter
        listing_type = params.get('listing_type')
        if listing_type:
            queryset = queryset.filter(listing_type=listing_type)

        # Status override
        status_filter = params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        # Geo-filtering with Haversine
        lat = params.get('lat')
        lng = params.get('lng')
        radius = params.get('radius')

        if lat and lng and radius:
            try:
                lat = float(lat)
                lng = float(lng)
                radius = float(radius)
                # Pre-filter with a bounding box for performance
                lat_range = radius / 111.0  # ~111km per degree
                lng_range = radius / (111.0 * math.cos(math.radians(lat)))
                queryset = queryset.filter(
                    latitude__range=(lat - lat_range, lat + lat_range),
                    longitude__range=(lng - lng_range, lng + lng_range),
                )
                # Precise Haversine filter
                ids = [
                    item.id for item in queryset
                    if haversine_distance(lat, lng, item.latitude, item.longitude) <= radius
                ]
                queryset = queryset.filter(id__in=ids)
            except (ValueError, TypeError):
                pass

        return queryset

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)

    def update(self, request, *args, **kwargs):
        listing = self.get_object()
        if listing.seller != request.user and not request.user.is_staff:
            return Response(
                {'detail': 'You can only edit your own listings.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        listing = self.get_object()
        if listing.seller != request.user and not request.user.is_staff:
            return Response(
                {'detail': 'You can only delete your own listings.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)
