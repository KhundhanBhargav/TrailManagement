# Event Booking Management System

A comprehensive event booking and management platform built with **React**, **Django**, and **PostgreSQL**.

## 🎯 Features

### User Features
- ✅ User Registration & Authentication (JWT)
- ✅ Browse Event Types
- ✅ Select Function Halls with Details (Name, Capacity, Location, Price)
- ✅ Choose Decoration Types
- ✅ Select Food Menu (Veg/Non-Veg)
- ✅ Add Additional Services (Music, Dance, etc.)
- ✅ Dynamic Package Summary with Real-time Price Calculation
- ✅ Event Date & Guest Count Selection
- ✅ Advanced Payment Option (50% at booking)
- ✅ Razorpay Payment Integration
- ✅ Booking Confirmation & Details
- ✅ View My Bookings with Status Tracking

### Admin Features
- ✅ Admin Dashboard with Analytics
- ✅ Revenue Tracking
- ✅ Booking Management
- ✅ Function Hall Management
- ✅ Decoration Management
- ✅ Food Menu Management
- ✅ Service Management
- ✅ User Management

## 🏗️ Tech Stack

### Frontend
- **React 19** - UI Library
- **React Router DOM** - Client-side routing
- **Axios** - HTTP Client
- **Vite** - Build tool
- **CSS3** - Styling

### Backend
- **Django 4.2** - Web Framework
- **Django REST Framework** - REST API
- **PostgreSQL** - Database
- **Razorpay** - Payment Gateway
- **JWT** - Authentication

## 📁 Project Structure

```
TrailEventManagement/
├── src/
│   ├── components/          # React components
│   ├── pages/               # Page components
│   ├── context/             # Context providers
│   ├── api/                 # API configuration
│   ├── styles/              # CSS files
│   ├── utils/               # Utilities
│   ├── App.jsx              # Main app
│   └── main.jsx             # Entry point
├── public/                  # Static files
├── package.json             # Dependencies
├── vite.config.js           # Vite config
├── eslint.config.js         # ESLint config
└── README.md                # Documentation
```

## 🚀 Quick Start

### Frontend Setup

```bash
# Navigate to project
cd TrailEventManagement

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update environment variables
# VITE_API_BASE_URL=http://localhost:8000/api
# VITE_RAZORPAY_KEY=your_razorpay_key

# Start development server
npm run dev
```

Frontend will be available at: `http://localhost:5173`

### Backend Setup

```bash
# Create backend directory (use BACKEND_CODE_GUIDE.md for detailed setup)
mkdir TrailEventBackend
cd TrailEventBackend

# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start server
python manage.py runserver
```

Backend will be available at: `http://localhost:8000`

## 📚 Documentation Files

Complete documentation is available:

### Getting Started
1. **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Complete project setup (START HERE)
2. **[FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md)** - Frontend architecture and components
3. **[BACKEND_CODE_GUIDE.md](./BACKEND_CODE_GUIDE.md)** - All Django code (models, views, serializers)
4. **[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)** - Frontend-Backend integration

### Reference
- **API Endpoints** - See INTEGRATION_GUIDE.md
- **Database Schema** - See SETUP_GUIDE.md
- **Environment Variables** - See .env.example

## 🎨 Key Components

### Frontend Components

#### Core
- **Navbar** - Navigation and user menu
- **Header** - Hero banner
- **HomePage** - Event listing

#### Authentication
- **Login** - User login
- **Register** - User registration

#### Event Management
- **EventCard** - Event display
- **EventDetail** - Full event with service tabs
- **FunctionHallTab** - Function hall selection
- **DecorationTab** - Decoration selection
- **FoodTab** - Food menu (veg/non-veg)
- **ServiceTab** - Additional services

#### Booking
- **PackageSummary** - Package details
- **Checkout** - Payment form
- **BookingConfirmation** - Confirmation page
- **MyBookings** - User bookings list

#### Admin
- **AdminDashboard** - Admin panel

### State Management

#### AuthContext
```javascript
{
  user,                    // Current user object
  isAuthenticated,         // Boolean
  isAdmin,                 // Boolean
  register(userData),      // Function
  login(email, password),  // Function
  logout()                 // Function
}
```

#### BookingContext
```javascript
{
  package,                       // Current package
  cart,                          // Cart items
  addHallToPackage(hall),       // Add hall
  addDecorationToPackage(dec),  // Add decoration
  addFoodToPackage(food),       // Add food
  addServiceToPackage(service), // Add service
  removeFromPackage(type, id),  // Remove item
  updatePackageDate(date),      // Set date
  updateGuestCount(count),      // Set count
  clearPackage()                // Clear all
}
```

## 💾 Backend Models

### User
- id, name, email, phone, is_staff, is_active

### Event
- id, name, description, image, is_active

### FunctionHall
- id, event, name, location, capacity, description, price, image

### Decoration
- id, event, name, description, decoration_type, amount, image

### FoodItem
- id, event, name, description, food_type (veg/non_veg), price, image

