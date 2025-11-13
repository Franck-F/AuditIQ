"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X } from "lucide-react"

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent")
    if (!consent) {
      setShowBanner(true)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem("cookie-consent", "accepted")
    setShowBanner(false)
  }

  const rejectCookies = () => {
    localStorage.setItem("cookie-consent", "rejected")
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
      <Card className="mx-auto max-w-4xl border-2 bg-background/95 p-4 shadow-2xl backdrop-blur-sm sm:p-6">
        <button
          onClick={rejectCookies}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <h3 className="mb-2 text-lg font-semibold">Nous utilisons des cookies</h3>
            <p className="text-sm text-muted-foreground">
              Nous utilisons des cookies pour améliorer votre expérience sur notre site, analyser le trafic et
              personnaliser le contenu. En cliquant sur "Accepter", vous consentez à l'utilisation de tous les cookies.{" "}
              <Link href="/privacy" className="text-primary underline hover:no-underline">
                En savoir plus
              </Link>
            </p>
          </div>

          <div className="flex gap-2 sm:flex-col">
            <Button onClick={acceptCookies} className="flex-1 sm:flex-none">
              Accepter
            </Button>
            <Button onClick={rejectCookies} variant="outline" className="flex-1 sm:flex-none bg-transparent">
              Refuser
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
