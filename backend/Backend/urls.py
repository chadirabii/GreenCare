"""
URL configuration for Backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path
from django.conf.urls.static import static
import authentication
from django.conf import settings




urlpatterns = [
    path('api/auth/', include('authentication.urls')),
    path('api/plants/', include('plants.urls')),
    path('api/products/', include('products.urls')),
    path('api/watering/', include('plant_watering.urls')),
]

# Conditionally include predict URLs only if TensorFlow is available
# This allows CI/CD to run tests without TensorFlow dependency
try:
    import tensorflow
    urlpatterns.append(path('api/predict/', include('predict.urls')))
except ImportError:
    # TensorFlow not available - skip predict URLs
    # This is expected in CI/CD environments
    pass

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Prometheus metrics endpoint
urlpatterns.append(path('', include('django_prometheus.urls')))

