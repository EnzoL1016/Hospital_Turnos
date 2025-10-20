from rest_framework import serializers
from ..models import Turno

class TurnoSerializer(serializers.ModelSerializer):
    paciente_nombre = serializers.CharField(
        source="paciente.nombre_completo", read_only=True
    )
    paciente_id = serializers.IntegerField(source="paciente.id", read_only=True)
    paciente_usuario_id = serializers.IntegerField(source="paciente.usuario.id", read_only=True)
    profesional_nombre = serializers.CharField(
        source="agenda.profesional.usuario.nombre_completo", read_only=True
    )
    justificacion = serializers.CharField(
        source="inasistencia.justificacion", read_only=True
    )
    estado_justificacion = serializers.CharField(
        source="inasistencia.estado_justificacion", read_only=True
    )
    class Meta:
        model = Turno
        fields = [
            "id", "fecha", "hora_inicio", "hora_fin", "estado",
            "paciente_id", "paciente_usuario_id", "paciente_nombre",
            "agenda", "profesional_nombre",
            "justificacion", "estado_justificacion"
        ]
        read_only_fields = ["agenda", "profesional"]
