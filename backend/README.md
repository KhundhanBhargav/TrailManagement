# Django Backend for TrailEventManagement

This backend implements the API layer for the TrailEventManagement frontend using Django and Django REST Framework.

## What is included

- Django project with a `events` app
- Custom user model for email-based authentication
- JWT authentication with login, refresh, logout, and user info
- API endpoints for events, function halls, decorations, food items, services, bookings, payments, and admin statistics
- CORS support for frontend development

## Getting Started

1. Create a Python virtual environment and activate it.
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Configure environment variables in a `.env` file or set them directly:

```env
DJANGO_SECRET_KEY=your-secret-key
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

4. Run migrations:

```bash
python manage.py migrate
```

5. Create a superuser (optional):

```bash
python manage.py createsuperuser
```

6. Start the development server:

```bash
python manage.py runserver 8000
```

The frontend should connect to the backend at `http://localhost:8000/api`.
