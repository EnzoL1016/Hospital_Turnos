from rest_framework import generics
from ..models import Paciente
from core.serializers.PacienteSerializer import RegistroPacienteSerializer
from rest_framework.permissions import AllowAny

class RegistroPacienteView(generics.CreateAPIView):
    queryset = Paciente.objects.all()
    serializer_class = RegistroPacienteSerializer
    permission_classes = [AllowAny]
