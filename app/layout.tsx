import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Navbar } from '@/components/navbar'
import { Toaster } from '@/components/ui/toaster'
import { FloatingAiAssistant } from '@/components/glowing-ai-chat-assistant'
import { SmoothScroll } from '@/components/smooth-scroll'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Audit-IQ - AI Fairness Audit Platform for SMEs',
  description: 'Professional fairness audit SaaS platform helping SMEs comply with AI Act and GDPR. Detect and mitigate algorithmic bias in your AI systems.',
  generator: 'v0.app',
  keywords: ['AI fairness', 'bias detection', 'GDPR compliance', 'AI Act', 'algorithmic audit', 'SME'],
  icons: {
    icon: '/icon-tab.png',
    apple: '/icon-tab.png',
    shortcut: '/icon-tab.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className={`font-sans antialiased`}>
        <SmoothScroll>
          <Navbar />
          {children}
          <Toaster />
          <FloatingAiAssistant />
          <Analytics />
        </SmoothScroll>
      </body>
    </html>
  )
}
