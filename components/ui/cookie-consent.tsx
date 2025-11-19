'use client'

import { useState, useEffect } from 'react'
import { Button } from './button'
import { X, Cookie, Settings } from 'lucide-react'

type CookiePreferences = {
  necessary: boolean
  analytics: boolean
  marketing: boolean
}

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false
  })

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      setIsVisible(true)
    } else {
      try {
        const saved = JSON.parse(consent)
        // Validate that saved is an object with the expected structure
        if (saved && typeof saved === 'object' && 'necessary' in saved) {
          setPreferences(saved)
        } else {
          // Invalid format, clear and show consent banner
          localStorage.removeItem('cookie-consent')
          setIsVisible(true)
        }
      } catch (error) {
        // Invalid JSON, clear and show consent banner
        localStorage.removeItem('cookie-consent')
        setIsVisible(true)
      }
    }
  }, [])

  const acceptAll = () => {
    const allAccepted = { necessary: true, analytics: true, marketing: true }
    localStorage.setItem('cookie-consent', JSON.stringify(allAccepted))
    setPreferences(allAccepted)
    setIsVisible(false)
  }

  const acceptNecessary = () => {
    const necessaryOnly = { necessary: true, analytics: false, marketing: false }
    localStorage.setItem('cookie-consent', JSON.stringify(necessaryOnly))
    setPreferences(necessaryOnly)
    setIsVisible(false)
  }

  const savePreferences = () => {
    localStorage.setItem('cookie-consent', JSON.stringify(preferences))
    setIsVisible(false)
    setShowSettings(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 pb-4 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-xl border border-border bg-card shadow-2xl backdrop-blur-lg">
        {!showSettings ? (
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <Cookie className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 space-y-3">
                <h3 className="text-lg font-semibold">Gestion des cookies</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Nous utilisons des cookies pour améliorer votre expérience, analyser le trafic et personnaliser 
                  le contenu. Les cookies nécessaires sont requis pour le fonctionnement du site. Vous pouvez 
                  personnaliser vos préférences à tout moment.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Button onClick={acceptAll} size="sm" className="glow-primary">
                    Accepter tout
                  </Button>
                  <Button onClick={acceptNecessary} size="sm" variant="outline">
                    Nécessaires uniquement
                  </Button>
                  <Button 
                    onClick={() => setShowSettings(true)} 
                    size="sm" 
                    variant="ghost"
                    className="gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Personnaliser
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  En continuant, vous acceptez notre{' '}
                  <a href="/privacy" className="underline hover:text-foreground">
                    Politique de confidentialité
                  </a>
                </p>
              </div>
              <button
                onClick={() => setIsVisible(false)}
                className="flex-shrink-0 rounded-lg p-1 hover:bg-accent transition-colors"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Préférences des cookies</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="rounded-lg p-1 hover:bg-accent transition-colors"
                  aria-label="Retour"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Necessary Cookies */}
                <div className="flex items-start justify-between rounded-lg border border-border p-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">Cookies nécessaires</h4>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        Requis
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Essentiels au fonctionnement du site. Incluent l'authentification et la sécurité.
                    </p>
                  </div>
                  <div className="ml-4">
                    <input
                      type="checkbox"
                      checked={preferences.necessary}
                      disabled
                      className="h-5 w-5 accent-primary"
                    />
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-start justify-between rounded-lg border border-border p-4">
                  <div className="space-y-1 flex-1">
                    <h4 className="font-medium">Cookies d'analyse</h4>
                    <p className="text-sm text-muted-foreground">
                      Nous aident à comprendre comment vous utilisez le site pour l'améliorer.
                    </p>
                  </div>
                  <div className="ml-4">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                      className="h-5 w-5 accent-primary"
                    />
                  </div>
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-start justify-between rounded-lg border border-border p-4">
                  <div className="space-y-1 flex-1">
                    <h4 className="font-medium">Cookies marketing</h4>
                    <p className="text-sm text-muted-foreground">
                      Utilisés pour personnaliser les publicités et mesurer leur efficacité.
                    </p>
                  </div>
                  <div className="ml-4">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                      className="h-5 w-5 accent-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={savePreferences} size="sm" className="flex-1 glow-primary">
                  Enregistrer les préférences
                </Button>
                <Button onClick={() => setShowSettings(false)} size="sm" variant="outline">
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
