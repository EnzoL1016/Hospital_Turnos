from rest_framework import generics
from ..models import Inasistencia
from core.serializers.InasistenciaActionSerializers import JustificarInasistenciaSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

class JustificarInasistenciaView(generics.UpdateAPIView):
    queryset = Inasistencia.objects.all()
    serializer_class = JustificarInasistenciaSerializer
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        inasistencia = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        inasistencia.justificacion = serializer.validated_data["justificacion"]
        inasistencia.estado_justificacion = "PENDIENTE"
        inasistencia.save()
        return Response({"status": "Justificación enviada"})
