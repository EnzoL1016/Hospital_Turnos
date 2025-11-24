import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore.ts"; 

const RedirectToDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      console.log("RedirectToDashboard: no hay user en store");
      navigate("/login");
      return;
    }

    if (!user.role) {
      console.log("RedirectToDashboard: user sin role", user);
      navigate("/login");
      return;
    }

    switch (user.role) {
      case "ADMIN":
        navigate("/admin");
        break;
      case "PROFESIONAL":
        navigate("/profesional");
        break;
      case "PACIENTE":
        navigate("/paciente");
        break;
      default:
        navigate("/login");
        break;
    }
  }, [user, navigate]);

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-800">Cargando...</h1>
    </div>
  );
};

export default RedirectToDashboard;
