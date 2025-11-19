'use client'

import { useState } from 'react'
import { Button } from './button'
import { Mail, Check } from 'lucide-react'
import { Input } from './input'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsSubscribed(true)
    setIsLoading(false)
    setEmail('')
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-8 shadow-lg">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-primary/10 p-3">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">Newsletter Audit-IQ</h3>
            <p className="text-sm text-muted-foreground">
              Restez informé des dernières actualités sur l'équité IA
            </p>
          </div>
        </div>

        {!isSubscribed ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading} className="glow-primary">
                {isLoading ? 'Inscription...' : "S'inscrire"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              En vous inscrivant, vous acceptez de recevoir nos emails. Désinscription possible à tout moment.
            </p>
          </form>
        ) : (
          <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-4 text-primary">
            <Check className="h-5 w-5" />
            <p className="font-medium">Merci de votre inscription !</p>
          </div>
        )}
      </div>
    </div>
  )
}
