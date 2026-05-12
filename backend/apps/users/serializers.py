from ninja import Schema
from typing import Optional
from datetime import datetime


class UserSchema(Schema):
    """Schema for user data."""
    id: int
    username: str
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class UserRegistrationSchema(Schema):
    """Schema for user registration."""
    username: str
    email: str
    password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class UserLoginSchema(Schema):
    """Schema for user login."""
    email: str
    password: str


class TokenSchema(Schema):
    """Schema for JWT tokens."""
    access_token: str
    refresh_token: str
    token_type: str


class RefreshTokenSchema(Schema):
    """Schema for refresh token request."""
    refresh_token: str
