import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const RedirectToDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const access = localStorage.getItem("access");
    const user = localStorage.getItem("user");
    if (access && user) {
      const { role } = JSON.parse(user);
      if (role === "ADMIN") navigate("/admin/dashboard");
      else if (role === "PROFESIONAL") navigate("/profesional/dashboard");
      else if (role === "PACIENTE") navigate("/paciente/dashboard");
      else navigate("/");
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return null;
};

export default RedirectToDashboard;
