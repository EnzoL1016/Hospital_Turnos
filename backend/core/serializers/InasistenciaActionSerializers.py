from rest_framework import serializers

class JustificarInasistenciaSerializer(serializers.Serializer):
    justificacion = serializers.CharField(required=True, allow_blank=False, max_length=2000)

class EvaluarInasistenciaSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=["APROBAR", "RECHAZAR"], required=True)
    nota = serializers.CharField(required=False, allow_blank=True, max_length=1000)
