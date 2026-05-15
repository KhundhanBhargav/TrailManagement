import { useState, useEffect } from 'react';
import { useBooking } from '../../context/BookingContext';
import api from '../../api/config';
import { SERVICE_ENDPOINTS } from '../../api/endpoints';
import '../../styles/tabs.css';

export const ServiceTab = ({ eventId }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedServices, setSelectedServices] = useState(new Set());
  const { addServiceToPackage } = useBooking();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await api.get(SERVICE_ENDPOINTS.LIST);
        setServices(response.data);
      } catch (err) {
        console.error('Failed to fetch services:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleSelectService = (service) => {
    const newSelected = new Set(selectedServices);
    if (newSelected.has(service.id)) {
      newSelected.delete(service.id);
    } else {
      newSelected.add(service.id);
      addServiceToPackage(service);
    }
    setSelectedServices(newSelected);
  };

  if (loading) return <div className="loading">Loading services...</div>;

  if (services.length === 0) {
    return (
      <div className="tab-content-wrapper">
        <h3>Additional Services</h3>
        <p className="no-items">No services available for this event</p>
      </div>
    );
  }

  return (
    <div className="tab-content-wrapper">
      <h3>Additional Services</h3>
      <div className="items-grid">
        {services.map((service) => (
          <div
            key={service.id}
            className={`item-card ${selectedServices.has(service.id) ? 'selected' : ''}`}
          >
            <div className="service-icon">{service.icon || '🎵'}</div>
            <div className="item-info">
              <h4>{service.name}</h4>
              <p className="description">{service.description}</p>
              {service.duration && (
                <p className="duration">⏱️ {service.duration} hours</p>
              )}
              <div className="item-footer">
                <span className="price">₹{service.price.toLocaleString()}</span>
                <button
                  onClick={() => handleSelectService(service)}
                  className={`add-btn ${selectedServices.has(service.id) ? 'selected' : ''}`}
                >
                  {selectedServices.has(service.id) ? '✓ Added' : 'Add to Package'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
