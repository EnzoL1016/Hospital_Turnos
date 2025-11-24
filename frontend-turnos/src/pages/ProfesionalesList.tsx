import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Trash2, Edit, UserPlus, LoaderCircle } from "lucide-react";
import api from "../api/api";
import Modal from "../components/Modal"; 


interface Profesional {
  id: number;
  matricula: string;
  especialidad: string;
  telefono: string;
  usuario_nombre: string;
}

const ProfesionalesList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [especialidadFiltro, setEspecialidadFiltro] = useState("");
  const [profesionalToDelete, setProfesionalToDelete] = useState<Profesional | null>(null);


  const { data: profesionales = [], isLoading, error } = useQuery<Profesional[], Error>({
    queryKey: ["profesionales"],
    queryFn: () => api.get('/profesionales/').then(res => res.data.results || res.data),
  });

  const { mutate: deleteProfesional, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => api.delete(`/profesionales/${id}/`),
    onSuccess: () => {
      toast.success("Profesional eliminado exitosamente");
     
      queryClient.invalidateQueries({ queryKey: ["profesionales"] });
      setProfesionalToDelete(null); 
    },
    onError: (err: any) => {
      console.error("Error eliminando profesional:", err);
      toast.error("No se pudo eliminar el profesional.");
      setProfesionalToDelete(null); 
    },
  });

 
  const handleOpenDeleteModal = (profesional: Profesional) => {
    setProfesionalToDelete(profesional);
  };
  
  const handleConfirmDelete = () => {
    if (profesionalToDelete) {
      deleteProfesional(profesionalToDelete.id);
    }
  };

 
  const especialidades = Array.from(new Set(profesionales.map((p) => p.especialidad)));
  
  const filtrados = especialidadFiltro
    ? profesionales.filter((p) => p.especialidad === especialidadFiltro)
    : profesionales;

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><LoaderCircle className="animate-spin text-blue-600" size={48} /></div>;
  }
  
  if (error) {
     return <p className="text-center mt-10 text-red-500">Error al cargar profesionales: {error.message}</p>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Gestión de Profesionales</h2>
        <button
          onClick={() => navigate("/admin/profesionales/nuevo")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 flex items-center gap-2"
        >
          <UserPlus size={20} />
          Agregar Profesional
        </button>
      </div>

      <div className="mb-4 flex items-center gap-2 bg-white p-4 rounded-lg shadow">
        <label className="font-medium text-gray-700">Filtrar por especialidad:</label>
        <select
          value={especialidadFiltro}
          onChange={(e) => setEspecialidadFiltro(e.target.value)}
          className="border border-gray-300 p-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Todas las especialidades</option>
          {especialidades.map((esp) => (<option key={esp} value={esp}>{esp}</option>))}
        </select>
      </div>

      <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
            <tr>
              <th scope="col" className="px-6 py-3">Usuario</th>
              <th scope="col" className="px-6 py-3">Matrícula</th>
              <th scope="col" className="px-6 py-3">Especialidad</th>
              <th scope="col" className="px-6 py-3">Teléfono</th>
              <th scope="col" className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length > 0 ? (
              filtrados.map((prof) => (
                <tr key={prof.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{prof.usuario_nombre}</td>
                  <td className="px-6 py-4">{prof.matricula}</td>
                  <td className="px-6 py-4">{prof.especialidad}</td>
                  <td className="px-6 py-4">{prof.telefono}</td>
                  <td className="px-6 py-4 flex justify-end gap-3">
                    <button onClick={() => navigate(`/admin/profesionales/${prof.id}/editar`)} className="text-yellow-500 hover:text-yellow-700">
                      <Edit size={20} />
                    </button>
                    <button onClick={() => handleOpenDeleteModal(prof)} className="text-red-600 hover:text-red-800">
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">No se encontraron profesionales.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      
      
      {profesionalToDelete && (
        <Modal
          isOpen={!!profesionalToDelete}
          onClose={() => setProfesionalToDelete(null)}
          onConfirm={handleConfirmDelete}
          title="Confirmar Eliminación"
          confirmText={isDeleting ? "Eliminando..." : "Sí, eliminar"}
          isConfirming={isDeleting}
        >
          <p>¿Estás seguro de que deseas eliminar al profesional <strong className="font-bold">{profesionalToDelete.usuario_nombre}</strong>?</p>
          <p className="text-sm text-red-600 mt-2">Esta acción es irreversible y también eliminará su cuenta de usuario.</p>
        </Modal>
      )}
    </div>
  );
};

export default ProfesionalesList;
