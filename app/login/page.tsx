'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Logo } from '@/components/ui/logo'
import { Checkbox } from '@/components/ui/checkbox'
import { Eye, EyeOff } from 'lucide-react'

// Helper pour extraire le message d'erreur
function getErrorMessage(data: any): string {
  if (typeof data?.detail === 'string') {
    return data.detail
  }
  if (Array.isArray(data?.detail)) {
    return data.detail.map((err: any) => err.msg || JSON.stringify(err)).join(', ')
  }
  if (typeof data?.detail === 'object') {
    return data.detail.msg || JSON.stringify(data.detail)
  }
  return 'Erreur inconnue'
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isLocked, setIsLocked] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const API_URL = (process.env.NEXT_PUBLIC_API_URL as string) || 'http://localhost:8000'

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          password: password
        }),
        credentials: 'include', // Important pour les cookies
      })

      const data = await res.json()

      if (!res.ok) {
        // Gestion des différents codes d'erreur
        const errorMsg = getErrorMessage(data)
        if (res.status === 423) {
          // Compte verrouillé
          setIsLocked(true)
          setError(errorMsg || 'Compte temporairement verrouillé')
        } else if (res.status === 401) {
          // Mauvais identifiants
          setError(errorMsg || 'Email ou mot de passe incorrect')
        } else if (res.status === 403) {
          // Compte désactivé
          setError(errorMsg || 'Compte désactivé. Contactez le support.')
        } else {
          setError(errorMsg || 'Erreur lors de la connexion')
        }
        setLoading(false)
        return
      }

      // Connexion réussie
      console.log('Connexion réussie:', data.user)
      window.location.href = '/dashboard'
    } catch (err) {
      setError('Erreur de connexion au serveur. Vérifiez que le backend est démarré.')
      console.error('Erreur de connexion:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <Logo className="justify-center mb-6" />
            <h1 className="text-3xl font-bold tracking-tight">Bienvenue sur Audit-IQ</h1>
            <p className="text-muted-foreground">Connectez-vous à votre compte</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Adresse email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="vous@entreprise.com"
                className="h-11"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mot de passe</Label>
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-11 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Se souvenir de moi
              </label>
            </div>

            <Button type="submit" className="w-full h-11 text-base glow-primary" disabled={loading || isLocked}>
              {loading ? 'Connexion...' : isLocked ? 'Compte verrouillé' : 'Se connecter'}
            </Button>

            {error && (
              <div className={`rounded-lg border p-4 ${isLocked ? 'bg-destructive/10 border-destructive/50' : 'bg-destructive/10 border-destructive/50'}`}>
                <div className="flex items-start gap-3">
                  <div className={`rounded-full p-1 ${isLocked ? 'bg-destructive' : 'bg-destructive'}`}>
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-destructive">{error}</p>
                    {isLocked && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Votre compte a été temporairement verrouillé pour des raisons de sécurité. 
                        Veuillez réessayer dans quelques minutes.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Ou continuer avec
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Button variant="outline" className="h-11" type="button">
                <img 
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-iX9UGe131WleCUasf7qjg2thc6Wi6s.png" 
                  alt="Google" 
                  className="h-5 w-auto"
                />
              </Button>
              <Button variant="outline" className="h-11" type="button">
                <img 
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-TXyB1H5UL38Cd2ucnrBLnkF3XEd3fJ.png" 
                  alt="Microsoft" 
                  className="h-5 w-auto"
                />
              </Button>
              <Button variant="outline" className="h-11" type="button">
                <img 
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-GLZgyggMq90d5POLFrkYrgRtMSoZ4L.png" 
                  alt="AWS" 
                  className="h-5 w-auto"
                />
              </Button>
            </div>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Pas encore de compte ?{' '}
            <Link href="/signup" className="font-semibold text-primary hover:underline">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-primary/20 via-secondary/20 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(233,30,140,0.1),transparent_50%)]" />
        <div className="relative flex flex-col items-center justify-center p-12 text-center space-y-6">
          <div className="space-y-4 max-w-lg">
            <h2 className="text-4xl font-bold">Garantissez l'équité de vos algorithmes</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Détectez et corrigez les biais algorithmiques pour une IA juste et conforme aux réglementations
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6 w-full max-w-md mt-12">
            <StatCard value="94%" label="Score d'équité moyen" />
            <StatCard value="100+" label="Audits réalisés" />
            <StatCard value="8+" label="Métriques de fairness" />
            <StatCard value="RGPD" label="Conformité native" />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/50 backdrop-blur p-6 space-y-1">
      <p className="text-3xl font-bold text-gradient">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}
