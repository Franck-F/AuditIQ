import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { TechBadge } from '@/components/ui/tech-badge'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { CookieConsent } from '@/components/ui/cookie-consent'
import { Newsletter } from '@/components/ui/newsletter'
import { ArrowRight, Shield, BarChart3, FileCheck, Zap, Users, Lock, TrendingUp, AlertTriangle, CheckCircle2, Brain, Target, LineChart } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container relative mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-8">
              <div className="inline-block rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5">
                <span className="text-sm font-medium text-primary">Conformité AI Act & RGPD</span>
              </div>
              <h1 className="text-5xl font-bold leading-tight tracking-tight lg:text-6xl">
                Auditez l'équité de vos <span className="text-gradient">algorithmes IA</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                La plateforme SaaS qui permet aux PME de détecter et corriger les biais algorithmiques 
                pour garantir la conformité réglementaire et l'équité de leurs systèmes IA.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link href="/signup">
                  <Button size="lg" className="w-full gap-2 text-base sm:w-auto glow-primary">
                    Démarrer gratuitement
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#demo">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-base">
                    Voir la démo
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>Conforme RGPD</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-primary" />
                  <span>Données chiffrées</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Certifié AI Act</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-secondary/20 to-transparent blur-3xl" />
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Hero-BEOjmENrQnvTAFgPAHeIe3SZA7SzBA.png"
                alt="Audit-IQ Dashboard"
                className="relative rounded-xl border border-border shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="technology" className="py-12 border-y border-border bg-muted/30">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm font-medium text-muted-foreground mb-8">
            Propulsé par les meilleures technologies d'IA et de fairness
          </p>
          <div className="relative overflow-hidden">
            <div className="flex gap-6 animate-scroll-left">
              <TechBadge name="PyTorch" icon="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pytorch_logo-qG7QqCh8l4UrvI8UfgU0QDicRprew1.png" url="https://pytorch.org" />
              <TechBadge name="Scikit-learn" icon="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Scikit_learn_logo_small.svg-M9zlUI72t0uJX6WpfY0oQ1dHCodm88.png" url="https://scikit-learn.org" />
              <TechBadge name="Pandas" icon="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Pandas_logo.svg-4Nka4VeBXGNsCHEXSVSYH2SdEYe7ol.png" url="https://pandas.pydata.org" />
              <TechBadge name="Plotly" icon="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Plotly-logo-ZblsyKiY5F1Q2zLBZzyJOHwrurOMRR.png" url="https://plotly.com" />
              <TechBadge name="Anthropic" icon="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Anthropic_logo.svg-NA6h5IkuBNRwdJ77gqjCpyPOGnFjNd.png" url="https://www.anthropic.com" />
              <TechBadge name="FairLearn" icon="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/FairLearnLogo-QvSI0N9IA3Ing2LUyWhRc5yFkpO4x3.png" url="https://fairlearn.org" />
              <TechBadge name="LlamaIndex" icon="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/0_rvIJnIxJe9LwQXQf-UCPbsXG90oucGwt9d8F2f2VjVTwtnH.png" url="https://www.llamaindex.ai" />
              {/* Duplicate for seamless loop */}
              <TechBadge name="PyTorch" icon="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pytorch_logo-qG7QqCh8l4UrvI8UfgU0QDicRprew1.png" url="https://pytorch.org" />
              <TechBadge name="Scikit-learn" icon="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Scikit_learn_logo_small.svg-M9zlUI72t0uJX6WpfY0oQ1dHCodm88.png" url="https://scikit-learn.org" />
              <TechBadge name="Pandas" icon="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Pandas_logo.svg-4Nka4VeBXGNsCHEXSVSYH2SdEYe7ol.png" url="https://pandas.pydata.org" />
              <TechBadge name="Plotly" icon="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Plotly-logo-ZblsyKiY5F1Q2zLBZzyJOHwrurOMRR.png" url="https://plotly.com" />
              <TechBadge name="Anthropic" icon="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Anthropic_logo.svg-NA6h5IkuBNRwdJ77gqjCpyPOGnFjNd.png" url="https://www.anthropic.com" />
              <TechBadge name="FairLearn" icon="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/FairLearnLogo-QvSI0N9IA3Ing2LUyWhRc5yFkpO4x3.png" url="https://fairlearn.org" />
              <TechBadge name="LlamaIndex" icon="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/0_rvIJnIxJe9LwQXQf-UCPbsXG90oucGwt9d8F2f2VjVTwtnH.png" url="https://www.llamaindex.ai" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-gradient">140+</div>
              <p className="text-sm text-muted-foreground">Fonctionnalités d'audit</p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-gradient">8+</div>
              <p className="text-sm text-muted-foreground">Métriques de fairness</p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-gradient">100%</div>
              <p className="text-sm text-muted-foreground">Conforme AI Act</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold tracking-tight">Fonctionnalités complètes</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tout ce dont vous avez besoin pour auditer et garantir l'équité de vos algorithmes
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold tracking-tight">Comment ça fonctionne</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Un processus simple en 4 étapes pour auditer vos algorithmes
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="space-y-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold tracking-tight">
                Pourquoi choisir Audit-IQ ?
              </h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex gap-4 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                    <div className="flex-shrink-0 rounded-lg bg-primary/10 p-2 text-primary">
                      <benefit.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-secondary/20 to-primary/20 blur-3xl" />
              <div className="relative rounded-xl border border-border bg-card p-8 shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Score d'équité</span>
                    <span className="text-2xl font-bold text-primary">94%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full w-[94%] bg-gradient-to-r from-primary to-secondary rounded-full" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Biais détectés</p>
                      <p className="text-2xl font-bold">3</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Recommandations</p>
                      <p className="text-2xl font-bold">7</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <Newsletter />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary/10 via-secondary/10 to-transparent">
        <div className="container mx-auto px-4 text-center space-y-8">
          <h2 className="text-4xl font-bold tracking-tight">
            Prêt à garantir l'équité de vos algorithmes ?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Rejoignez les entreprises qui font confiance à Audit-IQ pour leur conformité AI Act
          </p>
          <Link href="/signup">
            <Button size="lg" className="gap-2 text-base glow-primary">
              Commencer gratuitement - 14 jours d'essai
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
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
                <li><Link href="#features" className="hover:text-foreground transition-colors">Fonctionnalités</Link></li>
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

      <CookieConsent />
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="relative space-y-4">
        <div className="inline-flex rounded-lg bg-primary/10 p-3 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

