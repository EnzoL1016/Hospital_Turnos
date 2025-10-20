from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario, Paciente, Profesional, Agenda, Turno, Inasistencia

# Usuario personalizado
@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    list_display = ("username", "email", "nombre_completo", "rol", "is_staff", "is_active")
    list_filter = ("rol", "is_staff", "is_active", "is_superuser")
    search_fields = ("username", "email", "nombre_completo")
    ordering = ("username",)

    fieldsets = (
        (None, {"fields": ("username", "password")}),
        ("Información personal", {"fields": ("nombre_completo", "email", "rol")}),
        ("Permisos", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Fechas importantes", {"fields": ("last_login", "date_joined")}),
    )


# Paciente
@admin.register(Paciente)
class PacienteAdmin(admin.ModelAdmin):
    list_display = ("id", "nombre_completo", "dni", "telefono", "email", "obra_social")
    search_fields = ("nombre_completo", "dni", "email")
    list_filter = ("obra_social",)


# Profesional
@admin.register(Profesional)
class ProfesionalAdmin(admin.ModelAdmin):
    list_display = ("id", "usuario", "matricula", "especialidad", "telefono", "horario_inicio", "horario_fin")
    search_fields = ("usuario__nombre_completo", "matricula", "especialidad")
    list_filter = ("especialidad",)


# Agenda
@admin.register(Agenda)
class AgendaAdmin(admin.ModelAdmin):
    list_display = ("id", "profesional", "mes", "horario_inicio", "horario_fin", "duracion_turno")
    search_fields = ("profesional__usuario__nombre_completo",)
    list_filter = ("mes",)


# Turno
@admin.register(Turno)
class TurnoAdmin(admin.ModelAdmin):
    list_display = ("id", "paciente", "profesional", "fecha", "hora_inicio", "hora_fin", "estado")
    search_fields = ("paciente__nombre_completo", "profesional__usuario__nombre_completo")
    list_filter = ("estado", "fecha")


@admin.register(Inasistencia)
class InasistenciaAdmin(admin.ModelAdmin):
    list_display = ("id", "paciente", "fecha", "estado_justificacion", "created_at")
    search_fields = ("paciente__nombre_completo",)
    list_filter = ("estado_justificacion", "fecha")
