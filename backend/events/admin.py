from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
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


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('email', 'name', 'phone', 'is_staff', 'is_active')
    search_fields = ('email', 'name', 'phone')
    ordering = ('email',)
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('name', 'phone')}),
        ('Permissions', {'fields': ('is_staff', 'is_active', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'name', 'phone', 'password1', 'password2', 'is_staff', 'is_active'),
        }),
    )


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)


@admin.register(FunctionHall)
class FunctionHallAdmin(admin.ModelAdmin):
    list_display = ('name', 'location', 'capacity', 'price')
    list_filter = ()


@admin.register(Decoration)
class DecorationAdmin(admin.ModelAdmin):
    list_display = ('name', 'decoration_type', 'amount')
    list_filter = ('decoration_type',)


@admin.register(FoodItem)
class FoodItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'food_type', 'price')
    list_filter = ('food_type',)


@admin.register(ServiceItem)
class ServiceItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'duration')
    list_filter = ()


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer_name', 'event_date', 'total_amount', 'payment_status', 'status')
    list_filter = ('payment_status', 'status')
    search_fields = ('customer_name', 'customer_email', 'customer_phone')


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'booking', 'amount', 'payment_type', 'status', 'created_at')
    list_filter = ('payment_type', 'status')
