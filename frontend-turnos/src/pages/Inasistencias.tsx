import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { LoaderCircle, Send } from "lucide-react";
import api from "../api/api";
import FilterBar from "../components/FilterBar";
import ConfirmationModal from "../components/ConfirmationModal";

interface Inasistencia {
  id: number;
  turno: number;
  profesional_nombre: string;
  fecha: string;
  hora_turno: string;
  justificacion: string | null;
  estado_justificacion: "PENDIENTE" | "JUSTIFICADA" | "INJUSTIFICADA";
}


const getEstadoJustificacionColor = (estado?: string) => {
    switch (estado) {
      case "PENDIENTE": return "bg-yellow-100 text-yellow-800";
      case "JUSTIFICADA": return "bg-green-100 text-green-800";
      case "INJUSTIFICADA": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
};
const formatearFecha = (fecha: string) => {
    const date = new Date(fecha + "T00:00:00");
    return date.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
};

export default function Inasistencias() {
  const queryClient = useQueryClient();
  const [justificacionText, setJustificacionText] = useState<Record<number, string>>({});
  const [filtro, setFiltro] = useState<string>("PENDIENTE");
  
  // Estado para controlar el modal de confirmación
  const [inasistenciaParaJustificar, setInasistenciaParaJustificar] = useState<Inasistencia | null>(null);

  const { data: inasistencias = [], isLoading, error } = useQuery<Inasistencia[], Error>({
    queryKey: ["mis-inasistencias"],
    queryFn: () => api.get('/inasistencias/mis-inasistencias/').then(res => res.data),
  });

  const justificarMutation = useMutation({
    mutationFn: ({ inasistenciaId, justificacion }: { inasistenciaId: number, justificacion: string }) =>
      api.post(`/inasistencias/${inasistenciaId}/justificar/`, { justificacion }),
    onSuccess: (_, variables) => {
      toast.success("Justificación enviada exitosamente");
      queryClient.invalidateQueries({ queryKey: ["mis-inasistencias"] });
      setJustificacionText(prev => ({ ...prev, [variables.inasistenciaId]: '' }));
      setInasistenciaParaJustificar(null); // Cierra el modal
    },
    onError: () => {
      toast.error("No se pudo enviar la justificación");
      setInasistenciaParaJustificar(null); // Cierra el modal
    },
  });

  const handleConfirmarJustificacion = () => {
    if (!inasistenciaParaJustificar) return;
    const justificacion = justificacionText[inasistenciaParaJustificar.id];
    if (!justificacion || justificacion.trim() === "") {
      toast.error("Por favor, ingresa una justificación");
      return;
    }
    justificarMutation.mutate({ inasistenciaId: inasistenciaParaJustificar.id, justificacion });
  };

  const counts = {
    TODAS: inasistencias.length,
    PENDIENTE: inasistencias.filter(i => i.estado_justificacion === 'PENDIENTE').length,
    JUSTIFICADA: inasistencias.filter(i => i.estado_justificacion === 'JUSTIFICADA').length,
    INJUSTIFICADA: inasistencias.filter(i => i.estado_justificacion === 'INJUSTIFICADA').length,
  };

  const filters = [
    { key: "PENDIENTE", label: "Pendientes", color: "yellow", count: counts.PENDIENTE },
    { key: "JUSTIFICADA", label: "Justificadas", color: "green", count: counts.JUSTIFICADA },
    { key: "INJUSTIFICADA", label: "Injustificadas", color: "red", count: counts.INJUSTIFICADA },
    { key: "TODAS", label: "Todas", color: "blue", count: counts.TODAS },
  ];

  const inasistenciasFiltradas = [...inasistencias].filter(ina => filtro === 'TODAS' || ina.estado_justificacion === filtro);
  
  if (isLoading) return <div className="flex justify-center items-center h-64"><LoaderCircle className="animate-spin text-blue-600" size={48} /></div>;
  if (error) return <p className="text-center mt-10 text-red-500">No se pudieron cargar tus inasistencias.</p>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Mis Inasistencias</h1>
      <FilterBar filters={filters} activeFilter={filtro} onFilterChange={setFiltro} />

      {inasistenciasFiltradas.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No tienes inasistencias que coincidan con este filtro.</p>
      ) : (
        <div className="space-y-4">
          {inasistenciasFiltradas.map(ina => (
            <div key={ina.id} className="bg-white border rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-2">
                  <p className="text-lg font-semibold">Turno del {formatearFecha(ina.fecha)}</p>
                  <p className="text-gray-600">Horario: {ina.hora_turno.slice(0,5)}</p>
                  <p className="text-gray-600">Profesional: {ina.profesional_nombre}</p>
                </div>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getEstadoJustificacionColor(ina.estado_justificacion)}`}>
                  {ina.estado_justificacion}
                </span>
              </div>
              <div className="mt-4 pt-4 border-t">
                <h3 className="font-semibold mb-2">Justificación</h3>
                {ina.justificacion && <p className="text-gray-800 italic mb-3">"{ina.justificacion}"</p>}
                
                {(ina.estado_justificacion === 'PENDIENTE' || ina.estado_justificacion === 'INJUSTIFICADA') && (
                  <div className="space-y-2">
                    <textarea value={justificacionText[ina.id] || ""} onChange={e => setJustificacionText({...justificacionText, [ina.id]: e.target.value})} placeholder={ina.justificacion ? "Actualizar justificación..." : "Escriba su justificación aquí..."} className="w-full p-2 border rounded-md" rows={3} />
                    <button onClick={() => setInasistenciaParaJustificar(ina)} disabled={justificarMutation.isPending} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                      {ina.justificacion ? 'Actualizar Justificación' : 'Enviar Justificación'}
                    </button>
                  </div>
                )}
                 {ina.estado_justificacion === 'JUSTIFICADA' && (<p className="text-sm text-green-600 bg-green-50 p-3 rounded-md">✓ Tu justificación fue aprobada.</p>)}
              </div>
            </div>
          ))}
        </div>
      )}

      {inasistenciaParaJustificar && (
        <ConfirmationModal
          isOpen={!!inasistenciaParaJustificar}
          onClose={() => setInasistenciaParaJustificar(null)}
          onConfirm={handleConfirmarJustificacion}
          title="Confirmar Envío"
          confirmText="Sí, enviar"
          isConfirming={justificarMutation.isPending}
        >
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full"><Send className="text-blue-600" size={24} /></div>
            <p>¿Estás seguro de que deseas enviar esta justificación?</p>
          </div>
        </ConfirmationModal>
      )}
    </div>
  );
}
