// src/api/publicApi.ts

import axios from "axios";

const publicApi = axios.create({
  baseURL: "http://localhost:8000", // URL base del backend
  headers: {
    "Content-Type": "application/json",
  },
});

export default publicApi;
