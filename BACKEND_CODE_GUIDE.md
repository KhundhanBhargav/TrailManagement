# Django Backend Setup - Complete Code Guide

This guide provides all the code needed to set up the Django backend for the Event Booking Management System.

## Project Structure to Create

```
TrailEventBackend/
├── config/                   # Project configuration
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
├── users/                    # User authentication app
│   ├── models.py
│   ├── views.py
│   ├── urls.py
│   ├── serializers.py
│   └── permissions.py
├── events/                   # Event management app
│   ├── models.py
│   ├── views.py
│   ├── urls.py
│   └── serializers.py
├── bookings/                 # Booking management app
│   ├── models.py
│   ├── views.py
│   ├── urls.py
│   └── serializers.py
├── payments/                 # Payment processing app
│   ├── models.py
│   ├── views.py
│   ├── urls.py
│   ├── serializers.py
│   └── utils.py
├── manage.py
└── requirements.txt
```

## Step 1: Project Setup

### Create Project Structure
```bash
# Create project directory
mkdir TrailEventBackend
cd TrailEventBackend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install django==4.2
pip install djangorestframework==3.14.0
pip install django-cors-headers==4.0.0
pip install python-decouple==3.8
pip install pillow==10.0.0
pip install razorpay==1.3.0
pip install psycopg2-binary==2.9.6
pip install djangorestframework-simplejwt==5.2.2

# Create Django project
django-admin startproject config .

# Create apps
python manage.py startapp users
python manage.py startapp events
python manage.py startapp bookings
python manage.py startapp payments
```

### Generate requirements.txt
```bash
pip freeze > requirements.txt
```

## Step 2: Configuration Files

### config/settings.py - Add These Sections

```python
# Add to INSTALLED_APPS
INSTALLED_APPS = [
    # Django defaults
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party
    'rest_framework',
    'corsheaders',
    'rest_framework_simplejwt',
    
    # Local apps
    'users',
    'events',
    'bookings',
    'payments',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # Add this
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Database Configuration
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'event_booking',
        'USER': 'postgres',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

# CORS Settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

# JWT Configuration
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': False,
}

# Media Files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Environment Variables
from decouple import config

SECRET_KEY = config('SECRET_KEY', default='your-secret-key')
DEBUG = config('DEBUG', default=True, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1').split(',')

# Razorpay Configuration
RAZORPAY_KEY_ID = config('RAZORPAY_KEY_ID', default='')
RAZORPAY_KEY_SECRET = config('RAZORPAY_KEY_SECRET', default='')
```

### config/urls.py

```python
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/', include('events.urls')),
    path('api/', include('bookings.urls')),
    path('api/', include('payments.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

## Step 3: User App

### users/models.py

```python
from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    phone = models.CharField(max_length=10, blank=True)
    email = models.EmailField(unique=True)
    
    class Meta:
        db_table = 'users'
    
    def __str__(self):
        return self.email
```

### users/serializers.py

```python
from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'name', 'email', 'phone', 'is_staff')

class RegisterSerializer(serializers.ModelSerializer):
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ('name', 'email', 'phone', 'password', 'password_confirm')
        extra_kwargs = {'password': {'write_only': True}}
    
    def validate(self, data):
        if data['password'] != data.pop('password_confirm'):
            raise serializers.ValidationError("Passwords don't match")
        if len(data['password']) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters")
        return data
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            first_name=validated_data.get('name', ''),
            phone=validated_data.get('phone', ''),
            password=validated_data['password']
        )
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        
        try:
            user = User.objects.get(email=email)
            if not user.check_password(password):
                raise serializers.ValidationError("Invalid credentials")
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid credentials")
        
        return data
```

### users/views.py

```python
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model, authenticate

from .serializers import RegisterSerializer, LoginSerializer, UserSerializer

