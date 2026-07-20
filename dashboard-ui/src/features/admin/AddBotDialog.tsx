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

export function AddBotDialog({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    pseudo: "",
    email: "",
    deviceId: "",
    accountId: "",
    secret: "",
  });

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiFetch("/api/bots/add", {
        method: "POST",
        body: JSON.stringify({
          pseudo: form.pseudo || undefined,
          email: form.email,
          deviceAuth: {
            deviceId: form.deviceId,
            accountId: form.accountId,
            secret: form.secret,
          },
        }),
      });
      toast.success("Bot ajouté.");
      setForm({ pseudo: "", email: "", deviceId: "", accountId: "", secret: "" });
      setOpen(false);
      onAdded();
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
          <Plus /> Ajouter un bot
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un bot</DialogTitle>
          <DialogDescription>
            Le device auth s'obtient via le script de génération côté manager
            Discord (<code>generate-auth</code>).
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="bot-pseudo">Pseudo (optionnel)</Label>
            <Input id="bot-pseudo" value={form.pseudo} onChange={update("pseudo")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bot-email">Email Epic</Label>
            <Input id="bot-email" type="email" required value={form.email} onChange={update("email")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bot-device-id">Device ID</Label>
            <Input id="bot-device-id" required value={form.deviceId} onChange={update("deviceId")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bot-account-id">Account ID</Label>
            <Input id="bot-account-id" required value={form.accountId} onChange={update("accountId")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bot-secret">Secret</Label>
            <Input id="bot-secret" required value={form.secret} onChange={update("secret")} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Ajout..." : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
