import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

import type { Bot, GlobalConfig } from "@/types/admin";

const DEFAULT_CONFIG: GlobalConfig = { status: "", joinMsg: "", addMsg: "" };

export function usePublicBots() {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [bots, setBots] = useState<Bot[]>([]);
  const [config, setConfig] = useState<GlobalConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    const socket = io();
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("manager:bots", (rawBots: (Bot | string)[]) => {
      setBots(
        rawBots.map((b) =>
          typeof b === "string" ? { name: b, friends: 0, isOnline: true, ping: null } : b,
        ),
      );
    });

    socket.on("globalConfig:current", (cfg: Partial<GlobalConfig>) => {
      setConfig((prev) => ({ ...prev, ...cfg }));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  return { connected, bots, config };
}
