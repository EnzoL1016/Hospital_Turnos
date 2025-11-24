// src/api/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const access = localStorage.getItem("access"); // 👈 clave única
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
          const res = await axios.post("http://localhost:8000/api/auth/refresh/", {
            refresh: refreshToken,
          });

          if (res.status === 200) {
            // 👇 usamos siempre "access"
            localStorage.setItem("access", res.data.access);

            // Reintentamos con el nuevo token
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
