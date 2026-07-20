import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLanguage, makeTranslator } from "@/i18n/LanguageContext";
import { commandsTranslations, type CommandsStrings } from "@/i18n/commandsTranslations";
import { COMMAND_CATEGORIES, type CommandEntry } from "@/i18n/commandsData";
import { cn } from "@/lib/utils";

const CATEGORY_META = {
  cosmetics: { titleKey: "secCosmetics", subKey: "secCosmeticsSub" },
  lobby: { titleKey: "secLobby", subKey: "secLobbySub" },
  discord: { titleKey: "secDiscord", subKey: "secDiscordSub" },
  premium: { titleKey: "secPremium", subKey: "secPremiumSub" },
} as const;

function CommandCard({
  cmd,
  t,
  language,
}: {
  cmd: CommandEntry;
  t: (k: keyof CommandsStrings) => string;
  language: keyof CommandEntry["desc"];
}) {
  return (
    <Card
      className={cn(
        "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        cmd.premium
          ? "border-premium/40 bg-premium-bg hover:border-premium/70"
          : "hover:border-primary/40",
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <code className="font-mono text-sm font-medium">{cmd.name}</code>
          {cmd.admin && <Badge variant="destructive">{t("adminBadge")}</Badge>}
          {cmd.premium && <Badge variant="premium">{t("premiumBadge")}</Badge>}
        </div>
        {cmd.aliases.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {cmd.aliases.map((a) => <code key={a}>{a}</code>).reduce((prev, cur) => <>{prev}, {cur}</>)}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <p
          className="text-sm leading-relaxed text-muted-foreground [&_b]:font-semibold [&_b]:text-foreground"
          dangerouslySetInnerHTML={{ __html: cmd.desc[language] }}
        />
      </CardContent>
    </Card>
  );
}

export default function Commands() {
  const { language } = useLanguage();
  const t = makeTranslator(commandsTranslations, language);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return COMMAND_CATEGORIES;
    return COMMAND_CATEGORIES.map((cat) => ({
      ...cat,
      commands: cat.commands.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.aliases.some((a) => a.toLowerCase().includes(q)) ||
          c.desc[language].toLowerCase().includes(q),
      ),
    })).filter((cat) => cat.commands.length > 0);
  }, [search, language]);

  const hasResults = filtered.some((c) => c.commands.length > 0);

  return (
    <div className="space-y-14">
      <div className="fade-up flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
          {t("title")}
        </h1>
        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="pl-9"
          />
        </div>
      </div>

      <div
        className="fade-up rounded-lg border border-primary/25 bg-primary/5 p-5 text-sm leading-relaxed text-muted-foreground [&_b]:font-semibold [&_b]:text-foreground [&_code]:text-foreground"
        style={{ animationDelay: "60ms" }}
        dangerouslySetInnerHTML={{ __html: t("intro") }}
      />

      {!hasResults && <p className="py-10 text-center text-muted-foreground">{t("noResults")}</p>}

      {filtered.map((cat, i) => (
        <section
          key={cat.key}
          className="fade-up space-y-4"
          style={{ animationDelay: `${100 + i * 60}ms` }}
        >
          <div className="flex items-baseline gap-3">
            <span
              className={cn(
                "h-5 w-1 rounded-full",
                cat.key === "premium" ? "bg-premium" : "bg-primary",
              )}
            />
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground">
                {t(CATEGORY_META[cat.key].titleKey as keyof CommandsStrings)}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t(CATEGORY_META[cat.key].subKey as keyof CommandsStrings)}
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {cat.commands.map((cmd) => (
              <CommandCard key={cmd.name} cmd={cmd} t={t} language={language} />
            ))}
          </div>
        </section>
      ))}

      <Card className="glow-surface border-premium/40 bg-premium-bg text-center">
        <CardContent className="space-y-3 py-10">
          <h2 className="font-display text-xl font-semibold text-premium">{t("ctaTitle")}</h2>
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-muted-foreground">{t("ctaText")}</p>
          <Button asChild className="bg-premium text-white hover:bg-premium/90">
            <a href="https://discord.gg/SarmtBh3Gu" target="_blank" rel="noopener noreferrer">
              {t("ctaBtn")}
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