User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            'user': UserSerializer(user).data,
            'message': 'User registered successfully'
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')
    
    user = authenticate(username=email, password=password)
    if user is None:
        try:
            user = User.objects.get(email=email)
            if user.check_password(password):
                pass
            else:
                return Response(
                    {'message': 'Invalid credentials'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
        except User.DoesNotExist:
            return Response(
                {'message': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )
    
    refresh = RefreshToken.for_user(user)
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': UserSerializer(user).data
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    return Response({'message': 'Logged out successfully'})
```

### users/urls.py

```python
from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('user/', views.get_user, name='get_user'),
    path('logout/', views.logout, name='logout'),
]
```

## Step 4: Events App

### events/models.py

```python
from django.db import models

class Event(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    image = models.ImageField(upload_to='events/', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'events'
    
    def __str__(self):
        return self.name

class FunctionHall(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='halls')
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=200)
    capacity = models.IntegerField()
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='halls/', null=True, blank=True)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'function_halls'
    
    def __str__(self):
        return f"{self.name} - {self.event.name}"

class Decoration(models.Model):
    TYPES = [
        ('minimal', 'Minimal'),
        ('medium', 'Medium'),
        ('premium', 'Premium'),
    ]
    
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='decorations')
    name = models.CharField(max_length=100)
    description = models.TextField()
    decoration_type = models.CharField(max_length=20, choices=TYPES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='decorations/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'decorations'
    
    def __str__(self):
        return f"{self.name} - {self.decoration_type}"

class FoodItem(models.Model):
    FOOD_TYPES = [
        ('veg', 'Vegetarian'),
        ('non_veg', 'Non-Vegetarian'),
    ]
    
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='food_items')
    name = models.CharField(max_length=100)
    description = models.TextField()
    food_type = models.CharField(max_length=20, choices=FOOD_TYPES)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='food/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'food_items'
    
    def __str__(self):
        return f"{self.name} ({self.get_food_type_display()})"

class Service(models.Model):
    SERVICE_TYPES = [
        ('music', 'Live Music'),
        ('dance', 'Dance Performance'),
        ('photography', 'Photography'),
        ('videography', 'Videography'),
        ('catering', 'Catering'),
        ('transport', 'Transportation'),
    ]
    
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='services')
    name = models.CharField(max_length=100)
    description = models.TextField()
    service_type = models.CharField(max_length=20, choices=SERVICE_TYPES)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration = models.IntegerField(help_text="Duration in hours", null=True, blank=True)
    icon = models.CharField(max_length=10, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'services'
    
    def __str__(self):
        return f"{self.name} - {self.get_service_type_display()}"
```

### events/serializers.py

```python
from rest_framework import serializers
from .models import Event, FunctionHall, Decoration, FoodItem, Service

class FunctionHallSerializer(serializers.ModelSerializer):
    class Meta:
        model = FunctionHall
        fields = '__all__'

class DecorationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Decoration
        fields = '__all__'

class FoodItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodItem
        fields = '__all__'

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'

class EventSerializer(serializers.ModelSerializer):
    halls = FunctionHallSerializer(many=True, read_only=True)
    decorations = DecorationSerializer(many=True, read_only=True)
    food_items = FoodItemSerializer(many=True, read_only=True)
    services = ServiceSerializer(many=True, read_only=True)
    
    class Meta:
        model = Event
        fields = '__all__'

class EventListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ('id', 'name', 'description', 'image', 'is_active')
```

### events/views.py

```python
from rest_framework import viewsets, filters
from rest_framework.response import Response
from .models import Event, FunctionHall, Decoration, FoodItem, Service
from .serializers import (
    EventSerializer, EventListSerializer,
    FunctionHallSerializer, DecorationSerializer,
    FoodItemSerializer, ServiceSerializer
)

class EventViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Event.objects.filter(is_active=True)
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return EventListSerializer
        return EventSerializer

class FunctionHallViewSet(viewsets.ModelViewSet):
    serializer_class = FunctionHallSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'location']
    
    def get_queryset(self):
        event_id = self.request.query_params.get('event')
        if event_id:
            return FunctionHall.objects.filter(event_id=event_id, is_available=True)
        return FunctionHall.objects.all()

class DecorationViewSet(viewsets.ModelViewSet):
    serializer_class = DecorationSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'decoration_type']
    
    def get_queryset(self):
        event_id = self.request.query_params.get('event')
        if event_id:
            return Decoration.objects.filter(event_id=event_id)
        return Decoration.objects.all()

class FoodItemViewSet(viewsets.ModelViewSet):
    serializer_class = FoodItemSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'food_type']
    
    def get_queryset(self):
        event_id = self.request.query_params.get('event')
        if event_id:
            return FoodItem.objects.filter(event_id=event_id)
        return FoodItem.objects.all()

class ServiceViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'service_type']
    
    def get_queryset(self):
        event_id = self.request.query_params.get('event')
        if event_id:
            return Service.objects.filter(event_id=event_id)
        return Service.objects.all()
```

### events/urls.py

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'events', views.EventViewSet, basename='event')
router.register(r'function-halls', views.FunctionHallViewSet, basename='hall')
router.register(r'decorations', views.DecorationViewSet, basename='decoration')
router.register(r'food-items', views.FoodItemViewSet, basename='food')
router.register(r'services', views.ServiceViewSet, basename='service')

urlpatterns = [
    path('', include(router.urls)),
]
```

## Step 5: Bookings App

### bookings/models.py

```python
from django.db import models
from django.contrib.auth import get_user_model
from events.models import Event

User = get_user_model()

class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    PAYMENT_STATUS = [
        ('unpaid', 'Unpaid'),
        ('partial', 'Partial'),
        ('paid', 'Paid'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    event_date = models.DateField()
    guest_count = models.IntegerField()
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    advance_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='unpaid')
    
    customer_name = models.CharField(max_length=100)
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=15)
    customer_address = models.TextField()
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'bookings'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Booking #{self.id} - {self.customer_name}"

class BookingItem(models.Model):
    ITEM_TYPES = [
        ('hall', 'Function Hall'),
        ('decoration', 'Decoration'),
        ('food', 'Food Item'),
        ('service', 'Service'),
    ]
    
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='items')
    item_type = models.CharField(max_length=20, choices=ITEM_TYPES)
    item_id = models.IntegerField()
    item_name = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'booking_items'
    
    def __str__(self):
        return f"{self.booking.id} - {self.item_name}"
```

