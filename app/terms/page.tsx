import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Conditions d'Utilisation - Audit-IQ",
  description: "Conditions générales d'utilisation de la plateforme Audit-IQ",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 pt-32 pb-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Conditions d'Utilisation</h1>
        
        <div className="space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Acceptation des conditions</h2>
            <p>
              En accédant et en utilisant la plateforme Audit-IQ, vous acceptez d'être lié par les 
              présentes Conditions d'Utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas 
              utiliser nos services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Description du service</h2>
            <p className="mb-4">
              Audit-IQ est une plateforme SaaS qui permet d'auditer la fairness (équité) des algorithmes 
              d'intelligence artificielle et de machine learning. Le service comprend :
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Analyse automatisée de biais algorithmiques</li>
              <li>Génération de rapports de conformité</li>
              <li>Recommandations d'amélioration par IA</li>
              <li>Visualisations et tableaux de bord</li>
              <li>Gestion d'équipe et collaboration</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Inscription et compte utilisateur</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">3.1 Éligibilité</h3>
                <p>
                  Vous devez être majeur et avoir la capacité juridique de contracter. L'utilisation 
                  est réservée aux professionnels et entreprises.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">3.2 Exactitude des informations</h3>
                <p>
                  Vous vous engagez à fournir des informations exactes, complètes et à jour lors de 
                  votre inscription et à les maintenir à jour.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">3.3 Sécurité du compte</h3>
                <p>
                  Vous êtes responsable de la confidentialité de vos identifiants de connexion. 
                  Tout accès à votre compte avec vos identifiants sera présumé être effectué par vous.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Utilisation acceptable</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">4.1 Usages autorisés</h3>
                <p>Vous pouvez utiliser Audit-IQ pour :</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Auditer vos propres algorithmes et modèles IA</li>
                  <li>Générer des rapports de conformité pour vos besoins internes</li>
                  <li>Collaborer avec votre équipe sur des projets d'audit</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">4.2 Usages interdits</h3>
                <p>Il est strictement interdit de :</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Utiliser le service à des fins illégales ou frauduleuses</li>
                  <li>Tenter de contourner les mesures de sécurité</li>
                  <li>Reverse-engineer, décompiler ou désassembler le logiciel</li>
                  <li>Revendre ou sous-licencier l'accès au service</li>
                  <li>Utiliser des robots ou scripts automatisés non autorisés</li>
                  <li>Surcharger l'infrastructure (abuse, DDoS)</li>
                  <li>Violer les droits de propriété intellectuelle</li>
                  <li>Soumettre des données personnelles sensibles non autorisées</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Données utilisateur</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">5.1 Propriété des données</h3>
                <p>
                  Vous conservez tous les droits de propriété sur les données que vous soumettez à la plateforme. 
                  Les rapports générés vous appartiennent.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">5.2 Licence d'utilisation</h3>
                <p>
                  Vous nous accordez une licence limitée, non-exclusive et révocable pour traiter vos 
                  données dans le seul but de fournir le service.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">5.3 Responsabilité</h3>
                <p>
                  Vous êtes responsable de la légalité et de la conformité des données que vous soumettez. 
                  Vous garantissez disposer des droits nécessaires pour traiter ces données.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Propriété intellectuelle</h2>
            <p className="mb-4">
              Tous les droits de propriété intellectuelle sur la plateforme Audit-IQ (code source, 
              algorithmes, design, marques, contenus) appartiennent exclusivement à Audit-IQ SAS ou 
              ses concédants de licence.
            </p>
            <p>
              Aucune licence ou droit n'est conféré sauf autorisation expresse écrite.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Disponibilité du service</h2>
            <p className="mb-4">
              Nous nous efforçons d'assurer une disponibilité de 99,9% du service. Cependant, nous ne 
              garantissons pas un accès ininterrompu et pouvons suspendre temporairement le service pour :
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Maintenance programmée (notification préalable)</li>
              <li>Urgences de sécurité</li>
              <li>Cas de force majeure</li>
              <li>Non-respect de ces conditions d'utilisation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Limitation de responsabilité</h2>
            <p className="mb-4">
              Dans les limites autorisées par la loi :
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Le service est fourni "tel quel" sans garantie d'aucune sorte</li>
              <li>Nous ne sommes pas responsables des décisions prises sur la base de nos audits</li>
              <li>Notre responsabilité est limitée aux dommages directs et au montant payé lors des 12 derniers mois</li>
              <li>Nous ne sommes pas responsables de la perte de données due à votre négligence</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Indemnisation</h2>
            <p>
              Vous acceptez d'indemniser et de dégager Audit-IQ de toute responsabilité en cas de 
              réclamation résultant de votre utilisation du service en violation de ces conditions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Résiliation</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">10.1 Par vous</h3>
                <p>
                  Vous pouvez résilier votre compte à tout moment depuis les paramètres. La résiliation 
                  prend effet à la fin de la période d'abonnement en cours.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">10.2 Par nous</h3>
                <p>
                  Nous pouvons suspendre ou résilier votre compte immédiatement en cas de violation 
                  de ces conditions, sans préavis ni remboursement.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">10.3 Effet de la résiliation</h3>
                <p>
                  À la résiliation, votre accès est immédiatement révoqué. Vous disposez de 30 jours 
                  pour exporter vos données, après quoi elles seront définitivement supprimées.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">11. Modifications des conditions</h2>
            <p>
              Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications 
              substantielles vous seront notifiées 30 jours avant leur entrée en vigueur. Votre utilisation 
              continue du service constitue votre acceptation des nouvelles conditions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">12. Loi applicable et juridiction</h2>
            <p>
              Ces conditions sont régies par le droit français. Tout litige sera soumis à la compétence 
              exclusive des tribunaux de Paris, France.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">13. Dispositions diverses</h2>
            <p className="mb-4">
              Si une disposition est jugée invalide, les autres dispositions restent en vigueur. 
              L'absence d'exercice d'un droit ne constitue pas une renonciation à ce droit.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">14. Contact</h2>
            <p>
              Pour toute question concernant ces conditions :<br/>
              Email : <a href="mailto:legal@audit-iq.fr" className="text-primary hover:underline">legal@audit-iq.fr</a><br/>
              Adresse : [Adresse de l'entreprise]
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-sm">
              <strong>Date de dernière mise à jour :</strong> 19 novembre 2025<br/>
              <strong>Version :</strong> 1.0
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
