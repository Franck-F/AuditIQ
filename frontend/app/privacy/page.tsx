import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center gap-4 px-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <span className="text-lg font-bold text-primary-foreground">A</span>
            </div>
            <span className="text-xl font-bold">Audit-IQ</span>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl px-4 py-12">
        <h1 className="mb-8 text-4xl font-bold">Politique de confidentialité</h1>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold">1. Introduction</h2>
            <p className="text-muted-foreground">
              Audit-IQ s'engage à protéger votre vie privée. Cette politique de confidentialité explique comment nous
              collectons, utilisons et protégeons vos données personnelles.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">2. Données collectées</h2>
            <p className="text-muted-foreground">Nous collectons les types de données suivants :</p>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li>Informations de compte (nom, email)</li>
              <li>Données d'utilisation et analytiques</li>
              <li>Cookies et technologies similaires</li>
              <li>Données téléchargées pour analyse de biais</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold">3. Utilisation des données</h2>
            <p className="text-muted-foreground">Vos données sont utilisées pour :</p>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li>Fournir et améliorer nos services</li>
              <li>Analyser les biais dans vos algorithmes</li>
              <li>Communiquer avec vous</li>
              <li>Personnaliser votre expérience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold">4. Cookies</h2>
            <p className="text-muted-foreground">
              Nous utilisons des cookies pour améliorer votre expérience. Vous pouvez gérer vos préférences de cookies
              dans les paramètres de votre compte.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">5. Sécurité</h2>
            <p className="text-muted-foreground">
              Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données contre tout accès non
              autorisé, modification ou divulgation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold">6. Vos droits</h2>
            <p className="text-muted-foreground">Vous avez le droit de :</p>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li>Accéder à vos données personnelles</li>
              <li>Corriger vos données</li>
              <li>Supprimer votre compte</li>
              <li>Refuser le traitement de vos données</li>
              <li>Exporter vos données</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold">7. Contact</h2>
            <p className="text-muted-foreground">
              Pour toute question concernant cette politique de confidentialité, contactez-nous à :
              <br />
              <a href="mailto:privacy@audit-iq.com" className="text-primary hover:underline">
                privacy@audit-iq.com
              </a>
            </p>
          </section>

          <section>
            <p className="text-sm text-muted-foreground">
              Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
