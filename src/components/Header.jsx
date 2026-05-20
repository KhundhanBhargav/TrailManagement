import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/navbar.css';

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isServices = location.pathname === '/services';
  const title = isServices ? 'All Events' : 'Welcome to EventHub';
  const description = isServices
    ? 'Browse our event categories and discover beautiful options for weddings, corporate gatherings, birthday parties, anniversaries, and more.'
    : 'Plan Your Perfect Event with Ease';
  const moreText = isServices
    ? 'We offer complete event planning support including decor, catering, entertainment, venue coordination, and tailored packages for every celebration.'
    : null;

  return (
    <div className="header-banner">
      <div className="header-content">
        <h1>{title}</h1>
        <p>{description}</p>
        {moreText && <p className="header-subtext">{moreText}</p>}
        <button
          onClick={() => navigate('/services')}
          className="cta-button"
        >
          Start Booking
        </button>
      </div>
    </div>
  );
};
