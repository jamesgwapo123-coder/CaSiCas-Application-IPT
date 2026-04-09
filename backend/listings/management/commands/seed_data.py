"""
Seed the database with fake users and listings with product images.
Usage: python manage.py seed_data
"""
import random
from decimal import Decimal

from django.core.management.base import BaseCommand
from accounts.models import CustomUser
from listings.models import Listing


# ── Fake people ──────────────────────────────────────────────────

FAKE_USERS = [
    {"username": "maria_santos", "first_name": "Maria", "last_name": "Santos", "role": "seller"},
    {"username": "juan_delacruz", "first_name": "Juan", "last_name": "Dela Cruz", "role": "seller"},
    {"username": "ana_reyes", "first_name": "Ana", "last_name": "Reyes", "role": "seller"},
    {"username": "carlos_garcia", "first_name": "Carlos", "last_name": "Garcia", "role": "seller"},
    {"username": "rosa_mendoza", "first_name": "Rosa", "last_name": "Mendoza", "role": "seller"},
    {"username": "marco_villar", "first_name": "Marco", "last_name": "Villar", "role": "seller"},
    {"username": "jenny_lim", "first_name": "Jenny", "last_name": "Lim", "role": "seller"},
    {"username": "paolo_ramos", "first_name": "Paolo", "last_name": "Ramos", "role": "seller"},
    {"username": "grace_tan", "first_name": "Grace", "last_name": "Tan", "role": "seller"},
    {"username": "rico_bautista", "first_name": "Rico", "last_name": "Bautista", "role": "seller"},
    {"username": "liza_cruz", "first_name": "Liza", "last_name": "Cruz", "role": "buyer"},
    {"username": "miguel_flores", "first_name": "Miguel", "last_name": "Flores", "role": "buyer"},
    {"username": "claire_abad", "first_name": "Claire", "last_name": "Abad", "role": "buyer"},
    {"username": "daniel_soriano", "first_name": "Daniel", "last_name": "Soriano", "role": "buyer"},
    {"username": "nina_castillo", "first_name": "Nina", "last_name": "Castillo", "role": "buyer"},
]

# ── Listings with product-specific image keywords ────────────────

