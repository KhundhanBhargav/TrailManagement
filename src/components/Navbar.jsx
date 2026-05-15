import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/navbar.css';

export const Navbar = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🎉</span>
          EventHub
        </Link>

        <div className="nav-menu">
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/services" className="nav-link">
            Services
          </Link>

          {!isAuthenticated ? (
            <>
              <Link to="/login" className="nav-link login-btn">
                Login
              </Link>
              <Link to="/register" className="nav-link register-btn">
                Register
              </Link>
            </>
          ) : (
            <>
              <Link to="/bookings" className="nav-link">
                My Bookings
              </Link>
              {isAdmin && (
                <Link to="/admin" className="nav-link admin-btn">
                  Admin
                </Link>
              )}
              <div className="nav-user">
                <span className="user-name">{user?.name}</span>
                <button onClick={logout} className="logout-btn">
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
