import { ParallaxLayer } from '@react-spring/parallax'
import { CUSTOMER_FEATURES } from '@/utils/appConstants'
import { motion } from 'framer-motion'
import FloatingSymbol from '../FloatingSymbol'
import FogLayer from '../FogLayer'

/**
 * BenefitsScene - Beautiful flowing composition
 * Symbols scattered, no overlap
 */
const BenefitsScene = () => {
  const keyFeatures = CUSTOMER_FEATURES.slice(0, 4)
  
  const iconToSymbol = {
    'Search': 'magnifier',
    'Grid3x3': 'spark',
    'Calendar': 'star',
    'MessageSquare': 'message',
    'CreditCard': 'star',
    'Star': 'star',
  }

  const positions = [
    { top: '15%', left: '12%' },
    { top: '35%', right: '15%' },
    { top: '60%', left: '18%' },
    { top: '80%', right: '12%' },
  ]

  return (
    <>
      {/* Background */}
      <ParallaxLayer offset={4} speed={0.1}>
        <div 
          className="absolute inset-0"
          style={{ 
            background: "radial-gradient(ellipse 120% 90% at 40% 50%, rgba(20, 184, 166, 0.1), transparent 65%)" 
          }}
        />
        <FogLayer variant="radial" intensity="light" />
      </ParallaxLayer>

      {/* Benefit symbols */}
      <ParallaxLayer offset={4} speed={0.35}>
        {keyFeatures.map((feature, index) => {
          const pos = positions[index]
          const symbol = iconToSymbol[feature.icon] || 'spark'
          
          return (
            <motion.div
              key={feature.id}
              className="absolute"
              style={{
                top: pos.top,
                left: pos.left,
                right: pos.right,
              }}
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.12,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <FloatingSymbol symbol={symbol} size={120} className="animate-float" />
            </motion.div>
          )
        })}
      </ParallaxLayer>

      {/* Title */}
      <ParallaxLayer offset={4} speed={0.5}>
        <div className="h-screen flex items-center justify-center">
          <motion.div
            className="text-center px-6 md:px-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2
              style={{ fontFamily: 'var(--font-family-poppins)' }}
              className="text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 leading-tight"
            >
              Why Skillance?
            </h2>
            <p 
              style={{ fontFamily: 'var(--font-family-inter)' }}
              className="text-lg text-text-secondary max-w-2xl mx-auto"
            >
              Experience the benefits of a trusted marketplace designed for your success.
            </p>
          </motion.div>
        </div>
      </ParallaxLayer>
    </>
  )
}

export default BenefitsScene
