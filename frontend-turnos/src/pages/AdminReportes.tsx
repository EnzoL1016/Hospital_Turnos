// src/pages/AdminReportes.tsx
import React, { useEffect, useState } from "react";
import api from "../api/api";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

interface GlobalReport {
  total_turnos: number;
  asistidos: number;
  inasistencias: number;
  cancelados: number;
  porcentaje_asistencia: number;
  porcentaje_inasistencia: number;
  porcentaje_cancelados: number;
  justificaciones: {
    pendientes: number;
    aceptadas: number;
    rechazadas: number;
  };
}

type ProfesionalAPI = {
  id: number;
  usuario_nombre?: string;
  usuario?: { nombre_completo?: string; username?: string };
  // otros campos posibles...
};

type PacienteAPI = {
  id: number;
  nombre_completo?: string;
  usuario?: { nombre_completo?: string; username?: string };
  // otros campos posibles...
};

interface Report {
  total_turnos: number;
  asistidos: number;
  inasistencias: number;
  cancelados: number;
  porcentaje_asistencia: number;
  porcentaje_inasistencia: number;
  porcentaje_cancelados: number;
  profesional_id?: number;
  paciente_id?: number;
}

const COLORS = ["#4CAF50", "#F44336", "#9E9E9E"]; // Verde, Rojo, Gris

