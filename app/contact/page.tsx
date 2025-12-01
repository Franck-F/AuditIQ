import { Metadata } from 'next'
import { Mail, MapPin, Phone, Clock, Send } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export const metadata: Metadata = {
  title: 'Contact - Audit-IQ',
  description: 'Contactez l\'équipe Audit-IQ pour toute question ou demande',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="border-b bg-gradient-to-b from-primary/5 to-transparent pt-32">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Contactez-nous
            </h1>
            <p className="text-xl text-muted-foreground">
              Notre équipe est à votre écoute pour répondre à toutes vos questions et vous accompagner 
              dans votre démarche d'audit de fairness algorithmique.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info & Form */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Contact Information Cards */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Email</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm font-medium">Support général</p>
                  <a href="mailto:contact@audit-iq.fr" className="text-sm text-primary hover:underline">
                    contact@audit-iq.fr
                  </a>
                </div>
                <div>
                  <p className="text-sm font-medium">Support technique</p>
                  <a href="mailto:support@audit-iq.fr" className="text-sm text-primary hover:underline">
                    support@audit-iq.fr
                  </a>
                </div>
                <div>
                  <p className="text-sm font-medium">Ventes & Partenariats</p>
                  <a href="mailto:sales@audit-iq.fr" className="text-sm text-primary hover:underline">
                    sales@audit-iq.fr
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Téléphone</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium mb-1">France</p>
                <a href="tel:+33123456789" className="text-sm text-primary hover:underline">
                  +33 (0)1 23 45 67 89
                </a>
                <p className="text-xs text-muted-foreground mt-2">
                  Du lundi au vendredi, 9h-18h (hors jours fériés)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Adresse</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Audit-IQ SAS<br/>
                  123 Avenue de l'Innovation<br/>
                  75001 Paris<br/>
                  France
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">Horaires</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lundi - Vendredi</span>
                  <span className="font-medium">9h - 18h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Samedi - Dimanche</span>
                  <span className="font-medium">Fermé</span>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Support prioritaire 24/7 pour les clients Enterprise
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Envoyez-nous un message</CardTitle>
                <CardDescription>
                  Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom *</Label>
                      <Input 
                        id="firstName" 
                        name="firstName" 
                        placeholder="Jean" 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom *</Label>
                      <Input 
                        id="lastName" 
                        name="lastName" 
                        placeholder="Dupont" 
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email professionnel *</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      placeholder="jean.dupont@entreprise.fr" 
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Entreprise</Label>
                    <Input 
                      id="company" 
                      name="company" 
                      placeholder="Nom de votre entreprise" 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input 
                      id="phone" 
                      name="phone" 
                      type="tel" 
                      placeholder="+33 1 23 45 67 89" 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Sujet *</Label>
                    <Input 
                      id="subject" 
                      name="subject" 
                      placeholder="Objet de votre demande" 
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea 
                      id="message" 
                      name="message" 
                      placeholder="Décrivez votre demande en détail..."
                      className="min-h-[150px]"
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="interest">Je suis intéressé par</Label>
                    <select 
                      id="interest" 
                      name="interest"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">Sélectionnez une option</option>
                      <option value="demo">Demander une démo</option>
                      <option value="freemium">Plan Freemium</option>
                      <option value="pro">Plan Pro</option>
                      <option value="enterprise">Solution Enterprise</option>
                      <option value="partnership">Partenariat</option>
                      <option value="support">Support technique</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>

                  <div className="flex items-start gap-2">
                    <input 
                      type="checkbox" 
                      id="consent" 
                      name="consent"
                      className="mt-1"
                      required 
                    />
                    <Label htmlFor="consent" className="text-sm font-normal text-muted-foreground cursor-pointer">
                      J'accepte que mes données soient utilisées pour répondre à ma demande conformément 
                      à la <a href="/privacy" className="text-primary hover:underline">politique de confidentialité</a> *
                    </Label>
                  </div>

                  <Button type="submit" size="lg" className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Envoyer le message
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    * Champs obligatoires
                  </p>
                </form>
              </CardContent>
            </Card>

            {/* FAQ rapide */}
            <div className="mt-8 p-6 bg-muted/30 rounded-lg">
              <h3 className="font-semibold mb-4">Questions fréquentes</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-foreground">Quel est le délai de réponse ?</p>
                  <p className="text-muted-foreground">
                    Nous répondons sous 24h ouvrées pour les demandes générales, et sous 4h pour le support technique (clients Pro/Enterprise).
                  </p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Puis-je demander une démo ?</p>
                  <p className="text-muted-foreground">
                    Absolument ! Sélectionnez "Demander une démo" dans le formulaire ou contactez directement sales@audit-iq.fr
                  </p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Comment obtenir un devis Enterprise ?</p>
                  <p className="text-muted-foreground">
                    Contactez notre équipe commerciale à sales@audit-iq.fr avec vos besoins spécifiques.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map or CTA Section */}
      <section className="bg-primary/5 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Besoin d'aide immédiate ?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Consultez notre centre d'aide ou notre documentation pour trouver rapidement des réponses à vos questions.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="/docs"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Centre d'aide
            </a>
            <a 
              href="/docs"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Documentation
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
