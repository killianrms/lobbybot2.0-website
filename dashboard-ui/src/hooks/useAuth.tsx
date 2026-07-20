import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { apiFetch, ApiError } from "@/lib/api";
import type { AuthState } from "@/types/admin";

interface AuthContextValue extends AuthState {
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loginError: string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ authenticated: false });
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const me = await apiFetch<AuthState>("/api/auth/me");
      setState(me);
    } catch {
      setState({ authenticated: false });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    setLoginError(null);
    try {
      const result = await apiFetch<{ success: boolean; role: string }>(
        "/api/auth/login",
        { method: "POST", body: JSON.stringify({ email, password }) },
      );
      if (result.success) {
        await refresh();
      }
    } catch (e) {
      setLoginError(e instanceof ApiError ? e.message : "Erreur de connexion.");
      throw e;
    }
  }, [refresh]);

  const logout = useCallback(async () => {
    await apiFetch("/api/auth/logout", { method: "POST" });
    setState({ authenticated: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, loading, login, logout, loginError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
