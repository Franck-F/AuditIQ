import type React from "react"
import type { Metadata } from "next"

import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider"
import { CookieConsent } from "@/components/cookie-consent"
import "./globals.css"

import { Inter, Signika as V0_Font_Signika, Geist_Mono as V0_Font_Geist_Mono, Source_Serif_4 as V0_Font_Source_Serif_4 } from 'next/font/google'

// Initialize fonts
const _signika = V0_Font_Signika({ subsets: ['latin'], weight: ["300","400","500","600","700"] })
const _geistMono = V0_Font_Geist_Mono({ subsets: ['latin'], weight: ["100","200","300","400","500","600","700","800","900"] })
const _sourceSerif_4 = V0_Font_Source_Serif_4({ subsets: ['latin'], weight: ["200","300","400","500","600","700","800","900"] })

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Audit-IQ - Détection des Biais Discriminatoires",
  description: "Détectez et corrigez facilement les biais discriminatoires cachés dans vos algorithmes métiers",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.className} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
          <CookieConsent />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
