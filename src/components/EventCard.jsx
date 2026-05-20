import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/config';
import { EVENT_ENDPOINTS } from '../api/endpoints';
import '../styles/events.css';

export const EventCard = ({ event }) => {
  const navigate = useNavigate();

  return (
    <div className="event-card">
      <div className="event-image">
        <img src={event.image || 'https://via.placeholder.com/300x200'} alt={event.name} />
        <span className="event-type">{event.name}</span>
      </div>
      <div className="event-content">
        <h3>{event.name}</h3>
        <p className="event-description">{event.description}</p>
        <button
          onClick={() => navigate(`/event/${event.id}`)}
          className="view-details-btn"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get(EVENT_ENDPOINTS.LIST);
        setEvents(response.data);
      } catch (err) {
        const message =
          err.response?.data?.detail ||
          err.response?.statusText ||
          err.message ||
          'Failed to fetch events';
        setError(message);
        console.error('Event fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) return <div className="loading">Loading events...</div>;
  if (error) return <div className="error">Failed to fetch events: {error}</div>;

  return (
    <div className="events-container">
      <h2>All Event Types</h2>
      <p className="events-intro">
        Discover the events we provide, including weddings, corporate meetups, birthday parties, cultural celebrations, and special occasions — all designed with beautiful decor, catering, and seamless planning.
      </p>
      <div className="events-grid">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
};
