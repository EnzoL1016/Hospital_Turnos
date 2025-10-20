from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from core.permissions.IsAdminOrReadOnly import IsAdminOrReadOnly
from django.db.models import Q
from ..models import Turno, Agenda, Profesional, Inasistencia

class ReportesViewSet(viewsets.ViewSet):
    permission_classes = [IsAdminOrReadOnly]

    def _is_admin(self, user):
        try:
            return bool(getattr(user, "is_superuser", False) or str(getattr(user, "rol", "")).upper() == "ADMIN")
        except Exception:
            return False

    def _is_profesional_user(self, user):
        try:
            if str(getattr(user, "rol", "")).upper() != "PROFESIONAL":
                return False
            existe = Profesional.objects.filter(usuario=user).exists()
            return existe
        except Exception:
            return False

    def _is_paciente_user(self, user):
        try:
            return str(getattr(user, "rol", "")).upper() == "PACIENTE" and hasattr(user, "paciente") and user.paciente is not None
        except Exception:
            return False

    def _can_view_profesional(self, user, profesional_id):
        if self._is_admin(user):
            return True
        if self._is_profesional_user(user):
            try:
                prof = Profesional.objects.get(usuario=user)
                return int(profesional_id) == int(prof.id)
            except Exception:
                return False
        return False

    def _can_view_paciente(self, user, paciente_id):
        if self._is_admin(user):
            return True
        if self._is_paciente_user(user):
            try:
                return int(paciente_id) == int(user.paciente.id)
            except Exception:
                return False
        return False

    def _can_view_agenda(self, user, agenda_id):
        if self._is_admin(user):
            return True
        try:
            agenda = Agenda.objects.get(pk=int(agenda_id))
        except Agenda.DoesNotExist:
            return False
        if self._is_profesional_user(user):
            return agenda.profesional.usuario == user
        return False

    def _generar_reporte(self, queryset, pk, tipo):
        qs = queryset.exclude(estado="DISPONIBLE")
        total = qs.count()
        asistidos = qs.filter(estado="ASISTIO").count()
        inasistencias = qs.filter(estado="NO_ASISTIO").count()
        cancelados = qs.filter(estado="CANCELADO").count()
        return Response({
            f"{tipo}_id": pk,
            "total_turnos": total,
            "asistidos": asistidos,
            "inasistencias": inasistencias,
            "cancelados": cancelados,
            "porcentaje_asistencia": round(asistidos / total * 100, 2) if total else 0,
            "porcentaje_inasistencia": round(inasistencias / total * 100, 2) if total else 0,
            "porcentaje_cancelados": round(cancelados / total * 100, 2) if total else 0,
        })

    @action(detail=False, methods=["get"], url_path="global")
    def global_report(self, request):
        qs = Turno.objects.exclude(estado="DISPONIBLE")
        total_turnos = qs.count()
        asistidos = qs.filter(estado="ASISTIO").count()
        inasistencias = qs.filter(estado="NO_ASISTIO").count()
        cancelados = qs.filter(estado="CANCELADO").count()
        just_pendientes = Inasistencia.objects.filter(estado_justificacion="PENDIENTE").count()
        just_aceptadas = Inasistencia.objects.filter(estado_justificacion="JUSTIFICADA").count()
        just_rechazadas = Inasistencia.objects.filter(estado_justificacion="INJUSTIFICADA").count()
        return Response({
            "total_turnos": total_turnos,
            "asistidos": asistidos,
            "inasistencias": inasistencias,
            "cancelados": cancelados,
            "porcentaje_asistencia": round(asistidos / total_turnos * 100, 2) if total_turnos else 0,
            "porcentaje_inasistencia": round(inasistencias / total_turnos * 100, 2) if total_turnos else 0,
            "porcentaje_cancelados": round(cancelados / total_turnos * 100, 2) if total_turnos else 0,
            "justificaciones": {
                "pendientes": just_pendientes,
                "aceptadas": just_aceptadas,
                "rechazadas": just_rechazadas,
            }
        })

    @action(detail=True, methods=["get"], url_path="profesional")
    def report_by_profesional(self, request, pk=None):
        if not self._can_view_profesional(request.user, pk):
            return Response({"detail": "No tienes permiso para ver este reporte de profesional."}, status=status.HTTP_403_FORBIDDEN)
        qs = Turno.objects.filter(Q(agenda__profesional_id=pk) | Q(profesional_id=pk))
        return self._generar_reporte(qs, pk, "profesional")

    @action(detail=True, methods=["get"], url_path="paciente")
    def report_by_paciente(self, request, pk=None):
        if not self._can_view_paciente(request.user, pk):
            return Response({"detail": "No tienes permiso para ver este reporte de paciente."}, status=status.HTTP_403_FORBIDDEN)
        qs = Turno.objects.filter(paciente_id=pk)
        return self._generar_reporte(qs, pk, "paciente")

    @action(detail=True, methods=["get"], url_path="agenda")
    def report_by_agenda(self, request, pk=None):
        if not self._can_view_agenda(request.user, pk):
            return Response({"detail": "No tienes permiso para ver esta agenda."}, status=status.HTTP_403_FORBIDDEN)
        qs = Turno.objects.filter(agenda_id=pk)
        return self._generar_reporte(qs, pk, "agenda")

    @action(detail=False, methods=["get"], url_path="mi-reporte")
    def mi_reporte(self, request):
        user = request.user
        if not self._is_profesional_user(user):
            return Response({"detail": "Acceso denegado. Se requiere rol de PROFESIONAL."}, status=status.HTTP_403_FORBIDDEN)
        try:
            prof = Profesional.objects.get(usuario=user)
        except Profesional.DoesNotExist:
            return Response({"detail": "No se encontró el perfil de profesional."}, status=status.HTTP_404_NOT_FOUND)
        prof_id = prof.id
        qs = Turno.objects.filter(Q(agenda__profesional_id=prof_id) | Q(profesional_id=prof_id))
        return self._generar_reporte(qs, prof_id, "profesional")

    @action(detail=False, methods=["get"], url_path="mi-historial")
    def mi_historial(self, request):
        user = request.user
        if not self._is_paciente_user(user):
            return Response({"detail": "Acceso denegado. Se requiere rol de PACIENTE."}, status=status.HTTP_403_FORBIDDEN)
        paciente_id = user.paciente.id
        qs = Turno.objects.filter(paciente_id=paciente_id)
        return self._generar_reporte(qs, paciente_id, "paciente")
