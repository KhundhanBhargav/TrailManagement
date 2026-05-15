import { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/package.css';

export const PackageSummary = () => {
  const { package: pkg, removeFromPackage, updatePackageDate, updateGuestCount } = useBooking();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

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

  const foodTotal = calculateFoodTotal();
  const nonFoodTotal = calculateNonFoodTotal();
  const grandTotal = foodTotal + nonFoodTotal;

  const allItems = [
    ...(pkg.functionHall ? [{ ...pkg.functionHall, category: 'Function Hall', displayPrice: Number(pkg.functionHall.price) || 0 }] : []),
    ...pkg.decorations.map((d) => ({ ...d, category: 'Decoration', displayPrice: Number(d.amount) || 0 })),
    ...pkg.food.map((f) => ({ ...f, category: 'Food', displayPrice: (Number(f.price) || 0) * (pkg.guestCount || 1), basePrice: Number(f.price) || 0 })),
    ...pkg.services.map((s) => ({ ...s, category: 'Service', displayPrice: Number(s.price) || 0 })),
  ];

  return (
    <div className="package-summary-sidebar">
      <h3>📦 Your Package</h3>

      {allItems.length === 0 ? (
        <p className="empty-package">Start adding items to your package</p>
      ) : (
        <>
          <div className="package-items">
            {allItems.map((item, idx) => (
              <div key={idx} className="package-item">
                <div className="item-details">
                  <span className="item-name">{item.name}</span>
                  <span className="item-category">{item.category}</span>
                  {item.category === 'Food' && pkg.guestCount > 0 && (
                    <span className="item-quantity">₹{item.basePrice.toLocaleString()} x {pkg.guestCount} guests</span>
                  )}
                </div>
                <div className="item-price">
                  ₹{item.displayPrice.toLocaleString()}
                </div>
                <button
                  onClick={() => {
                    const type =
                      item.category === 'Function Hall'
                        ? 'functionHall'
                        : item.category === 'Decoration'
                          ? 'decorations'
                          : item.category === 'Food'
                            ? 'food'
                            : 'services';
                    removeFromPackage(type, item.id);
                  }}
                  className="remove-btn"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="package-inputs">
            <div className="input-group">
              <label>Event Date *</label>
              <input
                type="date"
                value={pkg.eventDate || ''}
                onChange={(e) => updatePackageDate(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Guest Count *</label>
              <input
                type="number"
                min="1"
                value={pkg.guestCount || ''}
                onChange={(e) => updateGuestCount(parseInt(e.target.value) || 0)}
                required
              />
            </div>
          </div>

          <div className="package-summary-section">
            {pkg.food.length > 0 && pkg.guestCount > 0 && (
              <>
                <div className="summary-row">
                  <span>Non-Food Items</span>
                  <span>₹{nonFoodTotal.toLocaleString()}</span>
                </div>
                <div className="summary-row">
                  <span>Food Items (₹{pkg.food[0]?.price || 0}/person × {pkg.guestCount} guests)</span>
                  <span>₹{foodTotal.toLocaleString()}</span>
                </div>
              </>
            )}
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{grandTotal.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>Advance (50%)</span>
              <span className="advance-amount">
                ₹{Math.ceil(grandTotal * 0.5).toLocaleString()}
              </span>
            </div>
            <div className="summary-row total">
              <span>Total Amount</span>
              <span>₹{grandTotal.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={handleProceedToCheckout}
            disabled={allItems.length === 0 || !pkg.eventDate || !pkg.guestCount || grandTotal === 0}
            className="checkout-btn"
          >
            Proceed to Checkout (₹{grandTotal.toLocaleString()})
          </button>
        </>
      )}
    </div>
  );
};
