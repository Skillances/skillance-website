import { motion } from 'framer-motion'
import { 
  Search, UserCircle, MessageSquare, CreditCard, CheckCircle,
  UserPlus, FileText, ShieldCheck, Bell, Banknote, MapPin
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { HOW_IT_WORKS_CUSTOMERS, HOW_IT_WORKS_FREELANCERS } from '@/utils/appConstants'
import { useInView } from 'react-intersection-observer'

const iconMap = {
  Search,
  UserCircle,
  CreditCard,
  CheckCircle,
  UserPlus,
  FileText,
  ShieldCheck,
  Bell,
  Banknote,
  MessageSquare,
  MapPin,
}

const HowItWorksSideBySide = () => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  })

  const renderStep = (step, index, isCustomer) => {
    const Icon = iconMap[step.icon]

    return (
      <motion.div
        key={step.number}
        initial={{ opacity: 0, x: isCustomer ? -50 : 50 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ delay: index * 0.1, duration: 0.5 }}
        className="relative"
      >
        <Card className="p-4 hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-[var(--color-section-primary)]">
          <div className="flex items-center gap-4">
            {/* Step Number & Icon */}
            <div className="flex-shrink-0 relative">
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: 'var(--color-section-primary)' }}
              >
                <span className="text-lg">{step.number}</span>
              </div>
              <div 
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ 
                  backgroundColor: 'var(--color-section-primary)',
                  opacity: 0.2
                }}
              >
                <Icon size={16} style={{ color: 'var(--color-section-primary)' }} />
              </div>
            </div>

            {/* Content */}
            <div className="flex-grow min-w-0">
              <h3 
                style={{ fontFamily: 'var(--font-family-poppins)' }} 
                className="text-base font-bold mb-1"
              >
                {step.title}
              </h3>
              <p className="text-sm text-text-secondary line-clamp-2">
                {step.description}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    )
  }

  return (
    <div ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <h2 
          style={{ fontFamily: 'var(--font-family-poppins)' }} 
          className="text-3xl md:text-4xl font-bold mb-2"
        >
          How It Works
        </h2>
        <p className="text-lg text-text-secondary">
          Get started in 5 simple steps
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Customer Flow */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-8"
          >
            <h3 
              style={{ fontFamily: 'var(--font-family-poppins)' }} 
              className="text-2xl font-bold mb-2"
            >
              For Customers
            </h3>
            <p className="text-text-secondary text-sm">
              Get started in 5 simple steps
            </p>
          </motion.div>

          <div className="space-y-3">
            {HOW_IT_WORKS_CUSTOMERS.map((step, index) =>
              renderStep(step, index, true)
            )}
          </div>
        </div>

        {/* Freelancer Flow */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-8"
          >
            <h3 
              style={{ fontFamily: 'var(--font-family-poppins)' }} 
              className="text-2xl font-bold mb-2"
            >
              For Freelancers
            </h3>
            <p className="text-text-secondary text-sm">
              Start earning in 5 simple steps
            </p>
          </motion.div>

          <div className="space-y-3">
            {HOW_IT_WORKS_FREELANCERS.map((step, index) =>
              renderStep(step, index, false)
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HowItWorksSideBySide

