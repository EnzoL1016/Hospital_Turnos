from rest_framework.permissions import BasePermission

class IsAdmin(BasePermission):
    """
    Permite acceso solo a usuarios con rol ADMIN.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.rol == 'ADMIN'
