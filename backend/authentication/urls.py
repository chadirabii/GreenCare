from django.urls import path, include
from .swagger import schema_view

from django.contrib import admin
from authentication.views import *

urlpatterns = [
    path("admin/", admin.site.urls),       
    path('register/', register_view, name='register'),
    path('login/', login_view, name='login'),   
    path('logout/', logout_view, name='logout'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
]