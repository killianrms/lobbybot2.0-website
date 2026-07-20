import { ShieldAlert } from "lucide-react";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { AdminDataProvider } from "@/hooks/useAdminData";
import { LoginCard } from "@/features/admin/LoginCard";
import { FleetTable } from "@/features/admin/FleetTable";
import { AccountsTable } from "@/features/admin/AccountsTable";
import { ConfigForm } from "@/features/admin/ConfigForm";
import { ActivityFeed } from "@/features/admin/ActivityFeed";
import { PremiumGrantsTable } from "@/features/admin/PremiumGrantsTable";
import { WebUsersTable } from "@/features/admin/WebUsersTable";

export default function Admin() {
  const { loading, authenticated, role } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
        Chargement...
      </div>
    );
  }

  if (!authenticated) {
    return <LoginCard />;
  }

  if (role !== "admin") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Card className="max-w-sm text-center">
          <CardHeader>
            <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <ShieldAlert className="size-5" />
            </div>
            <CardTitle>Accès refusé</CardTitle>
            <CardDescription>
              Ce compte n'a pas les droits administrateur nécessaires pour accéder à ce panel.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <AdminDataProvider>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">Panel Admin</h1>
          <p className="mt-1 text-muted-foreground">
            Gestion de la flotte de bots, des comptes et de la configuration globale.
          </p>
        </div>

        <Tabs defaultValue="fleet">
          <TabsList>
            <TabsTrigger value="fleet">Flotte</TabsTrigger>
            <TabsTrigger value="accounts">Comptes</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="premium">Premium</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="activity">Activité</TabsTrigger>
          </TabsList>
          <TabsContent value="fleet" className="mt-6">
            <FleetTable />
          </TabsContent>
          <TabsContent value="accounts" className="mt-6">
            <AccountsTable />
          </TabsContent>
          <TabsContent value="users" className="mt-6">
            <WebUsersTable />
          </TabsContent>
          <TabsContent value="premium" className="mt-6">
            <PremiumGrantsTable />
          </TabsContent>
          <TabsContent value="config" className="mt-6">
            <ConfigForm />
          </TabsContent>
          <TabsContent value="activity" className="mt-6">
            <ActivityFeed />
          </TabsContent>
        </Tabs>
      </div>
    </AdminDataProvider>
  );
}
