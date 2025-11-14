import { Header } from "@/components/landing/header"
import { Hero } from "@/components/landing/hero"
import { Clients } from "@/components/landing/clients"
import { Stats } from "@/components/landing/stats"
import { Trusted } from "@/components/landing/trusted"
import { Features } from "@/components/landing/features"
import { CTA } from "@/components/landing/cta"
import { Footer } from "@/components/landing/footer"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Clients />
        <Stats />
        <Trusted />
        <Features />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
