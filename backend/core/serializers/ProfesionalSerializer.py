from rest_framework import serializers
from ..models import Profesional, Usuario
from django.contrib.auth.hashers import make_password

class ProfesionalSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.CharField(source="usuario.username", read_only=True)

    class Meta:
        model = Profesional
        fields = [
            "id", "matricula", "especialidad", "telefono",
            "horario_inicio", "horario_fin", "dias_atencion",
            "duracion_turno", "usuario", "usuario_nombre"
        ]

class RegistroProfesionalSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    username = serializers.CharField(write_only=True)
    nombre_completo = serializers.CharField(write_only=True)

    class Meta:
        model = Profesional
        fields = [
            "id", "matricula", "especialidad", "telefono",
            "horario_inicio", "horario_fin", "dias_atencion",
            "duracion_turno", "username", "password", "nombre_completo"
        ]

    def create(self, validated_data):
        password = validated_data.pop("password")
        username = validated_data.pop("username")
        nombre_completo = validated_data.pop("nombre_completo")
        usuario = Usuario.objects.create(
            username=username,
            rol="PROFESIONAL",
            nombre_completo=nombre_completo,
            password=make_password(password)
        )
        profesional = Profesional.objects.create(usuario=usuario, **validated_data)
        return profesional
