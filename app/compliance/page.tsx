import { Metadata } from 'next'
import { Shield, Lock, FileCheck, Users, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Conformité & Certifications - Audit-IQ',
  description: 'Notre engagement en matière de conformité, sécurité et protection des données',
}

export default function CompliancePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="border-b bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Conformité & Sécurité
            </h1>
            <p className="text-xl text-muted-foreground">
              Audit-IQ respecte les plus hauts standards de sécurité et de conformité pour protéger 
              vos données et garantir la confiance.
            </p>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Nos Certifications & Conformités</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">
                  Conforme
                </Badge>
              </div>
              <CardTitle>RGPD</CardTitle>
              <CardDescription>Règlement Général sur la Protection des Données</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>DPO désigné et joignable</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Registre des traitements tenu à jour</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Analyse d'impact (PIA) réalisée</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Exercice des droits facilité</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">
                  Certifié ISO 27001
                </Badge>
              </div>
              <CardTitle>Sécurité de l'Information</CardTitle>
              <CardDescription>Management de la sécurité des systèmes d'information</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Chiffrement AES-256</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Audits de sécurité réguliers</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Gestion des incidents documentée</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Formation continue du personnel</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileCheck className="h-6 w-6 text-primary" />
                </div>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-500/20">
                  En cours
                </Badge>
              </div>
              <CardTitle>SOC 2 Type II</CardTitle>
              <CardDescription>Contrôles de sécurité, disponibilité et confidentialité</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Audit indépendant en cours</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Documentation complète</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Certification attendue Q2 2026</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">
                  Conforme
                </Badge>
              </div>
              <CardTitle>AI Act (UE)</CardTitle>
              <CardDescription>Règlement européen sur l'intelligence artificielle</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Transparence algorithmique</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Documentation technique complète</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Mesures d'atténuation des biais</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">
                  Hébergeur Agréé
                </Badge>
              </div>
              <CardTitle>Hébergement de Données de Santé</CardTitle>
              <CardDescription>HDS (Hébergeur de Données de Santé)</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Partenariat avec hébergeur HDS</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Infrastructure dédiée disponible</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Conformité secteur santé</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileCheck className="h-6 w-6 text-primary" />
                </div>
                <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">
                  SecNumCloud
                </Badge>
              </div>
              <CardTitle>Cloud de Confiance</CardTitle>
              <CardDescription>Qualification ANSSI</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Hébergement France & UE uniquement</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Protection contre lois extraterritoriales</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Souveraineté numérique</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Mesures de sécurité */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Mesures de Sécurité Techniques</h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div>
              <h3 className="text-xl font-semibold mb-4">Chiffrement & Protection</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Chiffrement AES-256 au repos</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>TLS 1.3 pour les transferts</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Sauvegardes quotidiennes chiffrées</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Authentification multi-facteurs (MFA)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Protection DDoS niveau 7</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Surveillance & Réponse</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Monitoring 24/7 des infrastructures</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Détection d'intrusions (IDS/IPS)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Logs d'audit immutables</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Plan de réponse aux incidents</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Tests d'intrusion annuels</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Contrôle d'Accès</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Principe du moindre privilège</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Gestion des identités (IAM)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Révision trimestrielle des accès</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Rotation automatique des secrets</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Conformité Continue</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Audits de conformité semestriels</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Scans de vulnérabilités automatisés</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Mise à jour des politiques</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Formation continue des équipes</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SLA & Garanties */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Nos Engagements</h2>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-4xl font-bold text-primary">99.9%</CardTitle>
              <CardDescription className="text-center">Disponibilité garantie</CardDescription>
            </CardHeader>
            <CardContent className="text-center text-sm text-muted-foreground">
              SLA avec compensation en cas de non-respect (plans Pro et Enterprise)
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-center text-4xl font-bold text-primary">&lt; 24h</CardTitle>
              <CardDescription className="text-center">Notification des incidents</CardDescription>
            </CardHeader>
            <CardContent className="text-center text-sm text-muted-foreground">
              Information immédiate en cas de violation de données
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-center text-4xl font-bold text-primary">100%</CardTitle>
              <CardDescription className="text-center">Hébergement UE</CardDescription>
            </CardHeader>
            <CardContent className="text-center text-sm text-muted-foreground">
              Toutes vos données restent sur le territoire européen
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact section */}
      <section className="bg-primary/5 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Questions sur notre conformité ?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Notre équipe de conformité et notre DPO sont à votre disposition pour répondre à toutes vos questions.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="mailto:dpo@audit-iq.fr"
              className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Contacter notre DPO
            </a>
            <a 
              href="mailto:security@audit-iq.fr"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-8 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Équipe Sécurité
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
