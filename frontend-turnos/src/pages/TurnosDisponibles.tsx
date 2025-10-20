// src/pages/TurnosDisponibles.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { CalendarCheck, LoaderCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import ConfirmationModal from "../components/ConfirmationModal";

// --- Interfaces ---
interface Profesional {
  id: number;
  usuario_nombre: string;
  especialidad: string;
}
interface Turno {
  id: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: string;
}
interface TurnosResponse {
  count: number;
  results: Turno[];
}

// --- Funciones de Fetching ---
const fetchProfesionales = async (): Promise<Profesional[]> => {
  const { data } = await api.get("/profesionales/");
  return data.results || data;
};
const fetchTurnos = async (profesionalId: string, page: number): Promise<TurnosResponse> => {
  if (!profesionalId) return { count: 0, results: [] };
  const pageSize = 20;
  const { data } = await api.get(
    `/turnos/?profesional=${profesionalId}&page=${page}&page_size=${pageSize}&estado=DISPONIBLE`
  );
  return data;
};

const formatDateFromYYYYMMDD = (fechaStr: string) => {
  if (!fechaStr) return "";
  const [year, month, day] = fechaStr.split("-");
  return `${day}/${month}/${year}`;
};


const TurnosDisponibles = () => {
  const navigate = useNavigate();
  const [selectedEspecialidad, setSelectedEspecialidad] = useState("");
  const [selectedProfesional, setSelectedProfesional] = useState("");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const [turnoParaReservar, setTurnoParaReservar] = useState<Turno | null>(null);

  const { data: profesionales = [], isLoading: isLoadingProfesionales } = useQuery({
    queryKey: ["profesionales"],
    queryFn: fetchProfesionales,
  });

  const especialidades = Array.from(new Set(profesionales.map((p) => p.especialidad)));

  const turnosQuery = useQuery({
    queryKey: ["turnos", selectedProfesional, page],
    queryFn: () => fetchTurnos(selectedProfesional, page),
    enabled: !!selectedProfesional,
    keepPreviousData: true,
  });

  const reservarTurnoMutation = useMutation({
    mutationFn: (turnoId: number) => api.patch(`/turnos/${turnoId}/`),
    onSuccess: () => {
      setTurnoParaReservar(null);
      toast.success("¡Turno reservado con éxito!");
      setTimeout(() => {
        navigate('/paciente/mis-turnos');
      }, 1500);
    },
    onError: () => {
      setTurnoParaReservar(null);
      toast.error("No se pudo reservar el turno.");
    },
  });

  const handleConfirmarReserva = () => {
    if (turnoParaReservar) {
      reservarTurnoMutation.mutate(turnoParaReservar.id);
    }
  };
  
  const turnos = turnosQuery.data?.results || [];
  const totalTurnos = turnosQuery.data?.count || 0;
  const pageSize = 20; // Asegúrate de que este valor coincida con el backend
  const totalPages = Math.ceil(totalTurnos / pageSize);

  return (
    <div className="max-w-5xl mx-auto mt-10 p-8 bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold mb-8 text-blue-700 border-b pb-3">Reservar Turno</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-gray-700">Especialidad</label>
        <select value={selectedEspecialidad} onChange={(e) => { setSelectedEspecialidad(e.target.value); setSelectedProfesional(""); }} className="p-2 border rounded w-full focus:ring-2 focus:ring-blue-500" disabled={isLoadingProfesionales}>
          <option value="">{isLoadingProfesionales ? 'Cargando...' : 'Seleccione una especialidad'}</option>
          {especialidades.map((esp) => <option key={esp} value={esp}>{esp}</option>)}
        </select>
      </div>
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-gray-700">Profesional</label>
        <select value={selectedProfesional} onChange={(e) => { setSelectedProfesional(e.target.value); setPage(1); }} className="p-2 border rounded w-full focus:ring-2 focus:ring-blue-500" disabled={!selectedEspecialidad}>
          <option value="">Seleccione un profesional</option>
          {profesionales.filter((p) => p.especialidad === selectedEspecialidad).map((p) => <option key={p.id} value={p.id}>{p.usuario_nombre}</option>)}
        </select>
      </div>
      
      {turnosQuery.isLoading && <div className="flex justify-center items-center h-48"><LoaderCircle className="animate-spin text-blue-600" size={40} /></div>}
      {turnosQuery.isError && <p className="text-red-500 text-center">No se pudieron cargar los turnos.</p>}
      
      {turnosQuery.isSuccess && selectedProfesional && (
        <>
          {turnos.length > 0 ? (
            <table className="w-full border border-gray-300 mt-6 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-100 text-left"><th className="p-3 border">Fecha</th><th className="p-3 border">Inicio</th><th className="p-3 border">Fin</th><th className="p-3 border">Acciones</th></tr>
              </thead>
              <tbody>
                {turnos.map((turno) => (
                  <tr key={turno.id} className="hover:bg-gray-50">
                    <td className="p-3 border font-medium text-gray-700">{formatDateFromYYYYMMDD(turno.fecha)}</td>
                    <td className="p-3 border">{turno.hora_inicio.slice(0,5)}</td>
                    <td className="p-3 border">{turno.hora_fin.slice(0,5)}</td>
                    <td className="p-3 border">
                      <button onClick={() => setTurnoParaReservar(turno)} disabled={reservarTurnoMutation.isPending} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50">Reservar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : ( <p className="mt-6 text-center text-gray-600">No hay turnos disponibles.</p> )}
          
          {/* [CORRECCIÓN] Se restaura el código completo de la paginación */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-6 gap-2">
              <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50">Anterior</button>
              {[...Array(totalPages)].map((_, i) => (
                <button key={i + 1} onClick={() => setPage(i + 1)} className={`px-3 py-1 rounded ${page === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"}`}>{i + 1}</button>
              ))}
              <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50">Siguiente</button>
            </div>
          )}
        </>
      )}

      {turnoParaReservar && (
        <ConfirmationModal
          isOpen={!!turnoParaReservar}
          onClose={() => setTurnoParaReservar(null)}
          onConfirm={handleConfirmarReserva}
          title="Confirmar Reserva"
          confirmText="Sí, reservar"
          isConfirming={reservarTurnoMutation.isPending}
        >
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
                <CalendarCheck className="text-blue-600" size={24} />
            </div>
            <div>
              <p>¿Deseas reservar el turno para el día <strong className="font-semibold">{formatDateFromYYYYMMDD(turnoParaReservar.fecha)}</strong> a las <strong className="font-semibold">{turnoParaReservar.hora_inicio.slice(0,5)}</strong>?</p>
            </div>
          </div>
        </ConfirmationModal>
      )}
    </div>
  );
};

export default TurnosDisponibles;