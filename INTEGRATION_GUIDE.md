# Integration Guide - Frontend & Backend

## Overview
This guide shows how the React frontend integrates with the Django backend API.

## Architecture Flow

```
React Component
    ↓
useAuth/useBooking Context
    ↓
Axios API Call (with interceptors)
    ↓
Django API Endpoint
    ↓
Database Operations
    ↓
JSON Response
    ↓
Update React State
    ↓
UI Re-render
```

## Data Flow Examples

### 1. User Registration Flow

**Frontend (React)**
```javascript
// components/Register.jsx
const { register } = useAuth();

const handleSubmit = async (e) => {
  const response = await register({
    name: formData.name,
    email: formData.email,
    phone: formData.phone,
    password: formData.password,
  });
  // Navigate to login
};
```

**Backend (Django)**
```
POST /api/auth/register/

Request Body:
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "securepass123"
}

Response:
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210"
  },
  "message": "User registered successfully"
}
```

### 2. Event Browsing Flow

**Frontend**
```javascript
// components/EventCard.jsx
useEffect(() => {
  const fetchEvents = async () => {
    const response = await api.get(EVENT_ENDPOINTS.LIST);
    setEvents(response.data);
  };
  fetchEvents();
}, []);
```

**Backend**
```
GET /api/events/

Response:
[
  {
    "id": 1,
    "name": "Wedding",
    "description": "Grand wedding events",
    "image": "url_to_image",
    "is_active": true
  },
  {
    "id": 2,
    "name": "Corporate Event",
    "description": "Business conferences and meetings",
    "image": "url_to_image",
    "is_active": true
  }
]
```

### 3. Booking Creation Flow

**Frontend**
```javascript
// components/Checkout.jsx
const handleBooking = async (e) => {
  const bookingPayload = {
    event_date: pkg.eventDate,
    guest_count: pkg.guestCount,
    total_amount: pkg.totalAmount,
    advance_amount: advanceAmount,
    function_hall: pkg.functionHall.id,
    decorations: pkg.decorations.map(d => d.id),
    food_items: pkg.food.map(f => f.id),
    services: pkg.services.map(s => s.id),
    customer_name: bookingData.name,
    customer_email: bookingData.email,
    customer_phone: bookingData.phone,
    customer_address: bookingData.address,
    notes: bookingData.notes,
  };
  
  const response = await api.post(BOOKING_ENDPOINTS.CREATE, bookingPayload);
};
```

**Backend**
```
POST /api/bookings/

Request Body:
{
  "event_date": "2026-06-15",
  "guest_count": 150,
  "total_amount": 50000,
  "advance_amount": 25000,
  "function_hall": 1,
  "decorations": [1, 2],
  "food_items": [3, 4, 5],
  "services": [1, 2],
  "customer_name": "Raj Kumar",
  "customer_email": "raj@example.com",
  "customer_phone": "9876543210",
  "customer_address": "123 Main St, City",
  "notes": "Vegetarian menu preferred"
}

Response:
{
  "id": 101,
  "user": 1,
  "event": 1,
  "event_date": "2026-06-15",
  "guest_count": 150,
  "total_amount": "50000.00",
  "advance_amount": "25000.00",
  "status": "pending",
  "payment_status": "unpaid",
  "customer_name": "Raj Kumar",
  "customer_email": "raj@example.com",
  "customer_phone": "9876543210",
  "customer_address": "123 Main St, City",
  "items": []
}
```

### 4. Payment Processing Flow

**Frontend**
```javascript
// components/Checkout.jsx
const handlePayment = async (bookingId) => {
  // Create payment order
  const paymentResponse = await api.post(PAYMENT_ENDPOINTS.CREATE, {
    booking_id: bookingId,
    amount: advanceAmount,
    payment_type: 'advance',
  });
  
  // Initialize Razorpay
  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY,
    amount: advanceAmount * 100,
    order_id: paymentResponse.data.razorpay_order_id,
    handler: async (response) => {
      // Verify payment
      await api.post(PAYMENT_ENDPOINTS.VERIFY, {
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        booking_id: bookingId,
      });
    }
  };
  new window.Razorpay(options).open();
};
```

**Backend**
```
POST /api/payments/

Request Body:
{
  "booking_id": 101,
  "amount": 25000,
  "payment_type": "advance"
}

Response:
{
  "razorpay_order_id": "order_12345abc",
  "amount": 25000,
  "currency": "INR"
}

---

POST /api/payments/verify/

Request Body:
{
  "razorpay_order_id": "order_12345abc",
  "razorpay_payment_id": "pay_xyz789",
  "razorpay_signature": "sig_encrypted",
  "booking_id": 101
}

Response:
{
  "success": true,
  "message": "Payment verified"
}
```

## API Authentication

