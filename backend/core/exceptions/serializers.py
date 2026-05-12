from rest_framework import serializers
from .exceptions import CustomException


class ErrorDetailSerializer(serializers.Serializer):
    """Serializer for error details."""
    detail = serializers.CharField()
    code = serializers.CharField()


class ExceptionResponseSerializer(serializers.Serializer):
    """Serializer for exception responses."""
    error = ErrorDetailSerializer()


class ValidationErrorSerializer(serializers.Serializer):
    """Serializer for validation errors."""
    detail = serializers.ListField(child=serializers.CharField())
    code = serializers.CharField()
