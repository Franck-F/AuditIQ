'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Eye, EyeOff, Sparkles, Mail } from 'lucide-react'
import { AnimatedCharacters } from '@/components/animated-characters'

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
  const API_URL = (process.env.NEXT_PUBLIC_API_URL as string) || 'http://localhost:8000'
  const [isLocked, setIsLocked] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)



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
      localStorage.setItem('token', data.access_token)
      
      // Récupérer le paramètre redirect de l'URL
      const urlParams = new URLSearchParams(window.location.search)
      const redirectPath = urlParams.get('redirect') || '/dashboard'
      
      window.location.href = redirectPath
    } catch (err) {
      setError('Erreur de connexion au serveur. Vérifiez que le backend est démarré.')
      console.error('Erreur de connexion:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Content Section */}
      <div className="relative hidden lg:flex flex-col justify-between bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-12 text-foreground overflow-hidden">
        <div className="relative z-20">
          <div className="flex items-center gap-2 text-lg font-semibold">
            {/*<div className="size-8 rounded-lg bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="size-4" />
            </div>
            <span></span>*/}
          </div>
        </div>

        <div className="relative z-20 flex items-end justify-center h-[500px]">
          {/* Cartoon Characters */}
          <AnimatedCharacters 
            isTyping={isTyping} 
            passwordLength={password.length} 
            showPassword={showPassword} 
          />
        </div>

        <div className="relative z-20 flex items-center gap-8 text-sm text-primary-foreground/60">
          <Link href="/privacy" className="hover:text-primary-foreground transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-primary-foreground transition-colors">
            Terms of Service
          </Link>
          <Link href="/contact" className="hover:text-primary-foreground transition-colors">
            Contact
          </Link>
        </div>

        {/* Decorative elements */}
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="absolute top-1/4 right-1/4 size-64 bg-primary-foreground/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 size-96 bg-primary-foreground/5 rounded-full blur-3xl" />
      </div>

      {/* Right Login Section */}
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-[420px]">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 text-lg font-semibold mb-12">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="size-4 text-primary" />
            </div>
            <span>Audit-IQ</span>
          </div>

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Bienvenue !</h1>
            <p className="text-muted-foreground text-sm">Entrez vos identifiants pour accéder à votre espace</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="vous@entreprise.com"
                value={email}
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setIsTyping(true)}
                onBlur={() => setIsTyping(false)}
                required
                className="h-12 bg-background border-border/60 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsTyping(true)}
                  onBlur={() => setIsTyping(false)}
                  required
                  className="h-12 pr-10 bg-background border-border/60 focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="size-5" />
                  ) : (
                    <Eye className="size-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <Label
                  htmlFor="remember"
                  className="text-sm font-normal cursor-pointer"
                >
                  Se souvenir de moi
                </Label>
              </div>
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline font-medium"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            {error && (
              <div className={`p-3 text-sm rounded-lg border ${isLocked ? 'bg-destructive/10 border-destructive/50 text-destructive' : 'bg-destructive/10 border-destructive/50 text-destructive'}`}>
                {error}
                {isLocked && (
                  <p className="text-xs mt-1 opacity-80">
                    Votre compte a été temporairement verrouillé. Réessayez plus tard.
                  </p>
                )}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-medium glow-primary" 
              size="lg" 
              disabled={loading || isLocked}
            >
              {loading ? "Connexion..." : isLocked ? "Compte verrouillé" : "Se connecter"}
            </Button>
          </form>

          {/* Social Login */}
          <div className="mt-6">
            <Button 
              variant="outline" 
              className="w-full h-12 bg-background border-border/60 hover:bg-accent"
              type="button"
              onClick={() => window.location.href = `${API_URL}/api/auth/google/login`}
            >
              <svg className="mr-2 size-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                  <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                  <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                  <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.734 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                  <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                </g>
              </svg>
              Continuer avec Google
            </Button>
          </div>

          {/* Sign Up Link */}
          <div className="text-center text-sm text-muted-foreground mt-8">
            Pas encore de compte ?{" "}
            <Link href="/signup" className="text-foreground font-medium hover:underline">
              Créer un compte
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
