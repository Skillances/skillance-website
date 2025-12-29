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
            willChange: 'transform',
          }}
          animate={parallaxVariants.slow}
        />
        <motion.div
          className="absolute w-80 h-80 rounded-full blur-3xl opacity-15"
          style={{
            background: 'linear-gradient(135deg, var(--color-section-secondary), var(--color-section-primary))',
            bottom: '20%',
            right: '-5%',
            willChange: 'transform',
          }}
          animate={parallaxVariants.medium}
        />
        <motion.div
          className="absolute w-64 h-64 rounded-full blur-3xl opacity-10"
          style={{
            background: 'linear-gradient(135deg, var(--color-section-primary), var(--color-section-secondary))',
            top: '50%',
            left: '50%',
            willChange: 'transform',
          }}
          animate={parallaxVariants.fast}
        />
      </div>

      <div className="container mx-auto container-padding max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] relative z-10">
        <div className="grid lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="space-y-4 md:space-y-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span 
                className="text-xs sm:text-sm font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full inline-block mb-4"
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
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight"
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
              className="text-base sm:text-lg md:text-xl text-text-secondary max-w-lg"
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
                className="grid grid-cols-2 gap-4 sm:gap-6 pt-6 sm:pt-8"
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
                      className="text-2xl sm:text-3xl md:text-4xl font-bold"
                    >
                      {stat.value}
                    </div>
                    <div className="text-xs sm:text-sm text-text-secondary">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>

          {/* Right Column - Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ 
              opacity: 1, 
              x: 0,
            }}
            transition={{ 
              opacity: { duration: 0.8, ease: 'easeOut', delay: 0.2 },
              x: { duration: 0.8, ease: 'easeOut', delay: 0.2 },
            }}
            className="relative flex items-center justify-center mt-8 lg:mt-0"
          >
            <motion.div
              animate={floatAnimation.animate}
              className="relative mx-auto"
              style={{ 
                perspective: '2000px',
                transformStyle: 'preserve-3d'
              }}
            >
              {/* Phone mockup with enhanced 3D tilt effect */}
              <motion.div
                className="relative"
                whileHover={{ 
                  rotateY: 5, 
                  rotateX: -5,
                  scale: 1.05,
                  transition: { type: 'spring', stiffness: 300, damping: 20 }
                }}
                style={{ 
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Enhanced shadow layers for depth */}
                <div 
                  className="absolute inset-0 rounded-[40px] sm:rounded-[50px]"
                  style={{
                    transform: 'translateZ(-30px)',
                    background: 'rgba(0, 0, 0, 0.3)',
                    filter: 'blur(25px)',
                    width: '100%',
                    height: '100%',
                  }}
                />
                <div 
                  className="absolute inset-0 rounded-[40px] sm:rounded-[50px]"
                  style={{
                    transform: 'translateZ(-15px)',
                    background: 'rgba(0, 0, 0, 0.2)',
                    filter: 'blur(15px)',
                    width: '100%',
                    height: '100%',
                  }}
                />

                {/* Phone frame with enhanced depth */}
                <div 
                  className="relative rounded-[40px] sm:rounded-[50px] border-[12px] sm:border-[16px] border-gray-900 overflow-hidden mx-auto"
                  style={{
                    width: 'min(280px, 90vw)',
                    height: 'min(560px, 180vw)',
                    maxWidth: '320px',
                    maxHeight: '640px',
                    boxShadow: `
                      0 25px 50px -12px rgba(0, 0, 0, 0.5),
                      0 0 0 1px rgba(0, 0, 0, 0.1),
                      inset 0 2px 4px rgba(255, 255, 255, 0.1),
                      8px 0 20px -5px rgba(0, 0, 0, 0.6),
                      12px 2px 30px -8px rgba(0, 0, 0, 0.4),
                      inset -3px 0 8px -2px rgba(0, 0, 0, 0.3)
                    `,
                    transform: 'perspective(1000px) rotateY(-12deg) rotateX(3deg) translateZ(0)',
                  }}
                >
                  {/* Phone notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 sm:w-36 h-6 sm:h-7 bg-gray-900 rounded-b-3xl z-10" />

                  {/* Screen content - gradient */}
                  <div 
                    className="w-full h-full relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, var(--color-section-primary), var(--color-section-secondary))`
                    }}
                  >
                    {/* App Icon */}
                    <div className="absolute inset-0 flex items-center justify-center p-6 sm:p-8">
                      <motion.img
                        src="/app_icon.png"
                        alt="Skillance App"
                        className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 object-contain"
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

                    {/* Subtle highlight on left edge to enhance 3D effect */}
                    <div 
                      className="absolute top-0 bottom-0 left-0 w-[2px]"
                      style={{
                        background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.3))',
                        pointerEvents: 'none',
                      }}
                    />

                    {/* Dark edge on right to create depth illusion */}
                    <div 
                      className="absolute top-0 bottom-0 right-0 w-[3px]"
                      style={{
                        background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4))',
                        pointerEvents: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Enhanced multi-layer glow effect */}
                <div 
                  className="absolute inset-0 -z-20 blur-3xl opacity-40"
                  style={{
                    background: `linear-gradient(135deg, var(--color-section-primary), var(--color-section-secondary))`,
                    transform: 'translateZ(-40px) scale(1.3)',
                  }}
                />
                <div 
                  className="absolute inset-0 -z-10 blur-2xl opacity-30"
                  style={{
                    background: `radial-gradient(circle at 50% 50%, var(--color-section-primary), transparent)`,
                    transform: 'translateZ(-20px) scale(1.2)',
                  }}
                />
                
                {/* Reflection effect */}
                <div 
                  className="absolute -bottom-4 left-0 right-0 h-32 opacity-20"
                  style={{
                    background: `linear-gradient(to bottom, var(--color-section-primary), transparent)`,
                    transform: 'translateZ(-10px) scaleY(-0.5) translateY(100%)',
                    filter: 'blur(10px)',
                  }}
                />
              </motion.div>
            </motion.div>
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

