from django.db import models
from django.contrib.auth.models import AbstractUser


class CustomUser(AbstractUser):
    username = None
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20, blank=True, null=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email


class Event(models.Model):
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    image = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.name


class FunctionHall(models.Model):
    name = models.CharField(max_length=150)
    location = models.CharField(max_length=255)
    capacity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    image = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.name


class Decoration(models.Model):
    DECORATION_TYPES = [
        ('classic', 'Classic'),
        ('modern', 'Modern'),
        ('luxury', 'Luxury'),
    ]

    name = models.CharField(max_length=150)
    decoration_type = models.CharField(max_length=50, choices=DECORATION_TYPES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    image = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.name


class FoodItem(models.Model):
    FOOD_TYPES = [
        ('veg', 'Vegetarian'),
        ('non_veg', 'Non-Vegetarian'),
    ]

    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    food_type = models.CharField(max_length=10, choices=FOOD_TYPES, default='veg')
    image = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.name


class ServiceItem(models.Model):
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration = models.PositiveIntegerField(blank=True, null=True)
    icon = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return self.name


class Booking(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
    ]

    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(CustomUser, related_name='bookings', on_delete=models.SET_NULL, null=True, blank=True)
    customer_name = models.CharField(max_length=150)
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=20)
    customer_address = models.TextField()
    event_date = models.DateField()
    guest_count = models.PositiveIntegerField()
    notes = models.TextField(blank=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    advance_amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    function_hall = models.ForeignKey(FunctionHall, on_delete=models.SET_NULL, null=True, blank=True)
    decorations = models.ManyToManyField(Decoration, blank=True)
    food_items = models.ManyToManyField(FoodItem, blank=True)
    services = models.ManyToManyField(ServiceItem, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Booking {self.id} - {self.customer_name}'


class Payment(models.Model):
    PAYMENT_TYPES = [
        ('advance', 'Advance'),
        ('balance', 'Balance'),
    ]

    booking = models.ForeignKey(Booking, related_name='payments', on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPES)
    razorpay_order_id = models.CharField(max_length=255, blank=True, null=True)
    razorpay_payment_id = models.CharField(max_length=255, blank=True, null=True)
    razorpay_signature = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=20, choices=Booking.PAYMENT_STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Payment {self.id} for booking {self.booking_id}'
