import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { apiFetch } from "@/lib/api";
import type { DiscordAuthState } from "@/types/premium";

interface DiscordAuthContextValue extends DiscordAuthState {
  loading: boolean;
  login: () => void;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const DiscordAuthContext = createContext<DiscordAuthContextValue | null>(null);

export function DiscordAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DiscordAuthState>({ authenticated: false });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const me = await apiFetch<DiscordAuthState>("/api/auth/discord/me");
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

  // Redirection pleine page (pas un fetch) : le flux OAuth2 Discord doit se faire
  // en navigation top-level, sinon Discord refuse de s'afficher dans une iframe/XHR.
  const login = useCallback(() => {
    window.location.href = "/api/auth/discord/login";
  }, []);

  const logout = useCallback(async () => {
    await apiFetch("/api/auth/discord/logout", { method: "POST" });
    setState({ authenticated: false });
  }, []);

  return (
    <DiscordAuthContext.Provider value={{ ...state, loading, login, logout, refresh }}>
      {children}
    </DiscordAuthContext.Provider>
  );
}

export function useDiscordAuth() {
  const ctx = useContext(DiscordAuthContext);
  if (!ctx) throw new Error("useDiscordAuth must be used within a DiscordAuthProvider");
  return ctx;
}
