'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, CreditCard, Shield, Lock } from 'lucide-react'

export default function PaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan') || 'pro'

  const handlePayment = () => {
    // TODO: Intégrer Stripe Payment
    alert('Intégration Stripe à venir - Redirection vers le portail de paiement')
    // Pour l'instant, simuler le paiement et rediriger vers onboarding
    router.push('/onboarding')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Logo className="justify-center mb-6" />
            <h1 className="text-3xl font-bold mb-2">Finaliser votre abonnement</h1>
            <p className="text-muted-foreground">Sécurisé par Stripe • Paiement chiffré SSL</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Récapitulatif */}
            <Card>
              <CardHeader>
                <CardTitle>Récapitulatif de commande</CardTitle>
                <CardDescription>Plan sélectionné</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-2 border-primary rounded-lg p-4 bg-primary/5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold">Plan Pro</h3>
                      <p className="text-sm text-muted-foreground">Facturation mensuelle</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">49€</p>
                      <p className="text-xs text-muted-foreground">/mois</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm border-t pt-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>Audits illimités</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>Rapports avancés avec IA</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>Support prioritaire (&lt; 24h)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>API REST incluse</span>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/10 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-secondary">
                    <Shield className="h-5 w-5" />
                    <span className="font-semibold">Paiement sécurisé</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Sans engagement. Annulation possible à tout moment depuis votre espace client.
                  </p>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sous-total</span>
                    <span>49,00 €</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">TVA (20%)</span>
                    <span>9,80 €</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total</span>
                    <span className="text-primary">58,80 €</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Paiement mensuel • Facturation automatique
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Paiement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Informations de paiement
                </CardTitle>
                <CardDescription>Paiement sécurisé par Stripe</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center space-y-4">
                  <Lock className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <p className="font-medium mb-2">Intégration Stripe</p>
                    <p className="text-sm text-muted-foreground">
                      Le formulaire de paiement sécurisé Stripe sera intégré ici
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-4 pt-4">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-6" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-6" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
                  </div>
                </div>

                <div className="space-y-3">
                  <Button 
                    onClick={handlePayment}
                    className="w-full glow-primary" 
                    size="lg"
                  >
                    Confirmer et payer 58,80 €
                  </Button>
                  <Button 
                    onClick={() => router.back()}
                    variant="outline"
                    className="w-full" 
                    size="lg"
                  >
                    ← Retour au choix du plan
                  </Button>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Lock className="h-3 w-3 text-primary" />
                    <span className="font-medium">Paiement 100% sécurisé</span>
                  </div>
                  <p className="text-muted-foreground">
                    Vos informations bancaires sont chiffrées et ne sont jamais stockées sur nos serveurs. 
                    Le paiement est traité par Stripe, certifié PCI DSS niveau 1.
                  </p>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  En confirmant, vous acceptez nos{' '}
                  <a href="/terms" className="text-primary hover:underline">conditions de vente</a>
                  {' '}et notre{' '}
                  <a href="/privacy" className="text-primary hover:underline">politique de confidentialité</a>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
