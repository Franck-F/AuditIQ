'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  BookOpen, 
  MessageCircle, 
  FileText, 
  Shield, 
  Settings, 
  Users, 
  CreditCard,
  HelpCircle,
  Mail,
  Phone,
  Video,
  Clock
} from 'lucide-react'

export default function AidePage() {
  const [searchQuery, setSearchQuery] = useState('')

  const faqCategories = [
    {
      id: 'getting-started',
      title: 'Démarrage',
      icon: BookOpen,
      faqs: [
        {
          question: "Comment créer mon premier audit ?",
          answer: "Pour créer votre premier audit : 1) Connectez-vous à votre compte. 2) Allez dans Dashboard > Audits. 3) Cliquez sur 'Nouvel Audit'. 4) Téléchargez vos documents ou connectez vos sources de données. 5) Sélectionnez le type d'audit souhaité (conformité RGPD, ISO 27001, SOC 2, etc.). 6) Lancez l'analyse automatique."
        },
        {
          question: "Quels formats de fichiers sont supportés ?",
          answer: "AuditIQ supporte de nombreux formats : PDF, DOCX, XLSX, CSV, TXT, JSON, XML, ainsi que les connexions directes à vos bases de données PostgreSQL, MySQL, MongoDB. Pour les audits de code, nous supportons tous les langages majeurs via GitHub, GitLab et Bitbucket."
        },
        {
          question: "Comment inviter des membres à mon équipe ?",
          answer: "Allez dans Dashboard > Équipe > 'Inviter un membre'. Entrez l'adresse email, sélectionnez le rôle (Admin, Auditeur, Lecteur) et envoyez l'invitation. La personne recevra un email avec un lien pour rejoindre votre espace."
        },
        {
          question: "Combien de temps prend un audit ?",
          answer: "La durée dépend du volume de données : petites entreprises (< 100 documents) : 5-15 minutes, moyennes entreprises (100-1000 documents) : 30-60 minutes, grandes entreprises (> 1000 documents) : 2-4 heures. L'analyse s'effectue en arrière-plan, vous pouvez continuer à travailler."
        }
      ]
    },
    {
      id: 'compliance',
      title: 'Conformité',
      icon: Shield,
      faqs: [
        {
          question: "Quels référentiels de conformité sont couverts ?",
          answer: "AuditIQ couvre : RGPD (Règlement Général sur la Protection des Données), ISO 27001 (Sécurité de l'information), SOC 2 Type I & II, HIPAA (secteur santé), PCI-DSS (paiements), NIS2 (cybersécurité), HDS (hébergement données de santé)."
        },
        {
          question: "Comment fonctionne l'analyse RGPD ?",
          answer: "Notre IA analyse vos documents et systèmes pour : identifier les données personnelles traitées, vérifier les bases légales de traitement, contrôler les mesures de sécurité, vérifier les droits des personnes, analyser les contrats avec les sous-traitants, générer un registre des traitements conforme."
        },
        {
          question: "Les rapports sont-ils reconnus par les autorités ?",
          answer: "Nos rapports suivent les recommandations officielles de la CNIL, de l'ANSSI et des autorités européennes. Ils sont utilisables comme preuve de conformité en cas de contrôle. Cependant, nous recommandons une validation par un DPO certifié pour les audits critiques."
        },
        {
          question: "Puis-je exporter les preuves de conformité ?",
          answer: "Oui, vous pouvez exporter : rapports d'audit complets (PDF), registres de traitement, cartographie des flux de données, plans d'action priorisés, attestations de conformité, journaux d'audit horodatés."
        }
      ]
    },
    {
      id: 'security',
      title: 'Sécurité & Confidentialité',
      icon: Shield,
      faqs: [
        {
          question: "Où sont stockées mes données ?",
          answer: "Toutes vos données sont hébergées en France sur des serveurs certifiés HDS (Hébergement de Données de Santé) chez OVHcloud. Nous utilisons un chiffrement AES-256 au repos et TLS 1.3 en transit. Aucune donnée ne quitte l'Union Européenne."
        },
        {
          question: "Qui a accès à mes documents ?",
          answer: "Seuls les membres de votre équipe que vous avez explicitement invités peuvent accéder à vos données. Nos ingénieurs n'ont aucun accès à vos documents. L'IA fonctionne dans un environnement isolé et ne conserve aucune donnée après analyse."
        },
        {
          question: "Comment fonctionne l'authentification ?",
          answer: "Nous utilisons : authentification multi-facteurs (2FA) obligatoire pour les comptes Admin, tokens JWT avec expiration courte, sessions sécurisées avec HttpOnly cookies, connexion SSO avec Google/Microsoft, journalisation complète des accès."
        },
        {
          question: "Puis-je supprimer définitivement mes données ?",
          answer: "Oui, vous pouvez à tout moment : supprimer des documents individuels, supprimer des audits complets, supprimer votre compte (suppression irréversible sous 30 jours). Nous respectons intégralement le droit à l'effacement RGPD."
        }
      ]
    },
    {
      id: 'billing',
      title: 'Facturation & Abonnements',
      icon: CreditCard,
      faqs: [
        {
          question: "Comment fonctionne la période d'essai ?",
          answer: "L'essai gratuit de 14 jours inclut : 3 audits complets, toutes les fonctionnalités premium, support prioritaire, aucune carte bancaire requise. Après l'essai, choisissez le plan adapté ou continuez en version gratuite limitée."
        },
        {
          question: "Puis-je changer de plan à tout moment ?",
          answer: "Oui, vous pouvez upgrader ou downgrader à tout moment. En cas d'upgrade, vous payez au prorata. En cas de downgrade, le crédit restant est appliqué sur les prochaines factures."
        },
        {
          question: "Quels moyens de paiement acceptez-vous ?",
          answer: "Nous acceptons : cartes bancaires (Visa, Mastercard, American Express), virements bancaires SEPA (facturation annuelle uniquement), paiement par mandat administratif pour le secteur public."
        },
        {
          question: "Proposez-vous des réductions pour les associations ?",
          answer: "Oui ! Les associations, ONG et organismes publics bénéficient de -30% sur tous les plans annuels. Contactez-nous avec votre numéro SIRET pour activer la réduction."
        }
      ]
    },
    {
      id: 'features',
      title: 'Fonctionnalités',
      icon: Settings,
      faqs: [
        {
          question: "Comment fonctionne l'IA d'analyse ?",
          answer: "Notre IA utilise des modèles de langage avancés (GPT-4 + modèles spécialisés) entraînés sur des milliers d'audits de conformité. Elle identifie automatiquement : les non-conformités, les risques par niveau de criticité, les recommandations priorisées, les écarts par rapport aux référentiels."
        },
        {
          question: "Puis-je personnaliser les critères d'audit ?",
          answer: "Oui, dans le plan Entreprise : créez vos propres checklists, définissez des critères métier spécifiques, ajustez les seuils de criticité, créez des templates d'audit personnalisés."
        },
        {
          question: "Les audits sont-ils automatiquement mis à jour ?",
          answer: "Oui, les audits récurrents peuvent être planifiés : analyses hebdomadaires/mensuelles automatiques, monitoring continu des changements, alertes en temps réel sur les nouvelles non-conformités, rapports périodiques par email."
        },
        {
          question: "Comment collaborer avec mon équipe ?",
          answer: "Fonctionnalités collaboratives : commentaires sur les non-conformités, assignation de tâches avec deadline, notifications en temps réel, historique complet des modifications, export vers Jira, Trello, Asana."
        }
      ]
    },
    {
      id: 'technical',
      title: 'Questions Techniques',
      icon: Settings,
      faqs: [
        {
          question: "Quelle est la disponibilité du service ?",
          answer: "Nous garantissons une disponibilité de 99.9% (SLA). Nos serveurs sont redondants avec basculement automatique. Status en temps réel disponible sur status.auditiq.fr"
        },
        {
          question: "Proposez-vous une API ?",
          answer: "Oui, l'API REST est disponible pour tous les plans Professionnel et Entreprise. Documentation complète sur docs.auditiq.fr/api. Webhooks disponibles pour les intégrations temps réel."
        },
        {
          question: "Puis-je installer AuditIQ sur mes serveurs ?",
          answer: "Une version on-premise est disponible pour les plans Entreprise avec plus de 50 utilisateurs. Contact commercial requis pour devis et déploiement personnalisé."
        },
        {
          question: "Quelles sont les limites de stockage ?",
          answer: "Stockage inclus par plan : Gratuit : 1 GB, Professionnel : 50 GB, Entreprise : 500 GB, Entreprise+ : illimité. Stockage supplémentaire : 10€/mois par tranche de 10 GB."
        }
      ]
    }
  ]

  const filteredFAQs = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq => 
      searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="border-b bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-16 max-w-6xl">
          <div className="text-center space-y-4">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-2xl">
                <HelpCircle className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Centre d'Aide AuditIQ
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Trouvez rapidement les réponses à vos questions sur l'utilisation d'AuditIQ
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mt-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Rechercher dans l'aide..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12 max-w-6xl">
        <Tabs defaultValue="faq" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="faq" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              FAQ
            </TabsTrigger>
            <TabsTrigger value="guides" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Guides
            </TabsTrigger>
            <TabsTrigger value="contact" className="gap-2">
              <Mail className="h-4 w-4" />
              Contact
            </TabsTrigger>
          </TabsList>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-8">
            {filteredFAQs.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">
                    Aucune question ne correspond à votre recherche.
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredFAQs.map((category) => {
                const Icon = category.icon
                return (
                  <Card key={category.id}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle>{category.title}</CardTitle>
                          <CardDescription>
                            {category.faqs.length} question{category.faqs.length > 1 ? 's' : ''}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        {category.faqs.map((faq, index) => (
                          <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger className="text-left">
                              {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                              {faq.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </TabsContent>

          {/* Guides Tab */}
          <TabsContent value="guides" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        Guide de démarrage rapide
                      </CardTitle>
                      <CardDescription>
                        Prenez en main AuditIQ en 10 minutes
                      </CardDescription>
                    </div>
                    <Badge>Nouveau</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Créer votre compte</li>
                    <li>• Configurer votre premier audit</li>
                    <li>• Interpréter les résultats</li>
                    <li>• Générer votre premier rapport</li>
                  </ul>
                  <Button variant="link" className="px-0 mt-4">
                    Lire le guide →
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Audit de conformité RGPD
                    </CardTitle>
                    <CardDescription>
                      Guide complet pour votre mise en conformité
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Identifier les données personnelles</li>
                    <li>• Vérifier les bases légales</li>
                    <li>• Générer le registre des traitements</li>
                    <li>• Plan d'action priorisé</li>
                  </ul>
                  <Button variant="link" className="px-0 mt-4">
                    Lire le guide →
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Gestion d'équipe
                    </CardTitle>
                    <CardDescription>
                      Collaborez efficacement avec votre équipe
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Inviter des membres</li>
                    <li>• Gérer les rôles et permissions</li>
                    <li>• Assigner des tâches</li>
                    <li>• Suivre les progrès</li>
                  </ul>
                  <Button variant="link" className="px-0 mt-4">
                    Lire le guide →
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Rapports personnalisés
                    </CardTitle>
                    <CardDescription>
                      Créez des rapports adaptés à vos besoins
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Personnaliser les templates</li>
                    <li>• Ajouter votre branding</li>
                    <li>• Exporter en multiple formats</li>
                    <li>• Automatiser la génération</li>
                  </ul>
                  <Button variant="link" className="px-0 mt-4">
                    Lire le guide →
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Tutoriels Vidéo
                </CardTitle>
                <CardDescription>
                  Apprenez visuellement avec nos vidéos pas à pas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline">
                  Voir tous les tutoriels →
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Besoin d'aide supplémentaire ?</CardTitle>
                <CardDescription>
                  Notre équipe support est disponible pour vous accompagner
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-semibold">Email</h3>
                        <p className="text-sm text-muted-foreground">
                          Réponse sous 24h
                        </p>
                        <a href="mailto:support@auditiq.fr" className="text-sm text-primary hover:underline">
                          support@auditiq.fr
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-semibold">Téléphone</h3>
                        <p className="text-sm text-muted-foreground">
                          Lun-Ven, 9h-18h
                        </p>
                        <a href="tel:+33123456789" className="text-sm text-primary hover:underline">
                          +33 1 23 45 67 89
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <MessageCircle className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-semibold">Chat en direct</h3>
                        <p className="text-sm text-muted-foreground">
                          Réponse immédiate
                        </p>
                        <Button variant="link" className="px-0 h-auto text-sm">
                          Démarrer une conversation
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-semibold">Rendez-vous</h3>
                        <p className="text-sm text-muted-foreground">
                          Assistance personnalisée
                        </p>
                        <Button variant="link" className="px-0 h-auto text-sm">
                          Prendre rendez-vous
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4">Horaires du support</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Lundi - Vendredi</span>
                        <span className="font-medium">9h00 - 18h00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Samedi</span>
                        <span className="font-medium">10h00 - 14h00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dimanche</span>
                        <span className="font-medium">Fermé</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Badge variant="secondary">Support prioritaire 24/7 pour les plans Entreprise</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle>Vous n'avez pas trouvé de réponse ?</CardTitle>
                <CardDescription>
                  Envoyez-nous un message détaillé
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full md:w-auto" size="lg">
                  Nous contacter
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      {/* Resources Section */}
      <section className="border-t bg-muted/30 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-2xl font-bold mb-6">Ressources utiles</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <BookOpen className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Documentation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Documentation technique complète
                </p>
                <Button variant="link" className="px-0">
                  Consulter →
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <FileText className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">API</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Intégrez AuditIQ à vos outils
                </p>
                <Button variant="link" className="px-0">
                  API Docs →
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Video className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Webinaires</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Sessions de formation en ligne
                </p>
                <Button variant="link" className="px-0">
                  S'inscrire →
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <MessageCircle className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Communauté</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Échangez avec d'autres utilisateurs
                </p>
                <Button variant="link" className="px-0">
                  Rejoindre →
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
