import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CGU - Conditions Générales d\'Utilisation - Audit-IQ',
  description: 'Conditions générales d\'utilisation de la plateforme Audit-IQ',
}

export default function CGUPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Conditions Générales d'Utilisation (CGU)</h1>
        
        <div className="space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Objet</h2>
            <p>
              Les présentes Conditions Générales d'Utilisation (CGU) ont pour objet de définir les modalités 
              et conditions d'utilisation de la plateforme Audit-IQ (ci-après "la Plateforme"), éditée par 
              Audit-IQ SAS, ainsi que de définir les droits et obligations des parties dans ce cadre.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Mentions légales</h2>
            <div className="space-y-2">
              <p><strong>Éditeur de la Plateforme :</strong></p>
              <ul className="list-none space-y-1 ml-4">
                <li>Raison sociale : Audit-IQ SAS</li>
                <li>Capital social : [À compléter]</li>
                <li>Siège social : [Adresse]</li>
                <li>RCS : [Numéro]</li>
                <li>SIRET : [Numéro]</li>
                <li>TVA intracommunautaire : [Numéro]</li>
                <li>Email : legal@audit-iq.fr</li>
                <li>Directeur de publication : [Nom]</li>
              </ul>
              <p className="mt-4"><strong>Hébergement :</strong></p>
              <ul className="list-none space-y-1 ml-4">
                <li>Amazon Web Services EMEA SARL</li>
                <li>38 Avenue John F. Kennedy, L-1855 Luxembourg</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Acceptation des CGU</h2>
            <p className="mb-4">
              L'utilisation de la Plateforme implique l'acceptation pleine et entière des présentes CGU. 
              Ces CGU sont accessibles à tout moment sur la Plateforme et prévaudront, le cas échéant, 
              sur toute autre version ou tout autre document contradictoire.
            </p>
            <p>
              L'Utilisateur reconnaît avoir pris connaissance des présentes CGU et s'engage à les respecter. 
              En cas de désaccord avec tout ou partie de ces CGU, l'Utilisateur est invité à ne pas utiliser 
              la Plateforme.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Définitions</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Utilisateur</strong> : Toute personne physique ou morale utilisant la Plateforme</li>
              <li><strong>Client</strong> : Utilisateur ayant souscrit à un abonnement payant</li>
              <li><strong>Compte</strong> : Espace personnel créé par l'Utilisateur sur la Plateforme</li>
              <li><strong>Audit</strong> : Analyse de fairness d'un algorithme réalisée via la Plateforme</li>
              <li><strong>Contenu</strong> : Ensemble des éléments constituant la Plateforme (textes, images, vidéos, etc.)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Accès à la Plateforme</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">5.1 Configuration technique requise</h3>
                <p>
                  La Plateforme est accessible depuis tout navigateur web moderne (Chrome, Firefox, Safari, Edge) 
                  à jour. Une connexion Internet stable est nécessaire. L'Utilisateur est seul responsable du 
                  bon fonctionnement de son équipement informatique.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">5.2 Disponibilité</h3>
                <p>
                  Nous nous efforçons d'assurer l'accessibilité de la Plateforme 24h/24 et 7j/7, sous réserve 
                  d'opérations de maintenance, de mises à jour ou de circonstances indépendantes de notre volonté. 
                  Aucune indemnité ne pourra être réclamée en cas d'indisponibilité temporaire.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Création de compte</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">6.1 Inscription</h3>
                <p>
                  Pour utiliser certaines fonctionnalités de la Plateforme, l'Utilisateur doit créer un compte 
                  en fournissant des informations exactes et à jour. Toute information fausse ou trompeuse peut 
                  entraîner la suspension ou la suppression du compte.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">6.2 Identifiants</h3>
                <p>
                  L'Utilisateur choisit un mot de passe lors de son inscription. Il est seul responsable de la 
                  confidentialité de ses identifiants et de toutes les activités effectuées sous son compte. 
                  En cas d'utilisation frauduleuse, l'Utilisateur doit immédiatement nous en informer.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">6.3 Compte professionnel</h3>
                <p>
                  La Plateforme est destinée à un usage professionnel. L'Utilisateur garantit disposer des 
                  autorisations nécessaires pour agir au nom de son entreprise.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Services proposés</h2>
            <p className="mb-4">
              Audit-IQ propose une plateforme SaaS permettant d'auditer la fairness (équité) des algorithmes 
              d'intelligence artificielle. Les services incluent :
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Analyse automatisée de biais algorithmiques sur plusieurs dimensions</li>
              <li>Calcul de métriques de fairness standards et personnalisées</li>
              <li>Génération de rapports de conformité (RGPD, AI Act)</li>
              <li>Recommandations d'amélioration assistées par IA</li>
              <li>Visualisations et tableaux de bord interactifs</li>
              <li>API d'intégration pour automatiser les audits</li>
              <li>Gestion d'équipe et contrôle d'accès (plans payants)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Propriété intellectuelle</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">8.1 Propriété de la Plateforme</h3>
                <p>
                  Tous les éléments de la Plateforme (structure, design, textes, images, logos, marques, 
                  code source, algorithmes) sont la propriété exclusive d'Audit-IQ ou de ses concédants de licence. 
                  Toute reproduction, représentation, modification ou exploitation non autorisée constitue une 
                  contrefaçon sanctionnée par le Code de la propriété intellectuelle.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">8.2 Licence d'utilisation</h3>
                <p>
                  Nous vous accordons une licence personnelle, non-exclusive, non-transférable et révocable 
                  d'utilisation de la Plateforme dans le cadre des présentes CGU. Cette licence ne vous confère 
                  aucun droit de propriété intellectuelle.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">8.3 Données Utilisateur</h3>
                <p>
                  Vous conservez tous les droits sur les données et contenus que vous soumettez à la Plateforme. 
                  Les rapports d'audit générés vous appartiennent. Vous nous accordez toutefois une licence 
                  d'utilisation nécessaire au fonctionnement du service.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Obligations de l'Utilisateur</h2>
            <p className="mb-4">L'Utilisateur s'engage à :</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Utiliser la Plateforme conformément à sa destination et aux présentes CGU</li>
              <li>Ne pas perturber le fonctionnement de la Plateforme (spam, virus, surcharge)</li>
              <li>Ne pas tenter d'accéder aux systèmes informatiques de manière non autorisée</li>
              <li>Ne pas copier, modifier, décompiler ou reverse-engineer le code source</li>
              <li>Respecter les droits de propriété intellectuelle</li>
              <li>Ne pas utiliser la Plateforme à des fins illégales ou frauduleuses</li>
              <li>Fournir des données exactes et légalement obtenues</li>
              <li>Respecter la législation sur la protection des données personnelles</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Protection des données personnelles</h2>
            <p>
              Le traitement des données personnelles est régi par notre 
              <a href="/privacy" className="text-primary hover:underline"> Politique de Confidentialité</a>, 
              qui fait partie intégrante des présentes CGU. Nous nous engageons à respecter le RGPD et à 
              protéger la confidentialité de vos données.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">11. Responsabilité</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">11.1 Limitation de responsabilité</h3>
                <p>
                  Audit-IQ ne saurait être tenu responsable des dommages indirects résultant de l'utilisation 
                  ou de l'impossibilité d'utiliser la Plateforme. Notre responsabilité est limitée aux 
                  dommages directs et prévisibles, dans la limite des sommes versées au cours des 12 derniers mois.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">11.2 Nature consultative</h3>
                <p>
                  Les audits et recommandations fournis par la Plateforme ont une nature purement consultative. 
                  Audit-IQ ne saurait être tenu responsable des décisions prises par l'Utilisateur sur la base 
                  de ces analyses.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">11.3 Responsabilité de l'Utilisateur</h3>
                <p>
                  L'Utilisateur est seul responsable de l'utilisation qu'il fait de la Plateforme, de la légalité 
                  des données qu'il soumet et des conséquences de ses actions.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">12. Durée et résiliation</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">12.1 Durée</h3>
                <p>
                  Les présentes CGU s'appliquent pendant toute la durée d'utilisation de la Plateforme.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">12.2 Résiliation par l'Utilisateur</h3>
                <p>
                  L'Utilisateur peut supprimer son compte à tout moment depuis les paramètres. Cette suppression 
                  entraîne la suppression définitive de toutes ses données après un délai de 30 jours.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">12.3 Résiliation par Audit-IQ</h3>
                <p>
                  Nous nous réservons le droit de suspendre ou supprimer un compte en cas de violation des 
                  présentes CGU, sans préavis ni indemnité.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">13. Modification des CGU</h2>
            <p>
              Nous nous réservons le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront 
              informés de toute modification substantielle par email ou notification sur la Plateforme. 
              L'utilisation continue de la Plateforme après notification vaut acceptation des nouvelles CGU.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">14. Loi applicable et juridiction</h2>
            <p>
              Les présentes CGU sont régies par le droit français. En cas de litige, et à défaut de règlement 
              amiable, les tribunaux de Paris seront seuls compétents.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">15. Contact</h2>
            <p>
              Pour toute question relative aux présentes CGU :<br/>
              Email : <a href="mailto:legal@audit-iq.fr" className="text-primary hover:underline">legal@audit-iq.fr</a><br/>
              Adresse : Audit-IQ SAS, [Adresse complète]
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
