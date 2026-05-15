import { useNavigate } from 'react-router-dom';
import '../styles/navbar.css';

export const Header = () => {
  const navigate = useNavigate();

  return (
    <div className="header-banner">
      <div className="header-content">
        <h1>Welcome to EventHub</h1>
        <p>Plan Your Perfect Event with Ease</p>
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
