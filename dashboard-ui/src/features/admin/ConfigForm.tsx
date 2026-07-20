import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAdminData } from "@/hooks/useAdminData";
import type { GlobalConfig } from "@/types/admin";

export function ConfigForm() {
  const { config, applyConfig } = useAdminData();
  const [form, setForm] = useState<GlobalConfig>(config);
  const [applying, setApplying] = useState(false);

  // Se synchronise quand le serveur pousse une nouvelle config (ex: appliquée
  // depuis un autre onglet admin).
  useEffect(() => setForm(config), [config]);

  function handleApply() {
    setApplying(true);
    applyConfig(form);
    setTimeout(() => setApplying(false), 1000);
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Configuration globale</h2>
        <p className="text-sm text-muted-foreground">
          Appliquée immédiatement à tous les bots connectés.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Status in-game</CardTitle>
            <CardDescription>
              Texte affiché dans le profil Fortnite de chaque bot (ex: code créateur).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              maxLength={128}
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
              placeholder="Utilisez le code créateur : aeroz"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Message de lobby</CardTitle>
            <CardDescription>
              Envoyé dans le chat de la party quand un joueur rejoint.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={form.joinMsg}
              onChange={(e) => setForm((p) => ({ ...p, joinMsg: e.target.value }))}
              placeholder="Bienvenue dans le lobby ! Utilisez !help pour les commandes."
            />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Message d'ajout</CardTitle>
            <CardDescription>
              Envoyé en DM quand le bot accepte une demande d'ami.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={form.addMsg}
              onChange={(e) => setForm((p) => ({ ...p, addMsg: e.target.value }))}
              placeholder="Merci de m'avoir ajouté ! Rejoins ma party pour utiliser les commandes."
            />
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-medium text-foreground">Appliquer à tous les bots</h3>
            <p className="text-sm text-muted-foreground">
              Les changements seront appliqués immédiatement sur tous les bots connectés.
            </p>
          </div>
          <Button onClick={handleApply} disabled={applying}>
            {applying ? "Application..." : "Appliquer maintenant"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
