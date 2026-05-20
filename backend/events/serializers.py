from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from .models import (
    CustomUser,
    Event,
    FunctionHall,
    Decoration,
    FoodItem,
    ServiceItem,
    Booking,
    Payment,
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'name', 'email', 'phone', 'is_staff', 'is_superuser')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ('name', 'email', 'phone', 'password')

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        user = CustomUser(
            name=validated_data['name'],
            email=validated_data['email'],
            phone=validated_data.get('phone', ''),
        )
        user.set_password(validated_data['password'])
        user.save()
        return user


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ('id', 'name', 'description', 'image')


class FunctionHallSerializer(serializers.ModelSerializer):
    class Meta:
        model = FunctionHall
        fields = ('id', 'name', 'location', 'capacity', 'price', 'description', 'image')


class DecorationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Decoration
        fields = ('id', 'name', 'decoration_type', 'amount', 'description', 'image')


class FoodItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodItem
        fields = ('id', 'name', 'description', 'price', 'food_type', 'image')


class ServiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceItem
        fields = ('id', 'name', 'description', 'price', 'duration', 'icon')


class BookingSerializer(serializers.ModelSerializer):
    decorations = DecorationSerializer(many=True, read_only=True)
    food_items = FoodItemSerializer(many=True, read_only=True)
    services = ServiceItemSerializer(many=True, read_only=True)
    function_hall = FunctionHallSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = (
            'id',
            'user',
            'customer_name',
            'customer_email',
            'customer_phone',
            'customer_address',
            'event_date',
            'guest_count',
            'notes',
            'total_amount',
            'advance_amount',
            'payment_status',
            'status',
            'function_hall',
            'decorations',
            'food_items',
            'services',
            'created_at',
        )
        read_only_fields = ('payment_status', 'status', 'created_at')


class BookingCreateSerializer(serializers.ModelSerializer):
    decorations = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Decoration.objects.all(),
        required=False,
    )
    food_items = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=FoodItem.objects.all(),
        required=False,
    )
    services = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=ServiceItem.objects.all(),
        required=False,
    )

    class Meta:
        model = Booking
        fields = (
            'id',
            'customer_name',
            'customer_email',
            'customer_phone',
            'customer_address',
            'event_date',
            'guest_count',
            'notes',
            'total_amount',
            'advance_amount',
            'function_hall',
            'decorations',
            'food_items',
            'services',
        )
        read_only_fields = ('id',)

    def create(self, validated_data):
        decorations = validated_data.pop('decorations', [])
        food_items = validated_data.pop('food_items', [])
        services = validated_data.pop('services', [])

        user = self.context['request'].user if self.context['request'].user.is_authenticated else None
        booking = Booking.objects.create(user=user, status='confirmed', payment_status='pending', **validated_data)
        booking.decorations.set(decorations)
        booking.food_items.set(food_items)
        booking.services.set(services)
        return booking


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ('id', 'booking', 'amount', 'payment_type', 'razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature', 'status', 'created_at')
        read_only_fields = ('razorpay_payment_id', 'razorpay_signature', 'status', 'created_at')


class PaymentVerifySerializer(serializers.Serializer):
    booking_id = serializers.IntegerField()
    razorpay_order_id = serializers.CharField(required=False, allow_blank=True)
    razorpay_payment_id = serializers.CharField()
    razorpay_signature = serializers.CharField()
