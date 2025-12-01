import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, X, Sparkles, Zap, Building2, Users, HelpCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Tarifs - Audit-IQ',
  description: 'Choisissez le plan adapté à vos besoins d\'audit de fairness algorithmique',
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="border-b bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <Badge className="mb-4" variant="outline">
              <Sparkles className="h-3 w-3 mr-1" />
              Offre de lancement
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Des tarifs <span className="text-gradient bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">simples et transparents</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Choisissez le plan adapté à vos besoins. Changez ou annulez à tout moment.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Freemium Plan */}
            <Card className="relative flex flex-col border-2 hover:border-primary/50 transition-all duration-300">
              <CardHeader className="pb-8">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle className="text-2xl">Freemium</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Parfait pour découvrir et tester la plateforme
                </CardDescription>
                
                <div className="mt-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold">0€</span>
                    <span className="text-muted-foreground">/mois</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                <Button variant="outline" className="w-full mb-8" size="lg" asChild>
                  <Link href="/signup">
                    Commencer gratuitement
                  </Link>
                </Button>

                <div className="space-y-4 flex-1">
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">1 audit par mois</p>
                      <p className="text-xs text-muted-foreground">Limite mensuelle</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Rapports basiques</p>
                      <p className="text-xs text-muted-foreground">PDF avec métriques essentielles</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Métriques de fairness</p>
                      <p className="text-xs text-muted-foreground">5 métriques standards</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Support communautaire</p>
                      <p className="text-xs text-muted-foreground">Forum et documentation</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">1 utilisateur</p>
                      <p className="text-xs text-muted-foreground">Compte individuel</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 opacity-50">
                    <X className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <p className="font-medium text-sm">API d'intégration</p>
                  </div>
                  <div className="flex items-start gap-3 opacity-50">
                    <X className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <p className="font-medium text-sm">Recommandations IA</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pro Plan - Popular */}
            <Card className="relative flex flex-col border-2 border-primary shadow-2xl shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 scale-105 lg:scale-110">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                <Badge className="bg-primary text-primary-foreground px-4 py-1.5 text-sm font-semibold shadow-lg">
                  <Sparkles className="h-3.5 w-3.5 mr-1" />
                  LE PLUS POPULAIRE
                </Badge>
              </div>
              
              <CardHeader className="pb-8 pt-10">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <CardTitle className="text-2xl">Pro</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Pour les équipes qui veulent aller plus loin
                </CardDescription>
                
                <div className="mt-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold text-primary">49€</span>
                    <span className="text-muted-foreground">/mois</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    +20% TVA • Facturation mensuelle
                  </p>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                <Button className="w-full mb-8 bg-primary hover:bg-primary/90 shadow-lg" size="lg" asChild>
                  <Link href="/signup">
                    Commencer maintenant
                  </Link>
                </Button>

                <div className="space-y-4 flex-1">
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Audits illimités</p>
                      <p className="text-xs text-muted-foreground">Aucune limite mensuelle</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Rapports avancés IA</p>
                      <p className="text-xs text-muted-foreground">Analyses approfondies avec recommandations</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Toutes les métriques</p>
                      <p className="text-xs text-muted-foreground">15+ métriques de fairness</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">API complète</p>
                      <p className="text-xs text-muted-foreground">Intégration dans vos outils</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Jusqu'à 10 utilisateurs</p>
                      <p className="text-xs text-muted-foreground">Collaboration d'équipe</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Support prioritaire</p>
                      <p className="text-xs text-muted-foreground">Réponse sous 4h</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Export multi-formats</p>
                      <p className="text-xs text-muted-foreground">PDF, Excel, JSON</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Historique 12 mois</p>
                      <p className="text-xs text-muted-foreground">Conservation des audits</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="relative flex flex-col border-2 hover:border-primary/50 transition-all duration-300 bg-gradient-to-br from-background to-muted/20">
              <CardHeader className="pb-8">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <CardTitle className="text-2xl">Enterprise</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Solution sur-mesure pour grandes organisations
                </CardDescription>
                
                <div className="mt-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">Sur devis</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Tarification personnalisée
                  </p>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                <Button variant="default" className="w-full mb-8" size="lg" asChild>
                  <Link href="/contact">
                    Nous contacter
                  </Link>
                </Button>

                <div className="space-y-4 flex-1">
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Tout ce qui est dans Pro</p>
                      <p className="text-xs text-muted-foreground">Et bien plus encore</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Déploiement on-premise</p>
                      <p className="text-xs text-muted-foreground">Hébergement dans votre infrastructure</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">SLA garanti 99,95%</p>
                      <p className="text-xs text-muted-foreground">Disponibilité haute performance</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Support 24/7</p>
                      <p className="text-xs text-muted-foreground">Équipe dédiée</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Utilisateurs illimités</p>
                      <p className="text-xs text-muted-foreground">Toute votre organisation</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">SSO & SAML</p>
                      <p className="text-xs text-muted-foreground">Intégration Active Directory</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Conformité avancée</p>
                      <p className="text-xs text-muted-foreground">HIPAA, SOC 2, ISO 27001</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Formation & onboarding</p>
                      <p className="text-xs text-muted-foreground">Sessions personnalisées</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <HelpCircle className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">Questions fréquentes</h2>
              <p className="text-muted-foreground">
                Tout ce que vous devez savoir sur nos tarifs
              </p>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Puis-je changer de plan à tout moment ?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Oui, vous pouvez passer à un plan supérieur ou inférieur à tout moment depuis votre compte. 
                    Les changements prennent effet immédiatement et sont calculés au prorata.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Y a-t-il des frais cachés ?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Non, nos tarifs sont totalement transparents. Le prix affiché est le prix que vous payez, 
                    hors TVA (20% en France). Pas de frais de setup, pas de frais d'annulation.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Que se passe-t-il si je dépasse ma limite d'audits en Freemium ?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Vous recevrez une notification vous proposant de passer au plan Pro pour continuer. 
                    Vos audits en cours ne sont pas perdus et vous pouvez les consulter à tout moment.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Proposez-vous des remises pour les associations ou l'éducation ?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Oui ! Nous offrons des réductions jusqu'à 50% pour les organisations à but non lucratif, 
                    les établissements d'enseignement et les chercheurs. Contactez-nous à sales@audit-iq.fr
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quels modes de paiement acceptez-vous ?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Nous acceptons les cartes bancaires (Visa, Mastercard, American Express) via Stripe. 
                    Pour les clients Enterprise, nous proposons également le paiement par virement bancaire.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Puis-je obtenir un essai du plan Enterprise ?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Oui, nous proposons des démonstrations personnalisées et des périodes d'essai pour le plan Enterprise. 
                    Contactez notre équipe commerciale pour organiser une démo adaptée à vos besoins.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 border-2 border-primary/20">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Prêt à auditer vos algorithmes ?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Rejoignez plus de 50 entreprises qui font confiance à Audit-IQ pour garantir 
                l'équité de leurs systèmes d'IA.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/signup">
                  <Button size="lg" className="shadow-lg">
                    Commencer gratuitement
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline">
                    Contacter les ventes
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-muted-foreground mt-6">
                Sans carte bancaire • 3 audits offerts • Annulation possible à tout moment
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-5">
            <div className="md:col-span-2 space-y-4">
              <h3 className="font-bold text-lg">Audit-IQ</h3>
              <p className="text-sm text-muted-foreground">
                Plateforme d'audit d'équité pour algorithmes d'intelligence artificielle
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Produit</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/#features" className="hover:text-foreground transition-colors">Fonctionnalités</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground transition-colors">Tarifs</Link></li>
                <li><Link href="/docs" className="hover:text-foreground transition-colors">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Entreprise</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground transition-colors">À propos</Link></li>
                <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
                <li><Link href="/compliance" className="hover:text-foreground transition-colors">Conformité</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Légal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-foreground transition-colors">Confidentialité</Link></li>
                <li><Link href="/terms" className="hover:text-foreground transition-colors">CGU</Link></li>
                <li><Link href="/terms-of-sale" className="hover:text-foreground transition-colors">CGV</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>© 2025 Audit-IQ. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
