import { motion } from 'framer-motion'
import { TypeAnimation } from 'react-type-animation'
import { ChevronDown } from 'lucide-react'
import DownloadCTA from './DownloadCTA'
import { APP_STATS } from '@/utils/appConstants'
import { floatAnimation, parallaxVariants } from '@/utils/animations'

const ParallaxHero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Animated background shapes */}
      <div className="absolute inset-0">
        {/* Large orbs */}
        <motion.div
          className="absolute w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{
            background: 'linear-gradient(135deg, var(--color-section-primary), var(--color-section-secondary))',
            top: '10%',
            left: '-10%',
          }}
          animate={parallaxVariants.slow}
        />
        <motion.div
          className="absolute w-80 h-80 rounded-full blur-3xl opacity-15"
          style={{
            background: 'linear-gradient(135deg, var(--color-section-secondary), var(--color-section-primary))',
            bottom: '20%',
            right: '-5%',
          }}
          animate={parallaxVariants.medium}
        />
        <motion.div
          className="absolute w-64 h-64 rounded-full blur-3xl opacity-10"
          style={{
            background: 'linear-gradient(135deg, var(--color-section-primary), var(--color-section-secondary))',
            top: '50%',
            left: '50%',
          }}
          animate={parallaxVariants.fast}
        />
      </div>

      <div className="container mx-auto container-padding max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="space-y-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span 
                className="text-sm font-semibold px-4 py-2 rounded-full inline-block mb-4"
                style={{ 
                  backgroundColor: 'var(--color-section-primary)',
                  color: 'white',
                  opacity: 0.9
                }}
              >
                Coming Soon
              </span>
            </motion.div>

            <h1 
              style={{ fontFamily: 'var(--font-family-poppins)' }} 
              className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight"
            >
              <TypeAnimation
                sequence={[
                  'Find trusted',
                  1000,
                  'Find verified',
                  1000,
                  'Find skilled',
                  1000,
                  'Find trusted',
                ]}
                wrapper="span"
                speed={50}
                repeat={Infinity}
              />
              <span 
                className="block mt-2" 
                style={{ color: 'var(--color-section-primary)' }}
              >
                freelancers near you
              </span>
            </h1>

            <motion.p 
              style={{ fontFamily: 'var(--font-family-inter)' }} 
              className="text-lg md:text-xl text-text-secondary max-w-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Connect with verified professionals for 13+ services. From tutors to mechanics,
              find the perfect match in your area.
            </motion.p>

            <DownloadCTA variant="hero" />

            {/* Stats - Only show if data exists */}
            {APP_STATS && APP_STATS.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-2 gap-6 pt-8"
              >
                {APP_STATS.slice(0, 2).map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div 
                      style={{ 
                        fontFamily: 'var(--font-family-poppins)',
                        color: 'var(--color-section-primary)'
                      }} 
                      className="text-3xl md:text-4xl font-bold"
                    >
                      {stat.value}
                    </div>
                    <div className="text-sm text-text-secondary">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>

          {/* Right Column - Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            className="relative flex items-center justify-center"
            animate={floatAnimation.animate}
          >
            <div className="relative">
              {/* Phone mockup with tilt effect */}
              <motion.div
                className="relative"
                whileHover={{ rotateY: 5, rotateX: -5 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Phone frame */}
                <div 
                  className="relative rounded-[50px] border-[16px] border-gray-900 overflow-hidden shadow-2xl"
                  style={{
                    width: '320px',
                    height: '640px',
                    transform: 'perspective(1000px) rotateY(-8deg) rotateX(2deg)',
                  }}
                >
                  {/* Phone notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-7 bg-gray-900 rounded-b-3xl z-10" />

                  {/* Screen content - gradient */}
                  <div 
                    className="w-full h-full relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, var(--color-section-primary), var(--color-section-secondary))`
                    }}
                  >
                    {/* App Icon */}
                    <div className="absolute inset-0 flex items-center justify-center p-8">
                      <motion.img
                        src="/app_icon.png"
                        alt="Skillance App"
                        className="w-48 h-48 object-contain"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                      />
                    </div>

                    {/* Floating elements */}
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-3 h-3 bg-white rounded-full opacity-20"
                        style={{
                          left: `${20 + i * 15}%`,
                          top: `${30 + (i % 3) * 20}%`,
                        }}
                        animate={{
                          y: [0, -20, 0],
                          opacity: [0.2, 0.5, 0.2],
                        }}
                        transition={{
                          duration: 2 + i * 0.5,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Glow effect */}
                <div 
                  className="absolute inset-0 -z-10 blur-3xl opacity-30"
                  style={{
                    background: `linear-gradient(135deg, var(--color-section-primary), var(--color-section-secondary))`,
                    transform: 'scale(1.1)',
                  }}
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <div className="flex flex-col items-center text-text-secondary">
          <span className="text-sm mb-2">Scroll to explore</span>
          <ChevronDown size={24} />
        </div>
      </motion.div>
    </section>
  )
}

export default ParallaxHero

