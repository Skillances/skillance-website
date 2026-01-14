import { motion, useScroll, useTransform } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useRef, useEffect, useState } from 'react'
import DownloadCTA from './DownloadCTA'
import { APP_STATS } from '@/utils/appConstants'
import { floatAnimation, fadeInUpStagger } from '@/utils/animations'
import DarkVeil from './DarkVeil'
import TextRotator from './TextRotator'
import MagneticElement from './MagneticElement'
import Card3D from './Card3D'

// Particle System Component
const ParticleSystem = () => {
  const [particles, setParticles] = useState([])
  const containerRef = useRef(null)

  useEffect(() => {
    const particleCount = 50
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5,
    }))
    setParticles(newParticles)
  }, [])

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background: `radial-gradient(circle, var(--color-section-primary) 0%, transparent 70%)`,
            opacity: 0.3,
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 50 - 25, 0],
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

const ParallaxHero = () => {
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })

  // Transform scroll progress to phone rotation
  const phoneRotateY = useTransform(scrollYProgress, [0, 1], [0, 15])
  const phoneRotateX = useTransform(scrollYProgress, [0, 1], [0, -5])
  const phoneScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95])
  const phoneOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.8])

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center pt-20 overflow-hidden w-full">
      {/* Dark Veil Background */}
      <div className="absolute inset-0 z-0">
        <DarkVeil intensity={0.6} speed={25} />
      </div>

      {/* Particle System */}
      <ParticleSystem />

      <div className="container mx-auto container-padding max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] relative z-10">
        <div className="grid lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            variants={fadeInUpStagger.container}
            initial="initial"
            animate="animate"
            className="space-y-6 md:space-y-8"
          >
            <motion.div variants={fadeInUpStagger.item}>
              <span 
                className="text-xs sm:text-sm font-semibold px-4 py-2 rounded-full inline-block mb-4 backdrop-blur-sm border border-(--color-section-primary)/20"
                style={{ 
                  backgroundColor: 'var(--color-section-primary)',
                  color: 'white',
                  boxShadow: '0 4px 14px 0 rgba(20, 184, 166, 0.3)'
                }}
              >
                Coming Soon
              </span>
            </motion.div>

            <motion.h1 
              variants={fadeInUpStagger.item}
              style={{ fontFamily: 'var(--font-family-poppins)' }} 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight"
            >
              <span className="block mb-2">Find trusted</span>
              <TextRotator
                words={['freelancers', 'experts', 'professionals', 'talent']}
                className="text-(--color-section-primary)"
                interval={2500}
              />
              <span className="block mt-2">near you</span>
            </motion.h1>

            <motion.p 
              variants={fadeInUpStagger.item}
              style={{ fontFamily: 'var(--font-family-inter)' }} 
              className="text-base sm:text-lg md:text-xl text-text-secondary max-w-lg leading-relaxed"
            >
              Connect with verified professionals for 13+ services. From tutors to mechanics,
              find the perfect match in your area with our secure platform.
            </motion.p>

            <motion.div variants={fadeInUpStagger.item} className="pt-4">
              <MagneticElement strength={0.2} range={100}>
                <DownloadCTA variant="hero" />
              </MagneticElement>
            </motion.div>

            {/* Stats */}
            {APP_STATS && APP_STATS.length > 0 && (
              <motion.div
                variants={fadeInUpStagger.item}
                className="grid grid-cols-2 gap-6 sm:gap-8 pt-8 border-t border-gray-100/50"
              >
                {APP_STATS.slice(0, 2).map((stat, index) => (
                  <div key={stat.label}>
                    <div 
                      style={{ 
                        fontFamily: 'var(--font-family-poppins)',
                        color: 'var(--color-section-primary)'
                      }} 
                      className="text-3xl sm:text-4xl font-bold mb-1"
                    >
                      {stat.value}
                    </div>
                    <div className="text-sm text-text-secondary font-medium">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            )}
          </motion.div>

          {/* Right Column - 3D Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="relative flex items-center justify-center mt-12 lg:mt-0 perspective-1000"
          >
            <motion.div
              animate={floatAnimation.animate}
              style={{
                rotateY: phoneRotateY,
                rotateX: phoneRotateX,
                scale: phoneScale,
                opacity: phoneOpacity,
              }}
              className="relative z-10"
            >
              <Card3D 
                depth={20} 
                className="relative mx-auto w-[280px] sm:w-[320px] h-[560px] sm:h-[640px]"
              >
                {/* Phone Frame */}
                <div 
                  className="relative w-full h-full rounded-[45px] border-14 border-gray-900 bg-gray-900 overflow-hidden shadow-2xl"
                  style={{
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0,0,0,0.1)'
                  }}
                >
                  {/* Dynamic Island / Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-2xl z-20" />

                  {/* Screen Content */}
                  <div className="w-full h-full bg-white relative overflow-hidden">
                    {/* Header */}
                    <div className="h-24 bg-linear-to-br from-(--color-section-primary) to-(--color-section-secondary) relative">
                      <div className="absolute bottom-4 left-6 text-white font-bold text-xl">Skillance</div>
                      <div className="absolute bottom-4 right-6 w-8 h-8 bg-white/20 rounded-full backdrop-blur-sm" />
                    </div>

                    {/* Content Placeholder */}
                    <div className="p-6 space-y-4">
                      {/* Search Bar */}
                      <div className="h-12 bg-gray-100 rounded-xl w-full animate-pulse" />
                      
                      {/* Categories */}
                      <div className="grid grid-cols-4 gap-4 pt-2">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="flex flex-col items-center gap-2">
                            <div className={`w-12 h-12 rounded-full bg-(--color-section-primary) opacity-${20 + i * 10}`} />
                            <div className="w-10 h-2 bg-gray-100 rounded" />
                          </div>
                        ))}
                      </div>

                      {/* Featured Card */}
                      <div className="h-40 bg-linear-to-br from-(--color-section-primary)/10 to-(--color-section-secondary)/10 rounded-2xl mt-4 border border-(--color-section-primary)/20 p-4 relative overflow-hidden">
                        <div className="w-2/3 h-4 bg-(--color-section-primary)/20 rounded mb-2" />
                        <div className="w-1/2 h-3 bg-gray-200 rounded" />
                        
                        <div className="absolute bottom-4 right-4 w-10 h-10 bg-(--color-section-primary) rounded-full flex items-center justify-center text-white shadow-lg shadow-(--color-section-primary)/30">
                          <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-4 h-4 bg-white rounded-full"
                          />
                        </div>
                      </div>

                      {/* List Items */}
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-20 bg-white border border-gray-100 rounded-xl shadow-sm p-3 flex items-center gap-3">
                          <div className="w-14 h-14 bg-gray-100 rounded-lg shrink-0" />
                          <div className="flex-1 space-y-2">
                            <div className="w-3/4 h-3 bg-gray-100 rounded" />
                            <div className="w-1/2 h-2 bg-gray-50 rounded" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reflection */}
                  <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/10 to-transparent pointer-events-none z-30" />
                </div>
              </Card3D>
            </motion.div>

            {/* Back Glow */}
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[600px] bg-linear-to-br from-(--color-section-primary) to-(--color-section-secondary) blur-[80px] opacity-30 -z-10 rounded-full pointer-events-none" 
            />
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 cursor-pointer"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
      >
        <div className="flex flex-col items-center text-text-secondary/70 hover:text-(--color-section-primary) transition-colors">
          <span className="text-sm mb-2 font-medium tracking-wide">Scroll to explore</span>
          <ChevronDown size={24} />
        </div>
      </motion.div>
    </section>
  )
}

export default ParallaxHero
