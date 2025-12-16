import { Link } from 'react-router-dom'
import { Smartphone, Globe, Code } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SERVICES } from '@/utils/constants'
import AnimatedSection from '@/components/common/AnimatedSection'

const iconMap = {
  Smartphone,
  Globe,
  Code,
}

const ServicesPreview = () => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {SERVICES.map((service, index) => {
        const Icon = iconMap[service.icon]

        return (
          <AnimatedSection
            key={service.id}
            animation="fadeInUp"
          >
            <Card className="h-full hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div
                  className="w-14 h-14 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: 'var(--color-surface-variant)' }}
                >
                  <Icon size={28} style={{ color: 'var(--color-primary)' }} />
                </div>
                <CardTitle style={{ fontFamily: 'var(--font-family-poppins)' }}>
                  {service.title}
                </CardTitle>
                <CardDescription className="text-base">
                  {service.shortDescription}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/services">Learn More</Link>
                </Button>
              </CardContent>
            </Card>
          </AnimatedSection>
        )
      })}
    </div>
  )
}

export default ServicesPreview
