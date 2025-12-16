import PageHeader from '@/components/common/PageHeader'
import Section from '@/components/common/Section'
import AnimatedSection from '@/components/common/AnimatedSection'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Sample portfolio data
const projects = [
  {
    id: 1,
    title: 'Skillance Mobile App',
    category: 'Mobile App',
    description: 'A comprehensive freelance marketplace platform connecting skilled professionals with clients.',
    technologies: ['Flutter', 'Firebase', 'Node.js'],
  },
  {
    id: 2,
    title: 'E-Commerce Platform',
    category: 'Web Application',
    description: 'Modern e-commerce solution with real-time inventory management and payment integration.',
    technologies: ['React', 'Node.js', 'PostgreSQL'],
  },
  {
    id: 3,
    title: 'Business Dashboard',
    category: 'Custom Software',
    description: 'Analytics dashboard for enterprise clients with advanced reporting capabilities.',
    technologies: ['Vue.js', 'Python', 'AWS'],
  },
]

const PortfolioPage = () => {
  return (
    <>
      <PageHeader
        title="Our Portfolio"
        subtitle="Showcasing our recent work and successful projects"
        breadcrumb={['Home', 'Portfolio']}
      />

      <Section>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <AnimatedSection key={project.id} animation="fadeInUp">
              <Card className="h-full hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-surface-variant rounded-t-lg flex items-center justify-center">
                  <span className="text-text-tertiary">Project Image</span>
                </div>
                <CardHeader>
                  <div className="mb-2">
                    <Badge variant="secondary">{project.category}</Badge>
                  </div>
                  <CardTitle style={{ fontFamily: 'var(--font-family-poppins)' }}>
                    {project.title}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <Badge key={tech} variant="outline">{tech}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </Section>
    </>
  )
}

export default PortfolioPage
