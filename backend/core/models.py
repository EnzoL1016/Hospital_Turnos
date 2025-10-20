# core/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
from django.conf import settings
from django.utils import timezone

# core/models.py

class Usuario(AbstractUser):
    """Usuario del sistema - puede ser Profesional, Admin o Paciente"""
    ROL_CHOICES = [
        ('PACIENTE', 'Paciente'),
        ('PROFESIONAL', 'Profesional'),
        ('ADMIN', 'Administrador'),
    ]
    
    nombre_completo = models.CharField(max_length=200)
    rol = models.CharField(max_length=20, choices=ROL_CHOICES)

    # Remover campos innecesarios heredados
    first_name = None
    last_name = None

    def __str__(self):
        return f"{self.username} - {self.nombre_completo} ({self.rol})"


class Paciente(models.Model):
    usuario = models.OneToOneField(
        Usuario,
        on_delete=models.CASCADE,
        limit_choices_to={'rol': 'PACIENTE'},
        related_name='paciente'
    )
    dni = models.CharField(max_length=8, unique=True)
    nombre_completo = models.CharField(max_length=200)
    fecha_nacimiento = models.DateField()
    telefono = models.CharField(max_length=20)
    email = models.EmailField(blank=True, null=True)
    direccion = models.CharField(max_length=300)
    obra_social = models.CharField(max_length=100, blank=True, null=True)
    numero_afiliado = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return f"{self.nombre_completo} - DNI: {self.dni}"


class Profesional(models.Model):
    """Profesional médico del sistema"""
    DIAS_SEMANA = [
        ('lunes', 'Lunes'),
        ('martes', 'Martes'),
        ('miercoles', 'Miércoles'),
        ('jueves', 'Jueves'),
        ('viernes', 'Viernes'),
        ('sabado', 'Sábado'),
        ('domingo', 'Domingo'),
    ]
    
    usuario = models.OneToOneField(
        Usuario, 
        on_delete=models.CASCADE,
        limit_choices_to={'rol': 'PROFESIONAL'}
    )
    matricula = models.CharField(max_length=20, unique=True)
    especialidad = models.CharField(max_length=100)
    telefono = models.CharField(max_length=20)
    horario_inicio = models.TimeField(default='08:00')
    horario_fin = models.TimeField(default='18:00')
    dias_atencion = models.JSONField(
        default=list,
        help_text='Lista de días de atención: ["lunes", "martes", ...]'
    )
    duracion_turno = models.PositiveIntegerField(
        default=30,
        help_text='Duración del turno en minutos'
    )
    
    class Meta:
        verbose_name_plural = "Profesionales"
        indexes = [
            models.Index(fields=['matricula']),
            models.Index(fields=['especialidad']),
        ]
    
    def __str__(self):
        return f"Dr/a. {self.usuario.nombre_completo} - {self.especialidad}"

class Agenda(models.Model):
    """Agenda mensual del profesional"""
    profesional = models.ForeignKey(Profesional, on_delete=models.CASCADE)
    mes = models.DateField(help_text='Primer día del mes de la agenda')
    horario_inicio = models.TimeField()
    horario_fin = models.TimeField()
    duracion_turno = models.PositiveIntegerField(
        help_text='Duración del turno en minutos'
    )
    dias_no_disponibles = models.JSONField(
        default=list,
        help_text='Lista de fechas no disponibles en formato YYYY-MM-DD'
    )
    
    class Meta:
        unique_together = ['profesional', 'mes']
        verbose_name_plural = "Agendas"
    
    def __str__(self):
        return f"Agenda {self.profesional.usuario.nombre_completo} - {self.mes.strftime('%B %Y')}"

# core/models.py

