"use client";

import { useUser } from "@/hooks/use-user";
import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/sign-in");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Bienvenue, {user.name} !</h1>
            <p className="text-slate-600">{user.email}</p>
          </div>
          <Button onClick={handleSignOut} variant="outline">
            Se déconnecter
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Audits en cours</CardTitle>
              <CardDescription>0 audit actif</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Nouvel audit</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rapports générés</CardTitle>
              <CardDescription>0 rapport</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Vos rapports apparaîtront ici
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Score de conformité</CardTitle>
              <CardDescription>N/A</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Lancez un audit pour voir votre score
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}