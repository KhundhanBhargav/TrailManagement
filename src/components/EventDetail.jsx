import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/config';
import { EVENT_ENDPOINTS } from '../api/endpoints';
import { FunctionHallTab } from './tabs/FunctionHallTab';
import { DecorationTab } from './tabs/DecorationTab';
import { FoodTab } from './tabs/FoodTab';
import { ServiceTab } from './tabs/ServiceTab';
import { PackageSummary } from './PackageSummary';
import '../styles/eventdetail.css';

export const EventDetail = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('halls');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await api.get(EVENT_ENDPOINTS.DETAIL(eventId));
        setEvent(response.data);
      } catch (err) {
        console.error('Failed to fetch event details:', err);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, navigate]);

  if (loading) return <div className="loading">Loading event details...</div>;
  if (!event) return <div className="error">Event not found</div>;

  return (
    <div className="event-detail-container">
      <div className="event-detail-header">
        <h1>{event.name}</h1>
        <p>{event.description}</p>
      </div>

      <div className="event-detail-content">
        <div className="tabs-section">
          <div className="tabs-navigation">
            <button
              className={`tab-btn ${activeTab === 'halls' ? 'active' : ''}`}
              onClick={() => setActiveTab('halls')}
            >
              🏛️ Function Halls
            </button>
            <button
              className={`tab-btn ${activeTab === 'decorations' ? 'active' : ''}`}
              onClick={() => setActiveTab('decorations')}
            >
              🎨 Decorations
            </button>
            <button
              className={`tab-btn ${activeTab === 'food' ? 'active' : ''}`}
              onClick={() => setActiveTab('food')}
            >
              🍽️ Food
            </button>
            <button
              className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`}
              onClick={() => setActiveTab('services')}
            >
              🎵 Services
            </button>
          </div>

          <div className="tabs-content">
            {activeTab === 'halls' && <FunctionHallTab eventId={eventId} />}
            {activeTab === 'decorations' && <DecorationTab eventId={eventId} />}
            {activeTab === 'food' && <FoodTab eventId={eventId} />}
            {activeTab === 'services' && <ServiceTab eventId={eventId} />}
          </div>
        </div>

        <PackageSummary />
      </div>
    </div>
  );
};
