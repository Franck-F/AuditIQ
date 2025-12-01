'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Logo } from '@/components/ui/logo'
import { CheckCircle } from 'lucide-react'

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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.detail || 'Erreur lors de l\'envoi du lien')
        setLoading(false)
        return
      }

      setSuccess(true)
    } catch (err) {
      setError('Erreur de connexion au serveur')
      console.error('Erreur:', err)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background via-background to-primary/5">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Email envoyé !</h1>
            <p className="text-muted-foreground">
              Si un compte existe avec l'adresse <strong>{email}</strong>, vous recevrez 
              un lien de réinitialisation dans quelques instants.
            </p>
            <div className="rounded-lg border border-border bg-card p-4 space-y-2 text-left">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Vérifiez votre boîte de réception</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Le lien est valide pendant 1 heure. Vérifiez aussi vos spams.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center space-y-4">
            <Link href="/login">
              <Button variant="outline" className="w-full h-11">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à la connexion
              </Button>
            </Link>
            <button
              onClick={() => {
                setSuccess(false)
                setEmail('')
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Renvoyer un email
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <Logo className="justify-center mb-6" />
          <h1 className="text-3xl font-bold tracking-tight">Réinitialiser votre mot de passe</h1>
          <p className="text-muted-foreground">
            Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe
          </p>
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
              required
            />
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <Button type="submit" className="w-full h-11 text-base glow-primary" disabled={loading}>
            {loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
          </Button>
        </form>

        <div className="text-center">
          <Link href="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Retour à la connexion
          </Link>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 space-y-2">
          <p className="text-sm font-semibold">Besoin d'aide ?</p>
          <p className="text-sm text-muted-foreground">
            Contactez notre support à{' '}
            <a href="mailto:support@audit-iq.com" className="text-primary hover:underline">
              support@audit-iq.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
