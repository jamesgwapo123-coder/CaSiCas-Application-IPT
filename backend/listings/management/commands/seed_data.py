import random
from django.core.management.base import BaseCommand
from accounts.models import CustomUser
from listings.models import Listing


# Sample listings scattered around Cebu City
SEED_LISTINGS = [
    {
        'title': 'iPhone 15 Pro Max - Like New',
        'description': 'Barely used iPhone 15 Pro Max, 256GB Natural Titanium. Complete with box and accessories. Meet-up in IT Park.',
        'price': 55000,
        'category': 'electronics',
        'listing_type': 'sell',
        'latitude': 10.3308,
        'longitude': 123.9053,
        'address': 'IT Park, Cebu City',
    },
    {
        'title': 'Gaming PC Setup - RTX 4070',
        'description': 'Full gaming setup: RTX 4070, Ryzen 7, 32GB RAM, 1TB SSD, 27" 144Hz monitor. Must sell, relocating.',
        'price': 65000,
        'category': 'electronics',
        'listing_type': 'sell',
        'latitude': 10.3157,
        'longitude': 123.8854,
        'address': 'Fuente Osmeña, Cebu City',
    },
    {
        'title': 'Wooden Dining Table Set - 6 Seater',
        'description': 'Solid narra wood dining table with 6 chairs. Minor scratches but very sturdy. Pick-up only.',
        'price': 12000,
        'category': 'furniture',
        'listing_type': 'sell',
        'latitude': 10.2934,
        'longitude': 123.8984,
        'address': 'Mambaling, Cebu City',
    },
    {
        'title': 'Looking for 2nd Hand Motorcycle',
        'description': 'WTB: Honda Click or Yamaha Mio, 2020 model or newer. Budget around 40-50k. Cebu City area only.',
        'price': 50000,
        'category': 'vehicles',
        'listing_type': 'buy',
        'latitude': 10.3119,
        'longitude': 123.9155,
        'address': 'Banilad, Cebu City',
    },
    {
        'title': 'Vintage Barong Tagalog Collection',
        'description': '5 pieces hand-embroidered barong tagalog. Perfect for formal events. Various sizes (M-XL).',
        'price': 8000,
        'category': 'clothing',
        'listing_type': 'sell',
        'latitude': 10.2942,
        'longitude': 123.8613,
        'address': 'Carbon Market, Cebu City',
    },
    {
        'title': 'Homemade Lechon - Whole Pig',
        'description': 'Original Cebu lechon! Order 2 days in advance. Whole pig (15-20kg). Free delivery within Cebu City.',
        'price': 7500,
        'category': 'food',
        'listing_type': 'sell',
        'latitude': 10.3450,
        'longitude': 123.9120,
        'address': 'Talamban, Cebu City',
    },
    {
        'title': 'Aircon Cleaning & Repair Service',
        'description': 'Professional aircon servicing. Split type & window type. Same-day service available in Cebu City.',
        'price': 500,
        'category': 'services',
        'listing_type': 'sell',
        'latitude': 10.3225,
        'longitude': 123.8987,
        'address': 'Capitol Site, Cebu City',
    },
    {
        'title': 'Samsung Galaxy Tab S9 FE',
        'description': 'Brand new sealed Samsung Galaxy Tab S9 FE with S Pen. WiFi, 128GB. Bought from Samsung store.',
        'price': 22000,
        'category': 'electronics',
        'listing_type': 'sell',
        'latitude': 10.3118,
        'longitude': 123.9176,
        'address': 'Ayala Center Cebu',
    },
    {
        'title': 'Looking for Condo Unit to Rent',
        'description': 'WTB/Rent: Studio or 1BR condo near IT Park or Ayala. Budget max 15k/month. For immediate move-in.',
        'price': 15000,
        'category': 'other',
        'listing_type': 'buy',
        'latitude': 10.3270,
        'longitude': 123.9050,
        'address': 'Lahug, Cebu City',
    },
    {
        'title': 'Mountain Bike - Trinx M136',
        'description': 'Trinx M136 mountain bike, 27.5" wheels, Shimano gears. Used for 6 months only. With free helmet.',
        'price': 8500,
        'category': 'vehicles',
        'listing_type': 'sell',
        'latitude': 10.3500,
        'longitude': 123.8900,
        'address': 'Banawa, Cebu City',
    },
    {
        'title': 'Office Desk & Ergonomic Chair Set',
        'description': 'WFH setup: adjustable standing desk (120x60cm) + ergonomic mesh chair. Both in excellent condition.',
        'price': 18000,
        'category': 'furniture',
        'listing_type': 'sell',
        'latitude': 10.3050,
        'longitude': 123.8930,
        'address': 'V. Rama, Cebu City',
    },
    {
        'title': 'Fresh Dried Mangoes - Wholesale',
        'description': 'Best quality Cebu dried mangoes! Wholesale price for bulk orders. Minimum 10 packs.',
        'price': 1500,
        'category': 'food',
        'listing_type': 'sell',
        'latitude': 10.2870,
        'longitude': 123.8620,
        'address': 'Talisay City, Cebu',
    },
]


class Command(BaseCommand):
    help = 'Seed database with sample users and listings for Cebu City'

    def handle(self, *args, **options):
        self.stdout.write('Seeding database...')

        # Create sample users
        seller1, created = CustomUser.objects.get_or_create(
            username='juan_seller',
            defaults={
                'email': 'juan@example.com',
                'first_name': 'Juan',
                'last_name': 'Dela Cruz',
                'role': 'seller',
                'latitude': 10.3157,
                'longitude': 123.8854,
            }
        )
        if created:
            seller1.set_password('password123')
            seller1.save()
            self.stdout.write(self.style.SUCCESS(f'Created seller: {seller1.username}'))

        seller2, created = CustomUser.objects.get_or_create(
            username='maria_seller',
            defaults={
                'email': 'maria@example.com',
                'first_name': 'Maria',
                'last_name': 'Santos',
                'role': 'seller',
                'latitude': 10.3308,
                'longitude': 123.9053,
            }
        )
        if created:
            seller2.set_password('password123')
            seller2.save()
            self.stdout.write(self.style.SUCCESS(f'Created seller: {seller2.username}'))

        buyer1, created = CustomUser.objects.get_or_create(
            username='pedro_buyer',
            defaults={
                'email': 'pedro@example.com',
                'first_name': 'Pedro',
                'last_name': 'Reyes',
                'role': 'buyer',
                'latitude': 10.3119,
                'longitude': 123.9155,
            }
        )
        if created:
            buyer1.set_password('password123')
            buyer1.save()
            self.stdout.write(self.style.SUCCESS(f'Created buyer: {buyer1.username}'))

        sellers = [seller1, seller2]

        # Create listings
        for listing_data in SEED_LISTINGS:
            listing, created = Listing.objects.get_or_create(
                title=listing_data['title'],
                defaults={
                    **listing_data,
                    'seller': random.choice(sellers),
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created listing: {listing.title}'))

        total_listings = Listing.objects.count()
        total_users = CustomUser.objects.count()
        self.stdout.write(self.style.SUCCESS(
            f'\nDone! {total_users} users, {total_listings} listings in database.'
        ))
