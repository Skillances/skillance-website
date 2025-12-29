import { useInView } from 'react-intersection-observer'
import CountUp from 'react-countup'
import { Users, Briefcase, Star, Grid3x3, ThumbsUp, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { fadeInUpStagger } from '@/utils/animations'

/**
 * STATS DATA STRUCTURE
 * 
 * To add stats data, import it here and assign to the `stats` variable below.
 * 
 * Expected data structure:
 * 
 * const stats = [
 *   {
 *     id: number,                    // Unique identifier
 *     icon: ReactComponent,           // Icon component from lucide-react (e.g., Users, Briefcase, Star)
 *     value: number,                  // The number to count up to
 *     suffix: string,                 // Optional suffix (e.g., '+', '%', '★', ' min')
 *     decimals: number,               // Optional: number of decimal places (default: 0)
 *     label: string,                  // Display label (e.g., 'Active Freelancers')
 *     color: string,                 // Hex color code (e.g., '#2563EB')
 *   },
 *   // ... more stats
 * ]
 * 
 * Example:
 * import { statsData } from '@/utils/statsData'
 * const stats = statsData
 */

// TODO: Import your stats data here
// import { stats } from '@/utils/statsData'
import { stats } from '@/utils/statsData'

const AnimatedStats = () => {
  // Don't render if no stats data
  if (!stats || stats.length === 0) {
    return null
  }
  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: true,
  })

  return (
    <div className="relative overflow-hidden py-12 sm:py-16 md:py-20" style={{ background: 'linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 100%)' }}>
      {/* Background particles/shapes */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-10"
            style={{
              width: Math.random() * 300 + 100,
              height: Math.random() * 300 + 100,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: stats[i]?.color || '#2563EB',
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <div className="container mx-auto container-padding max-w-7xl relative z-10">
        <motion.div
          ref={ref}
          variants={fadeInUpStagger.container}
          initial="initial"
          animate={inView ? 'animate' : 'initial'}
          className="text-center mb-16"
        >
          <h2 
            style={{ fontFamily: 'var(--font-family-poppins)' }} 
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Trusted by Thousands
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Join a thriving community of freelancers and customers who trust Skillance
          </p>
        </motion.div>

        <motion.div
          variants={fadeInUpStagger.container}
          initial="initial"
          animate={inView ? 'animate' : 'initial'}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon
            
            return (
              <motion.div
                key={stat.id}
                variants={fadeInUpStagger.item}
                className="text-center group"
              >
                <motion.div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 mx-auto"
                  style={{ 
                    backgroundColor: `${stat.color}15`,
                  }}
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <Icon size={28} style={{ color: stat.color }} />
                </motion.div>
                
                <div 
                  style={{ 
                    fontFamily: 'var(--font-family-poppins)',
                    color: stat.color,
                  }} 
                  className="text-4xl font-bold mb-2"
                >
                  {inView && (
                    <CountUp
                      end={stat.value}
                      duration={2.5}
                      decimals={stat.decimals || 0}
                      suffix={stat.suffix}
                      separator=","
                    />
                  )}
                </div>
                
                <div className="text-sm text-text-secondary font-medium">
                  {stat.label}
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </div>
  )
}

export default AnimatedStats

