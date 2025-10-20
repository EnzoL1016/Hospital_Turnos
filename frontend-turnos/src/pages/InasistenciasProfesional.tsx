// src/pages/InasistenciasProfesional.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { LoaderCircle, CheckCircle2, XCircle } from "lucide-react";
import api from "../api/api";
import FilterBar from "./../components/FilterBar";
import ConfirmationModal from "../components/ConfirmationModal";

// --- Interfaces y Helpers ---
interface Inasistencia {
  id: number;
  turno: number;
  paciente_nombre: string;
  fecha: string;
  justificacion: string | null;
  estado_justificacion: "PENDIENTE" | "JUSTIFICADA" | "INJUSTIFICADA";
  profesional_nombre: string;
}

const getEstadoColor = (estado: string) => {
  switch (estado) {
    case "PENDIENTE": return "bg-yellow-100 text-yellow-800";
    case "JUSTIFICADA": return "bg-green-100 text-green-800";
    case "INJUSTIFICADA": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const formatearFecha = (fecha: string) => {
  const date = new Date(fecha + "T00:00:00");
  return date.toLocaleDateString("es-AR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
};

const fetchInasistencias = async (): Promise<Inasistencia[]> => {
  const { data } = await api.get("/inasistencias/");
  return data.results || data;
};

export default function InasistenciasProfesional() {
  const queryClient = useQueryClient();
  const [filtro, setFiltro] = useState<string>("PENDIENTE");
  
  // Estado para controlar el modal de confirmación
  const [accionEnProgreso, setAccionEnProgreso] = useState<{ inasistencia: Inasistencia | null; accion: 'aceptar' | 'rechazar' } | null>(null);

  const { data: inasistencias = [], isLoading, error } = useQuery({
    queryKey: ["inasistenciasProfesional"],
    queryFn: fetchInasistencias,
  });

  const resolverInasistenciaMutation = useMutation({
    mutationFn: ({ id, accion }: { id: number; accion: "JUSTIFICADA" | "INJUSTIFICADA" }) => {
      const payloadAction = accion === "JUSTIFICADA" ? "APROBAR" : "RECHAZAR";
      return api.patch(`/inasistencias/${id}/evaluar/`, { action: payloadAction, nota: "" });
    },
    onSuccess: (_, variables) => {
      toast.success(`Inasistencia marcada como ${variables.accion.toLowerCase()}`);
      queryClient.invalidateQueries({ queryKey: ["inasistenciasProfesional"] });
      setAccionEnProgreso(null);
    },
    onError: () => {
      toast.error("No se pudo actualizar la inasistencia");
      setAccionEnProgreso(null);
    },
  });

  const handleConfirmarAccion = () => {
    if (!accionEnProgreso || !accionEnProgreso.inasistencia) return;
    const { inasistencia, accion } = accionEnProgreso;
    const nuevoEstado = accion === 'aceptar' ? 'JUSTIFICADA' : 'INJUSTIFICADA';
    resolverInasistenciaMutation.mutate({ id: inasistencia.id, accion: nuevoEstado });
  };

  const counts = {
    TODAS: inasistencias.length,
    PENDIENTE: inasistencias.filter((ina) => ina.estado_justificacion === "PENDIENTE").length,
    JUSTIFICADA: inasistencias.filter((ina) => ina.estado_justificacion === "JUSTIFICADA").length,
    INJUSTIFICADA: inasistencias.filter((ina) => ina.estado_justificacion === "INJUSTIFICADA").length,
  };

  const filters = [
    { key: "PENDIENTE", label: "Pendientes", color: "yellow", count: counts.PENDIENTE },
    { key: "JUSTIFICADA", label: "Justificadas", color: "green", count: counts.JUSTIFICADA },
    { key: "INJUSTIFICADA", label: "Injustificadas", color: "red", count: counts.INJUSTIFICADA },
    { key: "TODAS", label: "Todas", color: "blue", count: counts.TODAS },
  ];

  const inasistenciasFiltradas = inasistencias.filter((ina) => filtro === "TODAS" || ina.estado_justificacion === filtro);

  if (isLoading) return <div className="flex justify-center items-center h-64"><LoaderCircle className="animate-spin text-blue-600" size={48} /></div>;
  if (error) return <p className="text-center mt-10 text-red-500">Error al cargar las inasistencias.</p>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Inasistencias de Pacientes</h1>
      <FilterBar filters={filters} activeFilter={filtro} onFilterChange={setFiltro} />

      {inasistenciasFiltradas.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No hay inasistencias que coincidan con este filtro.</p>
      ) : (
        <div className="space-y-4">
          {inasistenciasFiltradas.map((ina) => (
            <div key={ina.id} className="bg-white border rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-1">
                  <p className="text-lg font-semibold">{ina.paciente_nombre}</p>
                  <p className="text-gray-600">Turno del: {formatearFecha(ina.fecha)}</p>
                </div>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(ina.estado_justificacion)}`}>
                  {ina.estado_justificacion.replace('_', ' ')}
                </span>
              </div>
              {ina.justificacion && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600 font-medium">Justificación del paciente:</p>
                  <p className="text-gray-800 italic">"{ina.justificacion}"</p>
                </div>
              )}
              {ina.estado_justificacion === "PENDIENTE" && (
                <div className="flex gap-3 mt-4 pt-4 border-t">
                  <button onClick={() => setAccionEnProgreso({ inasistencia: ina, accion: 'aceptar' })} disabled={resolverInasistenciaMutation.isPending} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50">Aceptar</button>
                  <button onClick={() => setAccionEnProgreso({ inasistencia: ina, accion: 'rechazar' })} disabled={resolverInasistenciaMutation.isPending} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50">Rechazar</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {accionEnProgreso && (
        <ConfirmationModal
          isOpen={!!accionEnProgreso}
          onClose={() => setAccionEnProgreso(null)}
          onConfirm={handleConfirmarAccion}
          title={`Confirmar Acción`}
          isConfirming={resolverInasistenciaMutation.isPending}
          variant={accionEnProgreso.accion === 'rechazar' ? 'danger' : 'primary'}
          confirmText={accionEnProgreso.accion === 'aceptar' ? 'Sí, aceptar' : 'Sí, rechazar'}
        >
          <div className="flex items-center gap-4">
            {accionEnProgreso.accion === 'aceptar' && <div className="bg-green-100 p-3 rounded-full"><CheckCircle2 className="text-green-600" size={24} /></div>}
            {accionEnProgreso.accion === 'rechazar' && <div className="bg-red-100 p-3 rounded-full"><XCircle className="text-red-600" size={24} /></div>}
            <p>
              ¿Estás seguro de que deseas <strong className="font-semibold">{accionEnProgreso.accion}</strong> la justificación del paciente <strong className="font-semibold">{accionEnProgreso.inasistencia?.paciente_nombre}</strong>?
            </p>
          </div>
        </ConfirmationModal>
      )}
    </div>
  );
}