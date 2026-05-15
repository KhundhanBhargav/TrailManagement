# Event Booking Management System - Frontend Documentation

## Project Structure

```
src/
├── components/           # Reusable React components
│   ├── Navbar.jsx
│   ├── Header.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── EventCard.jsx
│   ├── EventDetail.jsx
│   ├── PackageSummary.jsx
│   ├── Checkout.jsx
│   ├── BookingConfirmation.jsx
│   └── tabs/             # Tab components for event details
│       ├── FunctionHallTab.jsx
│       ├── DecorationTab.jsx
│       ├── FoodTab.jsx
│       └── ServiceTab.jsx
├── pages/                # Full page components
│   ├── HomePage.jsx
│   ├── MyBookings.jsx
│   ├── AdminDashboard.jsx
│   └── NotFound.jsx
├── context/              # Context API providers
│   ├── AuthContext.jsx   # Authentication state
│   └── BookingContext.jsx # Booking cart/package state
├── api/                  # API configuration
│   ├── config.js         # Axios instance with interceptors
│   └── endpoints.js      # All API endpoints
├── services/             # Business logic & utilities
├── styles/               # CSS modules
│   ├── navbar.css
│   ├── auth.css
│   ├── events.css
│   ├── eventdetail.css
│   ├── tabs.css
│   ├── package.css
│   ├── checkout.css
│   ├── confirmation.css
│   ├── bookings.css
│   ├── admin.css
│   ├── home.css
│   └── notfound.css
├── utils/                # Utility functions
├── assets/               # Static assets
├── App.jsx               # Main app with routing
├── main.jsx              # Entry point
└── index.css             # Global styles
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_RAZORPAY_KEY=your_razorpay_key_here
VITE_ENV=development
```

### 3. Start Development Server
```bash
npm run dev
```

The app will run on `http://localhost:5173`

## Key Features

### 1. Authentication
- User registration and login
- JWT token-based authentication
- Protected routes for authenticated users
- Admin role detection

### 2. Event Browsing
- View all available events
- Browse by event type
- Event detail view with tabs

### 3. Service Selection
- Function hall selection with availability
- Decoration type selection
- Food menu (veg/non-veg)
- Additional services (music, dance, etc.)

### 4. Booking & Checkout
- Dynamic package summary
- Real-time price calculation
- Advanced payment (50% at booking)
- Razorpay payment integration
- Booking confirmation

### 5. User Dashboard
- View my bookings
- Track booking status
- View payment status

### 6. Admin Dashboard
- View all bookings
- Revenue analytics
- Venue management
- Content management (decorations, food, services)

## Component Details

### AuthContext
Manages user authentication state and provides:
- `user` - Current user data
- `isAuthenticated` - Authentication status
- `isAdmin` - Admin role check
- `login(email, password)` - Login function
- `register(userData)` - Registration function
- `logout()` - Logout function

### BookingContext
Manages booking/package state and provides:
- `package` - Current package object
- `addHallToPackage(hall)` - Add function hall
- `addDecorationToPackage(decoration)` - Add decoration
- `addFoodToPackage(food)` - Add food
- `addServiceToPackage(service)` - Add service
- `removeFromPackage(type, id)` - Remove item
- `updatePackageDate(date)` - Set event date
- `updateGuestCount(count)` - Set guest count
- `clearPackage()` - Clear entire package

### API Endpoints

All API endpoints are defined in `src/api/endpoints.js`:

**Authentication:**
- POST `/auth/register/` - Register new user
- POST `/auth/login/` - Login user
- POST `/auth/logout/` - Logout user

**Events:**
- GET `/events/` - List all events
- GET `/events/{id}/` - Get event details

**Services:**
- GET `/function-halls/?event={eventId}` - Get halls for event
- GET `/decorations/?event={eventId}` - Get decorations
- GET `/food-items/?event={eventId}` - Get food items
- GET `/services/?event={eventId}` - Get services

**Bookings:**
- POST `/bookings/` - Create booking
- GET `/bookings/` - Get user bookings
- GET `/bookings/{id}/` - Get booking details

**Payment:**
- POST `/payments/` - Create payment
- POST `/payments/verify/` - Verify payment

## API Integration Guide

### Making API Requests
```javascript
import api from '../api/config';

// GET request
const data = await api.get('/endpoint/');

// POST request
const response = await api.post('/endpoint/', { data });

// PUT request
const updated = await api.put('/endpoint/', { data });

// DELETE request
await api.delete('/endpoint/');
```

### Error Handling
The API client automatically handles:
- 401 errors (redirects to login)
- Token refresh
- Authorization headers

### Adding New Endpoints
1. Add endpoint to `src/api/endpoints.js`
2. Use endpoint in components
3. Handle response and errors

## Building for Production
```bash
npm run build
```

Build artifacts will be in the `dist/` directory.

## Technologies Used
- React 19
- React Router DOM
- Axios
- Zustand (state management alternative)
- Vite
- CSS3

## Browser Support
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Common Issues & Solutions

### API Requests Failing
- Check if backend is running on `http://localhost:8000`
- Verify `.env` file has correct API_BASE_URL
- Check CORS settings on backend

### Login Not Working
- Ensure backend authentication endpoints are working
- Check if tokens are being saved in localStorage
- Verify JWT configuration

### Styling Issues
- Clear browser cache
- Run `npm run dev` again
- Check CSS file imports

## Performance Optimization
- Lazy loading for routes (implement React.lazy())
- Image optimization
- Minification on build
- Code splitting

## Next Steps
1. Set up Django backend
2. Configure Razorpay account
3. Set up database
4. Test payment flow
5. Deploy to production
