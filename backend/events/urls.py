from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    RegisterView,
    UserDetailView,
    LogoutView,
    EventListView,
    EventDetailView,
    FunctionHallListView,
    FunctionHallDetailView,
    DecorationListView,
    FoodItemListView,
    ServiceItemListView,
    BookingListCreateView,
    BookingDetailView,
    PaymentCreateView,
    PaymentVerifyView,
    AdminDashboardView,
    AdminBookingListView,
    AdminVenueListView,
    AdminDecorationListView,
    AdminFoodListView,
    AdminServiceListView,
)

urlpatterns = [
    # Authentication
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/user/', UserDetailView.as_view(), name='user-detail'),

    # Event data
    path('events/', EventListView.as_view(), name='event-list'),
    path('events/<int:pk>/', EventDetailView.as_view(), name='event-detail'),

    # Function halls
    path('function-halls/', FunctionHallListView.as_view(), name='hall-list'),
    path('function-halls/<int:pk>/', FunctionHallDetailView.as_view(), name='hall-detail'),

    # Decorations
    path('decorations/', DecorationListView.as_view(), name='decoration-list'),

    # Food items
    path('food-items/', FoodItemListView.as_view(), name='food-item-list'),

    # Services
    path('services/', ServiceItemListView.as_view(), name='service-item-list'),

    # Bookings
    path('bookings/', BookingListCreateView.as_view(), name='booking-list-create'),
    path('bookings/<int:pk>/', BookingDetailView.as_view(), name='booking-detail'),

    # Payments
    path('payments', PaymentCreateView.as_view()),
    path('payments/', PaymentCreateView.as_view(), name='payment-create'),
    path('payments/verify', PaymentVerifyView.as_view()),
    path('payments/verify/', PaymentVerifyView.as_view(), name='payment-verify'),

    # Admin
    path('admin/dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('admin/bookings/', AdminBookingListView.as_view(), name='admin-bookings'),
    path('admin/venues/', AdminVenueListView.as_view(), name='admin-venues'),
    path('admin/decorations/', AdminDecorationListView.as_view(), name='admin-decorations'),
    path('admin/food/', AdminFoodListView.as_view(), name='admin-food'),
    path('admin/services/', AdminServiceListView.as_view(), name='admin-services'),
]
