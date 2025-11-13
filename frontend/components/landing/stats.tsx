import { Button } from "@/components/ui/button"

export function Stats() {
  const stats = [
    { value: "2.3x", label: "Réduction moyenne des biais" },
    { value: "<5min", label: "Temps d'analyse initial" },
    { value: "95%", label: "Précision de détection" },
  ]

  return (
    <section className="py-20" id="produit">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            Performance de détection à <span className="text-primary">grande échelle</span>
          </h2>
          <p className="text-muted-foreground">Analysez des milliers de décisions en quelques minutes</p>
        </div>

        <div className="mb-16 grid gap-8 md:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="mb-3 text-5xl font-bold tracking-tight md:text-6xl text-primary">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border bg-card p-8">
          <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="mb-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                CAS CLIENT: RECRUTEMENT
              </div>
              <h3 className="mb-2 text-xl font-bold">PME du secteur technologique</h3>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Grâce à Audit-IQ, cette entreprise a identifié que ses algorithmes de tri de CV refusaient 2,3 fois plus
                souvent les candidatures féminines. Après correction, l&apos;équité de traitement s&apos;est améliorée
                de 87% en 3 mois.
              </p>
            </div>
            <Button variant="outline" size="sm">
              Lire l&apos;étude complète
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
