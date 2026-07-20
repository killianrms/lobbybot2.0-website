import { useState } from "react";
import { RotateCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiFetch, ApiError } from "@/lib/api";
import { useAdminData } from "@/hooks/useAdminData";
import { AddBotDialog } from "@/features/admin/AddBotDialog";
import { CommandDialog } from "@/features/admin/CommandDialog";

export function FleetTable() {
  const { bots, sendCommand, refreshBots, removeBotLocally } = useAdminData();
  const [pending, setPending] = useState<{ email: string; type: "restart" | "delete" } | null>(null);

  async function confirmAction() {
    if (!pending) return;
    try {
      if (pending.type === "restart") {
        await apiFetch(`/api/bots/${encodeURIComponent(pending.email)}/restart`, { method: "POST" });
        toast.success("Redémarrage demandé.");
      } else {
        await apiFetch(`/api/bots/${encodeURIComponent(pending.email)}`, { method: "DELETE" });
        toast.success("Bot supprimé.");
        removeBotLocally(pending.email);
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Erreur serveur.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Flotte de bots</h2>
          <p className="text-sm text-muted-foreground">{bots.length} bot(s) enregistré(s)</p>
        </div>
        <AddBotDialog onAdded={refreshBots} />
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Amis</TableHead>
              <TableHead>Ping</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bots.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Aucun bot connecté.
                </TableCell>
              </TableRow>
            )}
            {bots.map((bot) => (
              <TableRow key={bot.email || bot.name}>
                <TableCell className="font-medium">{bot.name}</TableCell>
                <TableCell>
                  <Badge variant={bot.isOnline ? "success" : "outline"}>
                    {bot.isOnline ? "En ligne" : "Hors ligne"}
                  </Badge>
                </TableCell>
                <TableCell>{bot.friends ?? 0}</TableCell>
                <TableCell>{bot.ping != null ? `${bot.ping} ms` : "—"}</TableCell>
                <TableCell className="flex justify-end gap-2">
                  <CommandDialog botName={bot.name} onSend={sendCommand} />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => bot.email && setPending({ email: bot.email, type: "restart" })}
                    disabled={!bot.email}
                  >
                    <RotateCw /> Restart
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => bot.email && setPending({ email: bot.email, type: "delete" })}
                    disabled={!bot.email}
                  >
                    <Trash2 />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={pending !== null} onOpenChange={(open) => !open && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pending?.type === "restart" ? "Redémarrer ce bot ?" : "Supprimer ce bot ?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pending?.type === "restart"
                ? "Le bot va se déconnecter puis se reconnecter automatiquement."
                : "Cette action est irréversible : le bot sera retiré de la base de données."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction}>Confirmer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
