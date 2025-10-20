// src/components/PublicRoute.tsx
import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const access = localStorage.getItem("access");
  const user = localStorage.getItem("user");

  if (access && user) {
    const { role } = JSON.parse(user);
    if (role === "ADMIN") return <Navigate to="/admin" replace />;
    if (role === "PROFESIONAL") return <Navigate to="/profesional" replace />;
    if (role === "PACIENTE") return <Navigate to="/paciente" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PublicRoute;
