import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api/config';
import { ADMIN_ENDPOINTS, BOOKING_ENDPOINTS } from '../api/endpoints';
import '../styles/admin.css';

export const AdminDashboard = () => {
  const { isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        const dashboardRes = await api.get(ADMIN_ENDPOINTS.DASHBOARD);
        const bookingsRes = await api.get(ADMIN_ENDPOINTS.BOOKINGS);

        setStats(dashboardRes.data);
        setBookings(bookingsRes.data);
      } catch (err) {
        console.error('Failed to fetch admin data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, isAdmin, navigate]);

  if (loading) return <div className="loading">Loading admin dashboard...</div>;

  return (
    <div className="admin-container">
      <div className="admin-sidebar">
        <h2>Admin Panel</h2>
        <nav className="admin-nav">
          <button
            className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            className={`nav-btn ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            📚 Bookings
          </button>
          <button
            className={`nav-btn ${activeTab === 'venues' ? 'active' : ''}`}
            onClick={() => setActiveTab('venues')}
          >
            🏛️ Venues
          </button>
          <button
            className={`nav-btn ${activeTab === 'decorations' ? 'active' : ''}`}
            onClick={() => setActiveTab('decorations')}
          >
            🎨 Decorations
          </button>
          <button
            className={`nav-btn ${activeTab === 'food' ? 'active' : ''}`}
            onClick={() => setActiveTab('food')}
          >
            🍽️ Food
          </button>
          <button
            className={`nav-btn ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
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
                      <button className="action-btn">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'venues' && (
          <div className="management-section">
            <h2>Manage Function Halls</h2>
            <button className="add-btn">+ Add New Venue</button>
            {/* Venue management UI */}
          </div>
        )}

        {activeTab === 'decorations' && (
          <div className="management-section">
            <h2>Manage Decorations</h2>
            <button className="add-btn">+ Add New Decoration</button>
            {/* Decoration management UI */}
          </div>
        )}

        {activeTab === 'food' && (
          <div className="management-section">
            <h2>Manage Food Items</h2>
            <button className="add-btn">+ Add New Food Item</button>
            {/* Food management UI */}
          </div>
        )}

        {activeTab === 'services' && (
          <div className="management-section">
            <h2>Manage Services</h2>
            <button className="add-btn">+ Add New Service</button>
            {/* Services management UI */}
          </div>
        )}
      </div>
    </div>
  );
};
