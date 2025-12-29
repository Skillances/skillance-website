import { Link } from 'react-router-dom'
import { Smartphone, Globe, Code } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SERVICES } from '@/utils/contractingConstants'
import AnimatedSection from '@/components/common/AnimatedSection'
import { motion } from 'framer-motion'

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
            <motion.div
              whileHover={{ y: -8 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Card className="h-full hover-lift border-2 border-transparent hover:border-[var(--color-accent-teal)] transition-all duration-300 flex flex-col bg-gradient-card">
                <CardHeader className="flex-grow flex flex-col">
                  <motion.div
                    className="w-14 h-14 rounded-lg flex items-center justify-center mb-4 bg-gradient-accent shadow-accent"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Icon size={28} className="text-white" />
                  </motion.div>
                  <CardTitle style={{ fontFamily: 'var(--font-family-poppins)' }}>
                    {service.title}
                  </CardTitle>
                  <CardDescription className="text-base flex-grow">
                    {service.shortDescription}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 mt-auto">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      variant="outline" 
                      className="w-full border-2 hover:border-[var(--color-accent-teal)] hover:text-[var(--color-accent-teal)] transition-all" 
                      asChild
                    >
                      <Link to="/services">Learn More</Link>
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatedSection>
        )
      })}
    </div>
  )
}

export default ServicesPreview
