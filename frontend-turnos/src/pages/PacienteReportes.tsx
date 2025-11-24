import React, { useEffect, useState } from "react";
import api from "../api/api";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface Historial {
  paciente_id?: number;
  total_turnos: number;
  asistidos: number;
  inasistencias: number;
  cancelados: number;
  porcentaje_asistencia?: number;
  porcentaje_inasistencia?: number;
  porcentaje_cancelados?: number;
}

const COLORS = ["#4CAF50", "#F44336", "#9E9E9E"]; // Verde, Rojo, Gris

export default function PacienteReportes() {
  const [historial, setHistorial] = useState<Historial | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    const cargarHistorial = async () => {
      setLoading(true);
      setErrorMsg("");
      setHistorial(null);

  
      const endpoints = ["/reportes/mi-historial/", "/reportes/mi-reporte/"];

      for (let i = 0; i < endpoints.length; i++) {
        const ep = endpoints[i];
        try {
          const res = await api.get(ep);
          console.log(`[PacienteReportes] Éxito desde endpoint: ${ep}`, res.data);
          setHistorial(res.data);
          setLoading(false);
          return;
        } catch (err: any) {
        
          console.warn(`[PacienteReportes] Error en ${ep}:`, {
            status: err?.response?.status,
            url: err?.config?.url,
            method: err?.config?.method,
            responseData: err?.response?.data,
          });

       
          if (err?.response?.status === 404) {
            continue;
          }

       
          if (err?.response?.status === 403) {
            setErrorMsg(
              "Acceso denegado: este informe solo está disponible para pacientes autenticados."
            );
            setLoading(false);
            return;
          }

      
          if (err?.response?.status === 400) {
            setErrorMsg("No se encontró un perfil de paciente asociado a este usuario.");
            setLoading(false);
            return;
          }

         
          if (!err?.response) {
            setErrorMsg("Error de red o CORS. Revisá la consola del navegador para más detalles.");
            setLoading(false);
            return;
          }

        
          setErrorMsg(
            "Ocurrió un error al cargar tu historial de turnos. Revisá la consola para más información."
          );
          setLoading(false);
          return;
        }
      }

      
      setErrorMsg("No se encontró el endpoint de historial en el servidor (404).");
      setLoading(false);
    };

    cargarHistorial();
  }, []);

  if (loading) return <p className="text-center mt-10">Cargando tu historial...</p>;

  if (errorMsg)
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">🗓️ Mi Historial de Turnos</h1>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-yellow-800">
          {errorMsg}
        </div>
      </div>
    );

  const chartData = historial
    ? [
        { name: "Asistidos", value: historial.asistidos },
        { name: "Inasistencias", value: historial.inasistencias },
        { name: "Cancelados", value: historial.cancelados },
      ].filter((item) => item.value > 0)
    : [];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🗓️ Mi Historial de Turnos</h1>

      {historial && historial.total_turnos > 0 ? (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-8">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold">{historial.total_turnos}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold">{historial.asistidos}</p>
              <p className="text-sm text-gray-600">Asistidos</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold">{historial.inasistencias}</p>
              <p className="text-sm text-gray-600">No asistidos</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold">{historial.cancelados}</p>
              <p className="text-sm text-gray-600">Cancelados</p>
            </div>
          </div>

          {chartData.length > 0 ? (
            <div style={{ width: "100%", height: 400 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={140}
                    label
                  >
                    {chartData.map((_, idx) => (
                      <Cell key={`c-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-500">No hay suficientes datos para graficar.</p>
          )}
        </div>
      ) : (
        <p className="text-center text-gray-500">
          Aún no tienes un historial de turnos para mostrar.
        </p>
      )}
    </div>
  );
}
