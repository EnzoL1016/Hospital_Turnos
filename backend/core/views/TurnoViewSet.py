from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from django.utils.timezone import now
from ..models import Turno, Paciente, Inasistencia
from core.serializers.TurnoSerializer import TurnoSerializer
from rest_framework.pagination import PageNumberPagination

class DefaultPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class TurnoViewSet(viewsets.ModelViewSet):
    queryset = Turno.objects.all()
    serializer_class = TurnoSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = DefaultPagination

    def get_queryset(self):
        # ... (Este método se mantiene igual, su orden ascendente es correcto para buscar turnos disponibles)
        user = self.request.user
        hoy = now().date()
        qs = Turno.objects.filter(fecha__gte=hoy)
        if getattr(user, "rol", None) == "PROFESIONAL":
            qs = qs.filter(agenda__profesional__usuario=user)
        elif getattr(user, "rol", None) == "PACIENTE":
            try:
                paciente = Paciente.objects.get(usuario=user)
            except Paciente.DoesNotExist:
                return Turno.objects.none()
            qs = qs.filter(
                Q(estado="DISPONIBLE", paciente__isnull=True) |
                Q(estado="RESERVADO", paciente=paciente)
            )
        agenda_id = self.request.query_params.get("agenda")
        profesional_id = self.request.query_params.get("profesional")
        estado = self.request.query_params.get("estado")
        if profesional_id:
            qs = qs.filter(agenda__profesional_id=profesional_id)
            if getattr(user, "rol", None) == "PACIENTE":
                qs = qs.filter(estado="DISPONIBLE", paciente__isnull=True)
        if agenda_id:
            qs = qs.filter(agenda_id=agenda_id)
            if getattr(user, "rol", None) == "PACIENTE":
                qs = qs.filter(estado="DISPONIBLE", paciente__isnull=True)
        if estado:
            qs = qs.filter(estado=estado)
        return qs.order_by("fecha", "hora_inicio")

    @action(detail=False, methods=["get"], url_path=r"por-agenda/(?P<agenda_id>[^/.]+)")
    def por_agenda(self, request, agenda_id=None):
        # ... (Este método también se mantiene igual, el orden ascendente es correcto para la agenda del profesional)
        user = request.user
        hoy = now().date()
        if getattr(user, "rol", None) == "PROFESIONAL" or getattr(user, "rol", None) == "ADMIN":
            qs = Turno.objects.filter(agenda_id=agenda_id, fecha__gte=hoy).order_by("fecha", "hora_inicio")
        else:
            qs = Turno.objects.filter(agenda_id=agenda_id, fecha__gte=hoy, estado="DISPONIBLE", paciente__isnull=True).order_by("fecha", "hora_inicio")
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def cancelar(self, request, pk=None):
        # ... (Sin cambios aquí)
        turno = self.get_object()
        user = request.user
        if getattr(user, "rol", None) != "PACIENTE":
            return Response({"detail": "Solo los pacientes pueden cancelar turnos."}, status=status.HTTP_403_FORBIDDEN)
        try:
            paciente = Paciente.objects.get(usuario=user)
        except Paciente.DoesNotExist:
            return Response({"detail": "El usuario no está asociado a un paciente."}, status=status.HTTP_400_BAD_REQUEST)
        if turno.paciente != paciente:
            return Response({"detail": "No puedes cancelar un turno que no es tuyo."}, status=status.HTTP_403_FORBIDDEN)
        if turno.estado != "RESERVADO":
            return Response({"detail": "Solo puedes cancelar turnos reservados."}, status=status.HTTP_400_BAD_REQUEST)
        turno.estado = "CANCELADO"
        turno.motivo_cancelacion = request.data.get("motivo", "Cancelado por el paciente")
        turno.save()
        return Response({"detail": "Turno cancelado y registrado en histórico."}, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], url_path="mis-turnos")
    def mis_turnos(self, request):
        user = request.user
        if getattr(user, "rol", None) != "PACIENTE":
            return Response({"detail": "Solo los pacientes pueden ver sus turnos."}, status=status.HTTP_403_FORBIDDEN)
        try:
            paciente = Paciente.objects.get(usuario=user)
        except Paciente.DoesNotExist:
            return Response({"detail": "No existe un perfil de paciente asociado."}, status=status.HTTP_400_BAD_REQUEST)
        
        # [CORRECCIÓN 1] Se elimina el filtro de fecha para devolver también el historial
        turnos = Turno.objects.filter(paciente=paciente)
        
        # [CORRECCIÓN 2] Se añade el segundo criterio de orden por hora descendente
        turnos = turnos.order_by("-fecha", "-hora_inicio")
        
        serializer = self.get_serializer(turnos, many=True)
        return Response(serializer.data)

    def partial_update(self, request, *args, **kwargs):
        # ... (Sin cambios aquí)
        turno = self.get_object()
        user = request.user
        if getattr(user, "rol", None) == "PACIENTE":
            try:
                paciente = Paciente.objects.get(usuario=user)
            except Paciente.DoesNotExist:
                return Response({"detail": "El usuario no está asociado a un paciente."}, status=status.HTTP_400_BAD_REQUEST)
            if turno.estado == "DISPONIBLE":
                if turno.paciente is None:
                    turno.paciente = paciente
                    turno.estado = "RESERVADO"
                    turno.save()
                    return Response(self.get_serializer(turno).data)
                else:
                    return Response({"detail": "El turno ya fue asignado."}, status=status.HTTP_400_BAD_REQUEST)
            if "justificacion" in request.data:
                if turno.paciente != paciente:
                    return Response({"detail": "No puedes justificar turnos de otro paciente."}, status=status.HTTP_403_FORBIDDEN)
                justificacion = request.data.get("justificacion")
                turno.estado = "NO_ASISTIO"
                turno.motivo_cancelacion = justificacion
                turno.save()
                inasistencia, created = Inasistencia.objects.get_or_create(
                    turno=turno,
                    defaults={
                        "paciente": paciente,
                        "fecha": turno.fecha,
                        "justificacion": justificacion,
                        "estado_justificacion": "PENDIENTE",
                    }
                )
                if not created:
                    inasistencia.justificacion = justificacion
                    inasistencia.estado_justificacion = "PENDIENTE"
                    inasistencia.save()
                return Response(self.get_serializer(turno).data)
            return Response({"detail": "Acción inválida para paciente."}, status=status.HTTP_400_BAD_REQUEST)
        if getattr(user, "rol", None) == "PROFESIONAL":
            estado_anterior = turno.estado
            serializer = self.get_serializer(turno, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            turno_actualizado = serializer.save()
            if (turno_actualizado.estado == "NO_ASISTIO" and turno_actualizado.paciente is not None and estado_anterior != "NO_ASISTIO"):
                Inasistencia.objects.get_or_create(
                    turno=turno_actualizado,
                    defaults={
                        "paciente": turno_actualizado.paciente,
                        "fecha": turno_actualizado.fecha,
                        "justificacion": None,
                        "estado_justificacion": "PENDIENTE",
                    }
                )
            return Response(serializer.data)
        return super().partial_update(request, *args, **kwargs)

    @action(detail=True, methods=["patch"], permission_classes=[IsAuthenticated])
    def marcar_inasistencia(self, request, pk=None):
        # ... (Sin cambios aquí)
        turno = self.get_object()
        user = request.user
        if getattr(user, "rol", None) != "PROFESIONAL":
            return Response({"detail": "Solo los profesionales pueden marcar inasistencias."}, status=status.HTTP_403_FORBIDDEN)
        if turno.agenda.profesional.usuario != user and turno.profesional.usuario != user:
            return Response({"detail": "No puedes marcar inasistencias de turnos de otros profesionales."}, status=status.HTTP_403_FORDEN)
        if turno.paciente is None:
            return Response({"detail": "No se puede marcar inasistencia en un turno sin paciente asignado."}, status=status.HTTP_400_BAD_REQUEST)
        if turno.estado not in ["PROGRAMADO", "RESERVADO"]:
            return Response({"detail": f"No se puede marcar inasistencia en un turno con estado {turno.estado}."}, status=status.HTTP_400_BAD_REQUEST)
        turno.estado = "NO_ASISTIO"
        turno.save()
        inasistencia, created = Inasistencia.objects.get_or_create(
            turno=turno,
            defaults={
                "paciente": turno.paciente,
                "fecha": turno.fecha,
                "justificacion": None,
                "estado_justificacion": "PENDIENTE",
            }
        )
        serializer = self.get_serializer(turno)
        return Response({
            "turno": serializer.data,
            "inasistencia_creada": created,
            "mensaje": "Inasistencia registrada correctamente"
        }, status=status.HTTP_200_OK)