import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import Login from "./pages/Login.tsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import RedirectToDashboard from "./components/RedirectToDashboard.tsx";
import RegistroPaciente from "./pages/RegistroPaciente.tsx";
import ProfesionalesList from "./pages/ProfesionalesList.tsx";
import ProfesionalCreate from "./pages/ProfesionalCreate.tsx";
import ProfesionalEdit from "./pages/ProfesionalEdit.tsx";
import CrearAgenda from "./pages/CrearAgenda.tsx";
import AgendaList from "./pages/AgendaList.tsx";
import TurnosDisponibles from "./pages/TurnosDisponibles";
import VistaDeTurnos from "./pages/VistaDeTurnos.tsx";
import Inasistencias from "./pages/Inasistencias.tsx";
import InasistenciasProfesional from "./pages/InasistenciasProfesional.tsx";
import PublicRoute from "./components/PublicRoute";
import React, { Suspense } from "react";

// Layout
import DashboardLayout from "./components/DashboardLayout";

// Lazy imports
const DashboardAdmin = React.lazy(() => import("./pages/DashboardAdmin.tsx"));
const DashboardProfesional = React.lazy(() => import("./pages/DashboardProfesional.tsx"));
const DashboardPaciente = React.lazy(() => import("./pages/DashboardPaciente.tsx"));
const AdminReportes = React.lazy(() => import("./pages/AdminReportes.tsx"));
const ProfesionalReportes = React.lazy(() => import("./pages/ProfesionalReportes.tsx"));
const PacienteReportes = React.lazy(() => import("./pages/PacienteReportes.tsx"));

// NavItems por rol
const adminNavItems = [
  { name: "Inicio", href: "/admin" },
  { name: "Profesionales", href: "/admin/profesionales/list" },
  { name: "Agregar Profesional", href: "/admin/profesionales/nuevo" },
  { name: "Agendas", href: "/admin/agendas/create" },
  { name: "Reportes", href: "/admin/reportes" },
];

const profesionalNavItems = [
  { name: "Inicio", href: "/profesional" },
  { name: "Mis Agendas", href: "/profesional/agendas" },
  { name: "Inasistencias", href: "/profesional/inasistencias" },
  { name: "Reportes", href: "/profesional/reportes" },
];

const pacienteNavItems = [
  { name: "Inicio", href: "/paciente" },
  { name: "Reservar Turno", href: "/paciente/turnos-disponibles" },
  { name: "Mis Turnos", href: "/paciente/mis-turnos" },
  { name: "Mis Inasistencias", href: "/paciente/inasistencias" },
  { name: "Ver Reportes", href: "/paciente/reportes" },
];

function App() {
  return (
    <Router>
      <Suspense fallback={<div>Cargando...</div>}>
        <Routes>
          {/* Rutas Públicas */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/registro"
            element={
              <PublicRoute>
                <RegistroPaciente />
              </PublicRoute>
            }
          />
          <Route path="/" element={<RedirectToDashboard />} />
          <Route
            path="/profesionales"
            element={
              <ProtectedRoute roles={["ADMIN", "PACIENTE", "PROFESIONAL"]}>
                <ProfesionalesList />
              </ProtectedRoute>
            }
          />

          {/* ADMIN con layout */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <DashboardLayout
                  title="Panel de Administrador"
                  navItems={adminNavItems}
                  colorClass="bg-blue-600"
                >
                  <Outlet />
                </DashboardLayout>
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardAdmin />} />
            <Route path="profesionales/list" element={<ProfesionalesList />} />
            <Route path="profesionales/nuevo" element={<ProfesionalCreate />} />
            <Route path="profesionales/:id/editar" element={<ProfesionalEdit />} />
            <Route path="agendas/create" element={<CrearAgenda />} />
            <Route path="reportes" element={<AdminReportes />} />
          </Route>

          {/* PROFESIONAL con layout */}
          <Route
            path="/profesional"
            element={
              <ProtectedRoute roles={["PROFESIONAL"]}>
                <DashboardLayout
                  title="Panel de Profesional"
                  navItems={profesionalNavItems}
                  colorClass="bg-green-600"
                >
                  <Outlet />
                </DashboardLayout>
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardProfesional />} />
            <Route path="agendas" element={<AgendaList />} />
            <Route path="agendas/create" element={<CrearAgenda />} />
            <Route path="agendas/:id/turnos" element={<VistaDeTurnos />} />
            <Route path="inasistencias" element={<InasistenciasProfesional />} />
            <Route path="reportes" element={<ProfesionalReportes />} />
          </Route>

          {/* PACIENTE con layout */}
          <Route
            path="/paciente"
            element={
              <ProtectedRoute roles={["PACIENTE"]}>
                <DashboardLayout
                  title="Panel de Paciente"
                  navItems={pacienteNavItems}
                  colorClass="bg-purple-600"
                >
                  <Outlet />
                </DashboardLayout>
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPaciente />} />
            <Route path="turnos-disponibles" element={<TurnosDisponibles />} />
            <Route path="mis-turnos" element={<VistaDeTurnos />} />
            <Route path="inasistencias" element={<Inasistencias />} />
            <Route path="reportes" element={<PacienteReportes />} />
          </Route>

          {/* Ruta por defecto */}
          <Route path="*" element={<RedirectToDashboard />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
