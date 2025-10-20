import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore.ts";

const LogoutButton = () => {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300"
    >
      Cerrar sesión
    </button>
  );
};

export default LogoutButton;
