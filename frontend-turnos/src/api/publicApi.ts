import axios from "axios";

const publicApi = axios.create({
  // Reemplazamos localhost por la URL de Render
  baseURL: "https://hospital-backend-vo2y.onrender.com", 
  headers: {
    "Content-Type": "application/json",
  },
});

export default publicApi;