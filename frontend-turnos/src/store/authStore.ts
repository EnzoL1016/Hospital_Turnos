import { create } from "zustand";

export interface User {
  id: number;
  username: string;
  role: "ADMIN" | "PROFESIONAL" | "PACIENTE";
  profesional_id?: number; 
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  login: (user: User, access: string, refresh: string) => void;
  logout: () => void;
}


const getStoredState = (): Partial<AuthState> => {
  try {
    const user = localStorage.getItem("user");
    const accessToken = localStorage.getItem("access");
    const refreshToken = localStorage.getItem("refreshToken");
    return {
      user: user ? JSON.parse(user) : null,
      accessToken,
      refreshToken,
    };
  } catch (error) {
    console.error("No se pudo cargar el estado de localStorage", error);
    return {};
  }
};

const useAuthStore = create<AuthState>((set) => {
  const storedState = getStoredState();

  return {
    user: storedState.user || null,
    accessToken: storedState.accessToken || null,
    refreshToken: storedState.refreshToken || null,

    login: (user: User, access: string, refresh: string) => {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("access", access); 
      localStorage.setItem("refreshToken", refresh);
      set({ user, accessToken: access, refreshToken: refresh });
    },

    logout: () => {
      localStorage.removeItem("user");
      localStorage.removeItem("access"); 
      localStorage.removeItem("refreshToken");
      set({ user: null, accessToken: null, refreshToken: null });
    },
  };
});

export default useAuthStore;
