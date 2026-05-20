import uuid
from django.conf import settings
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.db.models import Sum
from rest_framework import generics, permissions, status
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

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
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    EventSerializer,
    FunctionHallSerializer,
    DecorationSerializer,
    FoodItemSerializer,
    ServiceItemSerializer,
    BookingSerializer,
    BookingCreateSerializer,
    PaymentSerializer,
    PaymentVerifySerializer,
)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        identifier = attrs.get('email') or attrs.get('username')
        password = attrs.get('password')

        if not identifier or not password:
            raise AuthenticationFailed('Must include email/name and password.')

        user = None
        # First try with email
        if '@' in identifier:
            user = authenticate(self.context['request'], username=identifier, password=password)
        else:
            user = authenticate(self.context['request'], username=identifier, password=password)
            if user is None:
                user_obj = CustomUser.objects.filter(name__iexact=identifier).first()
                if user_obj:
                    user = authenticate(self.context['request'], username=user_obj.email, password=password)

        if user is None:
            raise AuthenticationFailed('No active account found with the given credentials')
        if not user.is_active:
            raise AuthenticationFailed('User account is disabled.')

        self.user = user
        data = super().validate({'email': user.email, 'password': password})
        data['user'] = UserSerializer(user).data
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer


class UserDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        return Response(status=status.HTTP_204_NO_CONTENT)


