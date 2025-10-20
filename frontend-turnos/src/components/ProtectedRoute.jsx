import { Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuthStore();

  // No hay usuario logueado → redirigir a login
  if (!user) return <Navigate to="/login" />;

  // Usuario logueado pero no tiene rol permitido → redirigir al home de su rol
  if (roles && !roles.includes(user.role)) {
    switch (user.role) {
      case "ADMIN":
        return <Navigate to="/admin" />;
      case "PROFESIONAL":
        return <Navigate to="/profesional" />;
      case "PACIENTE":
        return <Navigate to="/paciente" />;
      default:
        return <Navigate to="/login" />;
    }
  }

  // Usuario con rol permitido → renderizar componente
  return children;
};

export default ProtectedRoute;