### bookings/serializers.py

```python
from rest_framework import serializers
from .models import Booking, BookingItem

class BookingItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookingItem
        fields = '__all__'

class BookingSerializer(serializers.ModelSerializer):
    items = BookingItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
```

### bookings/views.py

```python
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Booking, BookingItem
from .serializers import BookingSerializer

class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Booking.objects.all()
        return Booking.objects.filter(user=self.request.user)
    
    def create(self, request, *args, **kwargs):
        data = request.data
        
        # Create booking
        booking = Booking.objects.create(
            user=request.user,
            event_id=data.get('event_id'),
            event_date=data.get('event_date'),
            guest_count=data.get('guest_count'),
            total_amount=data.get('total_amount'),
            advance_amount=data.get('advance_amount'),
            customer_name=data.get('customer_name'),
            customer_email=data.get('customer_email'),
            customer_phone=data.get('customer_phone'),
            customer_address=data.get('customer_address'),
            notes=data.get('notes', ''),
        )
        
        # Create booking items
        for hall_id in data.get('function_hall', []):
            BookingItem.objects.create(
                booking=booking,
                item_type='hall',
                item_id=hall_id,
                item_name='Function Hall',
                amount=0  # Get from hall
            )
        
        serializer = self.get_serializer(booking)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
```

### bookings/urls.py

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'bookings', views.BookingViewSet, basename='booking')

urlpatterns = [
    path('', include(router.urls)),
]
```

## Step 6: Payments App

### payments/models.py

```python
from django.db import models
from bookings.models import Booking

class Payment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('success', 'Success'),
        ('failed', 'Failed'),
    ]
    
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    razorpay_order_id = models.CharField(max_length=100, null=True, blank=True)
    razorpay_payment_id = models.CharField(max_length=100, null=True, blank=True)
    razorpay_signature = models.CharField(max_length=255, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_type = models.CharField(max_length=20, default='advance')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'payments'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Payment - {self.booking.id} - {self.status}"
```

### payments/serializers.py

```python
from rest_framework import serializers
from .models import Payment

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'
```

### payments/views.py

```python
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.conf import settings
import razorpay
from .models import Payment
from .serializers import PaymentSerializer
from bookings.models import Booking

client = razorpay.Client(
    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
)

class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Payment.objects.all()

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment(request):
    data = request.data
    booking_id = data.get('booking_id')
    amount = data.get('amount')
    
    try:
        booking = Booking.objects.get(id=booking_id, user=request.user)
        
        # Create Razorpay order
        order = client.order.create({
            'amount': int(amount * 100),
            'currency': 'INR',
            'payment_capture': '1'
        })
        
        # Save payment
        payment = Payment.objects.create(
            booking=booking,
            amount=amount,
            razorpay_order_id=order['id'],
            payment_type=data.get('payment_type', 'advance')
        )
        
        return Response({
            'razorpay_order_id': order['id'],
            'amount': amount,
            'currency': 'INR',
        })
    except Booking.DoesNotExist:
        return Response(
            {'error': 'Booking not found'},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_payment(request):
    data = request.data
    razorpay_order_id = data.get('razorpay_order_id')
    razorpay_payment_id = data.get('razorpay_payment_id')
    razorpay_signature = data.get('razorpay_signature')
    
    try:
        payment = Payment.objects.get(razorpay_order_id=razorpay_order_id)
        
        # Verify signature
        client.utility.verify_payment_signature({
            'razorpay_order_id': razorpay_order_id,
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_signature': razorpay_signature
        })
        
        # Update payment
        payment.razorpay_payment_id = razorpay_payment_id
        payment.razorpay_signature = razorpay_signature
        payment.status = 'success'
        payment.save()
        
        # Update booking
        booking = payment.booking
        booking.payment_status = 'partial' if payment.payment_type == 'advance' else 'paid'
        booking.status = 'confirmed'
        booking.save()
        
        return Response({'success': True, 'message': 'Payment verified'})
    
    except Exception as e:
        return Response(
            {'success': False, 'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
```

### payments/urls.py

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'payments', views.PaymentViewSet, basename='payment')

urlpatterns = [
    path('', include(router.urls)),
    path('payments/', views.create_payment, name='create_payment'),
    path('payments/verify/', views.verify_payment, name='verify_payment'),
]
```

## Step 7: Run Django

```bash
# Make migrations
python manage.py makemigrations

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run server
python manage.py runserver
```

This will start the backend on `http://localhost:8000`

---

For complete integration guide, see INTEGRATION_GUIDE.md (coming next)
