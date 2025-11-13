import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export function CTA() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="rounded-2xl border bg-card p-8 md:p-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            Commencez à construire des audits intelligents dès aujourd&apos;hui
          </h2>
          <p className="mb-8 text-muted-foreground">
            Créez votre premier audit gratuitement. Ensuite, payez seulement quand vous êtes prêt à passer à
            l&apos;échelle.
          </p>

          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild>
              <Link href="/sign-up">Commencer</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#demo">Voir une démo</Link>
            </Button>
          </div>

          <div className="border-t pt-8">
            <p className="mb-4 text-sm font-medium">Inscrivez-vous à la newsletter Audit-IQ</p>
            <form className="mx-auto flex max-w-md gap-2">
              <Input type="email" placeholder="Adresse email" className="flex-1" />
              <Button type="submit">S&apos;abonner</Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