class Turno(models.Model):
    """Turno médico - puede estar disponible o asignado a un paciente"""
    ESTADO_CHOICES = [
        ('DISPONIBLE', 'Disponible'),
        ('PROGRAMADO', 'Programado'),
        ('ASISTIO', 'Asistió'),
        ('CANCELADO', 'Cancelado'),
        ('NO_ASISTIO', 'No Asistió'),
    ]

    # El paciente es opcional al principio
    paciente = models.ForeignKey(
        "Paciente",
        on_delete=models.SET_NULL,  # no se borra el turno si se borra el paciente
        null=True,
        blank=True
    )

    profesional = models.ForeignKey("Profesional", on_delete=models.CASCADE)

    # Es útil saber qué agenda generó este turno
    agenda = models.ForeignKey(
        "Agenda",
        on_delete=models.CASCADE,
        related_name="turnos",
        null=True,  # opcional si se crean turnos manualmente
        blank=True
    )

    fecha = models.DateField()
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()

    estado = models.CharField(
        max_length=15,
        choices=ESTADO_CHOICES,
        default="DISPONIBLE"
    )

    motivo_consulta = models.TextField(blank=True, null=True)
    motivo_cancelacion = models.TextField(blank=True, null=True)

    # ⬇️ Nuevo campo para justificar inasistencias
    justificacion = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ["profesional", "fecha", "hora_inicio"]
        verbose_name_plural = "Turnos"
        indexes = [
            models.Index(fields=["fecha"]),
            models.Index(fields=["profesional", "fecha"]),
            models.Index(fields=["paciente"]),
            models.Index(fields=["estado"]),
        ]

    def __str__(self):
        return f"Turno {self.fecha} {self.hora_inicio}-{self.hora_fin} ({self.estado})"



class Inasistencia(models.Model):
   
    ESTADO_CHOICES = [
        ("PENDIENTE", "Pendiente"),
        ("JUSTIFICADA", "Justificada"),
        ("INJUSTIFICADA", "Injustificada"),
    ]

    turno = models.OneToOneField(
        "Turno",
        on_delete=models.CASCADE,
        related_name="inasistencia",
        null=True,
        blank=True
    )
    paciente = models.ForeignKey(
        "Paciente",
        on_delete=models.CASCADE,
        related_name="inasistencias"
    )
    fecha = models.DateField()
    justificacion = models.TextField(null=True, blank=True, help_text="Explicación / justificativo enviado por el paciente")
    estado_justificacion = models.CharField(
        max_length=20,
        choices=ESTADO_CHOICES,
        default="INJUSTIFICADA"  # mantenemos compatibilidad con registros antiguos
    )

    # auditoría
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name_plural = "Inasistencias"

    def __str__(self):
        paciente_nombre = getattr(self.paciente, "nombre_completo", str(self.paciente))
        return f"Inasistencia {paciente_nombre} - {self.fecha}"

class Notificacion(models.Model):
    class TipoNotificacion(models.TextChoices):
        TURNO_RESERVADO = 'TURNO_RESERVADO', 'Turno Reservado'
        TURNO_CANCELADO = 'TURNO_CANCELADO', 'Turno Cancelado'
        TURNO_ESTADO_ACTUALIZADO = 'TURNO_ESTADO_ACTUALIZADO', 'Estado del Turno Actualizado'
        RECORDATORIO_24H = 'RECORDATORIO_24H', 'Recordatorio de Turno (24h)'
        NUEVA_AGENDA = 'NUEVA_AGENDA', 'Nueva Agenda Disponible'

    # A quién se le envía la notificación
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notificaciones')
    recordatorio_enviado = models.BooleanField(default=False)
    # Contenido de la notificación
    titulo = models.CharField(max_length=255)
    mensaje = models.TextField()
    tipo = models.CharField(max_length=50, choices=TipoNotificacion.choices)
    
    # Estado y metadata
    leida = models.BooleanField(default=False, db_index=True) # db_index para filtrar rápido no leídas
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    
    # Opcional pero MUY recomendado: para redirigir al usuario al hacer clic
    url_destino = models.CharField(max_length=512, blank=True, null=True)

    class Meta:
        ordering = ['-fecha_creacion'] # Las más nuevas primero

    def __str__(self):
        return f"Notificación para {self.usuario.username}: {self.titulo}"