### Service
- id, event, name, description, service_type, price, duration

### Booking
- id, user, event, event_date, guest_count, total_amount, advance_amount, status, payment_status, customer info

### Payment
- id, booking, amount, razorpay_order_id, razorpay_payment_id, status

## 🔐 Authentication Flow

1. User registers → Backend creates account
2. User logs in → Backend generates JWT tokens
3. Frontend stores tokens in localStorage
4. Axios interceptor adds token to requests
5. Backend validates token
6. On 401 → Redirect to login

## 💳 Payment Flow

1. User proceeds to checkout
2. Frontend creates payment order via backend
3. Backend initializes Razorpay order
4. User completes payment in Razorpay
5. Razorpay returns payment details
6. Frontend verifies payment with backend
7. Backend confirms booking and updates status

## 📊 Data Flow

```
User Registration
    ↓
Browse Events → Select Services (Hall, Food, Decoration, Services)
    ↓
Package Summary (Date + Guest Count)
    ↓
Checkout Form
    ↓
Razorpay Payment
    ↓
Booking Confirmation
    ↓
Email Sent to User
    ↓
Team Contacts User
    ↓
Track Booking Status
```

## 🧪 Testing

### Frontend
```bash
npm run dev      # Development server with HMR
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Backend
```bash
python manage.py runserver              # Dev server
python manage.py migrate                # Run migrations
python manage.py createsuperuser        # Create admin
python manage.py test                   # Run tests
```

## 🔑 API Endpoints Summary

### Authentication
```
POST   /api/auth/register/
POST   /api/auth/login/
POST   /api/auth/logout/
GET    /api/auth/user/
```

### Events & Services
```
GET    /api/events/
GET    /api/events/{id}/
GET    /api/function-halls/?event={id}
GET    /api/decorations/?event={id}
GET    /api/food-items/?event={id}
GET    /api/services/?event={id}
```

### Bookings & Payments
```
POST   /api/bookings/
GET    /api/bookings/
GET    /api/bookings/{id}/
POST   /api/payments/
POST   /api/payments/verify/
```

### Admin
```
GET    /api/admin/dashboard/
GET    /api/admin/bookings/
POST   /api/admin/venues/
POST   /api/admin/decorations/
POST   /api/admin/food/
POST   /api/admin/services/
```

## 🛠️ Environment Setup

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_RAZORPAY_KEY=rzp_test_xxxxx
VITE_ENV=development
```

### Backend (.env)
```env
DEBUG=True
SECRET_KEY=your_secret_key
DB_NAME=event_booking
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
RAZORPAY_KEY_ID=key_id
RAZORPAY_KEY_SECRET=key_secret
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ORIGINS=http://localhost:5173
```

## 🐛 Troubleshooting

### Frontend Errors
| Error | Solution |
|-------|----------|
| CORS error | Check CORS_ALLOWED_ORIGINS in Django settings |
| API 404 | Verify VITE_API_BASE_URL matches backend |
| Login failing | Ensure backend is running on port 8000 |
| Payment error | Check Razorpay keys in .env |

### Backend Errors
| Error | Solution |
|-------|----------|
| Database connection error | Verify PostgreSQL is running |
| Migration error | Delete migrations, run `python manage.py migrate` |
| CORS blocked | Add frontend URL to CORS_ALLOWED_ORIGINS |
| 401 Unauthorized | Check JWT tokens are valid |

## 📱 Responsive Design

- Mobile-first approach
- Tablet optimization
- Desktop support
- Touch-friendly UI
- Flexible CSS Grid/Flexbox

## 🔒 Security

- JWT token authentication
- CORS configuration
- Input validation
- SQL injection prevention
- XSS protection
- CSRF protection
- Password hashing

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy dist/ folder
```

### Backend (Heroku/Railway)
```bash
python manage.py collectstatic
# Deploy with Gunicorn
```

### Database (PostgreSQL Cloud)
- Use AWS RDS / Railway / Supabase
- Update DATABASE_URL in .env

## 📋 Checklist

- [ ] Frontend setup complete
- [ ] Backend setup complete
- [ ] Database configured
- [ ] Razorpay keys configured
- [ ] Environment variables set
- [ ] API endpoints tested
- [ ] Payment flow tested
- [ ] Admin panel working
- [ ] Email configuration done
- [ ] Deployed to production

## 📞 Support

For detailed information:
1. Check the documentation files
2. Review error messages
3. Check browser console
4. Check Django server logs

## 📄 License

MIT License - See LICENSE file

---

**Status**: Frontend Complete ✅ | Backend Ready 📝

**Version**: 1.0

**Last Updated**: May 13, 2026

### Quick Links
- 📖 [Setup Guide](./SETUP_GUIDE.md) - Start here!
- 🎨 [Frontend Guide](./FRONTEND_GUIDE.md)
- 🔧 [Backend Code](./BACKEND_CODE_GUIDE.md)
- 🔗 [Integration](./INTEGRATION_GUIDE.md)
