import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import Link from 'next/link'
import { BookOpen, Code, FileText, Video, Download, ArrowRight, Search, ChevronRight } from 'lucide-react'

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="pt-32">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h1 className="text-5xl font-bold tracking-tight">
                Documentation <span className="text-gradient">Audit-IQ</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Apprenez à utiliser Audit-IQ pour auditer l'équité de vos algorithmes IA
              </p>
              <div className="flex items-center gap-2 max-w-xl mx-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Rechercher dans la documentation..."
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {quickLinks.map((link, index) => (
                <Link key={index} href={link.href}>
                  <div className="group h-full rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg">
                    <div className="space-y-4">
                      <div className="inline-flex rounded-lg bg-primary/10 p-3 text-primary">
                        <link.icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-semibold">{link.title}</h3>
                      <p className="text-sm text-muted-foreground">{link.description}</p>
                      <div className="flex items-center gap-2 text-sm font-medium text-primary">
                        En savoir plus
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Documentation Sections */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8">Guides par catégorie</h2>
              <div className="space-y-6">
                {docSections.map((section, index) => (
                  <div key={index} className="rounded-xl border border-border bg-card p-6">
                    <h3 className="text-xl font-semibold mb-4">{section.title}</h3>
                    <ul className="space-y-3">
                      {section.items.map((item, itemIndex) => (
                        <li key={itemIndex}>
                          <Link 
                            href={item.href}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors group"
                          >
                            <span className="text-sm font-medium">{item.title}</span>
                            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* API Reference */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="rounded-xl border border-border bg-card p-8">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 rounded-lg bg-primary/10 p-4 text-primary">
                    <Code className="h-8 w-8" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <h2 className="text-2xl font-bold">Référence API</h2>
                    <p className="text-muted-foreground">
                      Documentation complète de l'API REST Audit-IQ avec exemples de code 
                      en Python, JavaScript et cURL. Testez les endpoints directement depuis la documentation.
                    </p>
                    <div className="flex gap-3">
                      <Link href="/docs/api">
                        <Button className="glow-primary">
                          Voir l'API
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Télécharger OpenAPI
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Support */}
        <section className="py-16 bg-gradient-to-br from-primary/10 via-secondary/10 to-transparent">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-3xl font-bold">Besoin d'aide ?</h2>
              <p className="text-lg text-muted-foreground">
                Notre équipe est là pour vous accompagner dans l'utilisation d'Audit-IQ
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/support">
                  <Button size="lg" variant="outline">
                    Contacter le support
                  </Button>
                </Link>
                <Link href="/community">
                  <Button size="lg" className="glow-primary">
                    Rejoindre la communauté
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

const quickLinks = [
  {
    icon: BookOpen,
    title: "Guide de démarrage",
    description: "Commencez avec Audit-IQ en 5 minutes",
    href: "/docs/quickstart"
  },
  {
    icon: Code,
    title: "Intégration API",
    description: "Intégrez Audit-IQ dans vos applications",
    href: "/docs/api"
  },
  {
    icon: FileText,
    title: "Tutoriels",
    description: "Apprenez avec des exemples pratiques",
    href: "/docs/tutorials"
  },
  {
    icon: Video,
    title: "Vidéos",
    description: "Regardez nos guides en vidéo",
    href: "/docs/videos"
  }
]

const docSections = [
  {
    title: "Premiers pas",
    items: [
      { title: "Installation et configuration", href: "/docs/setup" },
      { title: "Créer votre premier audit", href: "/docs/first-audit" },
      { title: "Comprendre les métriques de fairness", href: "/docs/metrics" },
      { title: "Interpréter les résultats", href: "/docs/results" }
    ]
  },
  {
    title: "Fonctionnalités avancées",
    items: [
      { title: "Upload et préparation de données", href: "/docs/data-upload" },
      { title: "Configuration des audits personnalisés", href: "/docs/custom-audits" },
      { title: "Recommandations de mitigation", href: "/docs/mitigation" },
      { title: "Génération de rapports de conformité", href: "/docs/compliance-reports" }
    ]
  },
  {
    title: "Auto EDA - Analyse Exploratoire Automatique",
    items: [
      { title: "Introduction à Auto EDA", href: "/docs/auto-eda/intro" },
      { title: "Configurer les sources de données", href: "/docs/auto-eda/data-sources" },
      { title: "Lancer des analyses manuelles", href: "/docs/auto-eda/manual-analysis" },
      { title: "Comprendre les rapports matinaux", href: "/docs/auto-eda/morning-reports" },
      { title: "Configurer les alertes (Email/Slack)", href: "/docs/auto-eda/alerts" },
      { title: "Scheduler nocturne", href: "/docs/auto-eda/scheduler" }
    ]
  },
  {
    title: "Conformité réglementaire",
    items: [
      { title: "Conformité AI Act", href: "/docs/ai-act" },
      { title: "Conformité RGPD", href: "/docs/gdpr" },
      { title: "Documentation d'audit", href: "/docs/audit-documentation" },
      { title: "Bonnes pratiques", href: "/docs/best-practices" }
    ]
  }
]
