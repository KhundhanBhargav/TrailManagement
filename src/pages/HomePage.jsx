import { Header } from '../components/Header';
import { EventList } from '../components/EventCard';
import '../styles/home.css';

export const HomePage = () => {
  return (
    <div className="home-page">
      <Header />
      <EventList />
    </div>
  );
};
