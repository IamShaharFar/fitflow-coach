import { create } from "zustand";
import type { User } from "@/types";

type AuthState = {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  clear: () => void;
};

export const useAuth = create<AuthState>((set) => ({
  token: localStorage.getItem("token"),
  user: (() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) as User : null;
  })(),
  setAuth: (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    set({ token, user });
  },
  clear: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ token: null, user: null });
  }
}));
