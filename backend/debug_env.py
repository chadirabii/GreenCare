import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Backend.settings')
import django
try:
    django.setup()
    from django.conf import settings
    print('DJANGO_SETTINGS_MODULE=', os.environ.get('DJANGO_SETTINGS_MODULE'))
    print('DEBUG=', settings.DEBUG)
    print('ALLOWED_HOSTS=', settings.ALLOWED_HOSTS)
except Exception as e:
    print('Error while setting up Django:', e)
