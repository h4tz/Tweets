from ninja import Router
from ninja.errors import ValidationError as NinjaValidationError
from ninja.responses import Response
from ninja.security import HttpBearer
from typing import Optional

from .serializers import (
    UserSchema,
    UserRegistrationSchema,
    UserLoginSchema,
    TokenSchema,
    RefreshTokenSchema
)
from .services import AuthService
from core.auth.utils import generate_tokens

router = Router()
auth_scheme = HttpBearer()

@router.post('/register', response={201: UserSchema, 400: dict})
def register_user(request, data: UserRegistrationSchema):
    """Register a new user."""
    try:
        user = AuthService.register_user(data.dict())
        return user
    except NinjaValidationError as e:
        return Response(e.detail, status=400)

@router.post('/login', response={200: TokenSchema, 401: dict})
def login_user(request, data: UserLoginSchema):
    """Login user and return JWT tokens."""
    try:
        user = AuthService.authenticate_user(data.email, data.password)
        tokens = generate_tokens(user)
        return tokens
    except Exception as e:
        return Response({'detail': str(e)}, status=401)

@router.post('/refresh', response={200: TokenSchema, 401: dict})
def refresh_token(request, data: RefreshTokenSchema):
    """Refresh access token using refresh token."""
    try:
        tokens = AuthService.refresh_tokens(data.refresh_token)
        return tokens
    except Exception as e:
        return Response({'detail': str(e)}, status=401)

@router.get('/profile', response={200: UserSchema, 401: dict}, auth=auth_scheme)
def get_profile(request):
    """Get authenticated user profile."""
    try:
        user = AuthService.get_user_profile(request.user.id)
        return user
    except Exception as e:
        return Response({'detail': str(e)}, status=401)
