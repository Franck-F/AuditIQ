import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Check } from 'lucide-react'

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Logo />
          <div className="hidden items-center gap-6 md:flex">
            <Link href="/#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Fonctionnalités
            </Link>
            <Link href="/#technology" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Technologie
            </Link>
            <Link href="/docs" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Documentation
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-foreground">
              Tarifs
            </Link>
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Connexion
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="glow-primary">
                Commencer
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-12">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold tracking-tight">
              Des tarifs <span className="text-gradient">simples et transparents</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Pour essayer et pour petites applications.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid lg:grid-cols-3 gap-0 border border-border rounded-lg overflow-hidden">
            {/* Starter Plan */}
            <div className="relative flex flex-col bg-card p-8 border-r border-border">
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">Starter</h3>
                <p className="text-sm text-muted-foreground mb-8">
                  Pour essayer et pour petites applications.
                </p>
                
                <Button variant="outline" className="w-full mb-8">
                  Démarrer gratuitement
                </Button>

                <div className="mb-8">
                  <p className="text-2xl font-bold text-primary mb-2">Gratuit</p>
                  <button className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                    Voir l'utilisation incluse
                    <span className="text-xs">↓</span>
                  </button>
                </div>

                <div className="h-px bg-border mb-6" />

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Audit-IQ Serverless</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Audit-IQ Inference</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Audit-IQ Assistant</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Métriques Console</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Support communautaire</span>
                  </div>
                </div>

                <div className="mt-8">
                  <Link href="#" className="text-sm text-primary hover:underline">
                    Voir les workloads du plan Starter ↓
                  </Link>
                </div>
              </div>
            </div>

            {/* Standard Plan - Popular */}
            <div className="relative flex flex-col bg-card p-8 border-r border-border">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center rounded-md bg-primary px-4 py-1 text-xs font-medium text-primary-foreground uppercase whitespace-nowrap">
                  POPULAIRE
                </span>
              </div>
              
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">Standard</h3>
                <p className="text-sm text-muted-foreground mb-8">
                  Pour applications de production à toute échelle.
                </p>
                
                <Button className="w-full mb-8 bg-primary hover:bg-primary/90">
                  Démarrer un essai
                </Button>

                <div className="mb-8">
                  <p className="text-2xl font-bold text-primary mb-1">
                    Essai 14 jours, crédit 300€
                  </p>
                  <p className="text-sm text-muted-foreground underline decoration-dotted">
                    50€/mois d'utilisation minimale après
                  </p>
                </div>

                <div className="h-px bg-border mb-6" />

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Paiement à l'usage pour Serverless, Inference et Assistant</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Choisissez votre cloud et région</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Import depuis object storage</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Projets et utilisateurs multiples</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">SAML SSO</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">API utilisateur et RBAC</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Sauvegarde et restauration</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Métriques Prometheus</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Inclut <span className="underline decoration-dotted">support gratuit</span></span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">SLA de réponse disponibles via <span className="underline decoration-dotted">Developer</span> ou <span className="underline decoration-dotted">Pro support</span> add-on</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className="relative flex flex-col bg-card p-8">
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
                <p className="text-sm text-muted-foreground mb-8">
                  Pour applications de production critiques.
                </p>
                
                <div className="grid grid-cols-2 gap-3 mb-8">
                  <Button variant="default">
                    Démarrer
                  </Button>
                  <Button variant="outline">
                    Demander essai
                  </Button>
                </div>

                <div className="mb-8">
                  <p className="text-2xl font-bold text-primary mb-1">
                    500€/mois
                  </p>
                  <p className="text-sm text-muted-foreground underline decoration-dotted">
                    Utilisation minimale
                  </p>
                </div>

                <div className="h-px bg-border mb-6" />

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Tout ce qui est dans Standard</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">SLA de disponibilité 99,95%</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Réseau privé</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Clés de chiffrement gérées par le client</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Journaux d'audit</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Comptes de service</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">API d'administration</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Conformité HIPAA</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm"><span className="underline decoration-dotted">Pro support</span> inclus</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Compare Plans Button */}
          <div className="text-center mt-12">
            <Button variant="ghost" size="lg">
              Comparer les plans
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <Logo />
              <p className="text-sm text-muted-foreground">
                Plateforme d'audit d'équité pour algorithmes IA
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
                <li><Link href="#about" className="hover:text-foreground transition-colors">À propos</Link></li>
                <li><Link href="#contact" className="hover:text-foreground transition-colors">Contact</Link></li>
                <li><Link href="#blog" className="hover:text-foreground transition-colors">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Légal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#privacy" className="hover:text-foreground transition-colors">Confidentialité</Link></li>
                <li><Link href="#terms" className="hover:text-foreground transition-colors">CGU</Link></li>
                <li><Link href="#compliance" className="hover:text-foreground transition-colors">Conformité</Link></li>
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