class EventListView(generics.ListAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [permissions.AllowAny]


class EventDetailView(generics.RetrieveAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [permissions.AllowAny]


class FunctionHallListView(generics.ListAPIView):
    queryset = FunctionHall.objects.all()
    serializer_class = FunctionHallSerializer
    permission_classes = [permissions.AllowAny]


class FunctionHallDetailView(generics.RetrieveAPIView):
    queryset = FunctionHall.objects.all()
    serializer_class = FunctionHallSerializer
    permission_classes = [permissions.AllowAny]


class DecorationListView(generics.ListAPIView):
    queryset = Decoration.objects.all()
    serializer_class = DecorationSerializer
    permission_classes = [permissions.AllowAny]


class FoodItemListView(generics.ListAPIView):
    queryset = FoodItem.objects.all()
    serializer_class = FoodItemSerializer
    permission_classes = [permissions.AllowAny]


class ServiceItemListView(generics.ListAPIView):
    queryset = ServiceItem.objects.all()
    serializer_class = ServiceItemSerializer
    permission_classes = [permissions.AllowAny]


class BookingListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Booking.objects.all().order_by('-created_at')
        return Booking.objects.filter(user=self.request.user).order_by('-created_at')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return BookingCreateSerializer
        return BookingSerializer

    def perform_create(self, serializer):
        booking = serializer.save()
        self.send_booking_confirmation_email(booking)

    def send_booking_confirmation_email(self, booking):
        if not booking.customer_email:
            return

        subject = f'Your Event Booking #{booking.id} is Confirmed'
        decorations = ', '.join([item.name for item in booking.decorations.all()]) or 'None'
        food_items = ', '.join([item.name for item in booking.food_items.all()]) or 'None'
        services = ', '.join([item.name for item in booking.services.all()]) or 'None'
        hall_name = booking.function_hall.name if booking.function_hall else 'None'

        message = (
            f'Hello {booking.customer_name},\n\n'
            f'Your booking has been confirmed. Here are the details:\n\n'
            f'Booking ID: {booking.id}\n'
            f'Event Date: {booking.event_date}\n'
            f'Guest Count: {booking.guest_count}\n'
            f'Function Hall: {hall_name}\n'
            f'Decorations: {decorations}\n'
            f'Food Items: {food_items}\n'
            f'Services: {services}\n'
            f'Total Amount: ₹{booking.total_amount}\n'
            f'Advance Amount: ₹{booking.advance_amount}\n'
            f'Payment Status: {booking.payment_status}\n'
            f'Status: {booking.status}\n\n'
            'Thank you for booking with EventHub.\n'
            'We will contact you shortly with the next steps.\n\n'
            'Best regards,\n'
            'EventHub Team'
        )

        send_mail(
            subject,
            message,
            getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@eventhub.local'),
            [booking.customer_email],
            fail_silently=False,
        )


class BookingDetailView(generics.RetrieveAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Booking.objects.all()
        return Booking.objects.filter(user=self.request.user)


class PaymentCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        booking_id = request.data.get('booking_id')
        amount = request.data.get('amount')
        payment_type = request.data.get('payment_type', 'advance')

        try:
            booking = Booking.objects.get(id=booking_id)
        except Booking.DoesNotExist:
            return Response({'detail': 'Booking not found.'}, status=status.HTTP_404_NOT_FOUND)

        payment = Payment.objects.create(
            booking=booking,
            amount=amount,
            payment_type=payment_type,
            status='pending',
        )

        serializer = PaymentSerializer(payment)
        return Response({
            'razorpay_order_id': payment.razorpay_order_id,
            'payment': serializer.data,
        })


class PaymentVerifyView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PaymentVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        booking_id = serializer.validated_data['booking_id']
        razorpay_order_id = serializer.validated_data.get('razorpay_order_id')
        razorpay_payment_id = serializer.validated_data['razorpay_payment_id']
        razorpay_signature = serializer.validated_data['razorpay_signature']

        payment = None
        if razorpay_order_id:
            payment = Payment.objects.filter(booking_id=booking_id, razorpay_order_id=razorpay_order_id).first()

        if not payment:
            payment = Payment.objects.filter(booking_id=booking_id, status='pending').order_by('-created_at').first()

        if not payment:
            return Response({'detail': 'Payment record not found.'}, status=status.HTTP_404_NOT_FOUND)

        payment.razorpay_order_id = razorpay_order_id or payment.razorpay_order_id
        payment.razorpay_payment_id = razorpay_payment_id
        payment.razorpay_signature = razorpay_signature
        payment.status = 'paid'
        payment.save()

        booking = payment.booking
        booking.payment_status = 'paid'
        booking.status = 'confirmed'
        booking.save()

        return Response({'detail': 'Payment verified successfully.'})


class AdminDashboardView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        total_bookings = Booking.objects.count()
        total_revenue = Booking.objects.filter(payment_status='paid').aggregate(total=Sum('total_amount'))['total'] or 0
        pending_amount = Booking.objects.filter(payment_status='pending').aggregate(total=Sum('advance_amount'))['total'] or 0
        completed_bookings = Booking.objects.filter(status='completed').count()

        return Response({
            'total_bookings': total_bookings,
            'total_revenue': total_revenue,
            'pending_amount': pending_amount,
            'completed_bookings': completed_bookings,
        })


class AdminBookingListView(generics.ListAPIView):
    queryset = Booking.objects.all().order_by('-created_at')
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAdminUser]


class AdminEventListView(generics.ListCreateAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAdminUser]


class AdminEventDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAdminUser]


class AdminVenueListView(generics.ListCreateAPIView):
    queryset = FunctionHall.objects.all()
    serializer_class = FunctionHallSerializer
    permission_classes = [permissions.IsAdminUser]


class AdminVenueDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = FunctionHall.objects.all()
    serializer_class = FunctionHallSerializer
    permission_classes = [permissions.IsAdminUser]


class AdminDecorationListView(generics.ListCreateAPIView):
    queryset = Decoration.objects.all()
    serializer_class = DecorationSerializer
    permission_classes = [permissions.IsAdminUser]


class AdminDecorationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Decoration.objects.all()
    serializer_class = DecorationSerializer
    permission_classes = [permissions.IsAdminUser]


class AdminFoodListView(generics.ListCreateAPIView):
    queryset = FoodItem.objects.all()
    serializer_class = FoodItemSerializer
    permission_classes = [permissions.IsAdminUser]


class AdminFoodDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = FoodItem.objects.all()
    serializer_class = FoodItemSerializer
    permission_classes = [permissions.IsAdminUser]


class AdminServiceListView(generics.ListCreateAPIView):
    queryset = ServiceItem.objects.all()
    serializer_class = ServiceItemSerializer
    permission_classes = [permissions.IsAdminUser]


class AdminServiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ServiceItem.objects.all()
    serializer_class = ServiceItemSerializer
    permission_classes = [permissions.IsAdminUser]
