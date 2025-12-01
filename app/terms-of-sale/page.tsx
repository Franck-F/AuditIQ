import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Conditions Générales de Vente - Audit-IQ',
  description: 'Conditions générales de vente de la plateforme Audit-IQ',
}

export default function CGVPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Conditions Générales de Vente</h1>
        
        <div className="space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Objet</h2>
            <p>
              Les présentes Conditions Générales de Vente (CGV) régissent la fourniture de services d'audit 
              de fairness algorithmique par Audit-IQ (ci-après "le Prestataire") à tout client professionnel 
              (ci-après "le Client").
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Services proposés</h2>
            <p className="mb-4">Audit-IQ propose trois formules d'abonnement :</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Freemium</strong> : 1 audit par mois, rapports basiques, support communautaire</li>
              <li><strong>Pro (49€/mois)</strong> : Audits illimités, rapports avancés IA, support prioritaire</li>
              <li><strong>Enterprise (sur devis)</strong> : Solution personnalisée, déploiement on-premise, SLA garanti</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Tarifs et paiement</h2>
            <p className="mb-4">
              Les tarifs sont indiqués en euros HT. La TVA applicable (20%) sera ajoutée au montant facturé. 
              Le paiement s'effectue par carte bancaire via notre prestataire de paiement sécurisé Stripe.
            </p>
            <p>
              L'abonnement est renouvelé automatiquement chaque mois jusqu'à résiliation par le Client.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Durée et résiliation</h2>
            <p className="mb-4">
              Les abonnements sont souscrits pour une durée indéterminée avec engagement mensuel. 
              Le Client peut résilier son abonnement à tout moment depuis son espace client.
            </p>
            <p>
              La résiliation prend effet à la fin de la période d'abonnement en cours. Aucun remboursement 
              n'est effectué pour les périodes non utilisées.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Obligations du Prestataire</h2>
            <p>
              Le Prestataire s'engage à fournir les services avec diligence et selon les règles de l'art, 
              à maintenir la plateforme accessible 99,9% du temps (hors maintenance programmée), et à 
              assurer la confidentialité et la sécurité des données confiées.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Obligations du Client</h2>
            <p className="mb-4">Le Client s'engage à :</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Fournir des informations exactes lors de son inscription</li>
              <li>Respecter les conditions d'utilisation de la plateforme</li>
              <li>Ne pas utiliser le service à des fins illégales</li>
              <li>Maintenir la confidentialité de ses identifiants de connexion</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Propriété intellectuelle</h2>
            <p>
              Tous les éléments de la plateforme Audit-IQ (logiciels, algorithmes, contenus, marques) 
              sont et restent la propriété exclusive du Prestataire. Les rapports générés restent la 
              propriété du Client.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Responsabilité</h2>
            <p>
              La responsabilité du Prestataire est limitée aux préjudices directs et ne saurait excéder 
              le montant des sommes versées par le Client au cours des 12 derniers mois. Le Prestataire 
              ne saurait être tenu responsable des décisions prises par le Client sur la base des audits réalisés.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Protection des données</h2>
            <p>
              Le traitement des données personnelles est régi par notre Politique de Confidentialité, 
              conforme au RGPD. Le Client reste responsable du traitement des données qu'il soumet à la plateforme.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Droit applicable</h2>
            <p>
              Les présentes CGV sont soumises au droit français. Tout litige sera porté devant les 
              tribunaux compétents de Paris.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">11. Modifications</h2>
            <p>
              Le Prestataire se réserve le droit de modifier les présentes CGV à tout moment. 
              Les Clients seront informés par email de toute modification substantielle 30 jours avant son entrée en vigueur.
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-sm">
              <strong>Date de dernière mise à jour :</strong> 19 novembre 2025<br/>
              <strong>Contact :</strong> legal@audit-iq.fr
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