LISTINGS_DATA = [
    # Electronics
    {"title": "iPhone 14 Pro Max 256GB", "desc": "Deep Purple, 95% battery health, complete with box and charger.", "price": 42000, "cat": "electronics", "type": "sell", "img": "iphone,smartphone"},
    {"title": "Samsung Galaxy S23 Ultra", "desc": "Phantom Black, 512GB storage, slight scratch on back glass.", "price": 38000, "cat": "electronics", "type": "sell", "img": "samsung,phone"},
    {"title": "MacBook Air M2 2022", "desc": "Midnight, 8GB/256GB. Used for 6 months only. No dents.", "price": 55000, "cat": "electronics", "type": "sell", "img": "macbook,laptop"},
    {"title": "Sony WH-1000XM5 Headphones", "desc": "Black, noise cancelling. Barely used, comes with travel case.", "price": 12500, "cat": "electronics", "type": "sell", "img": "headphones,audio"},
    {"title": "Nintendo Switch OLED", "desc": "White model with 3 games: Zelda TOTK, Mario Kart, Splatoon 3.", "price": 16000, "cat": "electronics", "type": "sell", "img": "nintendo,gaming"},
    {"title": "iPad Air 5th Gen WiFi", "desc": "Space Gray, 64GB. Perfect for students. Apple Pencil included.", "price": 28000, "cat": "electronics", "type": "sell", "img": "ipad,tablet"},
    {"title": "Gaming PC RTX 4060", "desc": "Ryzen 5 5600X, 16GB RAM, 1TB SSD. Built last year.", "price": 45000, "cat": "electronics", "type": "sell", "img": "gaming,computer"},
    {"title": "Canon EOS R50 Mirrorless", "desc": "With 18-45mm lens kit. Only 2k shutter count. Great for vloggers.", "price": 35000, "cat": "electronics", "type": "sell", "img": "camera,canon"},
    {"title": "JBL Flip 6 Bluetooth Speaker", "desc": "Teal color. Waterproof and dustproof. Excellent bass.", "price": 5500, "cat": "electronics", "type": "sell", "img": "speaker,bluetooth"},
    {"title": "Apple Watch Series 9 GPS", "desc": "45mm Midnight Aluminum. AppleCare+ until 2025.", "price": 22000, "cat": "electronics", "type": "sell", "img": "smartwatch,apple"},

    # Furniture
    {"title": "L-Shaped Computer Desk", "desc": "Walnut finish, 140x120cm. Sturdy steel frame. Cable management.", "price": 6500, "cat": "furniture", "type": "sell", "img": "desk,office"},
    {"title": "Ergonomic Office Chair", "desc": "Mesh back, adjustable lumbar support, 360 swivel. Black.", "price": 8000, "cat": "furniture", "type": "sell", "img": "office,chair"},
    {"title": "Queen Size Bed Frame", "desc": "Solid wood, minimalist design. Mattress NOT included.", "price": 12000, "cat": "furniture", "type": "sell", "img": "bed,furniture"},
    {"title": "4-Seater Dining Table Set", "desc": "Wooden table with 4 cushioned chairs. Perfect for small apartments.", "price": 9500, "cat": "furniture", "type": "sell", "img": "dining,table"},
    {"title": "Bookshelves 5-Tier Set", "desc": "Industrial style, metal and wood. Set of 2. Holds heavy books.", "price": 4500, "cat": "furniture", "type": "sell", "img": "bookshelf,shelf"},
    {"title": "Sofa Bed Convertible", "desc": "Gray fabric, folds flat into a double bed. Great for guests.", "price": 15000, "cat": "furniture", "type": "sell", "img": "sofa,couch"},
    {"title": "Standing Desk Adjustable", "desc": "Electric height adjustment, 120x60cm. White oak surface.", "price": 18000, "cat": "furniture", "type": "sell", "img": "standing,desk"},

    # Vehicles
    {"title": "Honda Click 125i 2022", "desc": "Matte Black, 15k km. Well maintained, complete papers.", "price": 65000, "cat": "vehicles", "type": "sell", "img": "scooter,motorcycle"},
    {"title": "Toyota Vios 2019 1.3E AT", "desc": "White, 45k km. Casa maintained. New tires. No flood.", "price": 520000, "cat": "vehicles", "type": "sell", "img": "sedan,toyota"},
    {"title": "Yamaha NMAX 2023", "desc": "Blue, ABS model. 8k km only. First owner.", "price": 115000, "cat": "vehicles", "type": "sell", "img": "yamaha,scooter"},
    {"title": "Mountain Bike Trinx M136", "desc": "27.5 wheels, 21-speed Shimano. Lightweight aluminum frame.", "price": 7500, "cat": "vehicles", "type": "sell", "img": "bicycle,mountain"},
    {"title": "Suzuki Raider R150 Fi", "desc": "Red, 2021 model. 20k km. Modified exhaust.", "price": 58000, "cat": "vehicles", "type": "sell", "img": "motorcycle,suzuki"},

    # Clothing
    {"title": "Vintage Levis 501 Jeans", "desc": "Size 32, medium wash. Authentic vintage from the 90s.", "price": 2500, "cat": "clothing", "type": "sell", "img": "jeans,denim"},
    {"title": "Nike Air Max 90 Size 10", "desc": "White/Black colorway. Worn twice. With original box.", "price": 5000, "cat": "clothing", "type": "sell", "img": "sneakers,nike"},
    {"title": "Uniqlo Ultra Light Down Jacket", "desc": "Navy, size M. Perfect for cold weather trips.", "price": 1800, "cat": "clothing", "type": "sell", "img": "jacket,winter"},
    {"title": "Adidas Originals Hoodie", "desc": "Black, size L. Trefoil logo. Brand new with tags.", "price": 2200, "cat": "clothing", "type": "sell", "img": "hoodie,adidas"},
    {"title": "Bundle: 10 Preloved T-Shirts", "desc": "Assorted brands, sizes M-L. Good condition. Take all.", "price": 800, "cat": "clothing", "type": "sell", "img": "tshirt,clothing"},
    {"title": "Formal Barong Tagalog", "desc": "Handwoven pina-jusi blend. Size M. Worn once for graduation.", "price": 3500, "cat": "clothing", "type": "sell", "img": "formal,shirt"},

    # Services
    {"title": "Home Cleaning Deep Clean", "desc": "3BR house deep cleaning. Includes kitchen and bathrooms. Cebu area.", "price": 1500, "cat": "services", "type": "sell", "img": "cleaning,home"},
    {"title": "Web Developer for Hire", "desc": "React/Node.js developer. Available for freelance. Portfolio available.", "price": 500, "cat": "services", "type": "sell", "img": "coding,developer"},
    {"title": "Math Tutor College Level", "desc": "Calculus, Linear Algebra, Statistics. Per hour rate.", "price": 300, "cat": "services", "type": "sell", "img": "tutor,education"},
    {"title": "Pet Grooming for Dogs", "desc": "Full grooming: bath, haircut, nail trim, ear clean. Small-medium.", "price": 400, "cat": "services", "type": "sell", "img": "dog,grooming"},
    {"title": "Motorcycle Repair Service", "desc": "Engine overhaul, oil change, brake pads. Pickup available in Cebu.", "price": 800, "cat": "services", "type": "sell", "img": "mechanic,repair"},
    {"title": "Photography Events Coverage", "desc": "Wedding, debut, birthday. 4 hours + 100 edited photos.", "price": 5000, "cat": "services", "type": "sell", "img": "camera,photography"},

    # Food
    {"title": "Homemade Bibingka 12 pcs", "desc": "Traditional rice cake. Made fresh daily. Perfect for merienda.", "price": 250, "cat": "food", "type": "sell", "img": "ricecake,dessert"},
    {"title": "Lechon Belly 3kg", "desc": "Crispy skin, juicy meat. Pre-order 1 day ahead. Cebu pickup.", "price": 2400, "cat": "food", "type": "sell", "img": "roast,pork"},
    {"title": "Organic Vegetables Bundle", "desc": "Lettuce, tomatoes, kangkong, sitaw. Farm-fresh.", "price": 350, "cat": "food", "type": "sell", "img": "vegetables,organic"},
    {"title": "Korean Bento Meal Prep", "desc": "5-day meal prep: bibimbap, japchae, kimchi rice. Delivered.", "price": 1500, "cat": "food", "type": "sell", "img": "bento,korean"},
    {"title": "Durian Candy 500g Pack", "desc": "Made from real Davao durian. Sweet and chewy. Great pasalubong.", "price": 180, "cat": "food", "type": "sell", "img": "candy,sweets"},

    # Other
    {"title": "Camping Tent 4 Person", "desc": "Waterproof, double-layer. Used 3 times. Easy setup in 5 min.", "price": 3500, "cat": "other", "type": "sell", "img": "tent,camping"},
    {"title": "Acoustic Guitar Yamaha F310", "desc": "Natural finish. Comes with gig bag, capo, picks, and tuner.", "price": 6000, "cat": "other", "type": "sell", "img": "guitar,acoustic"},
    {"title": "Harry Potter Complete Set", "desc": "Bloomsbury paperback edition. English. Good condition.", "price": 2800, "cat": "other", "type": "sell", "img": "books,reading"},
    {"title": "Kids Bicycle Training Wheels", "desc": "Pink, for ages 4-7. Basket included. Barely used.", "price": 2000, "cat": "other", "type": "sell", "img": "bicycle,kids"},
    {"title": "Gym Dumbbells 20kg Pair", "desc": "Rubber-coated, hex shape. No rolling. Great for home gym.", "price": 3000, "cat": "other", "type": "sell", "img": "dumbbell,fitness"},
    {"title": "Monstera Deliciosa Plant", "desc": "Large, established plant in ceramic pot. 3 feet tall.", "price": 1200, "cat": "other", "type": "sell", "img": "monstera,plant"},
    {"title": "Board Games Bundle", "desc": "Settlers of Catan, Ticket to Ride, Codenames. Complete sets.", "price": 3500, "cat": "other", "type": "sell", "img": "boardgame,game"},
    {"title": "Baby Stroller Joie", "desc": "Lightweight, foldable. Rain cover included. 0-3 years.", "price": 4000, "cat": "other", "type": "sell", "img": "stroller,baby"},
    {"title": "Portable Projector Xiaomi", "desc": "1080p, built-in speaker. Perfect for movie nights.", "price": 8500, "cat": "other", "type": "sell", "img": "projector,tech"},
    {"title": "Dog Crate Large Foldable", "desc": "Metal crate for large breeds. 42 inches. Easy clean tray.", "price": 2500, "cat": "other", "type": "sell", "img": "pet,crate"},
]


