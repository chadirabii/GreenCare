from django.urls import path
from django.contrib import admin
from rest_framework_simplejwt.views import TokenRefreshView

from .swagger import schema_view
from authentication.views import *


urlpatterns = [
    path("admin/", admin.site.urls),       
    path('register/', register_view, name='register'),
    path('login/', login_view, name='login'),   
    path('me/', get_current_user, name='current-user'),
    
    # Refresh access token using refresh token
    # When access token expires, send refresh token here to get a new access token
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
        
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
]