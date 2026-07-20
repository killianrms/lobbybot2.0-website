import { useState, type FormEvent } from "react";
import { Terminal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Actions supportées par BotManager.executeAction côté manager Discord.
// Le champ "data" attendu dépend de l'action (nom de skin, pseudo cible, niveau...).
const ACTIONS = [
  { value: "skin", label: "Changer de skin", placeholder: "Nom du skin" },
  { value: "backpack", label: "Changer de sac à dos", placeholder: "Nom du sac à dos" },
  { value: "pickaxe", label: "Changer de pioche", placeholder: "Nom de la pioche" },
  { value: "emote", label: "Jouer une emote", placeholder: "Nom de l'emote" },
  { value: "stopdanse", label: "Arrêter l'emote", placeholder: "" },
  { value: "level", label: "Changer de niveau", placeholder: "Niveau (nombre)" },
  { value: "kick", label: "Kick un membre", placeholder: "Pseudo du membre" },
  { value: "promote", label: "Promouvoir un membre", placeholder: "Pseudo du membre" },
  { value: "privacy", label: "Changer la confidentialité", placeholder: "public / privé / amis" },
  { value: "ready", label: "Se mettre prêt", placeholder: "" },
  { value: "unready", label: "Se mettre non-prêt", placeholder: "" },
  { value: "leave", label: "Quitter la party", placeholder: "" },
  { value: "hide", label: "Cacher tout le monde", placeholder: "" },
  { value: "show", label: "Réafficher les membres", placeholder: "" },
] as const;

export function CommandDialog({
  botName,
  onSend,
}: {
  botName: string;
  onSend: (target: string, action: string, data?: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<string>("skin");
  const [data, setData] = useState("");

  const selected = ACTIONS.find((a) => a.value === action);
  const needsData = Boolean(selected?.placeholder);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSend(botName, action, needsData ? data : undefined);
    setOpen(false);
    setData("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Terminal /> Commande
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Commande — {botName}</DialogTitle>
          <DialogDescription>
            Envoyée en temps réel via Socket.io au bot sélectionné.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <Label>Action</Label>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTIONS.map((a) => (
                  <SelectItem key={a.value} value={a.value}>
                    {a.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {needsData && (
            <div className="space-y-1.5">
              <Label htmlFor="cmd-data">{selected?.placeholder}</Label>
              <Input id="cmd-data" value={data} onChange={(e) => setData(e.target.value)} />
            </div>
          )}
          <DialogFooter>
            <Button type="submit">Envoyer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
