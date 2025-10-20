// src/types/auth.ts

export interface User {
  id: number;
  username: string;
  role: "ADMIN" | "PROFESIONAL" | "PACIENTE";
  profesional_id?: number; // 👈 Agregamos el campo opcional
}

export interface AuthState {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface ProtectedRouteProps {
  roles: string[];
  children: React.ReactNode;
}
