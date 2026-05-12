from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.db import transaction
from ninja.errors import ValidationError as NinjaValidationError

from core.auth.utils import generate_tokens
from core.exceptions.exceptions import (
    EmailAlreadyExists,
    InvalidCredentials,
    UserNotFound
)

User = get_user_model()


class AuthService:
    """Service for authentication operations."""
    
    @staticmethod
    def register_user(data):
        """Register a new user."""
        try:
            with transaction.atomic():
                # Validate email
                validate_email(data['email'])
                
                # Check if email already exists
                if User.objects.filter(email=data['email']).exists():
                    raise EmailAlreadyExists()
                
                # Check if username already exists
                if User.objects.filter(username=data['username']).exists():
                    raise NinjaValidationError({'username': 'Username already exists'})
                
                # Create user
                user = User.objects.create_user(
                    username=data['username'],
                    email=data['email'],
                    password=data['password'],
                    first_name=data.get('first_name', ''),
                    last_name=data.get('last_name', ''),
                )
                
                return user
        except ValidationError:
            raise NinjaValidationError({'email': 'Invalid email format'})
        except Exception as e:
            raise NinjaValidationError({'detail': str(e)})
    
    @staticmethod
    def authenticate_user(email, password):
        """Authenticate user with email and password."""
        try:
            user = User.objects.get(email=email)
            if user.check_password(password):
                return user
            else:
                raise InvalidCredentials()
        except User.DoesNotExist:
            raise UserNotFound()
    
    @staticmethod
    def refresh_tokens(refresh_token):
        """Refresh access token using refresh token."""
        from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
        from rest_framework_simplejwt.tokens import RefreshToken
        
        try:
            token = RefreshToken(refresh_token)
            access_token = str(token.access_token)
            refresh_token = str(token)
            return {
                'access_token': access_token,
                'refresh_token': refresh_token,
                'token_type': 'Bearer'
            }
        except (InvalidToken, TokenError):
            from core.exceptions.exceptions import InvalidToken
            raise InvalidToken()
    
    @staticmethod
    def get_user_profile(user_id):
        """Get user profile by ID."""
        try:
            user = User.objects.get(id=user_id)
            return user
        except User.DoesNotExist:
            raise UserNotFound()
