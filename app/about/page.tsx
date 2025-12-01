import { Metadata } from 'next'
import { Target, Users, Award, Lightbulb, Globe, Heart, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'À propos - Audit-IQ',
  description: 'Découvrez Audit-IQ, notre mission et notre équipe',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="border-b bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4" variant="outline">Fondée en 2025</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Rendre l'IA plus juste et transparente
            </h1>
            <p className="text-xl text-muted-foreground">
              Audit-IQ est née d'une conviction : l'intelligence artificielle doit être équitable, 
              transparente et accessible à tous. Nous aidons les entreprises à construire des algorithmes 
              responsables qui respectent les valeurs humaines.
            </p>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="border-2">
            <CardHeader>
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-3">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Notre Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Démocratiser l'audit de fairness algorithmique en rendant accessible à toutes les 
                entreprises les outils nécessaires pour détecter et corriger les biais dans leurs 
                systèmes d'IA.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-3">
                <Lightbulb className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Notre Vision</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Un monde où chaque algorithme est audité, transparent et équitable. Nous aspirons à 
                devenir la référence européenne en matière d'audit de fairness et de conformité IA.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-3">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Nos Valeurs</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span><strong>Équité</strong> : Au cœur de notre produit</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span><strong>Transparence</strong> : Code ouvert et méthodologies documentées</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span><strong>Excellence</strong> : Standards techniques élevés</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Our Story */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Notre Histoire</h2>
            
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">2024 - La Genèse</h3>
                  <p className="text-muted-foreground">
                    Audit-IQ est née de la rencontre entre des experts en data science, des juristes 
                    spécialisés en droit du numérique et des militants pour l'éthique de l'IA. Constatant 
                    le manque d'outils accessibles pour auditer la fairness algorithmique, nous avons décidé 
                    de créer la solution que nous aurions aimé avoir.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">2025 - Lancement & Premiers Clients</h3>
                  <p className="text-muted-foreground">
                    Après 12 mois de développement intensif et de tests en conditions réelles, nous lançons 
                    Audit-IQ officiellement. Nos premiers clients issus des secteurs RH, finance et santé 
                    nous font confiance pour auditer leurs algorithmes de scoring et de recommandation.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">2026 - Expansion & Innovation</h3>
                  <p className="text-muted-foreground">
                    Forte de plus de 50 entreprises clientes et de partenariats stratégiques, Audit-IQ 
                    lance de nouvelles fonctionnalités : rapports conformes AI Act, audits en continu, 
                    et recommandations personnalisées par IA générative. Nous ouvrons également notre 
                    bureau à Bruxelles pour accompagner l'entrée en vigueur du règlement européen.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">2027 - Ambitions Futures</h3>
                  <p className="text-muted-foreground">
                    Notre feuille de route inclut l'expansion internationale (UK, Allemagne, Benelux), 
                    le développement d'une marketplace de connecteurs sectoriels, et le lancement d'un 
                    programme de certification des auditeurs de fairness IA.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Numbers */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Audit-IQ en Chiffres</h2>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-4xl font-bold text-primary">50+</CardTitle>
              <CardDescription>Entreprises clientes</CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-4xl font-bold text-primary">5K+</CardTitle>
              <CardDescription>Audits réalisés</CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-4xl font-bold text-primary">99.9%</CardTitle>
              <CardDescription>Disponibilité plateforme</CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-4xl font-bold text-primary">24/7</CardTitle>
              <CardDescription>Support Enterprise</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Team / Expertise */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Notre Expertise</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Une équipe pluridisciplinaire de passionnés au service de l'IA responsable
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <div className="p-2 bg-primary/10 rounded-lg w-fit mb-2">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Data Scientists</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                PhDs et experts en ML/IA issus des meilleures écoles (X, ENS, MIT)
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="p-2 bg-primary/10 rounded-lg w-fit mb-2">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Juristes RGPD/AI Act</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Avocats spécialisés en droit du numérique et protection des données
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="p-2 bg-primary/10 rounded-lg w-fit mb-2">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Product & Engineering</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Ingénieurs full-stack avec expérience en scale-ups B2B SaaS
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="p-2 bg-primary/10 rounded-lg w-fit mb-2">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Éthiciens IA</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Chercheurs en éthique de l'IA et philosophie des technologies
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Partners / Certifications */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-4">Partenaires & Certifications</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Nous collaborons avec les meilleurs acteurs de l'écosystème IA et respectons les standards les plus exigeants
        </p>

        <div className="flex flex-wrap justify-center items-center gap-8 max-w-4xl mx-auto opacity-70">
          <Badge variant="outline" className="text-sm py-2 px-4">French Tech</Badge>
          <Badge variant="outline" className="text-sm py-2 px-4">Bpifrance</Badge>
          <Badge variant="outline" className="text-sm py-2 px-4">CNIL</Badge>
          <Badge variant="outline" className="text-sm py-2 px-4">ANSSI</Badge>
          <Badge variant="outline" className="text-sm py-2 px-4">ISO 27001</Badge>
          <Badge variant="outline" className="text-sm py-2 px-4">SOC 2</Badge>
          <Badge variant="outline" className="text-sm py-2 px-4">HDS</Badge>
          <Badge variant="outline" className="text-sm py-2 px-4">AI Act Ready</Badge>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary/5 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Rejoignez l'aventure</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Nous recrutons des talents passionnés par l'IA responsable. Data scientists, développeurs, 
            juristes : consultez nos offres !
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="/contact"
              className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Nous contacter
            </a>
            <a 
              href="mailto:jobs@audit-iq.fr"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-8 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Carrières
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
