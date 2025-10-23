import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { LoaderCircle } from "lucide-react";
import api from "../api/api";
import useAuthStore from "../store/authStore";
import FilterBar from "../components/FilterBar";
import TurnoCard from "../components/TurnoCard";
import ConfirmationModal from "../components/ConfirmationModal"; 

interface Turno {
  id: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: string;
  profesional_nombre?: string;
  paciente_nombre?: string;
}

const formatearFecha = (fecha: string): string => {
    if (!fecha) return '';
    const date = new Date(fecha + "T00:00:00");
    return date.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
};

export default function VistaDeTurnos() {
  const { user } = useAuthStore();
  const { id: agendaId } = useParams();
  const queryClient = useQueryClient();
  const [filtro, setFiltro] = useState(user?.role === 'PACIENTE' ? 'PROXIMOS' : 'RESERVADOS');
  const [accionEnProgreso, setAccionEnProgreso] = useState<{ turno: Turno | null; accion: 'cancelar' | 'asistio' | 'no_asistio' } | null>(null);

  const fetchTurnos = async (): Promise<Turno[]> => {
    let endpoint = '';
    if (user?.role === 'PACIENTE') {
      endpoint = "/turnos/mis-turnos/";
    } else if (user?.role === 'PROFESIONAL' && agendaId) {
      endpoint = `/turnos/por-agenda/${agendaId}/`;
    } else {
      return [];
    }
    const res = await api.get(endpoint);
    return res.data;
  };

  const { data: turnos = [], isLoading, error } = useQuery<Turno[], Error>({
    queryKey: ["turnos", user?.role, agendaId],
    queryFn: fetchTurnos,
    enabled: !!user,
  });

  const cancelarTurnoMutation = useMutation({
    mutationFn: (turnoId: number) => api.post(`/turnos/${turnoId}/cancelar/`),
    onSuccess: () => { toast.success("Turno cancelado"); queryClient.invalidateQueries({ queryKey: ["turnos"] }); setAccionEnProgreso(null); },
    onError: () => { toast.error("No se pudo cancelar"); setAccionEnProgreso(null); },
  });

  const actualizarEstadoMutation = useMutation({
    mutationFn: ({ turnoId, nuevoEstado }: { turnoId: number, nuevoEstado: string }) => api.patch(`/turnos/${turnoId}/`, { estado: nuevoEstado }),
    onSuccess: () => { toast.success("Estado actualizado"); queryClient.invalidateQueries({ queryKey: ["turnos"] }); setAccionEnProgreso(null); },
    onError: () => { toast.error("No se pudo actualizar"); setAccionEnProgreso(null); },
  });

  const handleCancelar = (turno: Turno) => setAccionEnProgreso({ turno, accion: 'cancelar' });
  const handleActualizarEstado = (turno: Turno, nuevoEstado: 'ASISTIO' | 'NO_ASISTIO') => setAccionEnProgreso({ turno, accion: nuevoEstado.toLowerCase() as 'asistio' | 'no_asistio' });
  
  const handleConfirmarAccion = () => {
    if (!accionEnProgreso || !accionEnProgreso.turno) return;
    const { turno, accion } = accionEnProgreso;

    if (accion === 'cancelar') {
      cancelarTurnoMutation.mutate(turno.id);
    } else if (accion === 'asistio') {
      actualizarEstadoMutation.mutate({ turnoId: turno.id, nuevoEstado: 'ASISTIO' });
    } else if (accion === 'no_asistio') {
      actualizarEstadoMutation.mutate({ turnoId: turno.id, nuevoEstado: 'NO_ASISTIO' });
    }
  };

  let turnosFiltrados: Turno[] = [];
  let filters: any[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (user?.role === 'PACIENTE') {
    const turnosProximos = turnos.filter(t => new Date(t.fecha + "T00:00:00") >= today && t.estado === "RESERVADO");
    const turnosAsistidos = turnos.filter(t => t.estado === "ASISTIO");
    const turnosNoAsistidos = turnos.filter(t => t.estado === "NO_ASISTIO");
    const turnosCancelados = turnos.filter(t => t.estado === "CANCELADO");

    if (filtro === 'PROXIMOS') turnosFiltrados = turnosProximos;
    else if (filtro === 'ASISTIO') turnosFiltrados = turnosAsistidos;
    else if (filtro === 'NO_ASISTIO') turnosFiltrados = turnosNoAsistidos;
    else if (filtro === 'CANCELADO') turnosFiltrados = turnosCancelados;

    filters = [
      { key: "PROXIMOS", label: "Próximos", color: "blue", count: turnosProximos.length },
      { key: "ASISTIO", label: "Asistidos", color: "green", count: turnosAsistidos.length },
      { key: "NO_ASISTIO", label: "No Asistidos", color: "red", count: turnosNoAsistidos.length },
      { key: "CANCELADO", label: "Cancelados", color: "gray", count: turnosCancelados.length },
    ];
  } else if (user?.role === 'PROFESIONAL') { 
    turnosFiltrados = turnos.filter(t => {
        if (filtro === 'DISPONIBLES') return t.estado === "DISPONIBLE";
        if (filtro === 'RESERVADOS') return t.estado === "RESERVADO";
        if (filtro === 'ASISTIO') return t.estado === "ASISTIO";
        if (filtro === 'NO_ASISTIO') return t.estado === "NO_ASISTIO";
        if (filtro === 'CANCELADO') return t.estado === "CANCELADO";
        return true;
    });
    filters = [
      { key: "RESERVADOS", label: "Reservados", color: "blue", count: turnos.filter(t => t.estado === "RESERVADO").length },
      { key: "DISPONIBLES", label: "Disponibles", color: "yellow", count: turnos.filter(t => t.estado === "DISPONIBLE").length },
      { key: "ASISTIO", label: "Asistió", color: "green", count: turnos.filter(t => t.estado === "ASISTIO").length },
      { key: "NO_ASISTIO", label: "No Asistió", color: "red", count: turnos.filter(t => t.estado === "NO_ASISTIO").length },
      { key: "CANCELADO", label: "Cancelados", color: "gray", count: turnos.filter(t => t.estado === "CANCELADO").length },
    ];
  }

  if (isLoading) return <div className="flex justify-center items-center h-64"><LoaderCircle className="animate-spin text-blue-600" size={48} /></div>;
  if (error) return <p className="text-center mt-10 text-red-500">{error.message}</p>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{user?.role === 'PACIENTE' ? 'Mis Turnos' : 'Gestión de Turnos'}</h1>
      <FilterBar filters={filters} activeFilter={filtro} onFilterChange={setFiltro} />
      {turnosFiltrados.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No hay turnos para este filtro.</p>
      ) : (
        <div className="space-y-4">
          {turnosFiltrados.map((t) => (
            <TurnoCard
              key={t.id}
              turno={t}
              rolUsuario={user?.role || ''}
              filtroActivo={filtro}
              onCancelar={handleCancelar}
              onActualizarEstado={handleActualizarEstado}
              isProcessing={(cancelarTurnoMutation.isPending || actualizarEstadoMutation.isPending) && accionEnProgreso?.turno?.id === t.id}
            />
          ))}
        </div>
      )}

      {accionEnProgreso && (
        <ConfirmationModal
          isOpen={!!accionEnProgreso}
          onClose={() => setAccionEnProgreso(null)}
          onConfirm={handleConfirmarAccion}
          title={`Confirmar Acción`}
          isConfirming={cancelarTurnoMutation.isPending || actualizarEstadoMutation.isPending}
          variant={accionEnProgreso.accion === 'cancelar' || accionEnProgreso.accion === 'no_asistio' ? 'danger' : 'primary'}
          confirmText={
            accionEnProgreso.accion === 'cancelar' ? 'Sí, cancelar' :
            accionEnProgreso.accion === 'asistio' ? 'Sí, marcar asistió' : 'Sí, marcar no asistió'
          }
        >
          <p>
            {accionEnProgreso.accion === 'cancelar' && `¿Estás seguro de que deseas cancelar el turno con ${accionEnProgreso.turno?.profesional_nombre}?`}
            {accionEnProgreso.accion === 'asistio' && `¿Confirmas la asistencia del paciente ${accionEnProgreso.turno?.paciente_nombre}?`}
            {accionEnProgreso.accion === 'no_asistio' && `¿Confirmas la inasistencia del paciente ${accionEnProgreso.turno?.paciente_nombre}?`}
          </p>
        </ConfirmationModal>
      )}
    </div>
  );
}
