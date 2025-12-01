import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, ArrowRight, TrendingUp, Shield, Zap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Blog - Audit-IQ',
  description: 'Articles, actualités et ressources sur l\'IA responsable et l\'audit de fairness algorithmique',
}

// Mock blog posts data
const blogPosts = [
  {
    id: 1,
    title: 'Comprendre l\'AI Act : Ce que les entreprises doivent savoir en 2025',
    excerpt: 'Le règlement européen sur l\'IA entre en vigueur. Découvrez les obligations qui concernent votre organisation et comment vous y conformer.',
    category: 'Réglementation',
    date: '15 novembre 2025',
    readTime: '8 min',
    image: '/images/blog/ai-act.jpg',
    author: 'Sophie Martin',
    tags: ['AI Act', 'Conformité', 'RGPD']
  },
  {
    id: 2,
    title: 'Les 5 métriques essentielles pour auditer la fairness de vos algorithmes',
    excerpt: 'Demographic Parity, Equal Opportunity, Calibration... Apprenez à choisir les bonnes métriques pour évaluer l\'équité de vos modèles IA.',
    category: 'Technique',
    date: '10 novembre 2025',
    readTime: '12 min',
    image: '/images/blog/metrics.jpg',
    author: 'Thomas Dubois',
    tags: ['Métriques', 'Fairness', 'ML']
  },
  {
    id: 3,
    title: 'Retour d\'expérience : Comment BNP Paribas a éliminé les biais de son algorithme de crédit',
    excerpt: 'Étude de cas détaillée sur l\'audit et la correction des biais dans un système de scoring bancaire utilisé par des millions de clients.',
    category: 'Cas client',
    date: '5 novembre 2025',
    readTime: '10 min',
    image: '/images/blog/case-study.jpg',
    author: 'Marie Lefevre',
    tags: ['Cas client', 'Finance', 'Biais']
  },
  {
    id: 4,
    title: 'IA et Recrutement : Les pièges à éviter pour rester conforme',
    excerpt: 'Les algorithmes de tri de CV peuvent perpétuer des discriminations. Voici comment les détecter et les corriger selon le droit du travail français.',
    category: 'RH & Recrutement',
    date: '28 octobre 2025',
    readTime: '6 min',
    image: '/images/blog/recruitment.jpg',
    author: 'Sophie Martin',
    tags: ['RH', 'Recrutement', 'Discrimination']
  },
  {
    id: 5,
    title: 'L\'IA générative est-elle biaisée ? Analyse de GPT-4 et Claude',
    excerpt: 'Nous avons testé les LLMs les plus populaires sur des tâches sensibles. Les résultats sont surprenants...',
    category: 'Recherche',
    date: '20 octobre 2025',
    readTime: '15 min',
    image: '/images/blog/llm-bias.jpg',
    author: 'Thomas Dubois',
    tags: ['LLM', 'Biais', 'Recherche']
  },
  {
    id: 6,
    title: 'Guide pratique : Intégrer Audit-IQ dans votre pipeline CI/CD',
    excerpt: 'Automatisez vos audits de fairness avec notre API. Tutorial complet avec exemples GitHub Actions, GitLab CI et Jenkins.',
    category: 'Tutoriel',
    date: '12 octobre 2025',
    readTime: '20 min',
    image: '/images/blog/cicd.jpg',
    author: 'Alexandre Chen',
    tags: ['API', 'DevOps', 'CI/CD']
  }
]

const categories = ['Tous', 'Réglementation', 'Technique', 'Cas client', 'RH & Recrutement', 'Recherche', 'Tutoriel']

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="border-b bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4" variant="outline">
              <TrendingUp className="h-3 w-3 mr-1" />
              Mis à jour régulièrement
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Blog Audit-IQ
            </h1>
            <p className="text-xl text-muted-foreground">
              Actualités, guides pratiques et analyses approfondies sur l'IA responsable, 
              la fairness algorithmique et la conformité réglementaire.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === 'Tous' ? 'default' : 'outline'}
                size="sm"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="container mx-auto px-4 py-12">
        <Card className="overflow-hidden border-2 hover:border-primary/50 transition-all">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-muted flex items-center justify-center p-8">
              <Shield className="h-32 w-32 text-primary/20" />
            </div>
            <CardContent className="p-8 flex flex-col justify-center">
              <Badge className="w-fit mb-4">{blogPosts[0].category}</Badge>
              <CardTitle className="text-3xl mb-4">{blogPosts[0].title}</CardTitle>
              <CardDescription className="text-base mb-6">
                {blogPosts[0].excerpt}
              </CardDescription>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{blogPosts[0].date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{blogPosts[0].readTime}</span>
                </div>
              </div>
              <Button className="w-fit">
                Lire l'article
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </div>
        </Card>
      </section>

      {/* Blog Posts Grid */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8">Derniers articles</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.slice(1).map((post) => (
            <Card key={post.id} className="flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader>
                {/* Image placeholder */}
                <div className="bg-muted rounded-lg h-48 flex items-center justify-center mb-4">
                  {post.category === 'Technique' && <Zap className="h-16 w-16 text-primary/20" />}
                  {post.category === 'Cas client' && <TrendingUp className="h-16 w-16 text-primary/20" />}
                  {post.category === 'RH & Recrutement' && <Shield className="h-16 w-16 text-primary/20" />}
                  {post.category === 'Recherche' && <Shield className="h-16 w-16 text-primary/20" />}
                  {post.category === 'Tutoriel' && <Zap className="h-16 w-16 text-primary/20" />}
                </div>
                <Badge className="w-fit mb-2">{post.category}</Badge>
                <CardTitle className="text-xl line-clamp-2">{post.title}</CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col">
                <CardDescription className="mb-4 line-clamp-3">
                  {post.excerpt}
                </CardDescription>
                
                <div className="mt-auto space-y-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{post.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Par {post.author}</p>
                    <Button variant="ghost" size="sm">
                      Lire
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="bg-primary/5 py-16">
        <div className="container mx-auto px-4">
          <Card className="max-w-3xl mx-auto text-center border-2 border-primary/20">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold mb-4">
                Ne manquez aucun article
              </h2>
              <p className="text-muted-foreground mb-8">
                Recevez nos derniers articles, guides et actualités sur l'IA responsable 
                directement dans votre boîte mail. Un email par mois, pas de spam.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="votre.email@entreprise.fr"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <Button className="whitespace-nowrap">
                  S'abonner
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                En vous abonnant, vous acceptez notre{' '}
                <Link href="/privacy" className="text-primary hover:underline">
                  politique de confidentialité
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Tags Cloud */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold mb-6 text-center">Sujets populaires</h2>
        <div className="flex flex-wrap gap-2 justify-center max-w-4xl mx-auto">
          {['AI Act', 'RGPD', 'Fairness', 'Biais', 'Machine Learning', 'Conformité', 
            'RH', 'Finance', 'Discrimination', 'LLM', 'API', 'DevOps', 'Métriques',
            'Cas client', 'Recherche', 'Tutorial'].map((tag) => (
            <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
              {tag}
            </Badge>
          ))}
        </div>
      </section>
    </div>
  )
}
