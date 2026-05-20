import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api/config';
import { ADMIN_ENDPOINTS } from '../api/endpoints';
import '../styles/admin.css';

const initialFormState = {
  events: { name: '', description: '', image: '' },
  venues: { name: '', location: '', capacity: '', price: '', description: '', image: '' },
  decorations: { name: '', decoration_type: 'classic', amount: '', description: '', image: '' },
  food: { name: '', description: '', price: '', food_type: 'veg', image: '' },
  services: { name: '', description: '', price: '', duration: '', icon: '' },
};

export const AdminDashboard = () => {
  const { isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [decorations, setDecorations] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [services, setServices] = useState([]);
  const [activeTab, setActiveTab] = useState('bookings');
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(initialFormState);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        const [dashboardRes, bookingsRes, eventsRes, venuesRes, decorationsRes, foodRes, servicesRes] = await Promise.all([
          api.get(ADMIN_ENDPOINTS.DASHBOARD),
          api.get(ADMIN_ENDPOINTS.BOOKINGS),
          api.get(ADMIN_ENDPOINTS.EVENTS),
          api.get(ADMIN_ENDPOINTS.VENUES),
          api.get(ADMIN_ENDPOINTS.DECORATIONS),
          api.get(ADMIN_ENDPOINTS.FOOD),
          api.get(ADMIN_ENDPOINTS.SERVICES),
        ]);

        setStats(dashboardRes.data);
        setBookings(bookingsRes.data);
        setEvents(eventsRes.data);
        setVenues(venuesRes.data);
        setDecorations(decorationsRes.data);
        setFoodItems(foodRes.data);
        setServices(servicesRes.data);
      } catch (err) {
        console.error('Failed to fetch admin data:', err);
        setError('Failed to load admin data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, isAdmin, navigate]);

  const handleTabChange = (tab) => {
    setMessage(null);
    setError(null);
    setSelectedBooking(null);
    setSelectedItem(null);
    setFormData((prev) => ({ ...prev, [tab]: initialFormState[tab] }));
    setActiveTab(tab);
  };

  const handleSelectBooking = (booking) => {
    setSelectedBooking(booking);
  };

  const handleEditItem = (item) => {
    setSelectedItem(item);
    setMessage(null);
    setError(null);
    setFormData((prev) => ({
      ...prev,
      [activeTab]: {
        name: item.name || '',
        description: item.description || '',
        image: item.image || '',
        location: item.location || '',
        capacity: item.capacity || '',
        price: item.price || '',
        decoration_type: item.decoration_type || 'classic',
        amount: item.amount || '',
        food_type: item.food_type || 'veg',
        duration: item.duration || '',
        icon: item.icon || '',
      },
    }));
  };

  const handleCancelEdit = () => {
    setSelectedItem(null);
    setMessage(null);
    setError(null);
    setFormData((prev) => ({ ...prev, [activeTab]: initialFormState[activeTab] }));
  };

  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const refreshSection = async (section) => {
    try {
      if (section === 'events') {
        const res = await api.get(ADMIN_ENDPOINTS.EVENTS);
        setEvents(res.data);
      }
      if (section === 'venues') {
        const res = await api.get(ADMIN_ENDPOINTS.VENUES);
        setVenues(res.data);
      }
      if (section === 'decorations') {
        const res = await api.get(ADMIN_ENDPOINTS.DECORATIONS);
        setDecorations(res.data);
      }
      if (section === 'food') {
        const res = await api.get(ADMIN_ENDPOINTS.FOOD);
        setFoodItems(res.data);
      }
      if (section === 'services') {
        const res = await api.get(ADMIN_ENDPOINTS.SERVICES);
        setServices(res.data);
      }
    } catch (err) {
      console.error(`Failed to refresh ${section}:`, err);
    }
  };

  const getAdminDetailEndpoint = (section, id) => {
    return {
      events: ADMIN_ENDPOINTS.EVENT_DETAIL(id),
      venues: ADMIN_ENDPOINTS.VENUE_DETAIL(id),
      decorations: ADMIN_ENDPOINTS.DECORATION_DETAIL(id),
      food: ADMIN_ENDPOINTS.FOOD_DETAIL(id),
      services: ADMIN_ENDPOINTS.SERVICE_DETAIL(id),
    }[section];
  };

  const getAdminListEndpoint = (section) => {
    return {
      events: ADMIN_ENDPOINTS.EVENTS,
      venues: ADMIN_ENDPOINTS.VENUES,
      decorations: ADMIN_ENDPOINTS.DECORATIONS,
      food: ADMIN_ENDPOINTS.FOOD,
      services: ADMIN_ENDPOINTS.SERVICES,
    }[section];
  };

  const handleSaveItem = async (section) => {
    setMessage(null);
    setError(null);

    const payload = { ...formData[section] };
    if (section === 'venues') {
      payload.capacity = Number(payload.capacity || 0);
      payload.price = Number(payload.price || 0);
    }
    if (section === 'decorations') {
      payload.amount = Number(payload.amount || 0);
    }
    if (section === 'food') {
      payload.price = Number(payload.price || 0);
    }
    if (section === 'services') {
      payload.price = Number(payload.price || 0);
      payload.duration = Number(payload.duration || 0);
    }

    try {
      const listEndpoint = getAdminListEndpoint(section);
      if (selectedItem) {
        await api.put(getAdminDetailEndpoint(section, selectedItem.id), payload);
        setMessage('Updated successfully.');
      } else {
        await api.post(listEndpoint, payload);
        setMessage('Created successfully.');
      }

      setSelectedItem(null);
      setFormData((prev) => ({
        ...prev,
        [section]: initialFormState[section],
      }));
      await refreshSection(section);
    } catch (err) {
      console.error('Failed to save item:', err);
      setError(err.response?.data?.detail || 'Failed to save item.');
    }
  };

  const handleDeleteItem = async (section, itemId) => {
    setMessage(null);
    setError(null);

    try {
      await api.delete(getAdminDetailEndpoint(section, itemId));
      setMessage('Deleted successfully.');
      if (selectedItem?.id === itemId) {
        setSelectedItem(null);
        setFormData((prev) => ({ ...prev, [section]: initialFormState[section] }));
      }
      await refreshSection(section);
    } catch (err) {
      console.error('Failed to delete item:', err);
      setError(err.response?.data?.detail || 'Failed to delete item.');
    }
  };

  if (loading) return <div className="loading">Loading admin dashboard...</div>;

  return (
    <div className="admin-container">
      <div className="admin-sidebar">
        <h2>Admin Panel</h2>
        <nav className="admin-nav">
          <button
            className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleTabChange('dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            className={`nav-btn ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => handleTabChange('bookings')}
          >
            📚 Bookings
          </button>
          <button
            className={`nav-btn ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => handleTabChange('events')}
          >
            🎫 Events
          </button>
          <button
            className={`nav-btn ${activeTab === 'venues' ? 'active' : ''}`}
            onClick={() => handleTabChange('venues')}
          >
            🏛️ Venues
          </button>
          <button
            className={`nav-btn ${activeTab === 'decorations' ? 'active' : ''}`}
            onClick={() => handleTabChange('decorations')}
          >
            🎨 Decorations
          </button>
          <button
            className={`nav-btn ${activeTab === 'food' ? 'active' : ''}`}
            onClick={() => handleTabChange('food')}
          >
            🍽️ Food
          </button>
          <button
            className={`nav-btn ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => handleTabChange('services')}
          >
            🎵 Services
          </button>
        </nav>
      </div>

      <div className="admin-content">
        {activeTab === 'dashboard' && stats && (
          <div className="dashboard-grid">
            <div className="stat-card">
              <h3>Total Bookings</h3>
              <p className="stat-number">{stats.total_bookings}</p>
            </div>
            <div className="stat-card">
              <h3>Total Revenue</h3>
              <p className="stat-number">₹{stats.total_revenue.toLocaleString()}</p>
            </div>
            <div className="stat-card">
              <h3>Pending Payments</h3>
              <p className="stat-number">₹{stats.pending_amount.toLocaleString()}</p>
            </div>
            <div className="stat-card">
              <h3>Completed Bookings</h3>
              <p className="stat-number">{stats.completed_bookings}</p>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bookings-management">
            <h2>All Bookings</h2>
            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Customer</th>
                  <th>Event Date</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>#{booking.id}</td>
                    <td>{booking.customer_name}</td>
                    <td>{new Date(booking.event_date).toLocaleDateString()}</td>
                    <td>₹{booking.total_amount.toLocaleString()}</td>
                    <td>
                      <span className={`status-badge ${booking.status}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      <button className="action-btn" onClick={() => handleSelectBooking(booking)}>
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {selectedBooking && (
              <div className="booking-detail-panel">
                <h3>Booking Details for #{selectedBooking.id}</h3>
                <div className="detail-grid">
                  <div>
                    <p><strong>Customer:</strong> {selectedBooking.customer_name}</p>
                    <p><strong>Email:</strong> {selectedBooking.customer_email}</p>
                    <p><strong>Phone:</strong> {selectedBooking.customer_phone}</p>
                    <p><strong>Address:</strong> {selectedBooking.customer_address}</p>
                    <p><strong>User Account:</strong> {selectedBooking.user?.email || 'Guest'}</p>
                    <p><strong>Event Date:</strong> {new Date(selectedBooking.event_date).toLocaleDateString()}</p>
                    <p><strong>Guest Count:</strong> {selectedBooking.guest_count}</p>
                  </div>
                  <div>
                    <p><strong>Total Amount:</strong> ₹{selectedBooking.total_amount.toLocaleString()}</p>
                    <p><strong>Advance Paid:</strong> ₹{selectedBooking.advance_amount.toLocaleString()}</p>
                    <p><strong>Remaining:</strong> ₹{(selectedBooking.total_amount - selectedBooking.advance_amount).toLocaleString()}</p>
                    <p><strong>Status:</strong> {selectedBooking.status}</p>
                    <p><strong>Payment Status:</strong> {selectedBooking.payment_status}</p>
                    <p><strong>Function Hall:</strong> {selectedBooking.function_hall?.name || 'None'}</p>
                  </div>
                </div>
                <div className="booking-detail-lists">
                  <div>
                    <h4>Decorations</h4>
                    {selectedBooking.decorations?.length ? (
                      <ul>
                        {selectedBooking.decorations.map((item) => (
                          <li key={item.id}>{item.name} ({item.decoration_type})</li>
                        ))}
                      </ul>
                    ) : (
                      <p>No decorations selected.</p>
                    )}
                  </div>
                  <div>
                    <h4>Food Items</h4>
                    {selectedBooking.food_items?.length ? (
                      <ul>
                        {selectedBooking.food_items.map((item) => (
                          <li key={item.id}>{item.name} ({item.food_type})</li>
                        ))}
                      </ul>
                    ) : (
                      <p>No food items selected.</p>
                    )}
                  </div>
                  <div>
                    <h4>Services</h4>
                    {selectedBooking.services?.length ? (
                      <ul>
                        {selectedBooking.services.map((item) => (
                          <li key={item.id}>{item.name} ({item.duration} min)</li>
                        ))}
                      </ul>
                    ) : (
                      <p>No services selected.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {(activeTab === 'events' || activeTab === 'venues' || activeTab === 'decorations' || activeTab === 'food' || activeTab === 'services') && (
          <div className="management-section">
            <h2>
              {activeTab === 'events' && 'Manage Events'}
              {activeTab === 'venues' && 'Manage Function Halls'}
              {activeTab === 'decorations' && 'Manage Decorations'}
              {activeTab === 'food' && 'Manage Food Items'}
              {activeTab === 'services' && 'Manage Services'}
            </h2>
            <p className="section-description">
              {activeTab === 'events' && 'Add new event categories for customers to choose when they book an event.'}
              {activeTab === 'venues' && 'Add or update function halls with location, capacity and pricing.'}
              {activeTab === 'decorations' && 'Add decoration options with type, price, and styling details.'}
              {activeTab === 'food' && 'Add food items and menu options for event bookings.'}
              {activeTab === 'services' && 'Add additional services such as entertainment, photography, or coordination.'}
            </p>
            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}

            <div className="admin-form-grid">
              <div className="admin-form">
                <h3>Add New {activeTab === 'events' ? 'Event' : activeTab === 'venues' ? 'Venue' : activeTab === 'decorations' ? 'Decoration' : activeTab === 'food' ? 'Food Item' : 'Service'}</h3>
                {activeTab === 'events' && (
                  <>
                    <label>Name</label>
                    <input value={formData.events.name} onChange={(e) => handleInputChange('events', 'name', e.target.value)} />
                    <label>Description</label>
                    <textarea value={formData.events.description} onChange={(e) => handleInputChange('events', 'description', e.target.value)} />
                    <label>Image URL</label>
                    <input value={formData.events.image} onChange={(e) => handleInputChange('events', 'image', e.target.value)} />
                  </>
                )}
                {activeTab === 'venues' && (
                  <>
                    <label>Name</label>
                    <input value={formData.venues.name} onChange={(e) => handleInputChange('venues', 'name', e.target.value)} />
                    <label>Location</label>
                    <input value={formData.venues.location} onChange={(e) => handleInputChange('venues', 'location', e.target.value)} />
                    <label>Capacity</label>
                    <input type="number" value={formData.venues.capacity} onChange={(e) => handleInputChange('venues', 'capacity', e.target.value)} />
                    <label>Price</label>
                    <input type="number" value={formData.venues.price} onChange={(e) => handleInputChange('venues', 'price', e.target.value)} />
                    <label>Description</label>
                    <textarea value={formData.venues.description} onChange={(e) => handleInputChange('venues', 'description', e.target.value)} />
                    <label>Image URL</label>
                    <input value={formData.venues.image} onChange={(e) => handleInputChange('venues', 'image', e.target.value)} />
                  </>
                )}
                {activeTab === 'decorations' && (
                  <>
                    <label>Name</label>
                    <input value={formData.decorations.name} onChange={(e) => handleInputChange('decorations', 'name', e.target.value)} />
                    <label>Type</label>
                    <select value={formData.decorations.decoration_type} onChange={(e) => handleInputChange('decorations', 'decoration_type', e.target.value)}>
                      <option value="classic">Classic</option>
                      <option value="modern">Modern</option>
                      <option value="luxury">Luxury</option>
                    </select>
                    <label>Amount</label>
                    <input type="number" value={formData.decorations.amount} onChange={(e) => handleInputChange('decorations', 'amount', e.target.value)} />
                    <label>Description</label>
                    <textarea value={formData.decorations.description} onChange={(e) => handleInputChange('decorations', 'description', e.target.value)} />
                    <label>Image URL</label>
                    <input value={formData.decorations.image} onChange={(e) => handleInputChange('decorations', 'image', e.target.value)} />
                  </>
                )}
                {activeTab === 'food' && (
                  <>
                    <label>Name</label>
                    <input value={formData.food.name} onChange={(e) => handleInputChange('food', 'name', e.target.value)} />
                    <label>Description</label>
                    <textarea value={formData.food.description} onChange={(e) => handleInputChange('food', 'description', e.target.value)} />
                    <label>Price</label>
                    <input type="number" value={formData.food.price} onChange={(e) => handleInputChange('food', 'price', e.target.value)} />
                    <label>Food Type</label>
                    <select value={formData.food.food_type} onChange={(e) => handleInputChange('food', 'food_type', e.target.value)}>
                      <option value="veg">Vegetarian</option>
                      <option value="non_veg">Non-Vegetarian</option>
                    </select>
                    <label>Image URL</label>
                    <input value={formData.food.image} onChange={(e) => handleInputChange('food', 'image', e.target.value)} />
                  </>
                )}
                {activeTab === 'services' && (
                  <>
                    <label>Name</label>
                    <input value={formData.services.name} onChange={(e) => handleInputChange('services', 'name', e.target.value)} />
                    <label>Description</label>
                    <textarea value={formData.services.description} onChange={(e) => handleInputChange('services', 'description', e.target.value)} />
                    <label>Price</label>
                    <input type="number" value={formData.services.price} onChange={(e) => handleInputChange('services', 'price', e.target.value)} />
                    <label>Duration (minutes)</label>
                    <input type="number" value={formData.services.duration} onChange={(e) => handleInputChange('services', 'duration', e.target.value)} />
                    <label>Icon</label>
                    <input value={formData.services.icon} onChange={(e) => handleInputChange('services', 'icon', e.target.value)} />
                  </>
                )}
                <button className="add-btn" onClick={() => handleSaveItem(activeTab)}>
                  {selectedItem ? 'Update' : '+ Add New'} {' '}
                  {activeTab === 'events' ? 'Event' : activeTab === 'venues' ? 'Venue' : activeTab === 'decorations' ? 'Decoration' : activeTab === 'food' ? 'Food Item' : 'Service'}
                </button>
                {selectedItem && (
                  <button className="cancel-btn" type="button" onClick={handleCancelEdit}>
                    Cancel Edit
                  </button>
                )}
              </div>

              <div className="admin-list">
                <h3>Existing {activeTab === 'events' ? 'Events' : activeTab === 'venues' ? 'Venues' : activeTab === 'decorations' ? 'Decorations' : activeTab === 'food' ? 'Food Items' : 'Services'}</h3>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      {activeTab === 'venues' && <th>Location</th>}
                      {activeTab === 'venues' && <th>Capacity</th>}
                      {activeTab === 'venues' && <th>Price</th>}
                      {activeTab === 'decorations' && <th>Type</th>}
                      {activeTab === 'decorations' && <th>Amount</th>}
                      {activeTab === 'food' && <th>Type</th>}
                      {activeTab === 'food' && <th>Price</th>}
                      {activeTab === 'services' && <th>Price</th>}
                      {activeTab === 'services' && <th>Duration</th>}
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(activeTab === 'events' ? events : activeTab === 'venues' ? venues : activeTab === 'decorations' ? decorations : activeTab === 'food' ? foodItems : services).map((item) => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        {activeTab === 'venues' && <td>{item.location}</td>}
                        {activeTab === 'venues' && <td>{item.capacity}</td>}
                        {activeTab === 'venues' && <td>₹{item.price}</td>}
                        {activeTab === 'decorations' && <td>{item.decoration_type}</td>}
                        {activeTab === 'decorations' && <td>₹{item.amount}</td>}
                        {activeTab === 'food' && <td>{item.food_type}</td>}
                        {activeTab === 'food' && <td>₹{item.price}</td>}
                        {activeTab === 'services' && <td>₹{item.price}</td>}
                        {activeTab === 'services' && <td>{item.duration} min</td>}
                        <td>
                          <button className="action-btn" onClick={() => handleEditItem(item)}>
                            Edit
                          </button>
                          <button className="action-btn delete-btn" onClick={() => handleDeleteItem(activeTab, item.id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
