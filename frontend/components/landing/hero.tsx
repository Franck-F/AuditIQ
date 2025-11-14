import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, TrendingUp } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export function Hero() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="flex flex-col gap-8">
            <div className="inline-flex items-center gap-2 self-start rounded-full border bg-muted px-3 py-1 text-xs font-medium">
              <span className="text-primary">●</span>
              DÉTECTION INTELLIGENTE DES BIAIS
            </div>

            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Détectez les biais discriminatoires <span className="text-primary">cachés</span> dans vos algorithmes
            </h1>

            <p className="text-pretty text-lg text-muted-foreground md:text-xl">
              Importez vos données, analysez automatiquement les variables sensibles, et corrigez les biais de
              recrutement, scoring client ou recommandation produit. Sans compétence technique requise.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="/sign-up">
                  Démarrer l&apos;analyse
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#demo">Voir une démo</Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span>Conforme RGPD</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span>Résultats en temps réel</span>
              </div>
            </div>
          </div>

          <div className="relative h-[400px] lg:h-[600px]">
            <div className="absolute inset-0 rounded-2xl overflow-hidden border shadow-2xl">
              <Image
                src="/dashboard-hero.png"
                alt="Tableau de bord Audit-IQ montrant l'analyse des biais"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
