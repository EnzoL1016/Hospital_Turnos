import { Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuthStore();

 
  if (!user) return <Navigate to="/login" />;

  
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

  
  return children;
};

export default ProtectedRoute;
