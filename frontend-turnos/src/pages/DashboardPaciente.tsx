// src/pages/DashboardPaciente.tsx
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CalendarPlus, Calendar, UserX, BarChart3, LoaderCircle } from "lucide-react";
import useAuthStore from '../store/authStore';
import api from "../api/api";

interface Turno {
  paciente_nombre: string;
}

const DashboardPaciente = () => {
  const user = useAuthStore(state => state.user);

  // [CAMBIO] Se añade una query para obtener los turnos y de ahí el nombre del paciente
  const { data: turnos, isLoading } = useQuery<Turno[], Error>({
    queryKey: ['mis-turnos-nombre'], // Una key diferente para no interferir con otras vistas
    queryFn: () => api.get<Turno[]>("/turnos/mis-turnos/").then(res => res.data),
    // Solo se ejecuta si hay un usuario logueado
    enabled: !!user,
  });

  // Se extrae el nombre del primer turno, si existe. Si no, se usa el username.
  const nombrePaciente = turnos && turnos.length > 0 ? turnos[0].paciente_nombre : user?.username;

  return (
    <div className="p-6 space-y-8">
      {/* --- Cabecera de Bienvenida --- */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          {/* Se muestra el nombre del paciente o un saludo genérico mientras carga */}
          Bienvenido, {isLoading ? '...' : nombrePaciente}
        </h1>
        <p className="text-gray-600 mt-1">Aquí puedes acceder a todas las funciones de tu portal.</p>
      </div>
      
      {/* Se muestra un loader mientras se busca el nombre del paciente */}
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
            <LoaderCircle className="animate-spin text-purple-600" size={40} />
        </div>
      ) : (
        /* --- Grilla de Tarjetas de Acción --- */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* --- Tarjeta: Reservar Turno --- */}
          <Link 
            to="/paciente/turnos-disponibles" 
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow flex items-center gap-4 group"
          >
            <div className="bg-blue-100 p-4 rounded-full transition-transform group-hover:scale-110">
              <CalendarPlus className="text-blue-600" size={28} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Reservar Turno</h3>
              <p className="text-gray-500">Busca profesionales y agenda una nueva cita.</p>
            </div>
          </Link>

          {/* --- Tarjeta: Mis Turnos --- */}
          <Link 
            to="/paciente/mis-turnos" 
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow flex items-center gap-4 group"
          >
            <div className="bg-purple-100 p-4 rounded-full transition-transform group-hover:scale-110">
              <Calendar className="text-purple-600" size={28} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Mis Turnos</h3>
              <p className="text-gray-500">Revisa, gestiona o cancela tus próximos turnos.</p>
            </div>
          </Link>

          {/* --- Tarjeta: Mis Inasistencias --- */}
          <Link 
            to="/paciente/inasistencias" 
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow flex items-center gap-4 group"
          >
            <div className="bg-yellow-100 p-4 rounded-full transition-transform group-hover:scale-110">
              <UserX className="text-yellow-600" size={28} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Mis Inasistencias</h3>
              <p className="text-gray-500">Justifica tus inasistencias pasadas.</p>
            </div>
          </Link>

          {/* --- Tarjeta: Ver Reportes --- */}
          <Link 
            to="/paciente/reportes" 
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow flex items-center gap-4 group"
          >
            <div className="bg-red-100 p-4 rounded-full transition-transform group-hover:scale-110">
              <BarChart3 className="text-red-600" size={28} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Ver Reportes</h3>
              <p className="text-gray-500">Visualiza tu historial y estadísticas.</p>
            </div>
          </Link>

        </div>
      )}
    </div>
  );
};

export default DashboardPaciente;