from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, OrderViewSet

router = DefaultRouter()
router.register(r'', ProductViewSet, basename='product')

order_router = DefaultRouter()
order_router.register(r'', OrderViewSet, basename='order')

urlpatterns = [
    path('orders/', include(order_router.urls)),
    path('', include(router.urls)),
]
