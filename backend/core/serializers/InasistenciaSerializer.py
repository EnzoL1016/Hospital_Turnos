from rest_framework import serializers
from ..models import Inasistencia

class InasistenciaSerializer(serializers.ModelSerializer):
    paciente_nombre = serializers.CharField(
        source="paciente.nombre_completo", read_only=True
    )
    profesional_nombre = serializers.CharField(
        source="turno.profesional.usuario.username", read_only=True
    )
    # 👇 Corrección: ahora apunta a turno.fecha y turno.hora_inicio
    fecha = serializers.DateField(
        source="turno.fecha", format="%Y-%m-%d", read_only=True
    )
    hora_turno = serializers.TimeField(
        source="turno.hora_inicio", format="%H:%M", read_only=True
    )

    class Meta:
        model = Inasistencia
        fields = [
            "id",
            "paciente",
            "paciente_nombre",
            "turno",
            "fecha",
            "hora_turno",
            "profesional_nombre",
            "justificacion",
            "estado_justificacion",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["paciente", "turno", "created_at", "updated_at"]