import { Link, Outlet, useLocation } from "react-router-dom";

import { LANGUAGES, useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { to: "/", label: "Accueil" },
  { to: "/commands", label: "Commandes" },
  { to: "/premium", label: "Premium" },
  { to: "/admin", label: "Admin" },
];

export default function PublicLayout() {
  const { language, setLanguage } = useLanguage();
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight text-foreground">
            <span className="pulse-dot" aria-hidden />
            LobbyBot
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    "relative py-1 transition-colors",
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {link.label}
                  {active && (
                    <span className="absolute -bottom-[1px] left-0 h-px w-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-1 border-l border-border pl-4">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => setLanguage(l.code)}
                aria-label={l.code}
                className={cn(
                  "rounded-md border px-2 py-1 text-sm transition-colors",
                  language === l.code
                    ? "border-primary bg-primary/10"
                    : "border-transparent hover:bg-muted",
                )}
              >
                {l.flag}
              </button>
            ))}
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-14">
        <Outlet />
      </main>
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-6 py-8 text-xs text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} LobbyBot</span>
          <div className="flex gap-4">
            <Link to="/terms" className="hover:text-foreground">
              Conditions d'utilisation
            </Link>
            <Link to="/privacy" className="hover:text-foreground">
              Confidentialité
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