const features = [
  {
    icon: BarChart3,
    title: "Analyse des biais",
    description: "Détection automatique des biais avec 8+ métriques de fairness (Demographic Parity, Equal Opportunity, etc.)"
  },
  {
    icon: FileCheck,
    title: "Rapports de conformité",
    description: "Génération automatique de rapports AI Act et RGPD prêts pour vos audits réglementaires"
  },
  {
    icon: Zap,
    title: "Recommandations IA",
    description: "Suggestions de mitigation automatiques adaptées à votre contexte métier"
  },
  {
    icon: Shield,
    title: "Sécurité maximale",
    description: "Chiffrement AES-256, hébergement UE, conformité RGPD native"
  },
  {
    icon: Users,
    title: "Multi-utilisateurs",
    description: "Gestion d'équipe avec rôles et permissions granulaires"
  },
  {
    icon: Lock,
    title: "Données anonymisées",
    description: "Anonymisation automatique et pseudonymisation réversible de vos données"
  }
]

const steps = [
  {
    title: "Importez vos données",
    description: "Uploadez vos datasets CSV/Excel en toute sécurité avec chiffrement"
  },
  {
    title: "Configurez l'audit",
    description: "Sélectionnez les variables sensibles et métriques de fairness"
  },
  {
    title: "Analysez les résultats",
    description: "Visualisez les biais détectés avec dashboards interactifs"
  },
  {
    title: "Appliquez les corrections",
    description: "Suivez les recommandations IA pour mitiger les biais"
  }
]

const benefits = [
  {
    icon: TrendingUp,
    title: "ROI rapide",
    description: "Réduisez les risques de non-conformité et d'amendes RGPD"
  },
  {
    icon: AlertTriangle,
    title: "Détection précoce",
    description: "Identifiez les biais avant la mise en production"
  },
  {
    icon: Brain,
    title: "IA explicable",
    description: "Comprenez pourquoi vos modèles prennent certaines décisions"
  },
  {
    icon: Target,
    title: "Amélioration continue",
    description: "Trackez l'évolution de l'équité de vos algorithmes dans le temps"
  }
]
