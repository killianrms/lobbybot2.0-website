import { useCallback, useEffect, useState } from "react";

import { apiFetch, ApiError } from "@/lib/api";
import type { PremiumBot, Preset } from "@/types/premium";

export function usePremiumData(enabled: boolean) {
  const [bots, setBots] = useState<PremiumBot[]>([]);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    try {
      const [botsData, presetsData] = await Promise.all([
        apiFetch<PremiumBot[]>("/api/premium/bots"),
        apiFetch<Preset[]>("/api/premium/presets"),
      ]);
      setBots(botsData);
      setPresets(presetsData);
    } catch {
      // silencieux — la page affiche déjà un état vide par défaut
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const activatePreset = useCallback(
    async (name: string) => {
      await apiFetch(`/api/premium/presets/${encodeURIComponent(name)}/activate`, { method: "POST" });
      await refresh();
    },
    [refresh],
  );

  const deletePreset = useCallback(
    async (name: string) => {
      await apiFetch(`/api/premium/presets/${encodeURIComponent(name)}`, { method: "DELETE" });
      await refresh();
    },
    [refresh],
  );

  const triggerSquad = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    try {
      return await apiFetch("/api/premium/squad", { method: "POST" });
    } catch (e) {
      return { success: false, message: e instanceof ApiError ? e.message : "Erreur serveur." };
    }
  }, []);

  const triggerEmoteAll = useCallback(async (query: string): Promise<{ success: boolean; message: string }> => {
    try {
      return await apiFetch("/api/premium/emote-all", {
        method: "POST",
        body: JSON.stringify({ query }),
      });
    } catch (e) {
      return { success: false, message: e instanceof ApiError ? e.message : "Erreur serveur." };
    }
  }, []);

  return { bots, presets, loading, refresh, activatePreset, deletePreset, triggerSquad, triggerEmoteAll };
}
