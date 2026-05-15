import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../api/config';
import { BOOKING_ENDPOINTS } from '../api/endpoints';
import '../styles/confirmation.css';

export const BookingConfirmation = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await api.get(BOOKING_ENDPOINTS.DETAIL(bookingId));
        setBooking(response.data);
      } catch (err) {
        console.error('Failed to fetch booking:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  if (loading) return <div className="loading">Loading confirmation...</div>;
  if (!booking) return <div className="error">Booking not found</div>;

  return (
    <div className="confirmation-container">
      <div className="confirmation-card">
        <div className="success-icon">✓</div>
        <h1>Booking Confirmed!</h1>
        <p className="confirmation-text">
          Your event booking has been successfully confirmed
        </p>

        <div className="confirmation-details">
          <div className="detail-row">
            <span>Booking ID:</span>
            <span className="booking-id">{booking.id}</span>
          </div>
          <div className="detail-row">
            <span>Event Date:</span>
            <span>{new Date(booking.event_date).toLocaleDateString()}</span>
          </div>
          <div className="detail-row">
            <span>Guest Count:</span>
            <span>{booking.guest_count}</span>
          </div>
          <div className="detail-row">
            <span>Total Amount:</span>
            <span>₹{booking.total_amount.toLocaleString()}</span>
          </div>
          <div className="detail-row">
            <span>Advance Paid:</span>
            <span className="advance-paid">₹{booking.advance_amount.toLocaleString()}</span>
          </div>
          <div className="detail-row">
            <span>Remaining Amount:</span>
            <span>₹{(booking.total_amount - booking.advance_amount).toLocaleString()}</span>
          </div>
        </div>

        <div className="next-steps">
          <h3>What's Next?</h3>
          <ul>
            <li>Our team will contact you shortly to finalize the details</li>
            <li>Confirmation email has been sent to <strong>{booking.customer_email}</strong></li>
            <li>You need to pay the remaining amount before the event date</li>
            <li>Check your booking status anytime in My Bookings</li>
          </ul>
        </div>

        <div className="confirmation-actions">
          <button onClick={() => navigate('/bookings')} className="action-btn primary">
            View My Bookings
          </button>
          <button onClick={() => navigate('/')} className="action-btn secondary">
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};
