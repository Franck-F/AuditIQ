import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Code, Brain, Users, Globe, Zap, Heart, Briefcase, MapPin, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Carrières - Audit-IQ',
  description: 'Rejoignez notre mission pour une IA plus juste et transparente. Découvrez nos offres d\'emploi.',
}

const values = [
  {
    icon: <Brain className="h-8 w-8 text-primary" />,
    title: "Excellence Technique",
    description: "Nous repoussons les limites de l'état de l'art en matière d'audit d'IA et de fairness algorithmique."
  },
  {
    icon: <Heart className="h-8 w-8 text-primary" />,
    title: "Impact Positif",
    description: "Chaque ligne de code contribue à rendre le monde numérique plus équitable et inclusif."
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: "Bienveillance",
    description: "Nous cultivons un environnement de travail inclusif où chaque voix compte et est respectée."
  },
  {
    icon: <Zap className="h-8 w-8 text-primary" />,
    title: "Innovation Rapide",
    description: "Nous itérons rapidement pour apporter des solutions concrètes aux défis éthiques de l'IA."
  }
]

const jobs = [
  {
    id: 1,
    title: "Senior Full Stack Engineer",
    department: "Engineering",
    location: "Paris / Remote",
    type: "CDI",
    tags: ["React", "Python", "FastAPI", "PostgreSQL"]
  },
  {
    id: 2,
    title: "AI Ethics Researcher",
    department: "R&D",
    location: "Paris",
    type: "CDI",
    tags: ["Machine Learning", "Fairness", "Research", "Python"]
  },
  {
    id: 3,
    title: "Product Manager",
    department: "Product",
    location: "Remote",
    type: "CDI",
    tags: ["SaaS", "B2B", "Agile", "Strategy"]
  },
  {
    id: 4,
    title: "Customer Success Manager",
    department: "Sales",
    location: "Paris",
    type: "CDI",
    tags: ["Onboarding", "Support", "Relation Client"]
  }
]

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="container relative mx-auto px-4 text-center z-10">
          <Badge variant="outline" className="mb-6 px-4 py-1 text-sm border-primary/20 bg-primary/5 text-primary">
            On recrute !
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            Construisons ensemble <br />
            <span className="text-gradient">l'IA de confiance</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Rejoignez une équipe passionnée qui œuvre chaque jour pour rendre les algorithmes 
            plus justes, transparents et conformes aux valeurs humaines.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="#positions">
              <Button size="lg" className="gap-2 glow-primary">
                Voir les offres
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="#culture">
              <Button variant="outline" size="lg">
                Découvrir notre culture
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section id="culture" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Pourquoi nous rejoindre ?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Chez Audit-IQ, nous ne cherchons pas seulement des compétences, mais des personnalités 
              qui partagent notre vision d'une technologie responsable.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="border-none shadow-lg bg-background/50 backdrop-blur-sm hover:bg-background transition-colors">
                <CardHeader>
                  <div className="mb-4 p-3 bg-primary/10 w-fit rounded-xl">
                    {value.icon}
                  </div>
                  <CardTitle className="text-xl mb-2">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Perks Section */}
      <section className="py-20 container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Des avantages pensés pour vous</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="p-2 bg-green-500/10 rounded-lg h-fit">
                  <Globe className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Full Remote Friendly</h3>
                  <p className="text-muted-foreground">Travaillez d'où vous voulez, ou venez à nos bureaux au cœur de Paris.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="p-2 bg-blue-500/10 rounded-lg h-fit">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Équipement au top</h3>
                  <p className="text-muted-foreground">MacBook Pro M3, écran 4K et budget pour votre setup à la maison.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="p-2 bg-purple-500/10 rounded-lg h-fit">
                  <Heart className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Santé & Bien-être</h3>
                  <p className="text-muted-foreground">Mutuelle Alan couverte à 100%, tickets restaurant Swile.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative h-[400px] rounded-2xl overflow-hidden bg-muted border border-border">
            {/* Placeholder for team image or office illustration */}
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
              <p className="text-muted-foreground font-medium">Photo de l'équipe</p>
            </div>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section id="positions" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold mb-12 text-center">Postes ouverts</h2>
          
          <div className="space-y-4">
            {jobs.map((job) => (
              <Card key={job.id} className="group hover:border-primary/50 transition-all cursor-pointer">
                <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                        {job.title}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {job.department}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {job.type}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {job.tags.map(tag => (
                        <span key={tag} className="text-xs bg-muted px-2 py-1 rounded-md text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button className="shrink-0">
                    Postuler
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Spontaneous Application CTA */}
      <section className="py-20 container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto bg-primary/5 rounded-2xl p-12 border border-primary/10">
          <h2 className="text-2xl font-bold mb-4">Vous ne trouvez pas votre bonheur ?</h2>
          <p className="text-muted-foreground mb-8">
            Nous sommes toujours à la recherche de talents exceptionnels. Envoyez-nous votre CV et 
            dites-nous comment vous pouvez contribuer à notre mission.
          </p>
          <a href="mailto:jobs@audit-iq.fr">
            <Button variant="outline" size="lg">
              Candidature spontanée
            </Button>
          </a>
        </div>
      </section>
    </div>
  )
}
