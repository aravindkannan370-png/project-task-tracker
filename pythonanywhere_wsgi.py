import os
import sys

# Add your project to the path
path = '/home/yourusername/movie-recommender'  # REPLACE "yourusername" with your PythonAnywhere username
if path not in sys.path:
    sys.path.append(path)

# Set up Django settings module
os.environ['DJANGO_SETTINGS_MODULE'] = 'movie_recommender.settings'

# Get WSGI application
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
