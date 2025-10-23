from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from ..models import Inasistencia, Paciente
from core.serializers.InasistenciaSerializer import InasistenciaSerializer

class InasistenciaViewSet(viewsets.ModelViewSet):
    queryset = Inasistencia.objects.all().order_by("-turno__fecha", "-turno__hora_inicio")
    serializer_class = InasistenciaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        
        if hasattr(user, 'rol'):
            if user.rol == "PACIENTE":
                return qs.filter(paciente__usuario=user)
            
            elif user.rol == "PROFESIONAL":
                qs = qs.filter(
                    Q(turno__profesional__usuario=user) |
                    Q(turno__agenda__profesional__usuario=user)
                ).distinct()
                qs = qs.filter(justificacion__isnull=False)
                return qs

            elif user.rol == "ADMIN":
                return qs
        
        return Inasistencia.objects.none()

    @action(detail=False, methods=['get'], url_path='mis-inasistencias')
    def mis_inasistencias(self, request):
        user = request.user
        if not hasattr(user, 'rol') or user.rol != "PACIENTE":
             return Response({"detail": "Acceso denegado."}, status=status.HTTP_403_FORBIDDEN)
        try:
            paciente = Paciente.objects.get(usuario=user)
            queryset = Inasistencia.objects.filter(paciente=paciente).order_by('-turno__fecha', '-turno__hora_inicio')
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Paciente.DoesNotExist:
            return Response({"detail": "No se encontró un perfil de paciente para este usuario."}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["post"], url_path="justificar")
    def justificar(self, request, pk=None):
        inasistencia = self.get_object()
        user = request.user
        if user.rol != "PACIENTE":
            return Response({"detail": "Solo los pacientes pueden justificar sus inasistencias."}, status=status.HTTP_403_FORBIDDEN)
        if inasistencia.paciente.usuario != user:
            return Response({"detail": "No puedes justificar inasistencias de otros pacientes."}, status=status.HTTP_403_FORBIDDEN)
        
        justificacion = request.data.get("justificacion", "").strip()
        if not justificacion:
            return Response({"detail": "Debes proporcionar una justificación."}, status=status.HTTP_400_BAD_REQUEST)
        
        inasistencia.justificacion = justificacion
        inasistencia.estado_justificacion = "PENDIENTE" 
        inasistencia.save()
        
        serializer = self.get_serializer(inasistencia)
        return Response({"detail": "Justificación enviada correctamente", "inasistencia": serializer.data}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["patch"], url_path="evaluar")
    def evaluar(self, request, pk=None):
        inasistencia = self.get_object()
        user = request.user
        if user.rol != "PROFESIONAL":
            return Response({"detail": "Solo los profesionales pueden evaluar."}, status=status.HTTP_403_FORBIDDEN)

        action = request.data.get("action")
        if action == "APROBAR":
            inasistencia.estado_justificacion = "JUSTIFICADA"
        elif action == "RECHAZAR":
            inasistencia.estado_justificacion = "INJUSTIFICADA"
        else:
            return Response({"detail": "Acción no válida."}, status=status.HTTP_400_BAD_REQUEST)
        
        inasistencia.save()
        return Response({"detail": "Inasistencia evaluada correctamente."}, status=status.HTTP_200_OK)
