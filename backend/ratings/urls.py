from django.urls import path
from . import views

urlpatterns = [
    path('rate/', views.RateSellerView.as_view(), name='rate-seller'),
    path('seller/<int:seller_id>/', views.SellerRatingsView.as_view(), name='seller-ratings'),
]