### JWT Token Flow

1. **Login Request**
   ```
   POST /api/auth/login/
   {
     "email": "user@example.com",
     "password": "password"
   }
   ```

2. **Receive Tokens**
   ```
   {
     "access": "eyJ0eXAiOiJKV1QiLC...",
     "refresh": "eyJ0eXAiOiJKV1QiLC...",
     "user": { ... }
   }
   ```

3. **Store in Frontend**
   ```javascript
   localStorage.setItem('access_token', access);
   localStorage.setItem('refresh_token', refresh);
   ```

4. **Use in Requests**
   ```javascript
   // Automatically added by axios interceptor
   Authorization: Bearer eyJ0eXAiOiJKV1QiLC...
   ```

5. **Handle Expired Token**
   - If 401 response: Redirect to login
   - Clear tokens and re-authenticate

## State Management Flow

### AuthContext
```
User Input (Login Form)
    ↓
useAuth.login()
    ↓
API Call: POST /auth/login/
    ↓
Save Tokens & User
    ↓
Update AuthContext State
    ↓
Component Re-renders
    ↓
Navbar shows username & logout button
```

### BookingContext
```
User Selects Service (Hall/Decoration/Food/Service)
    ↓
addHallToPackage() / addDecorationToPackage() etc.
    ↓
Update BookingContext State
    ↓
PackageSummary Re-renders
    ↓
Show Updated Total Amount
    ↓
User Proceeds to Checkout
```

## Error Handling

### Frontend
```javascript
try {
  const response = await api.post(endpoint, data);
  // Success
} catch (error) {
  if (error.response?.status === 401) {
    // Unauthorized - redirect to login
  } else if (error.response?.status === 400) {
    // Validation error
    setErrors(error.response.data);
  } else {
    // Other errors
    setError('Operation failed');
  }
}
```

### Backend
```python
# Views return appropriate status codes
HTTP 200 - Success
HTTP 201 - Created
HTTP 400 - Bad Request
HTTP 401 - Unauthorized
HTTP 403 - Forbidden
HTTP 404 - Not Found
HTTP 500 - Server Error
```

## API Response Standards

### Success Response
```json
{
  "data": { ... },
  "message": "Operation successful",
  "status": 200
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": { ... },
  "status": 400
}
```

## CORS Configuration

**Django settings.py**
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",      # Vite dev server
    "http://127.0.0.1:5173",
    "http://yourdomain.com",      # Production domain
]
```

## Environment Variables

**Frontend (.env)**
```
VITE_API_BASE_URL=http://localhost:8000/api
VITE_RAZORPAY_KEY=rzp_test_xxxxxx
```

**Backend (.env)**
```
DEBUG=True
SECRET_KEY=django_secret_key
DB_NAME=event_booking
DB_USER=postgres
DB_PASSWORD=password
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxxxxx
```

## Testing the Integration

### 1. Start Backend
```bash
cd TrailEventBackend
source venv/bin/activate
python manage.py runserver
```

### 2. Start Frontend
```bash
cd TrailEventManagement
npm run dev
```

### 3. Test Endpoints
```bash
# Test API
curl http://localhost:8000/api/events/

# Check CORS
curl -H "Origin: http://localhost:5173" http://localhost:8000/api/events/
```

### 4. Test User Flow
1. Visit http://localhost:5173
2. Register new account
3. Login with credentials
4. Browse events
5. Create booking
6. Test payment (use Razorpay test credentials)

## Deployment Considerations

### Frontend
```bash
npm run build
# Deploy dist/ folder to CDN or static server
```

### Backend
```bash
python manage.py collectstatic
python manage.py migrate
gunicorn config.wsgi:application
```

### Database
- Use PostgreSQL in production
- Regular backups
- Connection pooling

### Security
- Use HTTPS
- Set CORS properly
- Validate all inputs
- Use environment variables
- Regular security audits

## Troubleshooting

### CORS Errors
```
Access to XMLHttpRequest has been blocked by CORS policy
```
Solution: Check CORS_ALLOWED_ORIGINS in Django settings

### 401 Unauthorized
```
Token might be expired or invalid
```
Solution: Check if token is properly stored and included in request header

### API Not Found (404)
```
POST /api/auth/login/ 404 Not Found
```
Solution: Check URL patterns in Django urls.py

### Database Connection Error
```
ConnectionError: could not connect to server
```
Solution: Ensure PostgreSQL is running and credentials are correct

---

## Next Steps

1. ✅ Frontend setup complete
2. ⏳ Backend setup (use BACKEND_CODE_GUIDE.md)
3. ⏳ Database setup
4. ⏳ Razorpay configuration
5. ⏳ Email configuration
6. ⏳ Deployment

See DEPLOYMENT_GUIDE.md for production setup.
