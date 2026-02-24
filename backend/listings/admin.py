from django.contrib import admin
from .models import Listing


@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = ['title', 'seller', 'price', 'category', 'listing_type', 'status', 'created_at']
    list_filter = ['category', 'listing_type', 'status']
    search_fields = ['title', 'description', 'address']
