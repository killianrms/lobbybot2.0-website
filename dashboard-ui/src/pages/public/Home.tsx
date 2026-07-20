import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePublicBots } from "@/hooks/usePublicBots";
import { useLanguage, makeTranslator } from "@/i18n/LanguageContext";
import { homeTranslations } from "@/i18n/homeTranslations";
import { cn } from "@/lib/utils";

export default function Home() {
  const { language } = useLanguage();
  const t = makeTranslator(homeTranslations, language);
  const { connected, bots, config } = usePublicBots();

  const online = bots.filter((b) => b.isOnline);
  const totalFriends = bots.reduce((sum, b) => sum + (b.friends ?? 0), 0);
  const pings = bots.map((b) => b.ping).filter((p): p is number => typeof p === "number");
  const avgPing = pings.length ? Math.round(pings.reduce((a, b) => a + b, 0) / pings.length) : null;

  return (
    <div className="space-y-16">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(60% 80% at 50% -10%, var(--accent-bg), transparent 70%)",
          }}
        />
        <div className="space-y-5 py-14 text-center">
          <div className="fade-up mx-auto flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <span className={cn("pulse-dot", !connected && "opacity-0")} aria-hidden />
            {connected ? t("connected") : t("disconnected")}
          </div>
          <h1
            className="fade-up font-display text-5xl font-bold tracking-tight text-foreground sm:text-6xl"
            style={{ animationDelay: "60ms" }}
          >
            LobbyBot <span className="text-primary">2.0</span>
          </h1>
          <p
            className="fade-up mx-auto max-w-xl text-balance text-muted-foreground"
            style={{ animationDelay: "120ms" }}
          >
            {t("tagline")}
          </p>
          {config.status && (
            <p className="fade-up text-sm text-primary" style={{ animationDelay: "180ms" }}>
              {t("creatorCodePrefix")} :{" "}
              <span className="font-display font-semibold">{config.status}</span>
            </p>
          )}
          <div className="fade-up pt-2" style={{ animationDelay: "240ms" }}>
            <Button asChild size="lg">
              <Link to="/commands">{t("viewCommands")}</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Live status */}
      <Card className="fade-up glow-surface overflow-hidden" style={{ animationDelay: "300ms" }}>
        <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-border/60">
          <div>
            <CardTitle className="font-display">{t("liveStatusTitle")}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{t("liveStatusSub")}</p>
          </div>
          <Badge variant={connected ? "success" : "outline"} className="gap-1.5">
            <span className={cn("pulse-dot", !connected && "opacity-0")} aria-hidden />
            {connected ? t("connected") : t("disconnected")}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-border bg-muted/30 p-4 text-center">
              <div className="font-display text-2xl font-bold text-foreground">{online.length}</div>
              <div className="text-xs text-muted-foreground">{t("botsOnline")}</div>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-4 text-center">
              <div className="font-display text-2xl font-bold text-foreground">{totalFriends}</div>
              <div className="text-xs text-muted-foreground">{t("totalFriends")}</div>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-4 text-center">
              <div className="font-display text-2xl font-bold text-foreground">
                {avgPing != null ? `${avgPing} ms` : "—"}
              </div>
              <div className="text-xs text-muted-foreground">{t("avgPing")}</div>
            </div>
          </div>

          {bots.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">{t("noBots")}</p>
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
                    <span>
                      {bot.friends ?? 0} {t("friends")}
                    </span>
                    <Badge variant={bot.isOnline ? "success" : "outline"}>
                      {bot.isOnline ? t("online") : t("offline")}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
