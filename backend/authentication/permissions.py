
from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsFarmer(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'farmer'


class IsPlantOwner(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'plant_owner'


class IsSeller(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'seller'


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'
    

class IsSellerOrReadOnly(BasePermission):
    """
    Custom permission to only allow sellers to create/edit products.
    Everyone can read (GET, HEAD, OPTIONS).
    """

    def has_permission(self, request, view):
        # Allow read-only access for everyone
        if request.method in SAFE_METHODS:
            return True

        # Write permissions only for sellers
        return request.user and request.user.is_authenticated and request.user.role == 'seller'

    def has_object_permission(self, request, view, obj):
        # Read permissions for everyone
        if request.method in SAFE_METHODS:
            return True

        # Write permissions only for the owner
        return obj.owner == request.user


# To use them :
# @permission_classes([IsFarmer])
# def farmer_endpint():
#     pass