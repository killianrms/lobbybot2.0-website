import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { ActivityEntry, Bot, GlobalConfig } from "@/types/admin";

const DEFAULT_CONFIG: GlobalConfig = { status: "", joinMsg: "", addMsg: "" };
const MAX_FEED = 100;

interface AdminDataContextValue {
  connected: boolean;
  bots: Bot[];
  config: GlobalConfig;
  activity: ActivityEntry[];
  applyConfig: (config: GlobalConfig) => void;
  sendCommand: (target: string, action: string, data?: unknown) => void;
  refreshBots: () => Promise<void>;
  removeBotLocally: (email: string) => void;
}

const AdminDataContext = createContext<AdminDataContextValue | null>(null);

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const { authenticated, role } = useAuth();
  const isAdmin = authenticated && role === "admin";
  const socketRef = useRef<Socket | null>(null);
  // Table des emails connus par nom de bot, alimentée par /api/bots (filtré secret_id
  // côté serveur — donc pas fiable comme LISTE de bots, mais fiable pour l'email).
  const emailByName = useRef<Map<string, string>>(new Map());

  const [connected, setConnected] = useState(false);
  const [bots, setBots] = useState<Bot[]>([]);
  const [config, setConfig] = useState<GlobalConfig>(DEFAULT_CONFIG);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);

  const refreshBots = useCallback(async () => {
    try {
      const data = await apiFetch<Bot[]>("/api/bots");
      for (const b of data) {
        if (b.email) emailByName.current.set(b.name, b.email);
      }
      // Enrichit la liste live existante avec les emails fraîchement connus,
      // sans jamais retirer un bot déjà affiché (voir note plus bas).
      setBots((prev) => prev.map((b) => ({ ...b, email: b.email || emailByName.current.get(b.name) })));
    } catch {
      // échec silencieux — le socket reste la source de vérité pour la liste des bots
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setConnected(false);
      return;
    }

    refreshBots();
    apiFetch<ActivityEntry[]>("/api/activity").then(setActivity).catch(() => {});

    const socket = io({ withCredentials: true });
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("manager:bots", (rawBots: (Bot | string)[]) => {
      // Source de vérité pour QUELS bots sont en ligne : le flux temps réel du
      // manager Discord. /api/bots ne renvoie que les bots ayant un secret_id en
      // base (ex: ajoutés via "Ajouter un bot") — un bot importé via accounts.csv
      // (device auth généré séparément) n'y apparaît jamais. On ne doit donc
      // JAMAIS filtrer la liste live sur la base de /api/bots : on l'enrichit
      // seulement avec l'email quand on le connaît (nécessaire pour Restart/Suppr).
      setBots(
        rawBots.map((b) => {
          const bot: Bot =
            typeof b === "string" ? { name: b, friends: 0, isOnline: true, ping: null } : b;
          return { ...bot, email: bot.email || emailByName.current.get(bot.name) };
        }),
      );
    });

    socket.on("globalConfig:current", (cfg: Partial<GlobalConfig>) => {
      setConfig((prev) => ({ ...prev, ...cfg }));
    });

    socket.on("activity:log", (log: ActivityEntry[]) => setActivity(log));

    socket.on("activity:new", (entry: ActivityEntry) => {
      setActivity((prev) => [entry, ...prev].slice(0, MAX_FEED));
      toast(entry.message || entry.type, { icon: entry.icon });
    });

    socket.on("action:sent", (data: { target: string; action: string }) => {
      toast.success(`Commande "${data.action}" envoyée à ${data.target}`);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [isAdmin, refreshBots]);

  const applyConfig = useCallback((next: GlobalConfig) => {
    socketRef.current?.emit("config:globalUpdate", next);
  }, []);

  const sendCommand = useCallback((target: string, action: string, data?: unknown) => {
    socketRef.current?.emit("cmd:manager:action", { target, action, data });
  }, []);

  const removeBotLocally = useCallback((email: string) => {
    setBots((prev) => prev.filter((b) => b.email !== email));
  }, []);

  return (
    <AdminDataContext.Provider
      value={{ connected, bots, config, activity, applyConfig, sendCommand, refreshBots, removeBotLocally }}
    >
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData() {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error("useAdminData must be used within an AdminDataProvider");
  return ctx;
}
