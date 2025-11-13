"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart3, FileText, Users, TrendingUp, Settings } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession()
        console.log("[v0] Session data:", session)

        if (!session || !session.user) {
          console.log("[v0] No valid session, redirecting to sign-in")
          router.push("/sign-in")
          return
        }

        setUser({
          name: session.user.name || session.user.email?.split("@")[0] || "Utilisateur",
          email: session.user.email || "email@example.com",
        })
      } catch (error) {
        console.error("[v0] Auth check error:", error)
        router.push("/sign-in")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/40">
        <header className="border-b bg-background">
          <div className="flex h-16 items-center justify-between px-8">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
        </header>
        <main className="p-8">
          <div className="mb-8">
            <Skeleton className="mb-2 h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </main>
      </div>
    )
  }

  const stats = [
    {
      title: "Audits totaux",
      value: "124",
      icon: FileText,
      description: "+12% ce mois",
    },
    {
      title: "Taux de conformité",
      value: "94.5%",
      icon: TrendingUp,
      description: "+2.3% ce mois",
    },
    {
      title: "Équipe",
      value: "8",
      icon: Users,
      description: "Membres actifs",
    },
    {
      title: "Analyses",
      value: "1.2k",
      icon: BarChart3,
      description: "+18% ce mois",
    },
  ]

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b bg-background">
        <div className="flex h-16 items-center justify-between px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <span className="text-lg font-bold text-primary-foreground">A</span>
            </div>
            <span className="text-xl font-bold">Audit-IQ</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push("/account")}>
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <main className="p-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Bienvenue, {user?.name}</h1>
          <p className="text-muted-foreground">{user?.email}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Audits récents</CardTitle>
              <CardDescription>Vos derniers audits réalisés</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Audit financier Q4", status: "Terminé", date: "Il y a 2 jours" },
                  { name: "Audit conformité RGPD", status: "En cours", date: "Il y a 5 jours" },
                  { name: "Audit sécurité IT", status: "Terminé", date: "Il y a 1 semaine" },
                ].map((audit) => (
                  <div key={audit.name} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{audit.name}</p>
                      <p className="text-xs text-muted-foreground">{audit.date}</p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        audit.status === "Terminé"
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                      }`}
                    >
                      {audit.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
              <CardDescription>Démarrez un nouvel audit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Nouvel audit financier
              </Button>
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <BarChart3 className="mr-2 h-4 w-4" />
                Analyser les données
              </Button>
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Gérer l'équipe
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
