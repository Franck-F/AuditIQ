import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politique de Confidentialité - Audit-IQ',
  description: 'Politique de confidentialité et protection des données personnelles',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 pt-32 pb-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Politique de Confidentialité</h1>
        
        <div className="space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
            <p>
              Audit-IQ accorde une importance particulière à la protection de vos données personnelles. 
              Cette politique de confidentialité explique quelles données nous collectons, pourquoi nous 
              les collectons, et comment nous les protégeons conformément au Règlement Général sur la 
              Protection des Données (RGPD).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibent text-foreground mb-4">2. Responsable du traitement</h2>
            <p>
              <strong>Audit-IQ SAS</strong><br/>
              Adresse : [Adresse de l'entreprise]<br/>
              Email : dpo@audit-iq.fr<br/>
              Téléphone : [Numéro de téléphone]
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Données collectées</h2>
            <p className="mb-4">Nous collectons les catégories de données suivantes :</p>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">3.1 Données d'identification</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Nom et prénom</li>
                  <li>Adresse email professionnelle</li>
                  <li>Nom de l'entreprise</li>
                  <li>Secteur d'activité et taille de l'entreprise</li>
                  <li>SIRET (optionnel)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">3.2 Données de connexion</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Adresse IP</li>
                  <li>Logs de connexion</li>
                  <li>Données de navigation (cookies)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">3.3 Données d'utilisation</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Audits réalisés (métadonnées uniquement)</li>
                  <li>Rapports générés</li>
                  <li>Paramètres de configuration</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Finalités du traitement</h2>
            <p className="mb-4">Vos données sont utilisées pour :</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Gérer votre compte utilisateur et authentification</li>
              <li>Fournir les services d'audit de fairness algorithmique</li>
              <li>Traiter les paiements et la facturation</li>
              <li>Assurer le support technique et client</li>
              <li>Améliorer nos services et développer de nouvelles fonctionnalités</li>
              <li>Respecter nos obligations légales et réglementaires</li>
              <li>Vous envoyer des communications relatives au service (notifications, mises à jour)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Base légale</h2>
            <p className="mb-4">Le traitement de vos données repose sur :</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>L'exécution du contrat</strong> pour la fourniture du service</li>
              <li><strong>L'intérêt légitime</strong> pour l'amélioration de nos services</li>
              <li><strong>Votre consentement</strong> pour les communications marketing (révocable à tout moment)</li>
              <li><strong>Les obligations légales</strong> en matière de comptabilité et fiscalité</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Durée de conservation</h2>
            <p className="mb-4">Nous conservons vos données :</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Données de compte : pendant toute la durée de votre abonnement + 3 ans</li>
              <li>Données de facturation : 10 ans (obligation légale)</li>
              <li>Logs de connexion : 12 mois</li>
              <li>Cookies : 13 mois maximum</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Partage des données</h2>
            <p className="mb-4">Vos données peuvent être partagées avec :</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Stripe</strong> : traitement des paiements</li>
              <li><strong>AWS/GCP</strong> : hébergement sécurisé en UE</li>
              <li><strong>Anthropic/OpenAI</strong> : génération de recommandations IA (données anonymisées)</li>
              <li><strong>Autorités compétentes</strong> : sur demande légale uniquement</li>
            </ul>
            <p className="mt-4">
              Nous ne vendons jamais vos données à des tiers. Tous nos sous-traitants sont soumis à des 
              obligations contractuelles strictes de confidentialité et de sécurité.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Sécurité</h2>
            <p className="mb-4">Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données :</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Chiffrement AES-256 des données au repos et en transit (TLS 1.3)</li>
              <li>Authentification forte et gestion des accès</li>
              <li>Sauvegardes quotidiennes chiffrées</li>
              <li>Surveillance et détection des intrusions</li>
              <li>Audits de sécurité réguliers</li>
              <li>Personnel formé à la protection des données</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Vos droits</h2>
            <p className="mb-4">Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Droit d'accès</strong> : obtenir une copie de vos données</li>
              <li><strong>Droit de rectification</strong> : corriger des données inexactes</li>
              <li><strong>Droit à l'effacement</strong> : supprimer vos données ("droit à l'oubli")</li>
              <li><strong>Droit à la limitation</strong> : restreindre le traitement</li>
              <li><strong>Droit à la portabilité</strong> : récupérer vos données dans un format structuré</li>
              <li><strong>Droit d'opposition</strong> : vous opposer à certains traitements</li>
              <li><strong>Droit de retirer votre consentement</strong> à tout moment</li>
            </ul>
            <p className="mt-4">
              Pour exercer vos droits, contactez-nous à : <a href="mailto:dpo@audit-iq.fr" className="text-primary hover:underline">dpo@audit-iq.fr</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Cookies</h2>
            <p className="mb-4">
              Nous utilisons des cookies essentiels pour le fonctionnement du service et des cookies 
              analytiques (avec votre consentement) pour améliorer l'expérience utilisateur. Vous pouvez 
              gérer vos préférences via notre bandeau de cookies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">11. Transferts internationaux</h2>
            <p>
              Vos données sont hébergées au sein de l'Union Européenne. En cas de transfert hors UE, 
              nous utilisons les clauses contractuelles types de la Commission Européenne.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">12. Réclamation</h2>
            <p>
              Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation 
              auprès de la CNIL : <a href="https://www.cnil.fr" className="text-primary hover:underline" target="_blank" rel="noopener">www.cnil.fr</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">13. Modifications</h2>
            <p>
              Cette politique peut être mise à jour. Toute modification substantielle vous sera notifiée 
              par email 30 jours avant son entrée en vigueur.
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-sm">
              <strong>Date de dernière mise à jour :</strong> 19 novembre 2025<br/>
              <strong>Contact DPO :</strong> dpo@audit-iq.fr<br/>
              <strong>Numéro de déclaration CNIL :</strong> [À compléter]
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
