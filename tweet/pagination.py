from rest_framework.pagination import CursorPagination

class CustomCursorPagination(CursorPagination):
    """
    Custom cursor pagination class to enforce a consistent ordering.
    """
    page_size = 20
    ordering = '-created_at'
