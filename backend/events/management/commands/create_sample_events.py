from django.core.management.base import BaseCommand
from events.models import Event, FunctionHall, Decoration, FoodItem, ServiceItem


class Command(BaseCommand):
    help = 'Create sample event data with related items'

    def handle(self, *args, **options):
        events_data = [
            {
                'name': 'Wedding',
                'description': 'Celebrate your special day with our comprehensive wedding planning services.',
                'image': 'https://images.unsplash.com/photo-1519741497674-611481863552?w=500&h=300&fit=crop'
            },
            {
                'name': 'Birthday Party',
                'description': 'Make birthdays memorable with our party planning and decoration services.',
                'image': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&h=300&fit=crop'
            },
            {
                'name': 'Corporate Event',
                'description': 'Professional event management for conferences, seminars, and corporate gatherings.',
                'image': 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop'
            },
            {
                'name': 'Engagement Party',
                'description': 'Celebrate your engagement with elegant decorations and catering services.',
                'image': 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=500&h=300&fit=crop'
            },
            {
                'name': 'Anniversary Party',
                'description': 'Celebrate milestones with romantic and memorable anniversary event planning.',
                'image': 'https://images.unsplash.com/photo-1495632066243-4e92b34b814d?w=500&h=300&fit=crop'
            },
            {
                'name': 'Graduation Party',
                'description': 'Celebrate academic achievements with our graduation event services.',
                'image': 'https://images.unsplash.com/photo-1479341141143-34ff287fac33?w=500&h=300&fit=crop'
            }
        ]

        for event_data in events_data:
            event, created = Event.objects.get_or_create(
                name=event_data['name'],
                defaults={
                    'description': event_data['description'],
                    'image': event_data['image']
                }
            )
            
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created event: {event.name}'))
            else:
                self.stdout.write(f'Event already exists: {event.name}')

        # Create shared Function Halls
        halls_data = [
            {
                'name': 'Grand Convention Hall',
                'location': 'Downtown Convention Center',
                'capacity': 500,
                'price': 50000,
                'description': 'Spacious hall perfect for large events with modern amenities',
                'image': 'https://images.unsplash.com/photo-1519167758993-5fbab60e9b4b?w=500&h=300&fit=crop'
            },
            {
                'name': 'Premium Event Hall',
                'location': 'Uptown Venue',
                'capacity': 300,
                'price': 35000,
                'description': 'Elegant premium hall ideal for intimate celebrations',
                'image': 'https://images.unsplash.com/photo-1520763185298-1b434c919eba?w=500&h=300&fit=crop'
            },
            {
                'name': 'Garden Pavilion',
                'location': 'Riverside Gardens',
                'capacity': 200,
                'price': 25000,
                'description': 'Beautiful outdoor pavilion with garden views',
                'image': 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=500&h=300&fit=crop'
            }
        ]
        
        for hall_data in halls_data:
            FunctionHall.objects.get_or_create(
                name=hall_data['name'],
                defaults={
                    'location': hall_data['location'],
                    'capacity': hall_data['capacity'],
                    'price': hall_data['price'],
                    'description': hall_data['description'],
                    'image': hall_data['image']
                }
            )
        
        # Create shared Decorations
        decorations_data = [
            {
                'name': 'Classic Elegance',
                'decoration_type': 'classic',
                'amount': 15000,
                'description': 'Traditional decorations with timeless elegance',
                'image': 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=500&h=300&fit=crop'
            },
            {
                'name': 'Modern Minimalist',
                'decoration_type': 'modern',
                'amount': 20000,
                'description': 'Contemporary designs with clean lines and modern aesthetics',
                'image': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&h=300&fit=crop'
            },
            {
                'name': 'Luxury Premium',
                'decoration_type': 'luxury',
                'amount': 30000,
                'description': 'Premium luxury decorations with exotic flowers and designer elements',
                'image': 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=500&h=300&fit=crop'
            },
            {
                'name': 'Rustic Charm',
                'decoration_type': 'classic',
                'amount': 18000,
                'description': 'Warm and inviting rustic decorations with natural elements',
                'image': 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=500&h=300&fit=crop'
            }
        ]
        
        for deco_data in decorations_data:
            Decoration.objects.get_or_create(
                name=deco_data['name'],
                defaults={
                    'decoration_type': deco_data['decoration_type'],
                    'amount': deco_data['amount'],
                    'description': deco_data['description'],
                    'image': deco_data['image']
                }
            )
        
        # Create shared Food Items
        food_data = [
            {
                'name': 'Paneer Tikka',
                'description': 'Succulent cottage cheese skewers marinated in aromatic spices',
                'price': 350,
                'food_type': 'veg',
                'image': 'https://images.unsplash.com/photo-1599599810694-f3a7fb3f4ffb?w=500&h=300&fit=crop'
            },
            {
                'name': 'Tandoori Chicken',
                'description': 'Tender chicken marinated and grilled in traditional tandoor',
                'price': 450,
                'food_type': 'non_veg',
                'image': 'https://images.unsplash.com/photo-1599599810694-f3a7fb3f4ffb?w=500&h=300&fit=crop'
            },
            {
                'name': 'Vegetable Biryani',
                'description': 'Fragrant basmati rice cooked with fresh vegetables and spices',
                'price': 300,
                'food_type': 'veg',
                'image': 'https://images.unsplash.com/photo-1599599810694-f3a7fb3f4ffb?w=500&h=300&fit=crop'
            },
            {
                'name': 'Chicken Biryani',
                'description': 'Aromatic basmati rice layered with tender chicken',
                'price': 400,
                'food_type': 'non_veg',
                'image': 'https://images.unsplash.com/photo-1599599810694-f3a7fb3f4ffb?w=500&h=300&fit=crop'
            },
            {
                'name': 'Samosa (Veg)',
                'description': 'Crispy pastry filled with spiced potato and peas',
                'price': 80,
                'food_type': 'veg',
                'image': 'https://images.unsplash.com/photo-1599599810694-f3a7fb3f4ffb?w=500&h=300&fit=crop'
            },
            {
                'name': 'Fish Curry',
                'description': 'Delicious fish cooked in aromatic coconut and spice curry',
                'price': 500,
                'food_type': 'non_veg',
                'image': 'https://images.unsplash.com/photo-1599599810694-f3a7fb3f4ffb?w=500&h=300&fit=crop'
            },
            {
                'name': 'Butter Chicken',
                'description': 'Creamy and rich butter chicken with aromatic spices',
                'price': 420,
                'food_type': 'non_veg',
                'image': 'https://images.unsplash.com/photo-1599599810694-f3a7fb3f4ffb?w=500&h=300&fit=crop'
            },
            {
                'name': 'Palak Paneer',
                'description': 'Creamy spinach curry with soft paneer cubes',
                'price': 320,
                'food_type': 'veg',
                'image': 'https://images.unsplash.com/photo-1599599810694-f3a7fb3f4ffb?w=500&h=300&fit=crop'
            }
        ]
        
        for food in food_data:
            FoodItem.objects.get_or_create(
                name=food['name'],
                defaults={
                    'description': food['description'],
                    'price': food['price'],
                    'food_type': food['food_type'],
                    'image': food['image']
                }
            )
        
        # Create shared Services
        services_data = [
            {
                'name': 'DJ & Music',
                'description': 'Professional DJ with quality sound system and lighting',
                'price': 10000,
                'duration': 4,
                'icon': '🎵'
            },
            {
                'name': 'Photography',
                'description': 'Professional photographer for event coverage with high-quality images',
                'price': 15000,
                'duration': 8,
                'icon': '📸'
            },
            {
                'name': 'Videography',
                'description': 'Complete video coverage with professional editing and cinematography',
                'price': 20000,
                'duration': 8,
                'icon': '🎥'
            },
            {
                'name': 'Catering Staff',
                'description': 'Professional catering staff for smooth food service',
                'price': 5000,
                'duration': 6,
                'icon': '👨‍🍳'
            },
            {
                'name': 'Florals Arrangement',
                'description': 'Beautiful floral arrangements for centerpieces and stage',
                'price': 12000,
                'duration': None,
                'icon': '🌹'
            },
            {
                'name': 'Makeup Artist',
                'description': 'Professional makeup artist for bridal and guest makeup',
                'price': 8000,
                'duration': 4,
                'icon': '💄'
            },
            {
                'name': 'Event Coordinator',
                'description': 'Professional event coordinator to manage all aspects of your event',
                'price': 15000,
                'duration': 12,
                'icon': '👔'
            },
            {
                'name': 'Security Services',
                'description': 'Professional security personnel for event safety',
                'price': 8000,
                'duration': 8,
                'icon': '🛡️'
            }
        ]
        
        for service in services_data:
            ServiceItem.objects.get_or_create(
                name=service['name'],
                defaults={
                    'description': service['description'],
                    'price': service['price'],
                    'duration': service['duration'],
                    'icon': service['icon']
                }
            )

        self.stdout.write(self.style.SUCCESS('\n✓ All sample data created successfully!'))
