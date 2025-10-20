from rest_framework import viewsets
from ..models import Paciente
from core.serializers.PacienteSerializer import PacienteSerializer
from rest_framework.permissions import IsAuthenticated

class PacienteViewSet(viewsets.ModelViewSet):
    queryset = Paciente.objects.all()
    serializer_class = PacienteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Solo superuser o rol ADMIN pueden listar pacientes
        if user.is_superuser or getattr(user, "rol", None) == "ADMIN":
            return Paciente.objects.all()
        # Los demás solo ven su propio paciente
        return Paciente.objects.filter(usuario=user)
