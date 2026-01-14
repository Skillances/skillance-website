import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, UserCircle, Calendar, CreditCard, CheckCircle,
  UserPlus, FileText, ShieldCheck, Bell, Banknote, ChevronDown, MessageSquare, MapPin
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { HOW_IT_WORKS_CUSTOMERS, HOW_IT_WORKS_FREELANCERS } from '@/utils/appConstants'
import { useInView } from 'react-intersection-observer'
import Card3D from './Card3D'

const iconMap = {
  Search,
  UserCircle,
  Calendar,
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

const HowItWorks = ({ userType = 'customers' }) => {
  const steps = userType === 'customers' ? HOW_IT_WORKS_CUSTOMERS : HOW_IT_WORKS_FREELANCERS
  const title = userType === 'customers' ? 'How It Works for Customers' : 'How It Works for Freelancers'
  const subtitle = userType === 'customers' 
    ? 'Get started in 5 simple steps' 
    : 'Start earning in 5 simple steps'

  const [expandedStep, setExpandedStep] = useState(null)
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  })

  return (
    <div ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 
          style={{ fontFamily: 'var(--font-family-poppins)' }} 
          className="text-3xl md:text-4xl font-bold mb-4"
        >
          {title}
        </h2>
        <p className="text-lg text-text-secondary">
          {subtitle}
        </p>
      </motion.div>

      <div className="max-w-4xl mx-auto">
        {/* Desktop: Timeline view */}
        <div className="hidden md:block relative">
          {/* Animated connecting lines with gradient */}
          <motion.div
            className="absolute left-8 top-0 bottom-0 w-1 origin-top"
            style={{ 
              background: 'linear-gradient(to bottom, var(--color-section-primary), var(--color-section-secondary))',
              opacity: 0.3,
            }}
            initial={{ scaleY: 0 }}
            animate={inView ? { scaleY: 1 } : {}}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
          />
          
          {/* Progress indicator that fills as user scrolls */}
          <motion.div
            className="absolute left-8 top-0 w-1 origin-top"
            style={{ 
              background: 'linear-gradient(to bottom, var(--color-section-primary), var(--color-section-secondary))',
              opacity: 0.6,
            }}
            initial={{ scaleY: 0 }}
            animate={inView ? { scaleY: 1 } : {}}
            transition={{ duration: 2, ease: 'easeInOut', delay: 0.3 }}
          />

          <div className="space-y-8">
            {steps.map((step, index) => {
              const Icon = iconMap[step.icon]
              const isExpanded = expandedStep === index
              
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: -50 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: index * 0.2, duration: 0.5 }}
                  className="relative flex items-start gap-8"
                >
                  {/* Timeline node with rotating number badge */}
                  <div className="relative z-10 flex-shrink-0">
                    <motion.div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg relative overflow-hidden"
                      style={{ backgroundColor: 'var(--color-section-primary)' }}
                      whileHover={{ scale: 1.15, rotate: 360 }}
                      transition={{ duration: 0.6 }}
                      animate={inView ? {
                        boxShadow: [
                          `0 10px 30px -10px rgba(20, 184, 166, 0.4)`,
                          `0 10px 30px -10px rgba(8, 145, 178, 0.4)`,
                          `0 10px 30px -10px rgba(20, 184, 166, 0.4)`,
                        ],
                      } : {}}
                      transition={{
                        boxShadow: {
                          duration: 3,
                          repeat: Infinity,
                          delay: index * 0.5,
                        },
                      }}
                    >
                      {/* Rotating number badge */}
                      <motion.div
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: 'var(--color-section-secondary)' }}
                        animate={inView ? { rotate: [0, 360] } : {}}
                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                      >
                        {step.number}
                      </motion.div>
                      <Icon size={28} />
                    </motion.div>
                  </div>

                  {/* Content card with 3D flip */}
                  <motion.div 
                    className="flex-grow"
                    whileHover={{ x: 5 }}
                  >
                    <Card3D depth={8} scaleOnHover={1.01}>
                      <Card 
                        className="p-6 cursor-pointer hover:shadow-xl transition-shadow"
                        onClick={() => setExpandedStep(isExpanded ? null : index)}
                      >
                      <div className="flex items-start justify-between">
                        <div className="flex-grow">
                          <div className="flex items-center gap-3 mb-2">
                            <span 
                              style={{ 
                                fontFamily: 'var(--font-family-poppins)',
                                color: 'var(--color-section-primary)',
                              }} 
                              className="text-3xl font-bold opacity-30"
                            >
                              {step.number}
                            </span>
                            <h3 
                              style={{ fontFamily: 'var(--font-family-poppins)' }} 
                              className="text-2xl font-bold"
                            >
                              {step.title}
                            </h3>
                          </div>
                          <p className="text-text-secondary">
                            {step.description}
                          </p>

                          {/* Expandable content */}
                          {step.details && (
                            <motion.div
                              initial={false}
                              animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-sm text-text-secondary leading-relaxed">
                                  {step.details}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </div>

                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ChevronDown size={24} className="text-text-secondary" />
                        </motion.div>
                      </div>
                      </Card>
                    </Card3D>
                  </motion.div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Mobile: Card grid */}
        <div className="md:hidden grid gap-6">
          {steps.map((step, index) => {
            const Icon = iconMap[step.icon]
            
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1 }}
              >
                <Card3D depth={5} scaleOnHover={1.02}>
                  <Card 
                    className="p-6 text-center hover:shadow-lg transition-shadow border-2 border-transparent"
                    style={{ borderColor: 'transparent' }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-section-primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                  >
                  <div 
                    className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 text-white"
                    style={{ backgroundColor: 'var(--color-section-primary)' }}
                  >
                    <Icon size={28} />
                  </div>
                  <span 
                    style={{ 
                      fontFamily: 'var(--font-family-poppins)',
                      color: 'var(--color-section-primary)',
                    }} 
                    className="text-4xl font-bold opacity-30 block mb-2"
                  >
                    {step.number}
                  </span>
                  <h3 
                    style={{ fontFamily: 'var(--font-family-poppins)' }} 
                    className="text-xl font-bold mb-2"
                  >
                    {step.title}
                  </h3>
                  <p className="text-text-secondary text-sm">
                    {step.description}
                  </p>
                  </Card>
                </Card3D>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default HowItWorks

