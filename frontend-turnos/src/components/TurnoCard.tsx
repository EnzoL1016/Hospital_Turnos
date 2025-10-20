// src/components/TurnoCard.tsx
import React from 'react';

// --- Funciones de Ayuda ---
const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "RESERVADO": return "bg-blue-100 text-blue-800";
      case "ASISTIO": return "bg-green-100 text-green-800";
      case "CANCELADO": return "bg-gray-100 text-gray-800";
      case "NO_ASISTIO": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
};
const formatearFecha = (fecha: string) => {
    const date = new Date(fecha + "T00:00:00");
    return date.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
};

// --- Interfaces ---
interface Turno {
  id: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: string;
  profesional_nombre?: string;
  paciente_nombre?: string;
}

interface TurnoCardProps {
  turno: Turno;
  rolUsuario: string;
  filtroActivo: string;
  onCancelar: (turno: Turno) => void; 
  // [CORRECCIÓN] Ahora espera el objeto Turno completo y el nuevo estado
  onActualizarEstado: (turno: Turno, nuevoEstado: 'ASISTIO' | 'NO_ASISTIO') => void;
  isProcessing: boolean;
}

const TurnoCard = ({ turno, rolUsuario, filtroActivo, onCancelar, onActualizarEstado, isProcessing }: TurnoCardProps) => {
  return (
    <div className="bg-white border rounded-lg shadow p-6">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 space-y-2">
          <p className="text-lg font-semibold">{formatearFecha(turno.fecha)}</p>
          <p className="text-gray-600">Horario: {turno.hora_inicio.slice(0, 5)} - {turno.hora_fin.slice(0, 5)}</p>
          <p className="text-gray-600">
            {rolUsuario === 'PACIENTE' ? `Profesional: ${turno.profesional_nombre}` : `Paciente: ${turno.paciente_nombre || "Disponible"}`}
          </p>
          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(turno.estado)}`}>
            {turno.estado.replace('_', ' ')}
          </span>
        </div>

        <div className="flex flex-col md:flex-row gap-2 items-end">
          {rolUsuario === 'PACIENTE' && filtroActivo === 'PROXIMOS' && (
            <button 
              onClick={() => onCancelar(turno)}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
              disabled={isProcessing}
            >
              {isProcessing ? 'Procesando...' : 'Cancelar'}
            </button>
          )}
          {rolUsuario === 'PROFESIONAL' && turno.estado === 'RESERVADO' && (
            <>
              {/* [CORRECCIÓN] Ahora se pasa el objeto turno completo */}
              <button onClick={() => onActualizarEstado(turno, 'ASISTIO')} className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600">
                Marcar Asistió
              </button>
              <button onClick={() => onActualizarEstado(turno, 'NO_ASISTIO')} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600">
                Marcar No Asistió
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(TurnoCard);