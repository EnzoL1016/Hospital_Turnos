import { useEffect, useState } from "react";
import api from "../api/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Report {
  total_turnos: number;
  asistidos: number;
  inasistencias: number;
  cancelados: number;
  porcentaje_asistencia: number;
  agenda_id?: number;
}

interface Agenda {
  id: number;
  mes: string;
}


const formatMonthFromYYYYMMDD = (mesStr: string) => {
  if (!mesStr) return "";
  const date = new Date(mesStr + "T00:00:00");
  return date.toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
};

export default function ProfesionalReportes() {
  const [miReporte, setMiReporte] = useState<Report | null>(null);
  const [misAgendas, setMisAgendas] = useState<Agenda[]>([]);
  const [reporteAgenda, setReporteAgenda] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [resReporte, resAgendas] = await Promise.all([
          api.get("/reportes/mi-reporte/"),
          api.get("/agendas/"),
        ]);
        setMiReporte(resReporte.data);
        setMisAgendas(resAgendas.data);
      } catch (error: any) {
        console.error("Error al cargar datos del profesional", error);
        setError("No se pudieron cargar los reportes. " + (error.response?.data?.detail || ""));
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  const handleAgendaSelect = async (agendaId: string) => {
    if (!agendaId) {
      setReporteAgenda(null);
      return;
    }
    try {
      const res = await api.get(`/reportes/${agendaId}/agenda/`);
      setReporteAgenda(res.data);
    } catch (error) {
      console.error("Error al cargar reporte de agenda", error);
    }
  };

  if (loading) return <p className="text-center mt-10">Cargando reporte...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  const chartData = miReporte
    ? [
        {
          name: "Total",
          asistidos: miReporte.asistidos,
          inasistencias: miReporte.inasistencias,
          cancelados: miReporte.cancelados,
        },
      ]
    : [];

  return (
    <div className="container mx-auto p-6 space-y-10">
      <h1 className="text-3xl font-bold">📈 Mi Reporte de Productividad</h1>

      {miReporte ? (
        <>
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Resumen General</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold">{miReporte.total_turnos}</p>
                <p>Total Turnos</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold">{miReporte.asistidos}</p>
                <p>Asistidos</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold">{miReporte.inasistencias}</p>
                <p>Inasistencias</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold">{miReporte.porcentaje_asistencia}%</p>
                <p>Productividad</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300} className="mt-6">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" /> <YAxis /> <Tooltip /> <Legend />
                <Bar dataKey="asistidos" fill="#4CAF50" name="Asistencias" />
                <Bar dataKey="inasistencias" fill="#F44336" name="Inasistencias" />
                <Bar dataKey="cancelados" fill="#9E9E9E" name="Cancelados" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Reporte por Agenda</h2>
              <select
                onChange={(e) => handleAgendaSelect(e.target.value)}
                className="border rounded-lg p-2"
              >
                <option value="">Seleccione una agenda</option>
                {misAgendas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {formatMonthFromYYYYMMDD(a.mes)}
                  </option>
                ))}
              </select>
            </div>
            {reporteAgenda ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[reporteAgenda]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="agenda_id" name="ID Agenda" /> <YAxis /> <Tooltip /> <Legend />
                  <Bar dataKey="asistidos" fill="#4CAF50" name="Asistencias" />
                  <Bar dataKey="inasistencias" fill="#F44336" name="Inasistencias" />
                  <Bar dataKey="cancelados" fill="#9E9E9E" name="Cancelados" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500">Seleccione una agenda para ver su detalle.</p>
            )}
          </div>
        </>
      ) : (
        <p className="text-center text-gray-500">No hay datos de reporte para mostrar.</p>
      )}
    </div>
  );
}
