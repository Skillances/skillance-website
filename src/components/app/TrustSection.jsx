import { ShieldCheck, Lock, Star, Headphones } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import AnimatedSection from '@/components/common/AnimatedSection'
import { TRUST_SECURITY } from '@/utils/appConstants'

const iconMap = {
  ShieldCheck,
  Lock,
  Star,
  Headphones,
}

const TrustSection = () => {
  return (
    <div>
      <AnimatedSection animation="fadeInUp">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 
            style={{ fontFamily: 'var(--font-family-poppins)' }} 
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Your Trust, Our Priority
          </h2>
          <p className="text-lg text-text-secondary">
            We take security and trust seriously, implementing multiple layers of protection
            to ensure safe transactions and quality service
          </p>
        </div>
      </AnimatedSection>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {TRUST_SECURITY.map((item, index) => {
          const Icon = iconMap[item.icon]
          
          // Define colors for each icon type
          const iconColors = {
            ShieldCheck: { bg: 'rgba(20, 184, 166, 0.1)', icon: '#14B8A6' }, // Teal
            Lock: { bg: 'rgba(8, 145, 178, 0.1)', icon: '#0891B2' }, // Cyan
            Star: { bg: 'rgba(234, 179, 8, 0.1)', icon: '#EAB308' }, // Yellow/Gold
            Headphones: { bg: 'rgba(37, 99, 235, 0.1)', icon: '#2563EB' }, // Blue
          }
          
          const colors = iconColors[item.icon] || { bg: 'rgba(20, 184, 166, 0.1)', icon: '#14B8A6' }
          
          return (
            <AnimatedSection key={item.id} animation="fadeInUp">
              <Card className="h-full text-center hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div 
                    className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
                    style={{ 
                      backgroundColor: colors.bg
                    }}
                  >
                    <Icon size={32} style={{ color: colors.icon }} />
                  </div>
                  <CardTitle 
                    style={{ fontFamily: 'var(--font-family-poppins)' }} 
                    className="text-xl mb-3"
                  >
                    {item.title}
                  </CardTitle>
                  <CardDescription>
                    {item.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </AnimatedSection>
          )
        })}
      </div>
    </div>
  )
}

export default TrustSection