export default function AdminReportes() {
  const [globalReport, setGlobalReport] = useState<GlobalReport | null>(null);
  const [profesionales, setProfesionales] = useState<ProfesionalAPI[]>([]);
  const [pacientes, setPacientes] = useState<PacienteAPI[]>([]);
  const [selectedProfesionalReport, setSelectedProfesionalReport] = useState<Report | null>(null);
  const [selectedPacienteReport, setSelectedPacienteReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    const cargarDatosIniciales = async () => {
      setLoading(true);
      setErrorMsg("");
      try {
        // usamos allSettled para que si una petición falla las otras sigan cargando
        const results = await Promise.allSettled([
          api.get("/reportes/global/"),
          api.get("/profesionales/"),
          api.get("/pacientes/"),
        ]);

        // Global
        if (results[0].status === "fulfilled") {
          setGlobalReport(results[0].value.data);
        } else {
          console.error("Error cargando reporte global:", results[0]);
        }

        // Profesionales
        if (results[1].status === "fulfilled") {
          setProfesionales(results[1].value.data);
        } else {
          console.error("Error cargando profesionales:", results[1]);
          // Si es 403/401 podemos informar al usuario
          if ((results[1] as any).reason?.response?.status === 403) {
            setErrorMsg("No tienes permisos para ver la lista de profesionales.");
          }
        }

        // Pacientes
        if (results[2].status === "fulfilled") {
          setPacientes(results[2].value.data);
        } else {
          console.error("Error cargando pacientes:", results[2]);
          if ((results[2] as any).reason?.response?.status === 403) {
            setErrorMsg((prev) =>
              prev
                ? prev + " También no hay permisos para pacientes."
                : "No tienes permisos para ver la lista de pacientes."
            );
          }
        }
      } catch (err) {
        console.error("Error inesperado cargando reportes iniciales:", err);
        setErrorMsg("Ocurrió un error al cargar los datos. Revisá la consola.");
      } finally {
        setLoading(false);
      }
    };

    cargarDatosIniciales();
  }, []);

  const profesionalDisplayName = (p: ProfesionalAPI) =>
    p.usuario_nombre || p.usuario?.nombre_completo || p.usuario?.username || `Profesional #${p.id}`;

  const pacienteDisplayName = (p: PacienteAPI) =>
    p.nombre_completo || p.usuario?.nombre_completo || p.usuario?.username || `Paciente #${p.id}`;

  const handleProfesionalSelect = async (profesionalId: string) => {
    if (!profesionalId) {
      setSelectedProfesionalReport(null);
      return;
    }
    setSelectedProfesionalReport(null);
    try {
      const res = await api.get(`/reportes/${profesionalId}/profesional/`);
      setSelectedProfesionalReport(res.data);
    } catch (err: any) {
      console.error("Error cargando reporte de profesional:", err);
      if (err?.response?.status === 403) {
        setErrorMsg("No tienes permiso para ver este reporte de profesional.");
      } else {
        setErrorMsg("Error cargando el reporte de profesional.");
      }
      setSelectedProfesionalReport(null);
    }
  };

  const handlePacienteSelect = async (pacienteId: string) => {
    if (!pacienteId) {
      setSelectedPacienteReport(null);
      return;
    }
    setSelectedPacienteReport(null);
    try {
      const res = await api.get(`/reportes/${pacienteId}/paciente/`);
      setSelectedPacienteReport(res.data);
    } catch (err: any) {
      console.error("Error cargando reporte de paciente:", err);
      if (err?.response?.status === 403) {
        setErrorMsg("No tienes permiso para ver este reporte de paciente.");
      } else {
        setErrorMsg("Error cargando el reporte de paciente.");
      }
      setSelectedPacienteReport(null);
    }
  };

  if (loading) return <p className="text-center mt-10">Cargando reportes...</p>;

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">📊 Reportes Administrativos</h1>

      {errorMsg && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 text-yellow-700">
          {errorMsg}
        </div>
      )}

      {/* Reporte global */}
      {globalReport ? (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Reporte Global</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <p className="text-2xl font-bold">{globalReport.total_turnos}</p>
              <p className="text-sm text-gray-600">Total Turnos</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <p className="text-2xl font-bold">{globalReport.asistidos}</p>
              <p className="text-sm text-gray-600">Asistidos</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg text-center">
              <p className="text-2xl font-bold">{globalReport.inasistencias}</p>
              <p className="text-sm text-gray-600">No asistidos</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-2xl font-bold">{globalReport.cancelados}</p>
              <p className="text-sm text-gray-600">Cancelados</p>
            </div>
          </div>

          {/* Pie chart: sólo si hay datos */}
          {globalReport.asistidos + globalReport.inasistencias + globalReport.cancelados > 0 ? (
            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Asistidos", value: globalReport.asistidos },
                      {
                        name: "Inasistencias",
                        value: globalReport.inasistencias,
                      },
                      { name: "Cancelados", value: globalReport.cancelados },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    label
                  >
                    {[
                      globalReport.asistidos,
                      globalReport.inasistencias,
                      globalReport.cancelados,
                    ].map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-500">
              No hay datos suficientes para mostrar el gráfico global.
            </p>
          )}
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-500">No se pudo cargar el reporte global.</p>
        </div>
      )}

      {/* Seleccionar profesional */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Reporte por Profesional</h2>
          <select
            onChange={(e) => handleProfesionalSelect(e.target.value)}
            className="border rounded-lg p-2"
          >
            <option value="">-- Ver por profesional --</option>
            {profesionales.length === 0 && <option disabled>Ningún profesional disponible</option>}
            {profesionales.map((p) => (
              <option key={p.id} value={p.id}>
                {profesionalDisplayName(p)}
              </option>
            ))}
          </select>
        </div>

        {selectedProfesionalReport ? (
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer>
              <BarChart data={[selectedProfesionalReport]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="profesional_id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="asistidos" name="Asistidos" fill="#4CAF50" />
                <Bar dataKey="inasistencias" name="No asistidos" fill="#F44336" />
                <Bar dataKey="cancelados" name="Cancelados" fill="#9E9E9E" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-gray-500">Seleccione un profesional para ver su reporte.</p>
        )}
      </div>

      {/* Seleccionar paciente */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Reporte por Paciente</h2>
          <select
            onChange={(e) => handlePacienteSelect(e.target.value)}
            className="border rounded-lg p-2"
          >
            <option value="">-- Ver por paciente --</option>
            {pacientes.length === 0 && <option disabled>Ningún paciente disponible</option>}
            {pacientes.map((p) => (
              <option key={p.id} value={p.id}>
                {pacienteDisplayName(p)}
              </option>
            ))}
          </select>
        </div>

        {selectedPacienteReport ? (
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer>
              <BarChart data={[selectedPacienteReport]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="paciente_id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="asistidos" name="Asistidos" fill="#4CAF50" />
                <Bar dataKey="inasistencias" name="No asistidos" fill="#F44336" />
                <Bar dataKey="cancelados" name="Cancelados" fill="#9E9E9E" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-gray-500">Seleccione un paciente para ver su reporte.</p>
        )}
      </div>
    </div>
  );
}
