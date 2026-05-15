import uuid
from django.db.models import Sum
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
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
        serializer.save()


class BookingDetailView(generics.RetrieveUpdateAPIView):
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
            razorpay_order_id=str(uuid.uuid4()),
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
        razorpay_order_id = serializer.validated_data['razorpay_order_id']
        razorpay_payment_id = serializer.validated_data['razorpay_payment_id']
        razorpay_signature = serializer.validated_data['razorpay_signature']

        try:
            payment = Payment.objects.get(booking_id=booking_id, razorpay_order_id=razorpay_order_id)
        except Payment.DoesNotExist:
            return Response({'detail': 'Payment record not found.'}, status=status.HTTP_404_NOT_FOUND)

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


class AdminVenueListView(generics.ListAPIView):
    queryset = FunctionHall.objects.all()
    serializer_class = FunctionHallSerializer
    permission_classes = [permissions.IsAdminUser]


class AdminDecorationListView(generics.ListAPIView):
    queryset = Decoration.objects.all()
    serializer_class = DecorationSerializer
    permission_classes = [permissions.IsAdminUser]


class AdminFoodListView(generics.ListAPIView):
    queryset = FoodItem.objects.all()
    serializer_class = FoodItemSerializer
    permission_classes = [permissions.IsAdminUser]


class AdminServiceListView(generics.ListAPIView):
    queryset = ServiceItem.objects.all()
    serializer_class = ServiceItemSerializer
    permission_classes = [permissions.IsAdminUser]
