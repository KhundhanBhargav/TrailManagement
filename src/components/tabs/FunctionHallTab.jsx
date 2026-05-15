import { useState, useEffect } from 'react';
import { useBooking } from '../../context/BookingContext';
import api from '../../api/config';
import { HALL_ENDPOINTS } from '../../api/endpoints';
import '../../styles/tabs.css';

export const FunctionHallTab = ({ eventId }) => {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHall, setSelectedHall] = useState(null);
  const { addHallToPackage } = useBooking();

  useEffect(() => {
    const fetchHalls = async () => {
      try {
        const response = await api.get(HALL_ENDPOINTS.LIST);
        setHalls(response.data);
      } catch (err) {
        console.error('Failed to fetch function halls:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHalls();
  }, []);

  const handleSelectHall = (hall) => {
    setSelectedHall(hall.id);
    addHallToPackage(hall);
  };

  if (loading) return <div className="loading">Loading function halls...</div>;

  if (halls.length === 0) {
    return (
      <div className="tab-content-wrapper">
        <h3>Available Function Halls</h3>
        <p className="no-items">No function halls available for this event</p>
      </div>
    );
  }

  return (
    <div className="tab-content-wrapper">
      <h3>Available Function Halls</h3>
      <div className="items-grid">
        {halls.map((hall) => (
          <div
            key={hall.id}
            className={`item-card ${selectedHall === hall.id ? 'selected' : ''}`}
          >
            <img
              src={hall.image || 'https://via.placeholder.com/250x150'}
              alt={hall.name}
            />
            <div className="item-info">
              <h4>{hall.name}</h4>
              <p className="location">📍 {hall.location}</p>
              <p className="capacity">👥 Capacity: {hall.capacity} people</p>
              <p className="description">{hall.description}</p>
              <div className="item-footer">
                <span className="price">₹{hall.price.toLocaleString()}</span>
                <button
                  onClick={() => handleSelectHall(hall)}
                  className={`add-btn ${selectedHall === hall.id ? 'selected' : ''}`}
                >
                  {selectedHall === hall.id ? '✓ Added' : 'Add to Package'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
