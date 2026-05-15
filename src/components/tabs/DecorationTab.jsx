import { useState, useEffect } from 'react';
import { useBooking } from '../../context/BookingContext';
import api from '../../api/config';
import { DECORATION_ENDPOINTS } from '../../api/endpoints';
import '../../styles/tabs.css';

export const DecorationTab = ({ eventId }) => {
  const [decorations, setDecorations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDecorations, setSelectedDecorations] = useState(new Set());
  const { addDecorationToPackage } = useBooking();

  useEffect(() => {
    const fetchDecorations = async () => {
      try {
        const response = await api.get(DECORATION_ENDPOINTS.LIST);
        setDecorations(response.data);
      } catch (err) {
        console.error('Failed to fetch decorations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDecorations();
  }, []);

  const handleSelectDecoration = (decoration) => {
    const newSelected = new Set(selectedDecorations);
    if (newSelected.has(decoration.id)) {
      newSelected.delete(decoration.id);
    } else {
      newSelected.add(decoration.id);
      addDecorationToPackage(decoration);
    }
    setSelectedDecorations(newSelected);
  };

  if (loading) return <div className="loading">Loading decorations...</div>;

  if (decorations.length === 0) {
    return (
      <div className="tab-content-wrapper">
        <h3>Decoration Types</h3>
        <p className="no-items">No decorations available for this event</p>
      </div>
    );
  }

  return (
    <div className="tab-content-wrapper">
      <h3>Decoration Types</h3>
      <div className="items-grid">
        {decorations.map((decoration) => (
          <div
            key={decoration.id}
            className={`item-card ${selectedDecorations.has(decoration.id) ? 'selected' : ''}`}
          >
            <img
              src={decoration.image || 'https://via.placeholder.com/250x150'}
              alt={decoration.name}
            />
            <div className="item-info">
              <h4>{decoration.name}</h4>
              <p className="description">{decoration.description}</p>
              <p className="decoration-type">Type: {decoration.decoration_type}</p>
              <div className="item-footer">
                <span className="price">₹{decoration.amount.toLocaleString()}</span>
                <button
                  onClick={() => handleSelectDecoration(decoration)}
                  className={`add-btn ${selectedDecorations.has(decoration.id) ? 'selected' : ''}`}
                >
                  {selectedDecorations.has(decoration.id) ? '✓ Added' : 'Add to Package'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
