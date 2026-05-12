import os
from decouple import config

# Environment-specific settings configuration
DJANGO_SETTINGS_MODULE = os.environ.get('DJANGO_SETTINGS_MODULE', 'backend.settings')

# Determine which settings to use
ENV = config('ENVIRONMENT', default='local')

# Import the appropriate settings module
if ENV == 'production':
    from .production import *
else:
    from .local import *
