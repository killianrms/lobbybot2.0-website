import { useState } from "react";
import type { SVGProps } from "react";
import { toast } from "sonner";
import { Sparkles, Star, Trash2, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDiscordAuth } from "@/hooks/useDiscordAuth";
import { usePremiumData } from "@/hooks/usePremiumData";
import { cn } from "@/lib/utils";

function DiscordIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.076.076 0 0 0-.04.107c.36.698.772 1.363 1.225 1.993a.076.076 0 0 0 .084.029 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.055c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028ZM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.955 2.418-2.157 2.418Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z" />
    </svg>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
      Chargement...
    </div>
  );
}

function LoggedOutState({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Card className="fade-up glow-surface w-full max-w-sm text-center">
        <CardHeader>
          <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="size-5" />
          </div>
          <CardTitle className="font-display">Espace Premium</CardTitle>
          <CardDescription>
            Connecte-toi avec ton compte Discord pour retrouver ta flotte perso, tes presets
            et lancer ta squad.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onLogin} className="w-full gap-2 bg-[#5865F2] text-white hover:bg-[#5865F2]/90">
            <DiscordIcon className="size-4" />
            Se connecter avec Discord
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function UpsellState({ username }: { username?: string }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Card className="fade-up glow-surface w-full max-w-md border-premium/40 bg-premium-bg text-center">
        <CardHeader>
          <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-premium/15 text-premium">
            <Star className="size-5" />
          </div>
          <CardTitle className="font-display text-premium">Pas encore Premium</CardTitle>
          <CardDescription>
            {username ? `${username}, tu` : "Tu"} n'as pas d'abonnement LobbyBot Premium actif.
            Abonne-toi directement sur Discord avec <code>/premium</code> pour débloquer ta
            flotte perso, <code>/squad</code>, les emotes synchronisées et les presets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="bg-premium text-white hover:bg-premium/90">
            <a href="https://discord.gg/SarmtBh3Gu" target="_blank" rel="noopener noreferrer">
              Rejoindre le Discord
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Premium() {
  const { loading, authenticated, username, premium, login } = useDiscordAuth();
  const isPremium = Boolean(premium);
  const { bots, presets, activatePreset, deletePreset, triggerSquad, triggerEmoteAll } =
    usePremiumData(isPremium);

  const [emoteQuery, setEmoteQuery] = useState("");
  const [sendingSquad, setSendingSquad] = useState(false);
  const [sendingEmote, setSendingEmote] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  if (loading) return <LoadingState />;
  if (!authenticated) return <LoggedOutState onLogin={login} />;
  if (!isPremium) return <UpsellState username={username} />;

  const online = bots.filter((b) => b.isOnline);

  async function handleSquad() {
    setSendingSquad(true);
    const res = await triggerSquad();
    (res.success ? toast.success : toast.error)(res.message);
    setSendingSquad(false);
  }

  async function handleEmoteAll() {
    if (!emoteQuery.trim()) return;
    setSendingEmote(true);
    const res = await triggerEmoteAll(emoteQuery.trim());
    (res.success ? toast.success : toast.error)(res.message);
    setSendingEmote(false);
  }

  async function handleDeleteConfirm() {
    if (!pendingDelete) return;
    await deletePreset(pendingDelete);
    toast.success(`Preset "${pendingDelete}" supprimé.`);
    setPendingDelete(null);
  }

  return (
    <div className="space-y-10">
      <div className="fade-up flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
            Salut {username} 👋
          </h1>
          <p className="mt-1 text-muted-foreground">Ta flotte perso, tes presets, ta squad.</p>
        </div>
        <Badge variant="premium" className="gap-1.5 px-3 py-1.5 text-sm">
          <Star className="size-3.5" /> Premium actif
        </Badge>
      </div>

      {/* Squad + emote-all */}
      <div className="fade-up grid gap-4 sm:grid-cols-2" style={{ animationDelay: "60ms" }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-base">
              <Users className="size-4 text-primary" /> Squad
            </CardTitle>
            <CardDescription>Tes bots en ligne rejoignent ta party Fortnite.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleSquad} disabled={sendingSquad} className="w-full">
              {sendingSquad ? "Envoi..." : "Appeler ma squad"}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-base">
              <Sparkles className="size-4 text-primary" /> Emote synchronisée
            </CardTitle>
            <CardDescription>Tous tes bots dansent la même emote en même temps.</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Input
              value={emoteQuery}
              onChange={(e) => setEmoteQuery(e.target.value)}
              placeholder="Nom de l'emote (ex: floss)"
              onKeyDown={(e) => e.key === "Enter" && handleEmoteAll()}
            />
            <Button onClick={handleEmoteAll} disabled={sendingEmote || !emoteQuery.trim()}>
              {sendingEmote ? "..." : "Jouer"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Owned fleet */}
      <Card className="fade-up" style={{ animationDelay: "120ms" }}>
        <CardHeader>
          <CardTitle className="font-display">Ma flotte</CardTitle>
          <CardDescription>{online.length} en ligne sur {bots.length} bot(s) perso.</CardDescription>
        </CardHeader>
        <CardContent>
          {bots.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Aucun bot perso pour le moment. Crée-en un avec <code>/createbot</code> sur Discord.
            </p>
          ) : (
            <div className="divide-y divide-border/60">
              {bots.map((bot) => (
                <div key={bot.name} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="flex items-center gap-2 font-medium text-foreground">
                    <span
                      className={cn(
                        bot.isOnline ? "pulse-dot" : "inline-flex size-2 rounded-full bg-muted-foreground/40",
                      )}
                      aria-hidden
                    />
                    {bot.name}
                  </span>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span>{bot.friends ?? 0} amis</span>
                    <Badge variant={bot.isOnline ? "success" : "outline"}>
                      {bot.isOnline ? "En ligne" : "Hors ligne"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Presets */}
      <Card className="fade-up" style={{ animationDelay: "180ms" }}>
        <CardHeader>
          <CardTitle className="font-display">Mes presets</CardTitle>
          <CardDescription>
            Créés via <code>/preset save</code> sur Discord. Active celui à appliquer à ta
            prochaine squad.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {presets.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Aucun preset. Crée-en un avec <code>/preset save</code> sur Discord.
            </p>
          ) : (
            <div className="space-y-2">
              {presets.map((preset) => (
                <div
                  key={preset.name}
                  className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{preset.name}</span>
                    {preset.isActive && <Badge variant="success">Actif</Badge>}
                  </div>
                  <div className="flex gap-2">
                    {!preset.isActive && (
                      <Button variant="outline" size="sm" onClick={() => activatePreset(preset.name)}>
                        Activer
                      </Button>
                    )}
                    <Button variant="destructive" size="sm" onClick={() => setPendingDelete(preset.name)}>
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce preset ?</AlertDialogTitle>
            <AlertDialogDescription>
              "{pendingDelete}" sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Confirmer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
