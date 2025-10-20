import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";

interface Agenda {
  id: number;
  mes: string;
  horario_inicio: string;
  horario_fin: string;
  duracion_turno: number;
  profesional_nombre: string;
  especialidad: string;
}

// ✅ utilitario para formatear "YYYY-MM-DD" a "Mes Año"
const formatMonthFromYYYYMMDD = (mesStr: string) => {
  if (!mesStr) return "";
  const parts = mesStr.split("-");
  if (parts.length < 2) return mesStr;

  const year = parts[0];
  const month = Number(parts[1]); // 1-based
  const meses = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];

  return `${meses[month - 1] ?? month} ${year}`;
};

const AgendaList = () => {
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAgendas = async () => {
      try {
        const res = await api.get<Agenda[]>("/agendas/");
        setAgendas(res.data);
      } catch (err) {
        console.error("Error cargando agendas:", err);
        setError("No se pudieron cargar las agendas");
      } finally {
        setLoading(false);
      }
    };
    fetchAgendas();
  }, []);

  if (loading) return <p className="text-center mt-10">Cargando agendas...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-6">Agendas</h2>
      {agendas.length === 0 ? (
        <p>No hay agendas registradas.</p>
      ) : (
        <table className="w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2 border">Mes</th>
              <th className="p-2 border">Profesional</th>
              <th className="p-2 border">Especialidad</th>
              <th className="p-2 border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {agendas.map((agenda) => (
              <tr key={agenda.id} className="hover:bg-gray-50">
                <td className="p-2 border">{formatMonthFromYYYYMMDD(agenda.mes)}</td>
                <td className="p-2 border">{agenda.profesional_nombre}</td>
                <td className="p-2 border">{agenda.especialidad}</td>
                <td className="p-2 border">
                  <Link
                    to={`/profesional/agendas/${agenda.id}/turnos`}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Ver turnos
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AgendaList;
