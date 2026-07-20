import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

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
import { apiFetch, ApiError } from "@/lib/api";

export function GrantPremiumDialog({ onGranted }: { onGranted: () => void }) {
  const [open, setOpen] = useState(false);
  const [discordId, setDiscordId] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiFetch("/api/admin/premium", {
        method: "POST",
        body: JSON.stringify({
          discordId: discordId.trim(),
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        }),
      });
      toast.success("Premium accordé.");
      setDiscordId("");
      setExpiresAt("");
      setOpen(false);
      onGranted();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur serveur.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> Accorder le premium
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Accorder le premium manuellement</DialogTitle>
          <DialogDescription>
            Pour toi-même ou n'importe quel utilisateur — complète l'abonnement Discord natif
            (source enregistrée comme "manual"). L'ID Discord se récupère avec le mode
            développeur activé dans Discord (clic droit sur le profil → Copier l'ID).
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="grant-discord-id">Discord ID</Label>
            <Input
              id="grant-discord-id"
              required
              inputMode="numeric"
              placeholder="ex: 123456789012345678"
              value={discordId}
              onChange={(e) => setDiscordId(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="grant-expires">Expiration (optionnel)</Label>
            <Input
              id="grant-expires"
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Attribution..." : "Accorder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
