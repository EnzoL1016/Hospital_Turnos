import { useState, FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import api from "../api/api";
import { LoginResponse } from "../types/auth";
const Login = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  useEffect(() => {
    const checkAuth = () => {
      const access = localStorage.getItem("access");
      const user = localStorage.getItem("user");

      if (access && user) {
        // Intentar verificar expiración básica del token (JWT)
        try {
          const payload = JSON.parse(atob(access.split('.')[1]));
          const now = Date.now() / 1000;
          
          if (payload.exp && payload.exp < now) {
            // Token expirado, limpiar y quedarse en login
            console.log("Token expirado detectado en Login, limpiando...");
            localStorage.removeItem("access");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            setCheckingAuth(false);
            return;
          }
        } catch (e) {
          // Si falla el decodificado, asumir inválido
          console.error("Error decodificando token en Login", e);
          setCheckingAuth(false);
          return;
        }

        const { role } = JSON.parse(user);
        if (role === "ADMIN") navigate("/admin/dashboard");
        else if (role === "PROFESIONAL") navigate("/profesional/dashboard");
        else if (role === "PACIENTE") navigate("/paciente/dashboard");
        else navigate("/");
      } else {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, [navigate]);
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post<LoginResponse>("/auth/login/", {
        username,
        password,
      });
      if (res.data.user && res.data.access && res.data.refresh) {
        login(res.data.user, res.data.access, res.data.refresh);
        navigate("/");
      } else {
        setError("Respuesta inválida del servidor");
      }
    } catch (err) {
      console.error(err);
      setError("Credenciales incorrectas. Por favor, intente de nuevo.");
    }
  };
  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-lg text-gray-600">Verificando sesión...</div>{" "}
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Usuario</label>
            <input
              type="text"
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ingresar
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-4">
          {" "}
          ¿No tienes cuenta?
          <span
            className="text-blue-600 cursor-pointer hover:underline"
            onClick={() => navigate("/registro")}
          >
            Regístrate aquí
          </span>
        </p>
      </div>
    </div>
  );
};
export default Login;
