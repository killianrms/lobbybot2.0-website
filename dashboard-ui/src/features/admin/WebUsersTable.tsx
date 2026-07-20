import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiFetch, ApiError } from "@/lib/api";
import type { WebDiscordUser } from "@/types/admin";

export function WebUsersTable() {
  const [users, setUsers] = useState<WebDiscordUser[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await apiFetch<WebDiscordUser[]>("/api/admin/web-users");
      setUsers(data);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Erreur serveur.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Utilisateurs</h2>
        <p className="text-sm text-muted-foreground">
          Toute personne déjà connectée avec Discord sur le site, premium ou non.
        </p>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pseudo Discord</TableHead>
              <TableHead>Discord ID</TableHead>
              <TableHead>Pseudo Epic</TableHead>
              <TableHead>Premium</TableHead>
              <TableHead>Première connexion</TableHead>
              <TableHead>Dernière connexion</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!loading && users.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  Personne ne s'est encore connecté avec Discord sur le site.
                </TableCell>
              </TableRow>
            )}
            {users.map((user) => (
              <TableRow key={user.discordId}>
                <TableCell className="font-medium">{user.username || "—"}</TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">{user.discordId}</TableCell>
                <TableCell>{user.epicPseudo || "—"}</TableCell>
                <TableCell>
                  <Badge variant={user.isPremium ? "premium" : "outline"}>
                    {user.isPremium ? "Premium" : "Non"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(user.firstSeenAt).toLocaleString()}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(user.lastSeenAt).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
