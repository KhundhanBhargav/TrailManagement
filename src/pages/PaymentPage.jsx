import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../api/config';
import { BOOKING_ENDPOINTS, PAYMENT_ENDPOINTS } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';

export const PaymentPage = () => {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(location.state?.booking ? false : true);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentStarted, setPaymentStarted] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (booking) {
      return;
    }

    const fetchBooking = async () => {
      try {
        const response = await api.get(BOOKING_ENDPOINTS.DETAIL(bookingId));
        setBooking(response.data);
      } catch (err) {
        setPaymentError('Failed to load booking details.');
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchBooking();
    } else {
      setPaymentError('Invalid booking ID.');
      setLoading(false);
    }
  }, [booking, bookingId]);

  useEffect(() => {
    if (booking && !paymentStarted && !paymentError) {
      setPaymentStarted(true);
      openRazorpay();
    }
  }, [booking, paymentStarted, paymentError]);

  const openRazorpay = async () => {
    if (!booking) return;

    setPaymentError(null);

    try {
      const response = await api.post(PAYMENT_ENDPOINTS.CREATE, {
        booking_id: booking.id,
        amount: Number(booking.advance_amount) || Math.ceil(Number(booking.total_amount) * 0.5),
        payment_type: 'advance',
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: (Number(booking.advance_amount) || Math.ceil(Number(booking.total_amount) * 0.5)) * 100,
        currency: 'INR',
        name: 'EventHub',
        description: `Advance payment for booking #${booking.id}`,
        order_id: response.data.razorpay_order_id,
        handler: async (paymentResult) => {
          try {
            await api.post(PAYMENT_ENDPOINTS.VERIFY, {
              razorpay_order_id: paymentResult.razorpay_order_id,
              razorpay_payment_id: paymentResult.razorpay_payment_id,
              razorpay_signature: paymentResult.razorpay_signature,
              booking_id: booking.id,
            });
            navigate(`/booking-confirmation/${booking.id}`);
          } catch (err) {
            setPaymentError('Payment verification failed.');
          }
        },
        prefill: {
          name: booking.customer_name,
          email: booking.customer_email,
          contact: booking.customer_phone,
        },
      };

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        const rzp = new window.Razorpay(options);
        rzp.open();
      };
      document.body.appendChild(script);
    } catch (err) {
      setPaymentError('Payment initialization failed.');
    }
  };

  if (loading) {
    return <div className="payment-page">Loading payment details...</div>;
  }

  return (
    <div className="payment-page">
      <h2>Complete Payment</h2>
      {paymentError && <div className="error-message">{paymentError}</div>}
      {booking ? (
        <div className="payment-summary">
          <p>Booking ID: #{booking.id}</p>
          <p>Event Date: {new Date(booking.event_date).toLocaleDateString()}</p>
          <p>Guest Count: {booking.guest_count}</p>
          <p>Total Amount: ₹{Number(booking.total_amount).toLocaleString()}</p>
          <p>Advance Due: ₹{(Number(booking.advance_amount) || Math.ceil(Number(booking.total_amount) * 0.5)).toLocaleString()}</p>
          <button onClick={openRazorpay} className="submit-btn">
            Pay Advance Now
          </button>
        </div>
      ) : (
        <div className="error-message">Booking details could not be loaded.</div>
      )}
    </div>
  );
};
