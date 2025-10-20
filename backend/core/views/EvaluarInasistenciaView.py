from rest_framework import generics, status
from ..models import Inasistencia
from core.serializers.InasistenciaActionSerializers import EvaluarInasistenciaSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

class EvaluarInasistenciaView(generics.UpdateAPIView):
    queryset = Inasistencia.objects.all()
    serializer_class = EvaluarInasistenciaSerializer
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        inasistencia = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        action = serializer.validated_data["action"]
        nota = serializer.validated_data.get("nota", "")
        if action == "APROBAR":
            inasistencia.estado_justificacion = "JUSTIFICADA"
        else:
            inasistencia.estado_justificacion = "INJUSTIFICADA"
        if nota:
            inasistencia.justificacion = f"{inasistencia.justificacion or ''}\n\nNota del profesional: {nota}"
        inasistencia.save()
        return Response({"status": f"Inasistencia {inasistencia.estado_justificacion.lower()}"}, status=status.HTTP_200_OK)
