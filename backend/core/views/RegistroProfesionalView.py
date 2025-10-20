from rest_framework import generics
from ..models import Profesional
from core.serializers.ProfesionalSerializer import RegistroProfesionalSerializer
from core.views.IsAdmin import IsAdmin

class RegistroProfesionalView(generics.CreateAPIView):
    queryset = Profesional.objects.all()
    serializer_class = RegistroProfesionalSerializer
    permission_classes = [IsAdmin]  # solo ADMIN
