'use client'

import { Sidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { logoutUser } from '@/lib/services/auth'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogout = async () => {
    setError(null)
    setLoading(true)
    try {
      await logoutUser()
      router.push('/login')
    } catch (err) {
      setError('Erreur lors de la déconnexion, veuillez réessayer')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64">
        <DashboardHeader />
        <main className="p-6 space-y-6 max-w-3xl">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Profil utilisateur</h1>
            <p className="text-muted-foreground">
              Gérez les informations de votre compte et votre session.
            </p>
          </div>

          <Card className="p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Informations de base</h2>
              <p className="text-sm text-muted-foreground">
                La récupération dynamique du profil (email, entreprise, rôle) sera branchée sur un
                futur endpoint <code>/api/auth/me</code>.
              </p>
            </div>
            <div className="space-y-1 text-sm">
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Email :</span> (à venir)
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Entreprise :</span> (à venir)
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Rôle :</span> (à venir)
              </p>
            </div>
          </Card>

          <Card className="p-6 space-y-4 border-destructive/40">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Session & sécurité</h2>
              <p className="text-sm text-muted-foreground">
                Déconnectez-vous de votre session actuelle. Le cookie d&apos;authentification et le
                token local seront supprimés.
              </p>
            </div>
            <Button
              variant="destructive"
              className="w-full sm:w-auto"
              onClick={handleLogout}
              disabled={loading}
            >
              {loading ? 'Déconnexion...' : 'Se déconnecter'}
            </Button>
            {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
          </Card>
        </main>
      </div>
    </div>
  )
}


