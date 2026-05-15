# Chat Backend - Phase 1: Authentication System

## Overview
This is Phase 1 of a scalable real-time chat backend project. This phase focuses on building a complete authentication system with a minimal frontend for testing purposes.

## Features Implemented

### Backend Features
- ✅ Custom User model with email-based authentication
- ✅ JWT-based authentication (login, register, refresh tokens)
- ✅ Environment-based configuration (local/production)
- ✅ PostgreSQL database setup
- ✅ Docker containerization
- ✅ API versioning (`/api/v1/`)
- ✅ Health check endpoint
- ✅ Global exception handling
- ✅ Clean response format
- ✅ Basic logging

### Frontend Features
- ✅ Minimal React application
- ✅ Login page with validation
- ✅ Register page with validation
- ✅ Dashboard page with user profile
- ✅ JWT token storage and management
- ✅ Protected routes
- ✅ Tailwind CSS styling
- ✅ Zustand for state management

## Project Structure
```
backend/
├── backend/
│   ├── settings.py          # Main settings
│   ├── urls.py             # Main URL configuration
│   ├── wsgi.py             # WSGI configuration
│   └── asgi.py             # ASGI configuration
├── apps/
│   └── users/
│       ├── models.py        # Custom User model
│       ├── serializers.py  # API serialization
│       ├── services.py     # Authentication service
│       ├── views.py        # DRF views
│       ├── api.py          # Ninja API endpoints
│       ├── urls.py         # User app URLs
│       └── apps.py         # Django app configuration
├── core/
│   ├── config/
│   │   ├── __init__.py     # Configuration loader
│   │   ├── base.py         # Base configuration
│   │   ├── local.py        # Local development
│   │   └── production.py   # Production settings
│   ├── auth/
│   │   ├── permissions.py  # Custom permissions
│   │   └── utils.py        # Authentication utilities
│   └── exceptions/
│       ├── exceptions.py   # Custom exceptions
│       └── serializers.py  # Error serialization
├── services/               # Future service modules
├── tests/                  # Test files
├── manage.py               # Django management script
├── requirements.txt        # Python dependencies
├── Dockerfile              # Docker configuration
├── docker-compose.yml      # Docker Compose configuration
└── .env.example            # Environment variables example

frontend/
├── package.json           # Node.js dependencies
├── src/
│   ├── App.jsx            # Main app component
│   ├── main.jsx           # Entry point
│   ├── index.css          # Global styles
│   ├── store/
│   │   └── authStore.js   # Authentication state
│   └── pages/
│       ├── LoginPage.jsx  # Login form
│       ├── RegisterPage.jsx # Registration form
│       └── DashboardPage.jsx # User dashboard
└── ...                    # Vite configuration files
```

## Quick Start

### Backend Setup

1. **Install dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Database setup** (for development)
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   ```

4. **Run the backend**
   ```bash
   python manage.py runserver
   # Backend will be available at http://localhost:8000
   ```

### Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Run the frontend**
   ```bash
   npm run dev
   # Frontend will be available at http://localhost:5173
   ```

### Docker Setup

1. **Build and run with Docker Compose**
   ```bash
   cd backend
   docker-compose up --build
   ```

## API Endpoints

### Authentication Endpoints

- `POST /api/v1/auth/register/` - Register new user
- `POST /api/v1/auth/login/` - Login user
- `POST /api/v1/auth/profile/` - Get user profile (requires auth)
- `GET /api/v1/health/` - Health check

### Example Requests

#### Register User
```bash
curl -X POST http://localhost:8000/api/v1/auth/register/ \
     -H "Content-Type: application/json" \
     -d '{
       "username": "testuser",
       "email": "test@example.com",
       "password": "password123",
       "first_name": "Test",
       "last_name": "User"
     }'
```

#### Login User
```bash
curl -X POST http://localhost:8000/api/v1/auth/login/ \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "password123"
     }'
```

#### Get Profile (with authentication)
```bash
TOKEN="your_jwt_token_here"
curl -X GET http://localhost:8000/api/v1/auth/profile/ \
     -H "Authorization: Bearer $TOKEN"
```

## Configuration

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Security
SECRET_KEY=your-secret-key-here-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (for development)
DB_ENGINE=django.db.backends.sqlite3
DB_NAME=chat_backend
DB_USER=
DB_PASSWORD=
DB_HOST=
DB_PORT=

# For production with PostgreSQL:
# DB_ENGINE=django.db.backends.postgresql
# DB_NAME=your_db_name
# DB_USER=your_db_user
# DB_PASSWORD=your_db_password
# DB_HOST=localhost
# DB_PORT=5432

# Environment
ENVIRONMENT=local
```

### Database Configuration

- **Development**: SQLite (default)
- **Production**: PostgreSQL

## Testing

### Backend Testing
```bash
cd backend
python manage.py test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## Architecture Decisions

### Why This Structure?
1. **Clean Separation**: Separated concerns across apps, core, and services
2. **Environment Flexibility**: Different configs for development/production
3. **Service Layer**: Business logic separated from views
4. **Authentication**: JWT-based with refresh tokens
5. **Frontend**: Minimal implementation for testing backend functionality

### Why These Technologies?
- **Django Ninja**: Clean API serialization
- **Django REST Framework**: Robust authentication and permissions
- **PostgreSQL**: Production-ready database
- **React + Vite**: Fast frontend development
- **Zustand**: Lightweight state management
- **Docker**: Easy deployment and development

## Next Steps (Phase 2)

Phase 2 should implement:
1. Chat models and database schema
2. WebSocket implementation (Django Channels)
3. Message storage and retrieval
4. Real-time message delivery
5. User presence indicators

## Documentation

- `what_i_learned.md` - Technical learning summary
- `why_i_did.md` - Architectural decisions rationale
- `authentication_flow.md` - Authentication flow diagram
- `backend_architecture.md` - Backend architecture diagram

## Contributing

This is a learning project. Feel free to explore and experiment with the codebase.

## License

This project is for educational purposes.