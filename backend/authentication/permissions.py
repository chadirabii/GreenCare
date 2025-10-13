
from rest_framework.permissions import BasePermission


class IsFarmer(BasePermission):
    def has_permission(self, request, view):
        return request.user.groups.filter(name = 'farmer').exists()
    
class IsHousePlantOwner(BasePermission):
    def has_permission(self, request, view):
        return request.user.groups.filter(name='house_plant_owner').exists()

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.groups.filter(name='admin').exists()
    

# To use them :
# @permission_classes([IsFarmer])
# def farmer_endpint():
#     pass