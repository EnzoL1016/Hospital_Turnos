from rest_framework import serializers
from ..models import Paciente, Usuario
from django.contrib.auth.hashers import make_password

class PacienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paciente
        fields = '__all__'

class RegistroPacienteSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Paciente
        fields = [
            'dni', 'password', 'nombre_completo', 'fecha_nacimiento', 'telefono',
            'email', 'direccion', 'obra_social', 'numero_afiliado'
        ]

    def create(self, validated_data):
        password = validated_data.pop('password')
        usuario = Usuario.objects.create(
            username=validated_data['dni'],
            rol='PACIENTE',
            password=make_password(password)
        )
        paciente = Paciente.objects.create(usuario=usuario, **validated_data)
        return paciente
