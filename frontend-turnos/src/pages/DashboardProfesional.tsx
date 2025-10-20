import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Calendar, CalendarPlus, List, LoaderCircle } from "lucide-react";
import useAuthStore from '../store/authStore';
import api from "../api/api";

interface Agenda {
  id: number;
  mes: string; // Formato "YYYY-MM-DD"
}

// Helper function to get the target agenda ID
const getTargetAgendaId = (agendas: Agenda[] | undefined): number | null => {
  if (!agendas || agendas.length === 0) {
    return null;
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // getMonth() is 0-indexed

  // Find agenda for the current month
  const currentAgenda = agendas.find(agenda => {
    const agendaDate = new Date(agenda.mes);
    return agendaDate.getFullYear() === currentYear && agendaDate.getMonth() + 1 === currentMonth;
  });

  if (currentAgenda) {
    return currentAgenda.id;
  }

  // If no current agenda, find the most recent past one
  const pastAgendas = agendas
    .filter(a => new Date(a.mes) < now)
    .sort((a, b) => new Date(b.mes).getTime() - new Date(a.mes).getTime());

  return pastAgendas.length > 0 ? pastAgendas[0].id : null;
};


const DashboardProfesional = () => {
  const user = useAuthStore(state => state.user);

  // --- OPTIMIZATION: Fetching agendas with useQuery ---
  const { data: agendas, isLoading } = useQuery<Agenda[], Error>({
    queryKey: ['agendas', 'profesional'],
    queryFn: () => api.get<Agenda[]>("/agendas/").then(res => res.data.results || res.data),
  });

  // useMemo prevents recalculating on every render unless agendas change
  const targetAgendaId = useMemo(() => getTargetAgendaId(agendas), [agendas]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Bienvenido, {user?.username}</h1>
        <p className="text-gray-600 mt-1">Desde aquí puedes gestionar tus agendas y turnos.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40"><LoaderCircle className="animate-spin text-green-600" size={40} /></div>
      ) : (
        <>
          {targetAgendaId && (
            <Link
              to={`/profesional/agendas/${targetAgendaId}/turnos`}
              className="flex items-center justify-center gap-3 w-full p-4 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition-transform transform hover:scale-105"
            >
              <Calendar size={24} />
              <span className="text-lg font-semibold">Ver Turnos del Mes Actual</span>
            </Link>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {/* --- Action Card: Manage Agendas --- */}
            <Link to="/profesional/agendas" className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <List className="text-blue-600" size={28} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Mis Agendas</h3>
                <p className="text-gray-500">Visualiza y gestiona todas tus agendas.</p>
              </div>
            </Link>

            {/* --- Action Card: Create Agenda --- */}
            <Link to="/profesional/agendas/create" className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full">
                <CalendarPlus className="text-green-600" size={28} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Crear Nueva Agenda</h3>
                <p className="text-gray-500">Define tus horarios para un nuevo mes.</p>
              </div>
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardProfesional;
