import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import api from '../api/config';
import { BOOKING_ENDPOINTS } from '../api/endpoints';
import { useState } from 'react';
import '../styles/bookings.css';

export const MyBookings = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchBookings = async () => {
      try {
        const response = await api.get(BOOKING_ENDPOINTS.LIST);
        setBookings(response.data);
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [isAuthenticated, navigate]);

  if (loading) return <div className="loading">Loading your bookings...</div>;

  return (
    <div className="my-bookings-container">
      <h1>My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="no-bookings">
          <p>You haven't made any bookings yet</p>
          <button onClick={() => navigate('/')}>Browse Events</button>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div key={booking.id} className="booking-card">
              <div className="booking-header">
                <h3>Booking #{booking.id}</h3>
                <span className={`status ${booking.status}`}>{booking.status}</span>
              </div>
              <div className="booking-details">
                <div className="detail-item">
                  <span className="label">Event Date:</span>
                  <span>{new Date(booking.event_date).toLocaleDateString()}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Guest Count:</span>
                  <span>{booking.guest_count}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Total Amount:</span>
                  <span>₹{booking.total_amount.toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Status:</span>
                  <span className="status-badge">{booking.payment_status}</span>
                </div>
              </div>
              <button
                onClick={() => navigate(`/booking-confirmation/${booking.id}`)}
                className="view-details-btn"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
