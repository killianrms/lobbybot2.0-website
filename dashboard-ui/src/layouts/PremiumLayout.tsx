import { Link, Outlet } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { DiscordAuthProvider, useDiscordAuth } from "@/hooks/useDiscordAuth";

function PremiumHeader() {
  const { authenticated, username, logout } = useDiscordAuth();
  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link to="/premium" className="font-display font-semibold tracking-tight text-foreground">
          LobbyBot <span className="text-primary">Premium</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          {authenticated && (
            <>
              <span className="hidden sm:inline">{username}</span>
              <Button variant="outline" size="sm" onClick={() => logout()}>
                Déconnexion
              </Button>
            </>
          )}
          <Link to="/" className="hover:text-foreground">
            Retour au site
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default function PremiumLayout() {
  return (
    <DiscordAuthProvider>
      <div className="min-h-screen flex flex-col">
        <PremiumHeader />
        <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
          <Outlet />
        </main>
      </div>
    </DiscordAuthProvider>
  );
}
