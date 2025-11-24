import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { LoaderCircle, CalendarPlus } from "lucide-react";
import api from "../api/api";
import useAuthStore from "../store/authStore";


interface Profesional {
  id: number;
  usuario_nombre: string;
  especialidad: string;
}


interface AgendaFormData {
  profesional: string;
  mes: string; // YYYY-MM
  horario_inicio: string; // HH:mm
  horario_fin: string; // HH:mm
  duracion_turno: number;
}

const CrearAgenda = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const [formData, setFormData] = useState<AgendaFormData>({
    profesional: user?.role === "PROFESIONAL" ? String(user.profesional_id) : "",
    mes: "",
    horario_inicio: "09:00",
    horario_fin: "17:00",
    duracion_turno: 30,
  });


  const { data: profesionales, isLoading: isLoadingProfesionales } = useQuery<Profesional[], Error>({
    queryKey: ["profesionales"],
    queryFn: () => api.get("/profesionales/").then(res => res.data.results || res.data),
  
    enabled: user?.role === "ADMIN",
  });


  const { mutate: createAgenda, isPending } = useMutation({
    mutationFn: (payload: any) => api.post("/agendas/", payload),
    onSuccess: () => {
      toast.success("¡Agenda creada exitosamente!");
    
      queryClient.invalidateQueries({ queryKey: ["agendas"] });
      navigate(user?.role === "ADMIN" ? "/admin" : "/profesional/agendas");
    },
    onError: (err: any) => {
      const errorData = err.response?.data;
   
      if (errorData?.non_field_errors?.some((e: string) => e.includes("unique"))) {
        toast.error("Ya existe una agenda para este profesional en el mes seleccionado.");
      } else {
       
        toast.error(errorData?.detail || "No se pudo crear la agenda.");
      }
      console.error("Error creating agenda:", errorData || err);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.profesional) {
      toast.error("Debe seleccionar un profesional.");
      return;
    }
    if (!formData.mes) {
      toast.error("Debe seleccionar un mes.");
      return;
    }


    const payload = {
      profesional: Number(formData.profesional),
      mes: `${formData.mes}-01`, 
      horario_inicio: `${formData.horario_inicio}:00`,
      horario_fin: `${formData.horario_fin}:00`,
      duracion_turno: Number(formData.duracion_turno),
      dias_no_disponibles: [],
    };
    
    createAgenda(payload);
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-3">
        <CalendarPlus size={32} />
        Crear Nueva Agenda
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {user?.role === "ADMIN" && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Profesional</label>
            {isLoadingProfesionales ? <LoaderCircle className="animate-spin mt-2" /> : (
              <select
                name="profesional"
                value={formData.profesional}
                onChange={handleChange}
                required
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleccione un profesional</option>
                {profesionales?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.usuario_nombre} - {p.especialidad}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        <div>
          <label htmlFor="mes" className="block text-sm font-medium text-gray-700">Mes de la Agenda</label>
          <input
            id="mes"
            type="month"
            name="mes"
            value={formData.mes}
            onChange={handleChange}
            required
            className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="horario_inicio" className="block text-sm font-medium text-gray-700">Horario Inicio</label>
            <input
              id="horario_inicio"
              type="time"
              name="horario_inicio"
              value={formData.horario_inicio}
              onChange={handleChange}
              required
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="horario_fin" className="block text-sm font-medium text-gray-700">Horario Fin</label>
            <input
              id="horario_fin"
              type="time"
              name="horario_fin"
              value={formData.horario_fin}
              onChange={handleChange}
              required
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="duracion_turno" className="block text-sm font-medium text-gray-700">Duración del Turno (minutos)</label>
          <input
            id="duracion_turno"
            type="number"
            name="duracion_turno"
            value={formData.duracion_turno}
            onChange={handleChange}
            min={10}
            step={5}
            required
            className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isPending || (user?.role === "ADMIN" && isLoadingProfesionales)}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
          >
            {isPending ? <LoaderCircle className="animate-spin" /> : "Crear Agenda"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CrearAgenda;
