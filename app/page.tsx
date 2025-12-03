"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { TechBadge } from '@/components/ui/tech-badge'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { CookieConsent } from '@/components/ui/cookie-consent'

import { ArrowRight, Shield, BarChart3, FileCheck, Zap, Users, Lock, TrendingUp, AlertTriangle, CheckCircle2, Brain, Target, LineChart, Linkedin, Twitter, Facebook, Instagram } from 'lucide-react'
import ShaderBackground from '@/components/shader-background'
import { Footer7 } from '@/components/footer-7'
import { LogoCloud } from "@/components/logo-cloud-3"
import { CountUp } from "@/components/ui/count-up"
import { motion } from "framer-motion"

const logos = [
  { name: "PyTorch", src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pytorch_logo-qG7QqCh8l4UrvI8UfgU0QDicRprew1.png", alt: "PyTorch" },
  { name: "Scikit-learn", src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Scikit_learn_logo_small.svg-M9zlUI72t0uJX6WpfY0oQ1dHCodm88.png", alt: "Scikit-learn" },
  { name: "Pandas", src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Pandas_logo.svg-4Nka4VeBXGNsCHEXSVSYH2SdEYe7ol.png", alt: "Pandas" },
  { name: "Plotly", src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Plotly-logo-ZblsyKiY5F1Q2zLBZzyJOHwrurOMRR.png", alt: "Plotly" },
  { name: "Anthropic", src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Anthropic_logo.svg-NA6h5IkuBNRwdJ77gqjCpyPOGnFjNd.png", alt: "Anthropic" },
  { name: "FairLearn", src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/FairLearnLogo-QvSI0N9IA3Ing2LUyWhRc5yFkpO4x3.png", alt: "FairLearn" },
  { name: "LlamaIndex", src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/0_rvIJnIxJe9LwQXQf-UCPbsXG90oucGwt9d8F2f2VjVTwtnH.png", alt: "LlamaIndex" },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20">
        <ShaderBackground className="absolute inset-0 w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="container relative mx-auto px-4 z-10">
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
          <LogoCloud logos={logos} />
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center space-y-2 p-6 rounded-2xl bg-background/50 backdrop-blur-sm border border-border/50 shadow-sm">
              <div className="text-4xl font-bold text-gradient">
                <CountUp value={140} suffix="+" />
              </div>
              <p className="text-sm text-muted-foreground">Fonctionnalités d'audit</p>
            </div>
            <div className="text-center space-y-2 p-6 rounded-2xl bg-background/50 backdrop-blur-sm border border-border/50 shadow-sm">
              <div className="text-4xl font-bold text-gradient">
                <CountUp value={8} suffix="+" />
              </div>
              <p className="text-sm text-muted-foreground">Métriques de fairness</p>
            </div>
            <div className="text-center space-y-2 p-6 rounded-2xl bg-background/50 backdrop-blur-sm border border-border/50 shadow-sm">
              <div className="text-4xl font-bold text-gradient">
                <CountUp value={100} suffix="%" />
              </div>
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
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="space-y-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold shadow-lg shadow-primary/20">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                )}
              </motion.div>
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



      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)]" />
        <div className="container relative mx-auto px-4 text-center space-y-8">
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

      <Footer7 
        logo={{
          url: "/",
          src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20audiot-iq%20big%20without%20bg.png-bniajyeaf5TeQYtgypNyrGiDOKCyWl.png",
          alt: "Audit-IQ Logo",
          title: "Audit-IQ"
        }}
        description="Plateforme SaaS d'audit d'équité et de conformité pour vos algorithmes d'IA. Détectez, analysez et corrigez les biais en toute simplicité."
        copyright="© 2025 Audit-IQ. Tous droits réservés."
        sections={[
          {
            title: "Produit",
            links: [
              { name: "Fonctionnalités", href: "#features" },
              { name: "Tarifs", href: "/pricing" },
              { name: "Documentation", href: "/docs" },
              { name: "API", href: "/docs/api" },
            ]
          },
          {
            title: "Compte",
            links: [
              { name: "Connexion", href: "/login" },
              { name: "Inscription", href: "/signup" },
              { name: "Tableau de bord", href: "/dashboard" },
              { name: "Onboarding", href: "/onboarding" },
            ]
          },
          {
            title: "Entreprise",
            links: [
              { name: "À propos", href: "/about" },
              { name: "Blog", href: "/blog" },
              { name: "Carrières", href: "/careers" },
              { name: "Contact", href: "/contact" },
            ]
          },
          {
            title: "Légal",
            links: [
              { name: "Confidentialité", href: "/privacy" },
              { name: "CGU", href: "/terms" },
              { name: "Conformité AI Act", href: "/compliance" },
              { name: "Sécurité", href: "/compliance" },
            ]
          }
        ]}
        legalLinks={[
          { name: "Confidentialité", href: "/privacy" },
          { name: "CGU", href: "/terms" },
          { name: "Mentions légales", href: "/terms" },
        ]}
        socialLinks={[
          { icon: <Linkedin className="h-5 w-5" />, href: "#", label: "LinkedIn" },
          { icon: <Twitter className="h-5 w-5" />, href: "#", label: "Twitter" },
          { icon: <Facebook className="h-5 w-5" />, href: "#", label: "Facebook" },
          { icon: <Instagram className="h-5 w-5" />, href: "#", label: "Instagram" },
        ]}
      />

      <CookieConsent />
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="relative space-y-4">
        <div className="inline-flex rounded-lg bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </motion.div>
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
