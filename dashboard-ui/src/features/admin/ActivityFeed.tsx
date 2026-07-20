import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminData } from "@/hooks/useAdminData";

export function ActivityFeed() {
  const { activity, connected } = useAdminData();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Activité en temps réel</h2>
          <p className="text-sm text-muted-foreground">
            {connected ? "Connecté au flux en direct." : "Déconnecté — reconnexion en cours..."}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Derniers événements</CardTitle>
          <CardDescription>Connexions, actions bots, changements de config...</CardDescription>
        </CardHeader>
        <CardContent className="max-h-[28rem] space-y-1 overflow-y-auto">
          {activity.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Aucune activité pour le moment.
            </p>
          )}
          {activity.map((entry) => (
            <div
              key={entry.id}
              className="flex items-start gap-3 rounded-md px-2 py-2 text-sm hover:bg-muted/50"
            >
              <span className="text-base leading-none">{entry.icon}</span>
              <div className="flex-1">
                <p className="text-foreground">
                  {entry.message || `${entry.action ?? entry.type} ${entry.target ? `→ ${entry.target}` : ""}`}
                  {entry.bot && <span className="text-muted-foreground"> · {entry.bot}</span>}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
