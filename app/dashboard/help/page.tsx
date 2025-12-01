'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  BookOpen, 
  MessageCircle, 
  FileText, 
  Shield, 
  Zap,
  Database,
  CreditCard,
  Mail,
  Video,
  ExternalLink,
  PlayCircle,
  Download,
  Lightbulb,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  HelpCircle
} from 'lucide-react'

export default function DashboardHelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const faqCategories = [
    {
      id: 'getting-started',
      title: 'Démarrage rapide',
      icon: Zap,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      faqs: [
        {
          question: "Comment créer mon premier audit ?",
          answer: "1. Cliquez sur 'Audits' dans le menu\n2. Sélectionnez 'Nouvel Audit'\n3. Choisissez votre type d'audit (RGPD, ISO 27001, SOC 2)\n4. Téléchargez vos documents ou connectez vos sources\n5. Lancez l'analyse automatique\n6. Consultez les résultats en temps réel"
        },
        {
          question: "Quels formats de fichiers puis-je analyser ?",
          answer: "Formats supportés : PDF, DOCX, XLSX, CSV, TXT, JSON, XML. Connexions directes : PostgreSQL, MySQL, MongoDB, API REST. Intégrations : GitHub, GitLab, Bitbucket pour l'audit de code."
        },
        {
          question: "Comment inviter mon équipe ?",
          answer: "Allez dans 'Équipe' > 'Inviter' > Entrez l'email et le rôle (Admin/Auditeur/Lecteur). La personne recevra un lien d'invitation par email."
        }
      ]
    },
    {
      id: 'audits',
      title: 'Audits & Analyses',
      icon: FileText,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      faqs: [
        {
          question: "Comment interpréter les résultats d'audit ?",
          answer: "Les résultats sont classés par niveau : 🔴 Critique (action immédiate), 🟠 Important (à corriger sous 30j), 🟡 Mineur (amélioration recommandée), 🟢 Conforme. Chaque non-conformité inclut une description, un impact et des recommandations."
        },
        {
          question: "Puis-je planifier des audits automatiques ?",
          answer: "Oui ! Allez dans les paramètres d'audit > Planification. Choisissez la fréquence (quotidienne, hebdomadaire, mensuelle) et les critères. Vous recevrez des rapports automatiques par email."
        }
      ]
    },
    {
      id: 'compliance',
      title: 'Conformité',
      icon: Shield,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      faqs: [
        {
          question: "Quels référentiels sont couverts ?",
          answer: "• RGPD : Conformité européenne protection des données\n• ISO 27001 : Management de la sécurité\n• SOC 2 : Contrôles pour services cloud\n• HIPAA : Secteur santé (USA)\n• PCI-DSS : Paiements carte bancaire\n• NIS2 : Cybersécurité EU\n• HDS : Hébergement données de santé (France)"
        }
      ]
    },
    {
      id: 'data',
      title: 'Données & Sécurité',
      icon: Database,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      faqs: [
        {
          question: "Où sont stockées mes données ?",
          answer: "Hébergement en France (OVHcloud) certifié HDS. Chiffrement AES-256 au repos, TLS 1.3 en transit. Aucune donnée ne quitte l'UE."
        }
      ]
    },
    {
      id: 'billing',
      title: 'Facturation',
      icon: CreditCard,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
      faqs: [
        {
          question: "Comment changer de plan ?",
          answer: "Paramètres > Abonnement > Changer de plan. Upgrade : actif immédiatement, paiement au prorata."
        }
      ]
    }
  ]

  const quickActions = [
    {
      title: 'Créer un audit',
      description: 'Lancez votre première analyse',
      icon: PlayCircle,
      href: '/dashboard/audits',
      color: 'text-blue-500'
    },
    {
      title: 'Guides vidéo',
      description: 'Tutoriels pas à pas',
      icon: Video,
      href: '#videos',
      color: 'text-purple-500'
    },
    {
      title: 'Documentation',
      description: 'Référence complète',
      icon: BookOpen,
      href: '/docs',
      color: 'text-green-500'
    },
    {
      title: 'Contacter le support',
      description: 'Aide personnalisée',
      icon: MessageCircle,
      href: '#contact',
      color: 'text-orange-500'
    }
  ]

  const tutorials = [
    { title: 'Démarrage en 5 minutes', duration: '5:32', views: '2.4k', thumbnail: '🎬' },
    { title: 'Audit RGPD complet', duration: '12:15', views: '1.8k', thumbnail: '🛡️' },
    { title: 'Gestion d\'équipe', duration: '7:45', views: '1.2k', thumbnail: '👥' },
    { title: 'Rapports personnalisés', duration: '9:20', views: '980', thumbnail: '📊' }
  ]

  const filteredFAQs = selectedCategory
    ? faqCategories.filter(cat => cat.id === selectedCategory)
    : faqCategories.filter(category => 
        category.faqs.some(faq => 
          searchQuery === '' ||
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
      ).map(category => ({
        ...category,
        faqs: category.faqs.filter(faq => 
          searchQuery === '' ||
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }))

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 border">
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-background/50 backdrop-blur-sm px-3 py-1 rounded-full border">
                <Lightbulb className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Centre d'Aide</span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight">
                Comment pouvons-nous vous aider ?
              </h1>
              <p className="text-lg text-muted-foreground">
                Trouvez des réponses, des guides et contactez notre équipe
              </p>
            </div>
            <Badge variant="secondary" className="gap-1">
              <TrendingUp className="h-3 w-3" />
              +120 articles
            </Badge>
          </div>

          {/* Search */}
          <div className="relative mt-6 max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Rechercher une question, un guide, un tutoriel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base bg-background/50 backdrop-blur-sm border-2"
            />
            {searchQuery && (
              <Badge variant="secondary" className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {filteredFAQs.reduce((acc, cat) => acc + cat.faqs.length, 0)} résultats
              </Badge>
            )}
          </div>
        </div>
        
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, index) => {
          const Icon = action.icon
          return (
            <Card key={index} className="hover:shadow-lg transition-all cursor-pointer group border-2 hover:border-primary/50">
              <CardContent className="p-5">
                <div className="space-y-3">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${action.color === 'text-blue-500' ? 'from-blue-500/10 to-blue-500/5' : action.color === 'text-purple-500' ? 'from-purple-500/10 to-purple-500/5' : action.color === 'text-green-500' ? 'from-green-500/10 to-green-500/5' : 'from-orange-500/10 to-orange-500/5'}`}>
                    <Icon className={`h-6 w-6 ${action.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold group-hover:text-primary transition-colors">{action.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Categories */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Questions fréquentes</h2>
          {selectedCategory && (
            <Button variant="ghost" size="sm" onClick={() => setSelectedCategory(null)}>
              Voir toutes les catégories
            </Button>
          )}
        </div>

        {!selectedCategory && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {faqCategories.map((category) => {
              const Icon = category.icon
              return (
                <Card 
                  key={category.id} 
                  className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary/50 group"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${category.bgColor}`}>
                        <Icon className={`h-6 w-6 ${category.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold group-hover:text-primary transition-colors">{category.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{category.faqs.length} questions</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* FAQ Display */}
        {filteredFAQs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">Aucun résultat trouvé</p>
              <p className="text-muted-foreground mt-2">Essayez avec d'autres mots-clés</p>
              <Button className="mt-4">
                <MessageCircle className="h-4 w-4 mr-2" />
                Contacter le support
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredFAQs.map((category) => {
              const Icon = category.icon
              return (
                <Card key={category.id} className="overflow-hidden border-2">
                  <CardHeader className={`${category.bgColor} border-b`}>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-background/50 backdrop-blur-sm">
                        <Icon className={`h-5 w-5 ${category.color}`} />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl">{category.title}</CardTitle>
                        <CardDescription>
                          {category.faqs.length} question{category.faqs.length > 1 ? 's' : ''} disponible{category.faqs.length > 1 ? 's' : ''}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Accordion type="single" collapsible className="w-full">
                      {category.faqs.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${category.id}-${index}`} className="px-6 border-none">
                          <AccordionTrigger className="text-left hover:no-underline py-5 hover:text-primary">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                              <span className="font-medium">{faq.question}</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground pl-8 pr-4 pb-5">
                            <div className="space-y-2 whitespace-pre-line leading-relaxed">
                              {faq.answer}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Tutorials */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Video className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Tutoriels vidéo</CardTitle>
                <CardDescription>Apprenez visuellement avec nos guides</CardDescription>
              </div>
            </div>
            <Button variant="outline">
              Voir tout
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tutorials.map((tutorial, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-lg transition-all group border-2">
                <CardContent className="p-4">
                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center mb-3 group-hover:scale-105 transition-transform relative">
                    <div className="text-4xl">{tutorial.thumbnail}</div>
                    <PlayCircle className="absolute h-12 w-12 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h4 className="font-medium text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {tutorial.title}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{tutorial.duration}</span>
                    <span>•</span>
                    <span>{tutorial.views} vues</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card className="border-2 border-dashed">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="p-4 bg-primary/10 rounded-2xl">
              <MessageCircle className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-bold mb-2">Vous ne trouvez pas votre réponse ?</h3>
              <p className="text-muted-foreground">
                Notre équipe support est disponible 24/7. Réponse garantie sous 2h.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="gap-2">
                <Mail className="h-5 w-5" />
                Contacter par email
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                <MessageCircle className="h-5 w-5" />
                Chat en direct
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resources */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/50">
          <CardContent className="p-6 text-center">
            <BookOpen className="h-8 w-8 text-primary mx-auto mb-3" />
            <h4 className="font-semibold mb-2">Documentation</h4>
            <p className="text-sm text-muted-foreground mb-4">Référence technique complète</p>
            <Button variant="link" className="p-0">Consulter →</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/50">
          <CardContent className="p-6 text-center">
            <FileText className="h-8 w-8 text-primary mx-auto mb-3" />
            <h4 className="font-semibold mb-2">API Reference</h4>
            <p className="text-sm text-muted-foreground mb-4">Intégrez AuditIQ</p>
            <Button variant="link" className="p-0">API Docs →</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/50">
          <CardContent className="p-6 text-center">
            <Download className="h-8 w-8 text-primary mx-auto mb-3" />
            <h4 className="font-semibold mb-2">Templates</h4>
            <p className="text-sm text-muted-foreground mb-4">Modèles prêts à l'emploi</p>
            <Button variant="link" className="p-0">Télécharger →</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
