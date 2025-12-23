'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8">
        <div className="space-y-2">
          <h1 className="text-9xl font-bold text-primary">404</h1>
          <h2 className="text-3xl font-semibold">Page introuvable</h2>
          <p className="text-muted-foreground max-w-md">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </div>
        
        <div className="flex gap-4 justify-center">
          <Button asChild variant="outline">
            <Link href="/" className="gap-2">
              <Home className="h-4 w-4" />
              Accueil
            </Link>
          </Button>
          <Button asChild>
            <Link href="/login" className="gap-2">
              Se connecter
            </Link>
          </Button>
        </div>
        
        <div className="pt-8 text-sm text-muted-foreground">
          <p>Si le problème persiste, contactez le support.</p>
        </div>
      </div>
    </div>
  )
}
