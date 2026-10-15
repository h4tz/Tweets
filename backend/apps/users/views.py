from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .services import AuthService
from core.auth.utils import generate_tokens
from core.exceptions.exceptions import CustomException
import logging

logger = logging.getLogger(__name__)


@api_view(['POST'])
def health_check(request):
    """Health check endpoint."""
    return Response({
        'status': 'healthy',
        'message': 'Backend is running',
    })


@api_view(['POST'])
def register(request):
    """Register a new user."""
    try:
        data = request.data
        user = AuthService.register_user(data)
        tokens = generate_tokens(user)
        return Response({
            'message': 'User registered successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            },
            'tokens': tokens
        }, status=status.HTTP_201_CREATED)
    except CustomException as e:
        return Response({
            'error': {
                'detail': e.default_detail,
                'code': e.default_code
            }
        }, status=e.status_code)
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        return Response({
            'error': {
                'detail': 'An unexpected error occurred',
                'code': 'internal_error'
            }
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def login(request):
    """Login user."""
    try:
        data = request.data
        user = AuthService.authenticate_user(data.get('email'), data.get('password'))
        tokens = generate_tokens(user)
        return Response({
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            },
            'tokens': tokens
        })
    except CustomException as e:
        return Response({
            'error': {
                'detail': e.default_detail,
                'code': e.default_code
            }
        }, status=e.status_code)
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return Response({
            'error': {
                'detail': 'An unexpected error occurred',
                'code': 'internal_error'
            }
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def profile(request):
    """Get user profile."""
    try:
        user = AuthService.get_user_profile(request.user.id)
        return Response({
            'message': 'Profile retrieved successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_active': user.is_active,
                'created_at': user.created_at.isoformat(),
                'updated_at': user.updated_at.isoformat()
            }
        })
    except CustomException as e:
        return Response({
            'error': {
                'detail': e.default_detail,
                'code': e.default_code
            }
        }, status=e.status_code)
    except Exception as e:
        logger.error(f"Profile error: {str(e)}")
        return Response({
            'error': {
                'detail': 'An unexpected error occurred',
                'code': 'internal_error'
            }
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
