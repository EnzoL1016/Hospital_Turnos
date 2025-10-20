from rest_framework import serializers
from ..models import Agenda, Turno, Profesional # Asegúrate que los modelos se importen
from datetime import datetime, timedelta
import calendar

class AgendaSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo Agenda.
    Incluye la lógica de negocio para generar los turnos al crear una nueva agenda.
    """
    profesional_nombre = serializers.CharField(
        source="profesional.usuario.username", read_only=True
    )
    especialidad = serializers.CharField(
        source="profesional.especialidad", read_only=True
    )

    class Meta:
        model = Agenda
        # Asegúrate de que los campos coincidan con tu modelo actual
        fields = [
            'id', 'profesional', 'mes', 'horario_inicio', 'horario_fin', 
            'duracion_turno', 'dias_no_disponibles', 'profesional_nombre', 'especialidad'
        ]

    def create(self, validated_data):
        """
        Crea la agenda y luego genera todos los turnos correspondientes.
        Lógica basada en la versión funcional de referencia, con corrección para mayúsculas.
        """
        agenda = super().create(validated_data)
        profesional = agenda.profesional
        dias_atencion_bd = profesional.dias_atencion or []

        # --- ¡LA CORRECCIÓN DEFINITIVA! ---
        # Convertimos los días de la BD a minúsculas para la comparación.
        # ["LUNES", "MARTES"] -> ["lunes", "martes"]
        dias_atencion = [dia.lower() for dia in dias_atencion_bd]

        year, month = agenda.mes.year, agenda.mes.month
        _, last_day = calendar.monthrange(year, month)
        turnos_a_crear = []
        
        # Este mapa es para compatibilidad con la lógica anterior, aunque ya no es estrictamente necesario
        # si tu sistema operativo está en español, lo mantenemos por robustez.
        DAY_MAP_ES = {0: "lunes", 1: "martes", 2: "miercoles", 3: "jueves", 4: "viernes", 5: "sabado", 6: "domingo"}

        for day in range(1, last_day + 1):
            fecha = datetime(year, month, day).date()
            
            # Usamos weekday() que devuelve un número (Lunes=0), que es más fiable
            nombre_dia = DAY_MAP_ES.get(fecha.weekday())

            if nombre_dia in dias_atencion and str(fecha) not in (agenda.dias_no_disponibles or []):
                hora_actual = datetime.combine(fecha, agenda.horario_inicio)
                hora_final_agenda = datetime.combine(fecha, agenda.horario_fin)

                while hora_actual < hora_final_agenda:
                    hora_fin_turno = hora_actual + timedelta(minutes=agenda.duracion_turno)
                    if hora_fin_turno > hora_final_agenda:
                        break

                    turnos_a_crear.append(
                        Turno(
                            agenda=agenda,
                            profesional=profesional,
                            fecha=fecha,
                            hora_inicio=hora_actual.time(),
                            hora_fin=hora_fin_turno.time(),
                            estado='DISPONIBLE'
                        )
                    )
                    hora_actual = hora_fin_turno

        if turnos_a_crear:
            Turno.objects.bulk_create(turnos_a_crear)

        return agenda
