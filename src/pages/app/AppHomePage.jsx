import { useRef } from 'react'
import { ParallaxLayer } from '@react-spring/parallax'
import ParallaxWithLenis from '@/components/app/ParallaxWithLenis'
import { ChevronDown, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import GlassShape from '@/components/app/GlassShape'
import FogLayer from '@/components/app/FogLayer'
import FloatingSymbol from '@/components/app/FloatingSymbol'
import TextRotator from '@/components/app/TextRotator'
import DownloadCTA from '@/components/app/DownloadCTA'
import { SERVICE_CATEGORIES, HOW_IT_WORKS_CUSTOMERS, APP_STATS } from '@/utils/appConstants'
import FloatingCTA from '@/components/app/FloatingCTA'
import CategoryLottieSymbol from '@/components/app/CategoryLottieSymbol'

/**
 * AppHomePage - Matches reference structure exactly
 * All ParallaxLayers are direct children of Parallax component
 */
const AppHomePage = () => {
  const parallaxRef = useRef(null)

  const scrollTo = (page) => {
    parallaxRef.current?.scrollTo(page)
  }

  const keyCategories = SERVICE_CATEGORIES.slice(0, 6)
  const displayCategories = keyCategories // Show all 6 categories
  // Use all 5 steps: Discover, View Profile, Book, Secure Payment, Have Session & Review
  const allSteps = HOW_IT_WORKS_CUSTOMERS
  const steps = [
    allSteps[0], // Discover Services
    allSteps[1], // View Freelancer Profile
    allSteps[2], // Message & Book Service
    allSteps[3], // Secure Payment
    { 
      number: '05',
      title: 'Have Session & Review',
      description: 'Complete your service and leave a review to help others',
      icon: 'CheckCircle'
    }
  ]

  const trustItems = [
    { label: "Verified identities", desc: "Every pro passes background checks" },
    { label: "Secure payments", desc: "Protected transactions, every time" },
    { label: "Insured services", desc: "Coverage for peace of mind" },
    { label: "24/7 support", desc: "Real humans, always available" },
  ]

  return (
    <div className="w-full h-screen">
      <ParallaxWithLenis ref={parallaxRef} pages={4.5} className="bg-background">
        
        {/* ═══════════════════════════════════════════════════════════════════
            SCENE 1: HERO - "Find Your Expert"
            Deep ambient glow, floating orb as anchor, typography flows around
        ═══════════════════════════════════════════════════════════════════ */}
        
        {/* Background ambience - slowest layer */}
        <ParallaxLayer offset={0} speed={0.1}>
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-transparent" />
          <div 
            className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[150%] h-[80%] opacity-40"
            style={{ 
              background: "radial-gradient(ellipse at center, hsl(174 72% 40% / 0.25), transparent 60%)" 
            }}
          />
          <FogLayer variant="ambient" intensity="medium" />
        </ParallaxLayer>

        {/* Floating background shapes - slow layer */}
        <ParallaxLayer offset={0} speed={0.2}>
          <div className="absolute top-[15%] left-[5%] opacity-30">
            <GlassShape variant="ring" size={300} />
          </div>
          <div className="absolute top-[60%] right-[8%] opacity-20">
            <GlassShape variant="arc" size={400} />
          </div>
        </ParallaxLayer>

        {/* Additional floating elements for depth */}
        <ParallaxLayer offset={0} speed={0.3}>
          <div className="absolute top-[40%] left-[15%] opacity-15">
            <GlassShape variant="lens" size={200} />
          </div>
          <div className="absolute bottom-[20%] right-[12%] opacity-18">
            <GlassShape variant="droplet" size={250} />
          </div>
        </ParallaxLayer>

        {/* Hero content - right side on desktop, centered on mobile */}
        <ParallaxLayer offset={0} speed={0.6}>
          <div className="h-screen flex items-center justify-center px-6 md:px-12 lg:px-20 relative z-10" style={{ paddingTop: '100px' }}>
            <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
              {/* Spacer for logo on desktop */}
              <div className="hidden md:block w-[380px] flex-shrink-0" />
              
              {/* Content */}
              <motion.div 
                className="flex-1 flex flex-col items-center md:items-start text-center md:text-left w-full"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2, type: 'spring', stiffness: 100, damping: 15 }}
              >
                <motion.span 
                  className="inline-block px-5 py-2.5 mb-8 text-sm font-medium text-[var(--color-section-primary)] glass-subtle rounded-full"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  Coming Soon
                </motion.span>
                
                <motion.div 
                  className="mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <span 
                    style={{ fontFamily: 'var(--font-family-poppins)' }}
                    className="text-2xl md:text-3xl font-bold text-[var(--color-section-primary)]"
                  >
                    Skillance
                  </span>
                </motion.div>
                
                <motion.h1 
                  className="text-5xl md:text-7xl lg:text-8xl font-semibold leading-[0.95] tracking-tight mb-8 max-w-5xl"
                  style={{ fontFamily: 'var(--font-family-poppins)' }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4, type: 'spring', stiffness: 120, damping: 20 }}
                >
                  <span className="block text-foreground">Find <TextRotator
                    words={['trusted', 'verified', 'skilled', 'expert']}
                    className="font-semibold text-[var(--color-section-primary)]"
                    interval={2500}
                  /> freelancers</span>
                  <span className="block text-gradient mt-2">near you</span>
                </motion.h1>
                
                <motion.p 
                  className="text-lg md:text-xl text-text-secondary max-w-xl mb-12 leading-relaxed"
                  style={{ fontFamily: 'var(--font-family-inter)' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  Connect with verified professionals for 13+ services. From tutors to mechanics, find the perfect match in your area.
                </motion.p>
                
                <motion.div 
                  className="flex flex-col items-center sm:items-start gap-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <div className="glass-card glass-hover glass-rounded-lg p-5 md:p-7">
                    <DownloadCTA variant="hero" />
                  </div>
                  
                  {/* Scroll indicator - aligned with download button */}
                  <button 
                    onClick={() => scrollTo(1)}
                    className="text-text-secondary hover:text-[var(--color-section-primary)] transition-colors flex flex-col items-center gap-2"
                  >
                    <span className="text-xs font-medium tracking-wider uppercase">Scroll to explore</span>
                    <ChevronDown size={20} className="animate-bounce" />
                  </button>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </ParallaxLayer>

        {/* ═══════════════════════════════════════════════════════════════════
            SCENE 2: SERVICES CONSTELLATION
            Symbols scattered in orbital composition, no grid
        ═══════════════════════════════════════════════════════════════════ */}

        {/* Scene 2 background */}
        <ParallaxLayer offset={0.95} speed={0.1}>
          <div 
            className="absolute inset-0"
            style={{ 
              background: "radial-gradient(ellipse 120% 80% at 30% 50%, hsl(174 62% 28% / 0.15), transparent 60%)" 
            }}
          />
          <FogLayer variant="radial" intensity="light" />
        </ParallaxLayer>

        {/* Floating decorative elements */}
        <ParallaxLayer offset={0.95} speed={0.15}>
          <div className="absolute top-[20%] right-[15%] opacity-25">
            <GlassShape variant="lens" size={250} />
          </div>
          <div className="absolute bottom-[25%] left-[10%] opacity-20">
            <GlassShape variant="droplet" size={180} />
          </div>
        </ParallaxLayer>

        {/* Services section: title + category labels in one layer, no icon loading (avoids lag and overlap) */}
        <ParallaxLayer offset={0.95} speed={0.5}>
          <div className="min-h-screen flex flex-col items-center justify-start px-6 md:px-12 lg:px-20 text-center pt-12 md:pt-16 pb-20">
            <motion.span
              className="inline-block px-4 py-2 mb-6 text-sm font-medium text-[var(--color-section-primary)] glass-subtle rounded-full w-fit"
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Services
            </motion.span>
            <motion.h2
              style={{ fontFamily: 'var(--font-family-poppins)' }}
              className="text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 leading-tight max-w-3xl"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, type: 'spring', stiffness: 100, damping: 15 }}
            >
              One platform,
              <br />
              <span className="text-gradient">endless expertise</span>
            </motion.h2>
            <motion.p
              style={{ fontFamily: 'var(--font-family-inter)' }}
              className="text-lg text-text-secondary leading-relaxed max-w-2xl mb-14 md:mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              From home repairs to personal growth, find the right expert for every need. All verified, all trusted.
            </motion.p>
            {/* Category labels only – no Lottie/icons to avoid lag; grid aligned below title */}
            <div className="w-full max-w-3xl mx-auto grid grid-cols-3 gap-x-4 gap-y-10 md:gap-y-12">
              {displayCategories.map((category, index) => (
                <motion.div
                  key={`category-${index}`}
                  className="flex flex-col items-center"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.05 }}
                >
                  <GlassShape
                    variant="orb-simple"
                    size={140}
                    style={{
                      width: 'clamp(72px, 10vw, 120px)',
                      height: 'clamp(72px, 10vw, 120px)',
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-3">
                      <CategoryLottieSymbol
                        category={category}
                        size={50}
                        loop={true}
                        style={{ width: 'clamp(36px, 5vw, 56px)', height: 'clamp(36px, 5vw, 56px)' }}
                      />
                    </div>
                  </GlassShape>
                  <span className="mt-3 md:mt-4 text-sm md:text-base font-medium text-text-secondary whitespace-nowrap">
                    {category?.name || 'Service'}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </ParallaxLayer>

        {/* ═══════════════════════════════════════════════════════════════════
            SCENE 3: HOW IT WORKS - Flowing steps
            Diagonal composition, connected by flowing line
        ═══════════════════════════════════════════════════════════════════ */}

        {/* Scene 3 background */}
        <ParallaxLayer offset={1.9} speed={0.1}>
          <div className="absolute inset-0 bg-background overflow-hidden" />
          <FogLayer variant="full" intensity="light" />
        </ParallaxLayer>

        {/* Flowing connector line */}
        <ParallaxLayer offset={1.9} speed={0.2}>
          <svg 
            className="absolute inset-0 w-full h-full opacity-20"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="flowLine" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(174 72% 40%)" stopOpacity="0" />
                <stop offset="30%" stopColor="hsl(174 84% 48%)" stopOpacity="0.8" />
                <stop offset="70%" stopColor="hsl(168 84% 78%)" stopOpacity="0.8" />
                <stop offset="100%" stopColor="hsl(168 84% 78%)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path 
              d="M10,15 Q30,15 40,30 T70,50 T90,70 T95,85" 
              fill="none" 
              stroke="url(#flowLine)" 
              strokeWidth="0.3"
            />
          </svg>
        </ParallaxLayer>

        {/* Step nodes - all 5 steps */}
        <ParallaxLayer offset={1.9} speed={0.35}>
          {/* Step 1 - Discover Services */}
          <motion.div 
            className="absolute top-[5%] sm:top-[8%] md:top-[12%] lg:top-[15%] left-[0%] sm:left-[2%] md:left-[8%] lg:left-[12%] xl:left-[15%] 2xl:left-[18%] max-w-[90vw] sm:max-w-[85vw] md:max-w-none"
            initial={{ opacity: 0, x: -50, y: 20 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, type: 'spring', stiffness: 100, damping: 15 }}
          >
            <div className="flex items-start gap-2 sm:gap-3 md:gap-4 lg:gap-6">
              <motion.div 
                className="relative"
                initial={{ scale: 0.8, rotate: -10 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3, type: 'spring', stiffness: 120, damping: 20 }}
              >
                <GlassShape variant="orb" size={100} 
                  style={{ width: 'clamp(60px, 6vw, 120px)', height: 'clamp(60px, 6vw, 120px)' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <FloatingSymbol 
                    symbol="magnifier" 
                    size={50} 
                    style={{ 
                      width: 'clamp(30px, 3vw, 50px)', 
                      height: 'clamp(30px, 3vw, 50px)',
                      minWidth: '30px',
                      minHeight: '30px'
                    }} 
                  />
                </div>
              </motion.div>
              <div className="pt-2 sm:pt-3 md:pt-4 flex-1 min-w-0">
                <span className="text-xs sm:text-sm text-teal-mint font-medium">01</span>
                <h3 
                  style={{ fontFamily: 'var(--font-family-poppins)' }}
                  className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold text-foreground mb-1 sm:mb-2"
                >
                  {steps[0]?.title || 'Discover Services'}
                </h3>
                <p 
                  style={{ fontFamily: 'var(--font-family-inter)' }}
                  className="text-text-secondary max-w-full sm:max-w-xs md:max-w-sm lg:max-w-md text-xs sm:text-sm md:text-base leading-relaxed"
                >
                  {steps[0]?.description || 'Browse categories, featured freelancers, and search with filters'}
                </p>
              </div>
            </div>
          </motion.div>
          
          {/* Step 2 - View Profile */}
          <motion.div 
            className="absolute top-[22%] sm:top-[26%] md:top-[30%] lg:top-[32%] left-[0%] sm:left-[10%] md:left-[20%] lg:left-[28%] xl:left-[32%] 2xl:left-[35%] max-w-[90vw] sm:max-w-[85vw] md:max-w-none"
            initial={{ opacity: 0, x: -30, y: 30 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4, type: 'spring', stiffness: 100, damping: 15 }}
          >
            <div className="flex items-start gap-2 sm:gap-3 md:gap-4 lg:gap-6">
              <motion.div 
                className="relative"
                initial={{ scale: 0.8, rotate: 10 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5, type: 'spring', stiffness: 120, damping: 20 }}
              >
                <GlassShape variant="orb" size={100} 
                  style={{ width: 'clamp(60px, 6vw, 120px)', height: 'clamp(60px, 6vw, 120px)' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <FloatingSymbol 
                    symbol="message" 
                    size={50} 
                    style={{ 
                      width: 'clamp(30px, 3vw, 50px)', 
                      height: 'clamp(30px, 3vw, 50px)',
                      minWidth: '30px',
                      minHeight: '30px'
                    }} 
                  />
                </div>
              </motion.div>
              <div className="pt-2 sm:pt-3 md:pt-4 flex-1 min-w-0">
                <span className="text-xs sm:text-sm text-teal-mint font-medium">02</span>
                <h3 
                  style={{ fontFamily: 'var(--font-family-poppins)' }}
                  className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold text-foreground mb-1 sm:mb-2"
                >
                  {steps[1]?.title || 'View Profile'}
                </h3>
                <p 
                  style={{ fontFamily: 'var(--font-family-inter)' }}
                  className="text-text-secondary max-w-full sm:max-w-xs md:max-w-sm lg:max-w-md text-xs sm:text-sm md:text-base leading-relaxed"
                >
                  {steps[1]?.description || 'Explore services, rates, portfolio, reviews, and contact options'}
                </p>
              </div>
            </div>
          </motion.div>
          
          {/* Step 3 - Book Service */}
          <motion.div 
            className="absolute top-[40%] sm:top-[44%] md:top-[48%] lg:top-[50%] left-[0%] sm:left-[15%] md:left-[35%] lg:left-[45%] xl:left-[48%] 2xl:left-[50%] max-w-[90vw] sm:max-w-[85vw] md:max-w-none"
            initial={{ opacity: 0, x: -20, y: 30 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6, type: 'spring', stiffness: 100, damping: 15 }}
          >
            <div className="flex items-start gap-2 sm:gap-3 md:gap-4 lg:gap-6">
              <motion.div 
                className="relative"
                initial={{ scale: 0.8, rotate: -10 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.7, type: 'spring', stiffness: 120, damping: 20 }}
              >
                <GlassShape variant="orb" size={100} 
                  style={{ width: 'clamp(60px, 6vw, 120px)', height: 'clamp(60px, 6vw, 120px)' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <FloatingSymbol 
                    symbol="message" 
                    size={50} 
                    style={{ 
                      width: 'clamp(30px, 3vw, 50px)', 
                      height: 'clamp(30px, 3vw, 50px)',
                      minWidth: '30px',
                      minHeight: '30px'
                    }} 
                  />
                </div>
              </motion.div>
              <div className="pt-2 sm:pt-3 md:pt-4 flex-1 min-w-0">
                <span className="text-xs sm:text-sm text-teal-mint font-medium">03</span>
                <h3 
                  style={{ fontFamily: 'var(--font-family-poppins)' }}
                  className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold text-foreground mb-1 sm:mb-2"
                >
                  {steps[2]?.title || 'Book Service'}
                </h3>
                <p 
                  style={{ fontFamily: 'var(--font-family-inter)' }}
                  className="text-text-secondary max-w-full sm:max-w-xs md:max-w-sm lg:max-w-md text-xs sm:text-sm md:text-base leading-relaxed"
                >
                  {steps[2]?.description || 'Chat with freelancers, then select service details and schedule'}
                </p>
              </div>
            </div>
          </motion.div>
          
          {/* Step 4 - Secure Payment */}
          <motion.div 
            className="absolute top-[58%] sm:top-[62%] md:top-[66%] lg:top-[68%] left-[0%] sm:left-[20%] md:left-[50%] lg:left-[60%] xl:left-[65%] 2xl:left-[67%] max-w-[90vw] sm:max-w-[85vw] md:max-w-none"
            initial={{ opacity: 0, x: -15, y: 35 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.8, type: 'spring', stiffness: 100, damping: 15 }}
          >
            <div className="flex items-start gap-2 sm:gap-3 md:gap-4 lg:gap-6">
              <motion.div 
                className="relative"
                initial={{ scale: 0.8, rotate: 10 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.9, type: 'spring', stiffness: 120, damping: 20 }}
              >
                <GlassShape variant="orb" size={100} 
                  style={{ width: 'clamp(60px, 6vw, 120px)', height: 'clamp(60px, 6vw, 120px)' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <FloatingSymbol 
                    symbol="shield" 
                    size={50} 
                    style={{ 
                      width: 'clamp(30px, 3vw, 50px)', 
                      height: 'clamp(30px, 3vw, 50px)',
                      minWidth: '30px',
                      minHeight: '30px'
                    }} 
                  />
                </div>
              </motion.div>
              <div className="pt-2 sm:pt-3 md:pt-4 flex-1 min-w-0">
                <span className="text-xs sm:text-sm text-teal-mint font-medium">04</span>
                <h3 
                  style={{ fontFamily: 'var(--font-family-poppins)' }}
                  className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold text-foreground mb-1 sm:mb-2"
                >
                  {steps[3]?.title || 'Secure Payment'}
                </h3>
                <p 
                  style={{ fontFamily: 'var(--font-family-inter)' }}
                  className="text-text-secondary max-w-full sm:max-w-xs md:max-w-sm lg:max-w-md text-xs sm:text-sm md:text-base leading-relaxed"
                >
                  {steps[3]?.description || 'Choose payment method and complete transaction securely via app'}
                </p>
              </div>
            </div>
          </motion.div>
          
          {/* Step 5 - Have Session & Review */}
          <motion.div 
            className="absolute top-[76%] sm:top-[80%] md:top-[82%] lg:top-[85%] left-[0%] sm:left-[25%] md:left-[65%] lg:left-[75%] xl:left-[80%] 2xl:left-[82%] max-w-[90vw] sm:max-w-[85vw] md:max-w-none"
            initial={{ opacity: 0, x: -10, y: 40 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 1.0, type: 'spring', stiffness: 100, damping: 15 }}
          >
            <div className="flex items-start gap-2 sm:gap-3 md:gap-4 lg:gap-6">
              <motion.div 
                className="relative"
                initial={{ scale: 0.8, rotate: -10 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 1.1, type: 'spring', stiffness: 120, damping: 20 }}
              >
                <GlassShape variant="orb" size={100} 
                  style={{ width: 'clamp(60px, 6vw, 120px)', height: 'clamp(60px, 6vw, 120px)' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <FloatingSymbol 
                    symbol="star" 
                    size={50} 
                    style={{ 
                      width: 'clamp(30px, 3vw, 50px)', 
                      height: 'clamp(30px, 3vw, 50px)',
                      minWidth: '30px',
                      minHeight: '30px'
                    }} 
                  />
                </div>
              </motion.div>
              <div className="pt-2 sm:pt-3 md:pt-4 flex-1 min-w-0">
                <span className="text-xs sm:text-sm text-teal-mint font-medium">05</span>
                <h3 
                  style={{ fontFamily: 'var(--font-family-poppins)' }}
                  className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold text-foreground mb-1 sm:mb-2"
                >
                  {steps[4]?.title || 'Have Session & Review'}
                </h3>
                <p 
                  style={{ fontFamily: 'var(--font-family-inter)' }}
                  className="text-text-secondary max-w-full sm:max-w-xs md:max-w-sm lg:max-w-md text-xs sm:text-sm md:text-base leading-relaxed"
                >
                  {steps[4]?.description || 'Complete your service and leave a review to help others'}
                </p>
              </div>
            </div>
          </motion.div>
        </ParallaxLayer>

        {/* How it works label - large, animated, different color */}
        <ParallaxLayer offset={1.9} speed={0.6}>
          <div className="absolute top-8 left-1/2 -translate-x-1/2">
            <h2 
              className="text-6xl md:text-8xl lg:text-9xl font-bold"
              style={{ 
                fontFamily: 'var(--font-family-poppins)',
                background: 'linear-gradient(135deg, hsl(174 84% 48%), hsl(168 84% 78%), hsl(174 84% 48%))',
                backgroundSize: '200% 200%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'gradient-shift-text 3s ease infinite',
              }}
            >
              How it works
            </h2>
          </div>
        </ParallaxLayer>

        {/* ═══════════════════════════════════════════════════════════════════
            SCENE 4: TRUST & SAFETY
            Shield as central anchor, radiating trust signals
        ═══════════════════════════════════════════════════════════════════ */}

        {/* Scene 4 background */}
        <ParallaxLayer offset={2.85} speed={0.1}>
          <div 
            className="absolute inset-0"
            style={{ 
              background: "radial-gradient(ellipse 100% 100% at 50% 40%, hsl(174 62% 28% / 0.1), transparent 60%)" 
            }}
          />
        </ParallaxLayer>

        {/* Large decorative ring */}
        <ParallaxLayer offset={2.85} speed={0.2}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-15">
            <GlassShape variant="ring" size={600} />
          </div>
        </ParallaxLayer>

        {/* Shield anchor - no parallax (speed 0) so it stays fixed relative to page */}
        <ParallaxLayer offset={2.85} speed={0}>
          <div className="absolute top-1/2 right-[15%] md:right-[20%] -translate-y-1/2">
            <FloatingSymbol symbol="shield" size={280} />
          </div>
        </ParallaxLayer>

        {/* Trust content - larger text, moved right, better spacing */}
        <ParallaxLayer offset={2.85} speed={0.5}>
          <div className="h-screen flex flex-col justify-center px-6 md:px-12 lg:px-20">
            <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
              {/* Content - takes up more space, moved right */}
              <motion.div 
                className="flex-1 flex flex-col justify-center md:max-w-[55%] md:ml-auto md:pr-8"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2, type: 'spring', stiffness: 100, damping: 15 }}
              >
                <motion.span 
                  className="inline-block px-4 py-2 mb-6 text-sm font-medium text-[var(--color-section-primary)] glass-subtle rounded-full w-fit"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  Trust & Safety
                </motion.span>
                <motion.h2 
                  style={{ fontFamily: 'var(--font-family-poppins)' }}
                  className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-semibold mb-8 leading-tight"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2, type: 'spring', stiffness: 100, damping: 15 }}
                >
                  Your security,
                  <br />
                  <span className="text-gradient">our priority</span>
                </motion.h2>
                
                <motion.div 
                  className="space-y-5"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  {trustItems.map((item, i) => (
                    <motion.div 
                      key={i} 
                      className="flex items-start gap-4"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.5 + i * 0.1, type: 'spring', stiffness: 120, damping: 20 }}
                    >
                      <div className="w-2 h-2 mt-2 rounded-full bg-teal-mint flex-shrink-0" />
                      <div>
                        <h4 
                          style={{ fontFamily: 'var(--font-family-poppins)' }}
                          className="font-medium text-foreground mb-1"
                        >
                          {item.label}
                        </h4>
                        <p 
                          style={{ fontFamily: 'var(--font-family-inter)' }}
                          className="text-sm text-text-secondary"
                        >
                          {item.desc}
                        </p>
        </div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
              
              {/* Spacer for shield on right */}
              <div className="hidden md:block w-[280px] flex-shrink-0" />
            </div>
          </div>
        </ParallaxLayer>

        {/* ═══════════════════════════════════════════════════════════════════
            SCENE 5: CTA - Final conversion
            Stats flowing upward, large call to action
        ═══════════════════════════════════════════════════════════════════ */}

        {/* Scene 5 background - glassy blurry texture */}
        <ParallaxLayer offset={3.8} speed={0.1}>
          <div 
            className="absolute inset-0"
            style={{ 
              background: `
                radial-gradient(ellipse 100% 50% at 50% 100%, hsl(174 72% 40% / 0.15), transparent 60%),
                linear-gradient(0deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)
              `,
              backdropFilter: 'blur(40px) saturate(150%)',
              WebkitBackdropFilter: 'blur(40px) saturate(150%)',
            }}
          />
        </ParallaxLayer>

        {/* Floating prisms */}
        <ParallaxLayer offset={3.8} speed={0.25}>
          <div className="absolute top-[10%] left-[10%] opacity-20 rotate-12">
            <GlassShape variant="prism" size={120} />
          </div>
          <div className="absolute top-[20%] right-[15%] opacity-15 -rotate-6">
            <GlassShape variant="prism" size={180} />
          </div>
          <div className="absolute bottom-[30%] left-[20%] opacity-25 rotate-[-15deg]">
            <GlassShape variant="shard" size={80} />
          </div>
        </ParallaxLayer>

        {/* CTA content - positioned higher to avoid overlap */}
        <ParallaxLayer offset={3.8} speed={0.5}>
          <div className="h-screen flex flex-col items-center justify-center px-6 text-center" style={{ paddingTop: '8vh', paddingBottom: '12vh' }}>
            <h2 
              style={{ fontFamily: 'var(--font-family-poppins)' }} 
              className="text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 leading-tight max-w-3xl"
            >
              Ready to find your
              <br />
              <span className="text-gradient">perfect match?</span>
            </h2>
            
            <p 
              style={{ fontFamily: 'var(--font-family-inter)' }}
              className="text-lg md:text-xl text-text-secondary mb-8 max-w-xl"
            >
              Join thousands who've discovered trusted local experts through Skillance.
            </p>
            
            <div className="mb-8">
              <DownloadCTA variant="full" />
            </div>
          </div>
        </ParallaxLayer>

        {/* Footer attribution - glassy blurry texture */}
        <ParallaxLayer offset={3.8} speed={0.6}>
          <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 text-center px-4">
            <div 
              className="px-6 sm:px-8 py-3 sm:py-4 rounded-2xl"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              }}
            >
              <p 
                style={{ fontFamily: 'var(--font-family-inter)' }}
                className="text-xs sm:text-sm text-text-secondary"
              >
                © Skillance. Connecting communities with trusted experts.
              </p>
            </div>
          </div>
        </ParallaxLayer>

      </ParallaxWithLenis>
      
      {/* Floating Download Button */}
      <FloatingCTA />
    </div>
  )
}

export default AppHomePage
