import axios from "axios";

// Definimos la URL base aca para usarla en ambos lugares y evitar errores
const API_BASE_URL = "https://hospital-backend-vo2y.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const access = localStorage.getItem("access");
    if (access) {
      config.headers.Authorization = `Bearer ${access}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        try {
          // [CORRECCIÓN] Usamos la URL de producción definida arriba
          const res = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });

          if (res.status === 200) {
            
            localStorage.setItem("access", res.data.access);

           
            originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
            return axios(originalRequest);
          }
        } catch (refreshError) {
          console.error("Error refrescando token:", refreshError);
          localStorage.removeItem("user");
          localStorage.removeItem("access");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
        }
      } else {
        localStorage.removeItem("user");
        localStorage.removeItem("access");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;