import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function Trusted() {
  const companies = [
    {
      tag: "CAS CLIENT: FINTECH",
      name: "Vanguard",
      description: "Avant Audit-IQ, l'équipe de Vanguard passait des semaines à auditer manuellement...",
      testimonial: "Audit-IQ nous permet de traiter 10x plus d'audits avec la même équipe.",
    },
    {
      tag: "CAS CLIENT: ASSURANCE",
      name: "AXA",
      description: "AXA utilise Audit-IQ pour automatiser l'analyse de conformité de milliers de contrats...",
      testimonial: "La précision et la vitesse d'Audit-IQ ont transformé notre processus d'audit.",
    },
    {
      tag: "CAS CLIENT: RETAIL",
      name: "Inkeep",
      description: "Audit-IQ soutient notre croissance hybride en combinant vitesse et précision...",
      testimonial: "Performance exceptionnelle avec des analyses 100x plus rapides.",
    },
    {
      tag: "CAS CLIENT: TECH",
      name: "New Relic",
      description: "L'équipe utilise Audit-IQ pour automatiser les audits de sécurité et conformité...",
      testimonial: "Une solution qui évolue avec nos besoins et s'intègre parfaitement.",
    },
  ]

  return (
    <section className="py-20 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">Utilisé en production</h2>
          <p className="text-muted-foreground">Les entreprises les plus innovantes utilisent déjà Audit-IQ</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {companies.map((company) => (
            <Card key={company.name}>
              <CardHeader>
                <div className="mb-2 text-xs font-medium text-primary">{company.tag}</div>
                <CardTitle className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <span className="font-bold text-primary">{company.name[0]}</span>
                  </div>
                  {company.name}
                </CardTitle>
                <CardDescription>{company.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <blockquote className="mb-4 border-l-2 border-primary pl-4 italic text-sm">
                  &quot;{company.testimonial}&quot;
                </blockquote>
                <Button variant="link" className="h-auto p-0">
                  Lire l&apos;étude de cas →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
