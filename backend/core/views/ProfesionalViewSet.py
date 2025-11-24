from rest_framework import viewsets, status
from rest_framework.response import Response
from ..models import Profesional
from core.serializers.ProfesionalSerializer import ProfesionalSerializer
from rest_framework.permissions import IsAuthenticated

class ProfesionalViewSet(viewsets.ModelViewSet):

    queryset = Profesional.objects.select_related('usuario').all()
    serializer_class = ProfesionalSerializer

    permission_classes = [IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        profesional = self.get_object()
        user = profesional.usuario
        
        if user:
            user.delete()
      
        return Response(status=status.HTTP_204_NO_CONTENT)
