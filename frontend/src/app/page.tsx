import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            🔍 AuditIQ
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            Plateforme d'audit de fairness pour l'IA - Conformité AI Act
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="lg">Commencer gratuitement</Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline">Se connecter</Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>📊 Upload de données</CardTitle>
              <CardDescription>CSV, Excel ou API</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Importez vos données facilement pour démarrer l'audit
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🎯 Analyse automatique</CardTitle>
              <CardDescription>Métriques de fairness</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Demographic parity, Equal opportunity, Disparate impact
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📄 Rapports conformes</CardTitle>
              <CardDescription>AI Act & RGPD</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Générez des rapports conformes automatiquement
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}