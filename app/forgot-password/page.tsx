import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Logo } from '@/components/ui/logo'
import { ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
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

        <form className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Adresse email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="vous@entreprise.com"
              className="h-11"
            />
          </div>

          <Button type="submit" className="w-full h-11 text-base glow-primary">
            Envoyer le lien de réinitialisation
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
