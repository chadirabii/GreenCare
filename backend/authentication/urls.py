from django.urls import path
from django.contrib import admin
from rest_framework_simplejwt.views import TokenRefreshView

from .swagger import schema_view
from authentication.views import *

urlpatterns = [
    path("admin/", admin.site.urls),
    path('register/', register_view, name='register'),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('me/', get_current_user, name='current-user'),
    path('forgot-password/', forgot_password, name='forgot-password'),
    path('reset-password/', reset_password, name='reset-password'),
    
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    
    path('swagger/', schema_view.with_ui('swagger',
         cache_timeout=0), name='schema-swagger-ui'),
]
