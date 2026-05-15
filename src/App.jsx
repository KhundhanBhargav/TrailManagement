
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { EventDetail } from './components/EventDetail';
import { Checkout } from './components/Checkout';
import { BookingConfirmation } from './components/BookingConfirmation';
import { MyBookings } from './pages/MyBookings';
import { PaymentPage } from './pages/PaymentPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { NotFound } from './pages/NotFound';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <BookingProvider>
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/services" element={<HomePage />} />
            <Route path="/event/:eventId" element={<EventDetail />} />

            {/* Protected Routes */}
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payments/:bookingId" element={<PaymentPage />} />
            <Route path="/booking-confirmation/:bookingId" element={<BookingConfirmation />} />
            <Route path="/bookings" element={<MyBookings />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BookingProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;