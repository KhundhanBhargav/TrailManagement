import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from '../api/config';
import { BOOKING_ENDPOINTS, PAYMENT_ENDPOINTS } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import '../styles/payment.css';

export const PaymentPage = () => {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(location.state?.booking ? false : true);
  const [paymentError, setPaymentError] = useState(null);
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const hasRazorpayKey = Boolean(import.meta.env.VITE_RAZORPAY_KEY && import.meta.env.VITE_RAZORPAY_KEY !== 'your_razorpay_key_here');

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
        const message =
          err.response?.data?.detail ||
          err.response?.statusText ||
          err.message ||
          'Failed to load booking details.';
        setPaymentError(message);
        console.error('Booking fetch error:', err);
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

  const handleScreenshotChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setScreenshotFile(null);
      setScreenshotPreview(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setPaymentError('Please upload a valid image file.');
      return;
    }

    setPaymentError(null);
    setScreenshotFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setScreenshotPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handlePayDone = () => {
    if (!booking) return;
    if (!screenshotFile) {
      setPaymentError('Please upload your payment screenshot before continuing.');
      return;
    }
    navigate(`/booking-confirmation/${booking.id}`);
  };

  const openRazorpay = async () => {
    if (!booking) return;

    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY;
    if (!razorpayKey || razorpayKey === 'your_razorpay_key_here') {
      setPaymentError(null);
      return;
    }

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
      script.onerror = () => {
        setPaymentError('Failed to load Razorpay checkout. Check your network or Razorpay key.');
      };
      document.body.appendChild(script);
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        err.response?.statusText ||
        err.message ||
        'Payment initialization failed.';
      setPaymentError(message);
      console.error('Payment initialization error:', err);
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
          <button onClick={openRazorpay} className="submit-btn" disabled={!hasRazorpayKey}>
            Pay Advance Now
          </button>
          {!hasRazorpayKey && (
            <p className="payment-note">
              Razorpay is not configured. Upload your payment screenshot and click Pay Done instead.
            </p>
          )}

          <div className="payment-proof-section">
            <h3>Upload payment screenshot</h3>
            <p className="payment-note">
              If the Razorpay checkout does not work, upload your payment screenshot here and click Pay Done.
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleScreenshotChange}
            />
            {screenshotPreview ? (
              <div className="screenshot-preview-wrapper">
                <img
                  src={screenshotPreview}
                  alt="Payment screenshot preview"
                  className="screenshot-preview"
                />
              </div>
            ) : (
              <div className="screenshot-placeholder">
                <span role="img" aria-label="Screenshot icon">
                  📷
                </span>
                Upload a screenshot of your payment confirmation or scanner image here.
              </div>
            )}
            <button type="button" onClick={handlePayDone} className="submit-btn">
              Pay Done
            </button>
          </div>
        </div>
      ) : (
        <div className="error-message">Booking details could not be loaded.</div>
      )}
    </div>
  );
};
