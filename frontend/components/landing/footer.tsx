import Link from "next/link"
import Image from "next/image"
import { Github, Twitter, Linkedin, Youtube } from "lucide-react"

export function Footer() {
  const footerLinks = {
    Solutions: ["Détection de biais", "Audit algorithmique", "Conformité IA", "Tableau de bord"],
    Développeurs: ["Documentation", "API Reference", "Centre d'apprentissage", "Blog"],
    Ressources: ["Études de cas", "Webinaires", "Guides pratiques", "Partenaires"],
    Entreprise: ["À propos", "Carrières", "Contact", "Sécurité"],
  }

  return (
    <footer className="border-t bg-background py-12">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="grid gap-8 md:grid-cols-5">
          <div className="md:col-span-1">
            <Link href="/" className="mb-4 inline-block">
              <Image src="/logo.png" alt="Audit-IQ Logo" width={140} height={40} className="h-10 w-auto" />
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Détectez et corrigez les biais discriminatoires dans vos algorithmes.
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-4 text-sm font-semibold">{title}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Audit-IQ. Tous droits réservés.</p>

          <div className="flex items-center gap-4">
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Twitter className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Github className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Linkedin className="h-5 w-5" />
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Youtube className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
