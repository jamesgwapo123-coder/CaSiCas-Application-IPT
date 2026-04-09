"""
Seed the database with fake users and listings using local media-pic images.
Usage: python manage.py seed_data
"""
import os
import random
import shutil
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.core.files import File
from django.conf import settings
from accounts.models import CustomUser
from listings.models import Listing


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

# Each listing maps to a local image from media-pic/
LISTINGS_DATA = [
    # Electronics
    {"title": "ThinkPad X220 Laptop", "desc": "Classic business laptop. i5, 8GB RAM, SSD. Perfect for students and devs.", "price": 8500, "cat": "electronics", "type": "sell", "img": "thinkpadx220.jpg"},
    {"title": "ThinkPad Tablet 2-in-1", "desc": "Convertible tablet with stylus. Great for note-taking and light work.", "price": 12000, "cat": "electronics", "type": "sell", "img": "thinkpadtablet.jpg"},
    {"title": "Vintage PC Desktop", "desc": "Retro computing setup. Working condition. Collectors item.", "price": 5000, "cat": "electronics", "type": "sell", "img": "vintagepc.jpg"},
    {"title": "Gaming PC Ryzen Build", "desc": "Ryzen system unit. Great for gaming and productivity. Clean build.", "price": 35000, "cat": "electronics", "type": "sell", "img": "systemunitryzen.jpg"},
    {"title": "Suit Laptop Bundle", "desc": "Professional laptop setup. Ready for business meetings and presentations.", "price": 22000, "cat": "electronics", "type": "sell", "img": "suitlaptop.jpg"},
    {"title": "Nokia Classic Phone", "desc": "Indestructible Nokia. Still works perfectly. Great backup phone.", "price": 1500, "cat": "electronics", "type": "sell", "img": "thornokia.jpg"},
    {"title": "Tank Mouse Gaming", "desc": "Unique tank-shaped gaming mouse. Conversation starter. Works great.", "price": 800, "cat": "electronics", "type": "sell", "img": "tankmouse.jpg"},

    # Musical Instruments
    {"title": "Acoustic Guitar - Sunburst", "desc": "Beautiful sunburst finish. Great action. Perfect for beginners.", "price": 6500, "cat": "other", "type": "sell", "img": "guitar1.jpg"},
    {"title": "Classical Guitar - Nylon", "desc": "Nylon string classical guitar. Warm tone. Good for fingerpicking.", "price": 5000, "cat": "other", "type": "sell", "img": "guitar2.jpg"},
    {"title": "Electric Guitar - Red", "desc": "Electric guitar with amp. Rock-ready setup. Barely used.", "price": 12000, "cat": "other", "type": "sell", "img": "guitar3.jpg"},
    {"title": "Grand Piano - Black", "desc": "Full-size grand piano. Excellent condition. Tuned recently.", "price": 150000, "cat": "other", "type": "sell", "img": "piano.jpg"},
    {"title": "Upright Piano - Mahogany", "desc": "Classic upright piano. Rich sound. Perfect for home practice.", "price": 45000, "cat": "other", "type": "sell", "img": "paino2.jpg"},
    {"title": "Digital Piano - 88 Keys", "desc": "Weighted keys, multiple voices. MIDI capable. Like new.", "price": 25000, "cat": "other", "type": "sell", "img": "piano3.jpg"},
    {"title": "Studio Piano - White", "desc": "Beautiful white studio piano. Showroom condition.", "price": 85000, "cat": "other", "type": "sell", "img": "piano4.jpg"},
    {"title": "Baby Grand Piano", "desc": "Compact baby grand. Perfect for apartments. Stunning sound.", "price": 120000, "cat": "other", "type": "sell", "img": "piano5.jpg"},
    {"title": "Violin - Student Grade", "desc": "4/4 student violin with bow and case. Great for beginners.", "price": 8000, "cat": "other", "type": "sell", "img": "violin1.jpg"},
    {"title": "Violin - Intermediate", "desc": "Spruce top, maple back. Rich warm tone. With hardshell case.", "price": 15000, "cat": "other", "type": "sell", "img": "violin2.jpg"},
    {"title": "Violin - Professional", "desc": "Handcrafted violin. Exceptional projection and clarity.", "price": 35000, "cat": "other", "type": "sell", "img": "violin3.jpg"},
    {"title": "Electric Violin - Modern", "desc": "5-string electric violin. Built-in pickup. Stage-ready.", "price": 18000, "cat": "other", "type": "sell", "img": "violin4.jpg"},
    {"title": "Used Drum Kit - Complete", "desc": "5-piece drum kit with cymbals, hardware, and throne. Gigging ready.", "price": 20000, "cat": "other", "type": "sell", "img": "useddrum.jpg"},

    # Furniture
    {"title": "Vintage Wooden Chair", "desc": "Hand-carved vintage chair. Solid wood. Beautiful patina.", "price": 4500, "cat": "furniture", "type": "sell", "img": "vintagechair.jpg"},
    {"title": "Wooden Dining Chair Set", "desc": "Set of 4 wooden dining chairs. Sturdy and stylish.", "price": 6000, "cat": "furniture", "type": "sell", "img": "wodenchair.jpg"},
    {"title": "Plastic Stackable Chairs", "desc": "Set of 6 plastic chairs. Stackable. Perfect for events or outdoor.", "price": 2000, "cat": "furniture", "type": "sell", "img": "plasticchair.jpg"},
    {"title": "Human-Shaped Art Chair", "desc": "Unique art piece chair. Functional sculpture. Statement furniture.", "price": 15000, "cat": "furniture", "type": "sell", "img": "humanchair.jpg"},
    {"title": "Antique Torture Chair Replica", "desc": "Museum-quality replica. Medieval design. Display piece only.", "price": 25000, "cat": "furniture", "type": "sell", "img": "torturechair.jpg"},
    {"title": "Possessed-Looking Chair", "desc": "Creepy antique chair. Perfect for Halloween or horror-themed rooms.", "price": 8000, "cat": "furniture", "type": "sell", "img": "possesschair.jpg"},

    # Vehicles
    {"title": "Honda Motorcycle Custom", "desc": "Custom Honda. Modified exhaust and body. Head-turner on the road.", "price": 55000, "cat": "vehicles", "type": "sell", "img": "hondaDog.jpg"},
    {"title": "Sports Car - Red", "desc": "Red sports car. Well maintained. Complete documents. Ready to drive.", "price": 850000, "cat": "vehicles", "type": "sell", "img": "car3.jpg"},
    {"title": "Sedan - Silver", "desc": "Family sedan. Low mileage. Automatic transmission. Fuel efficient.", "price": 450000, "cat": "vehicles", "type": "sell", "img": "car4.jpg"},
    {"title": "SUV - Black", "desc": "4x4 SUV. Perfect for road trips. Leather interior. Sunroof.", "price": 750000, "cat": "vehicles", "type": "sell", "img": "car5.jpg"},
    {"title": "Mountain Bike - 21 Speed", "desc": "Aluminum frame mountain bike. 21-speed Shimano gears. Disc brakes.", "price": 7500, "cat": "vehicles", "type": "sell", "img": "bike.jpg"},
    {"title": "Banana Car Art Vehicle", "desc": "Custom banana-shaped vehicle. Runs on gas. Ultimate meme mobile.", "price": 200000, "cat": "vehicles", "type": "sell", "img": "bananacar.jpg"},
    {"title": "Toilet-Themed Motorcycle", "desc": "One-of-a-kind toilet motorcycle. Fully functional. Viral sensation.", "price": 75000, "cat": "vehicles", "type": "sell", "img": "toiletmotor.jpg"},
    {"title": "Mr. Bean Special Edition Car", "desc": "Iconic green car with modifications. Complete gatling accessory. Fun!", "price": 350000, "cat": "vehicles", "type": "sell", "img": "mrbeancarwithgatling.jpg"},

    # Clothing
    {"title": "Designer Drip Outfit", "desc": "Full designer outfit. Streetwear vibes. Flex-worthy drip.", "price": 12000, "cat": "clothing", "type": "sell", "img": "drip.png"},

    # Other / Unique
    {"title": "Galaxy Edition Board Game", "desc": "Rare galaxy edition board game. Complete set. Never opened.", "price": 3500, "cat": "other", "type": "sell", "img": "galaxyeditiongame.jpg"},
    {"title": "Atomic Bomb Model", "desc": "Detailed scale model replica. Educational display piece. Metal build.", "price": 5000, "cat": "other", "type": "sell", "img": "atomicbomb.jpg"},
    {"title": "Military Tank Model", "desc": "Large-scale tank model. Hand-painted details. Museum quality.", "price": 8000, "cat": "other", "type": "sell", "img": "tank.jpg"},
    {"title": "ThinkPad X230 Parts", "desc": "ThinkPad X230 for parts or repair. Screen works. Battery dead.", "price": 3000, "cat": "electronics", "type": "sell", "img": "x230.jpg"},
    {"title": "WhatsApp Bird Plushie", "desc": "Adorable bird plushie. WhatsApp meme vibes. Soft and huggable.", "price": 500, "cat": "other", "type": "sell", "img": "whatsapp birb.jpg"},
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
    help = "Seed database with fake users and listings using local media-pic images"

    def handle(self, *args, **options):
        self.stdout.write("Seeding database...")

        media_pic_dir = os.path.join(settings.BASE_DIR, 'media-pic')

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

        # 2. Create listings with local images
        for i, ld in enumerate(LISTINGS_DATA):
            seller = sellers[i % len(sellers)]
            lat, lng = random_cebu_coords()

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
                },
            )

            if created:
                # Attach local image from media-pic/
                img_filename = ld.get("img", "")
                img_path = os.path.join(media_pic_dir, img_filename)
                if img_filename and os.path.exists(img_path):
                    with open(img_path, 'rb') as f:
                        listing.image.save(img_filename, File(f), save=True)
                    self.stdout.write(f"  + [{i+1}/{len(LISTINGS_DATA)}] {ld['title']} ({img_filename})")
                else:
                    self.stdout.write(f"  + [{i+1}/{len(LISTINGS_DATA)}] {ld['title']} (no image)")
            else:
                self.stdout.write(f"  - Listing exists: {ld['title']}")

        self.stdout.write(self.style.SUCCESS(
            f"\nDone! {CustomUser.objects.count()} users, {Listing.objects.count()} listings."
        ))
