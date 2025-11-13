import { Upload, Brain, BarChart3, Lightbulb, TrendingUp, FileText } from "lucide-react"

export function Features() {
  const features = [
    {
      icon: Upload,
      title: "Import simplifié",
      description: "Importez vos données (CV, scoring, décisions) en quelques clics. Format CSV, Excel ou API.",
    },
    {
      icon: Brain,
      title: "Analyse automatique",
      description: "Détection intelligente des variables sensibles : nom, sexe, origine, adresse, âge...",
    },
    {
      icon: BarChart3,
      title: "Tableau de bord visuel",
      description: "Score de risque global et visualisation des écarts statistiquement suspects par segment.",
    },
    {
      icon: Lightbulb,
      title: "Recommandations concrètes",
      description:
        "Propositions d'actions : modifier les règles métier, recalibrer les modèles, ajuster les pondérations.",
    },
    {
      icon: TrendingUp,
      title: "Suivi dans le temps",
      description: "Mesurez l'impact de vos corrections avec des rapports mensuels d'évolution des biais.",
    },
    {
      icon: FileText,
      title: "Bulletin éthique mensuel",
      description: "Recevez automatiquement un rapport complet sur la santé éthique de vos algorithmes.",
    },
  ]

  return (
    <section className="py-20 bg-muted/30" id="fonctionnalites">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-16 text-center">
          <div className="mb-4 inline-block rounded-full border bg-background px-3 py-1 text-xs font-medium">
            FONCTIONNALITÉS CLÉS
          </div>
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            Contrôle des biais accessible et actionnable
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Pas besoin d&apos;expertise technique. Audit-IQ rend la détection et la correction des biais
            discriminatoires accessible à toutes les PME.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col items-start gap-4 rounded-xl border bg-background p-6 transition-all hover:shadow-lg hover:border-primary/50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
