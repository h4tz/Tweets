from django.contrib import admin
from django.urls import path, include
from apps.users.views import health_check

# API versioning
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/health/', health_check, name='health-check'),
    path('api/v1/auth/', include('apps.users.urls')),
]
