from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from ..models import Agenda
from core.serializers.AgendaSerializer import AgendaSerializer 

class AgendaViewSet(viewsets.ModelViewSet):
    serializer_class = AgendaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Optimización: Usamos select_related para reducir queries a la BD
        qs = Agenda.objects.select_related('profesional__usuario').all()

        if user.rol == "PROFESIONAL":
            return qs.filter(profesional__usuario=user)
        if user.rol == "PACIENTE":
            return Agenda.objects.none()
        return qs

