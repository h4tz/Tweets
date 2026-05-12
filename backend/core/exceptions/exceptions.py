from rest_framework import status
from rest_framework.exceptions import APIException


class CustomException(APIException):
    """Base custom exception."""
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'An error occurred.'
    default_code = 'error'


class AuthenticationFailed(CustomException):
    """Authentication failed exception."""
    status_code = status.HTTP_401_UNAUTHORIZED
    default_detail = 'Authentication credentials were not provided.'
    default_code = 'authentication_failed'


class InvalidToken(CustomException):
    """Invalid token exception."""
    status_code = status.HTTP_401_UNAUTHORIZED
    default_detail = 'Invalid token.'
    default_code = 'invalid_token'


class TokenExpired(CustomException):
    """Token expired exception."""
    status_code = status.HTTP_401_UNAUTHORIZED
    default_detail = 'Token has expired.'
    default_code = 'token_expired'


class UserNotFound(CustomException):
    """User not found exception."""
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = 'User not found.'
    default_code = 'user_not_found'


class EmailAlreadyExists(CustomException):
    """Email already exists exception."""
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Email already exists.'
    default_code = 'email_exists'


class InvalidCredentials(CustomException):
    """Invalid credentials exception."""
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Invalid credentials.'
    default_code = 'invalid_credentials'
