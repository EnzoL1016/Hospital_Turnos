import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { LoaderCircle } from "lucide-react";
import api from "../api/api";

// Definimos un tipo para el payload para mayor seguridad
type ProfesionalPayload = {
  username: string;
  password: string;
  nombre_completo: string;
  matricula: string;
  especialidad: string;
  telefono: string;
  horario_inicio: string;
  horario_fin: string;
  dias_atencion: string[];
  duracion_turno: number;
};

const ProfesionalCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    nombre_completo: "",
    matricula: "",
    especialidad: "",
    telefono: "",
    horario_inicio: "09:00",
    horario_fin: "17:00",
    dias_atencion: [] as string[],
    duracion_turno: 30,
  });

  // --- OPTIMIZACIÓN: Usamos useMutation en lugar de useState para loading/error ---
  const { mutate: createProfesional, isPending } = useMutation({
    mutationFn: (payload: ProfesionalPayload) => 
      api.post("/profesionales/registro/", payload), // <-- CORRECCIÓN #1: URL correcta
    onSuccess: () => {
      toast.success("¡Profesional creado exitosamente!");
      navigate("/admin/profesionales/list"); // <-- CORRECCIÓN #2: Redirección absoluta
    },
    onError: (error: any) => {
      // Intentamos dar un error más específico de la API de Django
      const errorData = error.response?.data;
      let errorMessage = "No se pudo crear el profesional. Inténtalo de nuevo.";
      if (errorData) {
        // Extrae el primer error de validación que encuentre
        const firstErrorKey = Object.keys(errorData)[0];
        errorMessage = `${firstErrorKey}: ${errorData[firstErrorKey][0]}`;
      }
      toast.error(errorMessage);
      console.error("Error creando profesional:", errorData || error);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      dias_atencion: prev.dias_atencion.includes(day)
        ? prev.dias_atencion.filter((d) => d !== day)
        : [...prev.dias_atencion, day],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.dias_atencion.length === 0) {
      toast.error("Debes seleccionar al menos un día de atención.");
      return;
    }

    const payload = {
      ...formData,
      // Normalizamos la hora para que siempre envíe los segundos
      horario_inicio: formData.horario_inicio.includes(':00', 1) ? formData.horario_inicio : formData.horario_inicio + ":00",
      horario_fin: formData.horario_fin.includes(':00', 1) ? formData.horario_fin : formData.horario_fin + ":00",
    };
    
    createProfesional(payload);
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Agregar Nuevo Profesional</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* --- SECCIÓN DATOS DE USUARIO --- */}
        <fieldset className="border p-4 rounded-md">
          <legend className="text-lg font-semibold px-2">Credenciales de Acceso</legend>
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Usuario</label>
              <input type="text" name="username" value={formData.username} onChange={handleChange} required className="mt-1 p-2 border rounded w-full shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contraseña</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required className="mt-1 p-2 border rounded w-full shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
        </fieldset>

        {/* --- SECCIÓN DATOS PROFESIONALES --- */}
        <fieldset className="border p-4 rounded-md">
          <legend className="text-lg font-semibold px-2">Información Profesional</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Nombre completo</label>
              <input type="text" name="nombre_completo" value={formData.nombre_completo} onChange={handleChange} required className="mt-1 p-2 border rounded w-full shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Matrícula</label>
              <input type="text" name="matricula" value={formData.matricula} onChange={handleChange} required className="mt-1 p-2 border rounded w-full shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Especialidad</label>
              <input type="text" name="especialidad" value={formData.especialidad} onChange={handleChange} required className="mt-1 p-2 border rounded w-full shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Teléfono</label>
              <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} required className="mt-1 p-2 border rounded w-full shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
        </fieldset>
        
        {/* --- SECCIÓN HORARIOS --- */}
        <fieldset className="border p-4 rounded-md">
          <legend className="text-lg font-semibold px-2">Horarios de Atención</legend>
          <div className="pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Horario inicio</label>
                <input type="time" name="horario_inicio" value={formData.horario_inicio} onChange={handleChange} required className="mt-1 p-2 border rounded w-full shadow-sm focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Horario fin</label>
                <input type="time" name="horario_fin" value={formData.horario_fin} onChange={handleChange} required className="mt-1 p-2 border rounded w-full shadow-sm focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Días de atención</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"].map((day) => (
                  <label key={day} className="flex items-center p-2 border rounded-md has-[:checked]:bg-blue-50 has-[:checked]:border-blue-400">
                    <input type="checkbox" checked={formData.dias_atencion.includes(day)} onChange={() => handleCheckboxChange(day)} className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                    <span className="capitalize text-sm">{day.toLowerCase()}</span>
                  </label>
                ))}
              </div>
            </div>
             <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Duración del turno (minutos)</label>
              <input type="number" name="duracion_turno" value={formData.duracion_turno} onChange={handleChange} min={10} step={5} required className="mt-1 p-2 border rounded w-full shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
        </fieldset>

        <button type="submit" disabled={isPending} className="w-full inline-flex justify-center items-center px-4 py-2 bg-blue-600 text-white font-bold rounded-md shadow-sm hover:bg-blue-700 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          {isPending ? (<><LoaderCircle className="animate-spin mr-2" size={20} /> Creando Profesional...</>) : "Crear Profesional"}
        </button>
      </form>
    </div>
  );
};

export default ProfesionalCreate;