






import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/config';
import { BOOKING_ENDPOINTS, PAYMENT_ENDPOINTS } from '../api/endpoints';
import '../styles/checkout.css';

export const Checkout = () => {
  const navigate = useNavigate();
  const { package: pkg, clearPackage } = useBooking();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [bookingData, setBookingData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    notes: '',
  });

  // Calculate correct total with food multiplied by guest count
  const calculateFoodTotal = () => {
    return pkg.food.reduce((total, f) => total + (f.price * (pkg.guestCount || 1)), 0);
  };

  const calculateNonFoodTotal = () => {
    let total = 0;
    if (pkg.functionHall) total += Number(pkg.functionHall.price) || 0;
    total += pkg.decorations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
    total += pkg.services.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
    return total;
  };

  const grandTotal = calculateFoodTotal() + calculateNonFoodTotal();
  const advanceAmount = Math.ceil(grandTotal * 0.5);
  const remainingAmount = grandTotal - advanceAmount;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!bookingData.name.trim()) newErrors.name = 'Name is required';
    if (!bookingData.email.trim()) newErrors.email = 'Email is required';
    if (!bookingData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!bookingData.address.trim()) newErrors.address = 'Address is required';
    return newErrors;
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  const handleBooking = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      // Create booking
      const bookingPayload = {
        customer_name: bookingData.name,
        customer_email: bookingData.email,
        customer_phone: bookingData.phone,
        customer_address: bookingData.address,
        event_date: pkg.eventDate,
        guest_count: pkg.guestCount,
        notes: bookingData.notes,
        total_amount: grandTotal,
        advance_amount: advanceAmount,
        // Include selected items
        function_hall: pkg.functionHall?.id,
        decorations: pkg.decorations.map((d) => d.id),
        food_items: pkg.food.map((f) => f.id),
        services: pkg.services.map((s) => s.id),
      };

      const bookingResponse = await api.post(
        BOOKING_ENDPOINTS.CREATE,
        bookingPayload
      );

      const bookingId = bookingResponse.data.id;

      // Navigate to payment page to complete advance payment
      navigate(`/payments/${bookingId}`, {
        state: {
          booking: {
            id: bookingId,
            customer_name: bookingData.name,
            customer_email: bookingData.email,
            customer_phone: bookingData.phone,
            event_date: pkg.eventDate,
            guest_count: pkg.guestCount,
            total_amount: grandTotal,
            advance_amount: advanceAmount,
          },
        },
      });
    } catch (error) {
      const backendError = error.response?.data;
      const errorMsg = backendError?.detail ||
        (typeof backendError === 'string' ? backendError :
         backendError ? JSON.stringify(backendError) : null) ||
        'Booking failed. Please try again.';

      setErrors({
        submit: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-container">
      <div className="checkout-form-section">
        <h2>Complete Your Booking</h2>
        <form onSubmit={handleBooking}>
          {errors.submit && <div className="error-message">{errors.submit}</div>}

          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={bookingData.name}
              onChange={handleInputChange}
              required
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={bookingData.email}
              onChange={handleInputChange}
              required
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={bookingData.phone}
              onChange={handleInputChange}
              required
            />
            {errors.phone && <span className="field-error">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="address">Address *</label>
            <textarea
              id="address"
              name="address"
              value={bookingData.address}
              onChange={handleInputChange}
              rows="3"
              required
            />
            {errors.address && <span className="field-error">{errors.address}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="notes">Special Requests / Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={bookingData.notes}
              onChange={handleInputChange}
              rows="3"
              placeholder="Any special requirements..."
            />
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Processing...' : 'Pay Advance & Complete Booking'}
          </button>
        </form>
      </div>

      <div className="checkout-summary-section">
        <h3>Order Summary</h3>
        <div className="summary-details">
          <div className="summary-item">
            <span>Event Date:</span>
            <span>{pkg.eventDate}</span>
          </div>
          <div className="summary-item">
            <span>Guest Count:</span>
            <span>{pkg.guestCount}</span>
          </div>

          <hr />

          <div className="summary-item">
            <span>Subtotal:</span>
            <span>₹{grandTotal.toLocaleString()}</span>
          </div>
          <div className="summary-item highlight">
            <span>Advance Payment (50%):</span>
            <span>₹{advanceAmount.toLocaleString()}</span>
          </div>
          <div className="summary-item">
            <span>Remaining Amount:</span>
            <span>₹{remainingAmount.toLocaleString()}</span>
          </div>

          <hr />

          <h4>Selected Items:</h4>
          {pkg.functionHall && (
            <div className="summary-item-detail">
              <span>🏛️ {pkg.functionHall.name}</span>
              <span>₹{pkg.functionHall.price.toLocaleString()}</span>
            </div>
          )}
          {pkg.decorations.map((d) => (
            <div key={d.id} className="summary-item-detail">
              <span>🎨 {d.name}</span>
              <span>₹{d.amount.toLocaleString()}</span>
            </div>
          ))}
          {pkg.food.map((f) => (
            <div key={f.id} className="summary-item-detail">
              <span>🍽️ {f.name}</span>
              <span>₹{f.price.toLocaleString()}</span>
            </div>
          ))}
          {pkg.services.map((s) => (
            <div key={s.id} className="summary-item-detail">
              <span>🎵 {s.name}</span>
              <span>₹{s.price.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
