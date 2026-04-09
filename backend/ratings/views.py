from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django.db.models import Avg
from .models import Rating
from .serializers import RatingSerializer


class RateSellerView(generics.CreateAPIView):
    """POST a rating for a seller."""
    serializer_class = RatingSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        rating = serializer.save(buyer=self.request.user)
        # Update seller average rating
        seller = rating.seller
        ratings_qs = Rating.objects.filter(seller=seller)
        avg = ratings_qs.aggregate(avg=Avg('score'))['avg'] or 0
        cnt = ratings_qs.count()
        seller.rating = round(avg, 1)
        seller.rating_count = cnt
        seller.save(update_fields=['rating', 'rating_count'])


class SellerRatingsView(generics.ListAPIView):
    """GET all ratings for a specific seller."""
    serializer_class = RatingSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        seller_id = self.kwargs['seller_id']
        return Rating.objects.filter(seller_id=seller_id)