CEBU_CENTER = (10.3157, 123.8854)


def random_cebu_coords():
    lat = CEBU_CENTER[0] + random.uniform(-0.04, 0.04)
    lng = CEBU_CENTER[1] + random.uniform(-0.04, 0.04)
    return round(lat, 6), round(lng, 6)


STREETS = [
    "Colon St", "Osmena Blvd", "Mango Ave", "General Maxilom Ave",
    "Don Jose Avila St", "Junquera St", "Sanciangko St", "V. Rama Ave",
    "N. Bacalso Ave", "Pope John Paul II Ave", "AS Fortuna St",
    "ML Quezon National Highway", "Salinas Drive", "Juan Luna Ave",
    "Archbishop Reyes Ave", "Banilad Road", "Gorordo Ave",
    "F. Ramos St", "Plaridel St", "MJ Cuenco Ave",
]


def random_address():
    return f"{random.randint(1, 999)} {random.choice(STREETS)}, Cebu City"


class Command(BaseCommand):
    help = "Seed database with 15 fake users and 50 listings with product images"

    def handle(self, *args, **options):
        self.stdout.write("Seeding database...")

        # 1. Create users
        users = []
        for u in FAKE_USERS:
            user, created = CustomUser.objects.get_or_create(
                username=u["username"],
                defaults={
                    "first_name": u["first_name"],
                    "last_name": u["last_name"],
                    "email": f"{u['username']}@casicas.demo",
                    "role": u["role"],
                    "bio": f"Hi, I'm {u['first_name']}! Active on CaSiCaS marketplace.",
                    "rating": round(random.uniform(3.5, 5.0), 1),
                    "rating_count": random.randint(2, 30),
                },
            )
            if created:
                user.set_password("demo1234")
                user.save()
                self.stdout.write(f"  + Created user: {u['username']}")
            else:
                self.stdout.write(f"  - User exists: {u['username']}")
            users.append(user)

        sellers = [u for u in users if u.role == "seller"]

        # 2. Create listings with product image URLs
        for i, ld in enumerate(LISTINGS_DATA):
            seller = sellers[i % len(sellers)]
            lat, lng = random_cebu_coords()

            # Use loremflickr for category-relevant product images
            keywords = ld.get("img", "product")
            img_url = f"https://loremflickr.com/640/480/{keywords}?lock={i}"

            listing, created = Listing.objects.get_or_create(
                title=ld["title"],
                seller=seller,
                defaults={
                    "description": ld["desc"],
                    "price": Decimal(str(ld["price"])),
                    "category": ld["cat"],
                    "listing_type": ld["type"],
                    "latitude": lat,
                    "longitude": lng,
                    "address": random_address(),
                    "status": "active",
                    "image_url": img_url,
                },
            )

            if created:
                self.stdout.write(f"  + [{i+1}/50] {ld['title']}")
            else:
                self.stdout.write(f"  - Listing exists: {ld['title']}")

        self.stdout.write(self.style.SUCCESS(
            f"\nDone! {CustomUser.objects.count()} users, {Listing.objects.count()} listings."
        ))
