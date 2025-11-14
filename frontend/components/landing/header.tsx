"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Search, Menu } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useState } from "react"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="Audit-IQ Logo" width={180} height={50} className="h-12 w-auto" priority />
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="#produit"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Produit
            </Link>
            <Link
              href="#fonctionnalites"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Fonctionnalités
            </Link>
            <Link
              href="/docs"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Docs
            </Link>
            <Link
              href="#cas-usage"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cas d&apos;usage
            </Link>
            <Link
              href="#tarifs"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Tarifs
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="hidden md:inline-flex">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" asChild className="hidden md:inline-flex">
            <Link href="/sign-in">Connexion</Link>
          </Button>
          <Button asChild>
            <Link href="/sign-up">Essai gratuit</Link>
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="border-t md:hidden">
          <nav className="flex flex-col gap-4 p-4">
            <Link href="#produit" className="text-sm font-medium">
              Produit
            </Link>
            <Link href="#fonctionnalites" className="text-sm font-medium">
              Fonctionnalités
            </Link>
            <Link href="/docs" className="text-sm font-medium">
              Docs
            </Link>
            <Link href="#cas-usage" className="text-sm font-medium">
              Cas d&apos;usage
            </Link>
            <Link href="#tarifs" className="text-sm font-medium">
              Tarifs
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
