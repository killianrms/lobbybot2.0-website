import { useCallback, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
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
import type { PremiumGrant } from "@/types/admin";
import { GrantPremiumDialog } from "@/features/admin/GrantPremiumDialog";

export function PremiumGrantsTable() {
  const [grants, setGrants] = useState<PremiumGrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingRevoke, setPendingRevoke] = useState<PremiumGrant | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await apiFetch<PremiumGrant[]>("/api/admin/premium");
      setGrants(data);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Erreur serveur.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function confirmRevoke() {
    if (!pendingRevoke) return;
    try {
      await apiFetch(`/api/admin/premium/${pendingRevoke.discordId}`, { method: "DELETE" });
      toast.success("Premium retiré.");
      refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Erreur serveur.");
    } finally {
      setPendingRevoke(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Premium</h2>
          <p className="text-sm text-muted-foreground">
            Abonnements actifs — natifs Discord ou accordés manuellement.
          </p>
        </div>
        <GrantPremiumDialog onGranted={refresh} />
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Discord ID</TableHead>
              <TableHead>Pseudo Epic</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Expire le</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!loading && grants.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  Aucune attribution premium.
                </TableCell>
              </TableRow>
            )}
            {grants.map((grant) => (
              <TableRow key={grant.discordId}>
                <TableCell className="font-mono text-sm">{grant.discordId}</TableCell>
                <TableCell>{grant.epicPseudo || "—"}</TableCell>
                <TableCell>
                  <Badge variant={grant.source === "discord" ? "default" : "secondary"}>
                    {grant.source}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={grant.active ? "success" : "outline"}>
                    {grant.active ? "Actif" : "Expiré"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {grant.expiresAt ? new Date(grant.expiresAt).toLocaleDateString() : "Jamais"}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="destructive" size="sm" onClick={() => setPendingRevoke(grant)}>
                    <Trash2 />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={pendingRevoke !== null} onOpenChange={(open) => !open && setPendingRevoke(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Retirer le premium ?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingRevoke?.discordId} perdra immédiatement l'accès au panel premium
              {pendingRevoke?.source === "discord" && " — même si son abonnement Discord est toujours actif côté Discord, il sera réattribué automatiquement à sa prochaine commande premium."}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRevoke}>Confirmer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
