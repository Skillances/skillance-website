import { 
  Search, Grid3x3, Calendar, MessageSquare, CreditCard, Star,
  UserCircle, ShieldCheck, MapPin, BarChart3, DollarSign, Users
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Check } from 'lucide-react'
import AnimatedSection from '@/components/common/AnimatedSection'
import { CUSTOMER_FEATURES, FREELANCER_FEATURES } from '@/utils/appConstants'

const iconMap = {
  Search,
  Grid3x3,
  Calendar,
  MessageSquare,
  CreditCard,
  Star,
  UserCircle,
  ShieldCheck,
  MapPin,
  BarChart3,
  DollarSign,
  Users,
}

const FeatureComparison = () => {
  return (
    <div className="grid lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
      {/* Customer Features */}
      <div>
        <AnimatedSection animation="fadeInUp">
          <div className="text-center mb-6 md:mb-8">
            <h3 
              style={{ fontFamily: 'var(--font-family-poppins)' }} 
              className="text-xl sm:text-2xl md:text-3xl font-bold mb-2"
            >
              For Customers
            </h3>
            <p className="text-text-secondary text-base sm:text-lg">
              Skip the search. Find verified professionals without asking around
            </p>
          </div>
        </AnimatedSection>

        <div className="grid gap-3 sm:gap-4">
          {CUSTOMER_FEATURES.map((feature, index) => {
            const Icon = iconMap[feature.icon]
            
            return (
              <AnimatedSection key={feature.id} animation="slideInLeft">
                <Card className="hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-[var(--color-section-primary)]">
                  <CardHeader className="p-4 sm:p-6 pb-3">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div 
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ 
                          backgroundColor: 'rgba(20, 184, 166, 0.1)'
                        }}
                      >
                        <Icon size={24} className="sm:w-7 sm:h-7" style={{ color: '#14B8A6' }} />
                      </div>
                      <div className="flex-grow min-w-0">
                        <CardTitle 
                          style={{ fontFamily: 'var(--font-family-poppins)' }} 
                          className="text-base sm:text-lg mb-1"
                        >
                          {feature.title}
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm line-clamp-2">
                          {feature.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </AnimatedSection>
            )
          })}
        </div>
      </div>

      {/* Freelancer Features */}
      <div>
        <AnimatedSection animation="fadeInUp">
          <div className="text-center mb-6 md:mb-8">
            <h3 
              style={{ fontFamily: 'var(--font-family-poppins)' }} 
              className="text-xl sm:text-2xl md:text-3xl font-bold mb-2"
            >
              For Freelancers
            </h3>
            <p className="text-text-secondary text-base sm:text-lg">
              Grow your business & manage everything
            </p>
          </div>
        </AnimatedSection>

        <div className="grid gap-3 sm:gap-4">
          {FREELANCER_FEATURES.map((feature, index) => {
            const Icon = iconMap[feature.icon]
            
            return (
              <AnimatedSection key={feature.id} animation="slideInRight">
                <Card className="hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-[var(--color-section-primary)]">
                  <CardHeader className="p-4 sm:p-6 pb-3">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div 
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ 
                          backgroundColor: 'rgba(20, 184, 166, 0.1)'
                        }}
                      >
                        <Icon size={24} className="sm:w-7 sm:h-7" style={{ color: '#14B8A6' }} />
                      </div>
                      <div className="flex-grow min-w-0">
                        <CardTitle 
                          style={{ fontFamily: 'var(--font-family-poppins)' }} 
                          className="text-base sm:text-lg mb-1"
                        >
                          {feature.title}
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm line-clamp-2">
                          {feature.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </AnimatedSection>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default FeatureComparison

