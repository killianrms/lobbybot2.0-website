import { Link, Outlet } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function AdminLayout() {
  const { authenticated, email, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/admin" className="font-display font-semibold tracking-tight text-foreground">
            LobbyBot <span className="text-primary">Admin</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm text-muted-foreground">
            {authenticated && (
              <>
                <span className="hidden sm:inline">{email}</span>
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
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}
