# Event Booking Management System - Complete Setup Guide

## Project Overview

This is a comprehensive event booking management system with:
- **Frontend**: React/Vite with modern UI
- **Backend**: Django REST Framework
- **Database**: PostgreSQL
- **Payment**: Razorpay Integration
- **Authentication**: JWT Tokens

## Frontend Setup (Already Completed)

### Installed Files:
✅ Components for all pages  
✅ Context providers for auth & booking  
✅ API configuration with interceptors  
✅ Routing setup  
✅ Complete styling  
✅ Admin dashboard  

### To Run Frontend:
```bash
# Navigate to project
cd TrailEventManagement

# Install dependencies
npm install

# Create .env file (use .env.example as template)
cp .env.example .env

# Update .env with your configuration
# VITE_API_BASE_URL=http://localhost:8000/api
# VITE_RAZORPAY_KEY=your_key

# Start development server
npm run dev
```

## Backend Setup (Django)

### Step 1: Create Backend Project Structure

```bash
# Create backend directory
mkdir TrailEventBackend
cd TrailEventBackend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Django and dependencies
pip install django djangorestframework django-cors-headers python-decouple pillow razorpay psycopg2-binary

# Create Django project
django-admin startproject config .

# Create apps
python manage.py startapp users
python manage.py startapp events
python manage.py startapp bookings
python manage.py startapp payments
```

### Step 2: Database Setup

```bash
# Install PostgreSQL if not installed
# Then create database
createdb event_booking

# Update settings.py with database credentials
# See DATABASE_SETUP.md for details

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

### Step 3: File Structure

```
TrailEventBackend/
├── config/
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
├── users/
│   ├── models.py (User model)
│   ├── views.py (Auth views)
│   ├── urls.py
│   └── serializers.py
├── events/
│   ├── models.py (Event, FunctionHall, Decoration, Food, Service)
│   ├── views.py
│   ├── urls.py
│   └── serializers.py
├── bookings/
│   ├── models.py (Booking, BookingItem)
│   ├── views.py
│   ├── urls.py
│   └── serializers.py
├── payments/
│   ├── models.py (Payment)
│   ├── views.py
│   ├── urls.py
│   └── serializers.py
├── manage.py
└── requirements.txt
```

## Key Features Implementation

### 1. User Authentication
- User registration with email verification
- JWT token-based login
- Token refresh mechanism
- Password reset functionality

### 2. Event Management
- Event CRUD operations
- Multiple service types linked to events
- Image upload for events
- Availability management

### 3. Booking System
- Create bookings with multiple services
- Track booking status
- Automatic price calculation
- Booking confirmation emails

### 4. Payment Processing
- Razorpay integration
- Payment verification
- Advance payment handling (50%)
- Remaining payment tracking

### 5. Admin Features
- Dashboard with analytics
- Revenue tracking
- Booking management
- Service management
- User management

## Database Schema

### Users Table
```
- id (PK)
- name
- email (unique)
- phone
- password
- is_staff (admin flag)
- is_active
- created_at
- updated_at
```

### Events Table
```
- id (PK)
- name
- description
- image
- is_active
- created_at
```

### FunctionHalls Table
```
- id (PK)
- event (FK to Events)
- name
- location
- capacity
- description
- price
- image
- availability
- created_at
```

### Decorations Table
```
- id (PK)
- event (FK to Events)
- name
- description
- decoration_type
- amount
- image
- created_at
```

### Food Table
```
- id (PK)
- event (FK to Events)
- name
- description
- food_type (veg/non_veg)
- price
- image
- created_at
```

### Services Table
```
- id (PK)
- event (FK to Events)
- name
- description
- type (music/dance/etc)
- price
- duration
- created_at
```

### Bookings Table
```
- id (PK)
- user (FK to Users)
- event (FK to Events)
- event_date
- guest_count
- total_amount
- advance_amount
- status (pending/confirmed/cancelled)
- payment_status (unpaid/partial/paid)
- customer_name
- customer_email
- customer_phone
- customer_address
- notes
- created_at
- updated_at
```

### BookingItems Table
```
- id (PK)
- booking (FK to Bookings)
- item_type (hall/decoration/food/service)
- item_id
- amount
- created_at
```

### Payments Table
```
- id (PK)
- booking (FK to Bookings)
- amount
- razorpay_order_id
- razorpay_payment_id
- razorpay_signature
- status (pending/success/failed)
- payment_type (advance/full/remaining)
- created_at
- updated_at
```

## API Endpoints Summary

### Authentication
```
POST   /api/auth/register/        - Register new user
POST   /api/auth/login/           - Login user
POST   /api/auth/refresh/         - Refresh token
POST   /api/auth/logout/          - Logout user
GET    /api/auth/user/            - Get current user
```

### Events
```
GET    /api/events/               - List all events
GET    /api/events/{id}/          - Event details
```

### Services
```
GET    /api/function-halls/?event={id}  - Hall list for event
POST   /api/function-halls/             - Create hall (admin)
PUT    /api/function-halls/{id}/        - Update hall (admin)

GET    /api/decorations/?event={id}     - Decorations for event
GET    /api/food-items/?event={id}      - Food items for event
GET    /api/services/?event={id}        - Services for event
```

### Bookings
```
POST   /api/bookings/              - Create booking
GET    /api/bookings/              - Get user bookings
GET    /api/bookings/{id}/         - Get booking details
PUT    /api/bookings/{id}/         - Update booking
```

### Payments
```
POST   /api/payments/              - Create payment order
POST   /api/payments/verify/       - Verify payment
GET    /api/payments/{id}/         - Get payment details
```

### Admin
```
GET    /api/admin/dashboard/       - Dashboard stats
GET    /api/admin/bookings/        - All bookings
POST   /api/admin/venues/          - Manage venues
POST   /api/admin/decorations/     - Manage decorations
POST   /api/admin/food/            - Manage food
POST   /api/admin/services/        - Manage services
```

## Environment Variables (.env)

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:8000/api
VITE_RAZORPAY_KEY=your_razorpay_key
VITE_ENV=development
```

### Backend (.env)
```
DEBUG=True
SECRET_KEY=your_secret_key
DB_NAME=event_booking
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ORIGINS=http://localhost:5173
```

## Running the Application

### Terminal 1: Start Backend
```bash
cd TrailEventBackend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python manage.py runserver
```

### Terminal 2: Start Frontend
```bash
cd TrailEventManagement
npm run dev
```

### Access Points:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api
- **Admin Panel**: http://localhost:8000/admin

## Testing the System

### 1. User Registration
- Go to http://localhost:5173/register
- Fill in details
- Should receive confirmation

### 2. Event Browsing
- Login and go to home
- Click on event
- See all service options

### 3. Create Booking
- Select services
- Fill checkout form
- Make payment (test Razorpay)

### 4. Admin Dashboard
- Login as admin
- Go to /admin
- View analytics and manage content

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrated
- [ ] Static files collected
- [ ] CORS properly configured
- [ ] HTTPS enabled
- [ ] Razorpay production keys
- [ ] Email configured
- [ ] Logging setup
- [ ] Backup strategy
- [ ] Monitoring setup

## Support & Documentation

See individual guide files:
- `FRONTEND_GUIDE.md` - Frontend details
- `BACKEND_SETUP.md` - Backend details (to be created)
- `DATABASE_SETUP.md` - Database configuration (to be created)
- `API_DOCUMENTATION.md` - API reference (to be created)

## Common Issues & Solutions

See `TROUBLESHOOTING.md` (to be created)

---

**Last Updated**: 2026-05-13  
**Status**: Frontend Complete, Ready for Backend Integration
