import { useRef, useState, useEffect } from 'react'
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

const AppHomePage = () => {
  const parallaxRef = useRef(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const scrollTo = (page) => {
    parallaxRef.current?.scrollTo(page)
  }

  const keyCategories = SERVICE_CATEGORIES.slice(0, 6)
  const displayCategories = keyCategories
  const allSteps = HOW_IT_WORKS_CUSTOMERS
  const steps = [
    allSteps[0],
    allSteps[1],
    allSteps[2],
    allSteps[3],
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

  // Responsive offsets: tighter on mobile, spread on desktop
  const o = isMobile
    ? { hero: 0, services: 0.85, howItWorks: 1.6, trust: 2.8, cta: 3.6 }
    : { hero: 0, services: 0.95, howItWorks: 1.9, trust: 2.85, cta: 3.8 }
  
  const totalPages = isMobile ? 4.2 : 4.5

  return (
    <div className="w-full h-screen">
      <ParallaxWithLenis ref={parallaxRef} pages={totalPages} className="bg-background">
        
        {/* ═══ SCENE 1: HERO ═══ */}
        
        <ParallaxLayer offset={o.hero} speed={0.1}>
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-transparent" />
          <div className="absolute inset-0 opacity-30" 
            style={{
              backgroundImage: 'radial-gradient(hsl(var(--foreground) / 0.15) 1px, transparent 1px)',
              backgroundSize: '32px 32px'
            }}
          />
          <motion.div 
            className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, hsl(174 72% 40% / 0.15) 0%, transparent 60%)" }}
            animate={{ x: ['0%', '5%', '-5%', '0%'], y: ['0%', '10%', '5%', '0%'] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div 
            className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, hsl(168 84% 78% / 0.1) 0%, transparent 60%)" }}
            animate={{ x: ['0%', '-5%', '5%', '0%'], y: ['0%', '-10%', '-5%', '0%'] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          />
          <FogLayer variant="ambient" intensity="medium" />
        </ParallaxLayer>

        <ParallaxLayer offset={o.hero} speed={0.2}>
          <div className="absolute top-[15%] left-[5%] opacity-30">
            <GlassShape variant="ring" size={300} />
          </div>
          <div className="absolute top-[60%] right-[8%] opacity-20">
            <GlassShape variant="arc" size={400} />
          </div>
        </ParallaxLayer>

        <ParallaxLayer offset={o.hero} speed={0.3}>
          <div className="absolute top-[40%] left-[15%] opacity-15">
            <GlassShape variant="lens" size={200} />
          </div>
          <div className="absolute bottom-[20%] right-[12%] opacity-18">
            <GlassShape variant="droplet" size={250} />
          </div>
        </ParallaxLayer>

        {/* Hero content */}
        <ParallaxLayer offset={o.hero} speed={0.6}>
          <div className="h-screen flex items-center justify-center px-5 md:px-12 lg:px-20 relative z-10 pt-16 md:pt-24">
            <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12">
              <div className="hidden md:block w-[380px] flex-shrink-0" />
              
              <motion.div 
                className="flex-1 flex flex-col items-center md:items-start text-center md:text-left w-full"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2, type: 'spring', stiffness: 100, damping: 15 }}
              >
                <motion.span 
                  className="inline-block px-4 py-2 mb-4 md:mb-8 text-xs md:text-sm font-medium text-[var(--color-section-primary)] glass-subtle rounded-full"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  Coming Soon
                </motion.span>
                
                <motion.div 
                  className="mb-3 md:mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <span 
                    style={{ fontFamily: 'var(--font-family-poppins)' }}
                    className="text-xl md:text-3xl font-bold text-[var(--color-section-primary)]"
                  >
                    Skillance
                  </span>
                </motion.div>
                
                <motion.h1 
                  className="text-3xl sm:text-4xl md:text-7xl lg:text-8xl font-semibold leading-[0.95] tracking-tight mb-4 md:mb-8 max-w-5xl"
                  style={{ fontFamily: 'var(--font-family-poppins)' }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4, type: 'spring', stiffness: 120, damping: 20 }}
                >
                  <span className="block text-foreground">Find <TextRotator
                    words={[
                      { text: 'trusted', color: 'hsl(174, 72%, 40%)' },
                      { text: 'verified', color: 'hsl(260, 60%, 60%)' },
                      { text: 'skilled', color: 'hsl(200, 80%, 50%)' },
                      { text: 'expert', color: 'hsl(35, 90%, 55%)' }
                    ]}
                    className="font-semibold"
                    interval={2500}
                  /> freelancers</span>
                  <span className="block text-gradient mt-1 md:mt-2">near you</span>
                </motion.h1>
                
                <motion.p 
                  className="text-sm md:text-xl text-text-secondary max-w-xl mb-6 md:mb-12 leading-relaxed"
                  style={{ fontFamily: 'var(--font-family-inter)' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  Connect with verified professionals for 13+ services. From tutors to mechanics, find the perfect match in your area.
                </motion.p>
                
                <motion.div 
                  className="flex flex-col items-center sm:items-start gap-4 md:gap-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <DownloadCTA variant="hero" />
                  
                  <button 
                    onClick={() => scrollTo(o.services)}
                    className="text-text-secondary hover:text-[var(--color-section-primary)] transition-colors flex flex-col items-center gap-1.5"
                  >
                    <span className="text-[10px] md:text-xs font-medium tracking-wider uppercase">Scroll to explore</span>
                    <ChevronDown size={18} className="animate-bounce" />
                  </button>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </ParallaxLayer>

        {/* ═══ SCENE 2: SERVICES ═══ */}

        <ParallaxLayer offset={o.services} speed={0.1}>
          <div 
            className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse 120% 80% at 30% 50%, hsl(174 62% 28% / 0.15), transparent 60%)" }}
          />
          <FogLayer variant="radial" intensity="light" />
        </ParallaxLayer>

        <ParallaxLayer offset={o.services} speed={0.15}>
          <div className="absolute top-[20%] right-[15%] opacity-25">
            <GlassShape variant="lens" size={250} />
          </div>
          <div className="absolute bottom-[25%] left-[10%] opacity-20">
            <GlassShape variant="droplet" size={180} />
          </div>
        </ParallaxLayer>

        <ParallaxLayer offset={o.services} speed={0.5}>
          <div className="min-h-screen flex flex-col items-center justify-start px-5 md:px-12 lg:px-20 text-center pt-8 md:pt-16 pb-12 md:pb-20">
            <motion.span
              className="inline-block px-4 py-1.5 md:py-2 mb-4 md:mb-6 text-xs md:text-sm font-medium text-[var(--color-section-primary)] glass-subtle rounded-full w-fit"
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Services
            </motion.span>
            <motion.h2
              style={{ fontFamily: 'var(--font-family-poppins)' }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold mb-4 md:mb-6 leading-tight max-w-3xl"
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
              className="text-sm md:text-lg text-text-secondary leading-relaxed max-w-2xl mb-8 md:mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              From home repairs to personal growth, find the right expert for every need. All verified, all trusted.
            </motion.p>
            <div className="w-full max-w-3xl mx-auto grid grid-cols-3 gap-x-3 gap-y-6 md:gap-x-4 md:gap-y-12">
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
                      width: 'clamp(56px, 10vw, 120px)',
                      height: 'clamp(56px, 10vw, 120px)',
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-3">
                      <CategoryLottieSymbol
                        category={category}
                        size={50}
                        loop={true}
                        style={{ width: 'clamp(32px, 5vw, 56px)', height: 'clamp(32px, 5vw, 56px)' }}
                      />
                    </div>
                  </GlassShape>
                  <span className="mt-2 md:mt-4 text-xs md:text-base font-medium text-text-secondary whitespace-nowrap">
                    {category?.name || 'Service'}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </ParallaxLayer>

        {/* ═══ SCENE 3: HOW IT WORKS ═══ */}

        <ParallaxLayer offset={o.howItWorks} speed={0.1}>
          <div className="absolute inset-0 bg-background overflow-hidden" />
          <FogLayer variant="full" intensity="light" />
        </ParallaxLayer>

        <ParallaxLayer offset={o.howItWorks} speed={0.2}>
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

        {/* "How it works" title */}
        <ParallaxLayer offset={o.howItWorks} speed={0.6}>
          <div className="absolute top-4 md:top-8 left-1/2 -translate-x-1/2">
            <h2 
              className="text-4xl sm:text-5xl md:text-8xl lg:text-9xl font-bold whitespace-nowrap"
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

        {/* Steps - use flow layout on mobile, absolute on desktop */}
        <ParallaxLayer offset={o.howItWorks} speed={0.35}>
          {isMobile ? (
            <div className="flex flex-col gap-6 px-5 pt-20 pb-8">
              {steps.map((step, i) => (
                <motion.div
                  key={`step-${i}`}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 + i * 0.1, type: 'spring', stiffness: 100, damping: 15 }}
                >
                  <div className="relative shrink-0" style={{ width: 52, height: 52 }}>
                    <GlassShape variant="orb" size={52} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FloatingSymbol 
                        symbol={i === 0 ? 'magnifier' : i === 4 ? 'star' : i === 3 ? 'shield' : 'message'} 
                        size={26}
                      />
                    </div>
                  </div>
                  <div className="pt-1 flex-1 min-w-0">
                    <span className="text-xs text-teal-mint font-medium">{String(i + 1).padStart(2, '0')}</span>
                    <h3 
                      style={{ fontFamily: 'var(--font-family-poppins)' }}
                      className="text-base font-semibold text-foreground mb-0.5"
                    >
                      {step?.title}
                    </h3>
                    <p 
                      style={{ fontFamily: 'var(--font-family-inter)' }}
                      className="text-text-secondary text-xs leading-relaxed"
                    >
                      {step?.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <>
              {/* Step 1 */}
              <motion.div 
                className="absolute top-[12%] lg:top-[15%] left-[2%] md:left-[8%] lg:left-[12%] xl:left-[15%] 2xl:left-[18%]"
                initial={{ opacity: 0, x: -50, y: 20 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2, type: 'spring', stiffness: 100, damping: 15 }}
              >
                <div className="flex items-start gap-4 lg:gap-6">
                  <motion.div className="relative"
                    initial={{ scale: 0.8, rotate: -10 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3, type: 'spring', stiffness: 120, damping: 20 }}
                  >
                    <GlassShape variant="orb" size={100} style={{ width: 'clamp(60px, 6vw, 120px)', height: 'clamp(60px, 6vw, 120px)' }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FloatingSymbol symbol="magnifier" size={50} style={{ width: 'clamp(30px, 3vw, 50px)', height: 'clamp(30px, 3vw, 50px)' }} />
                    </div>
                  </motion.div>
                  <div className="pt-4">
                    <span className="text-sm text-teal-mint font-medium">01</span>
                    <h3 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl lg:text-3xl xl:text-4xl font-semibold text-foreground mb-2">{steps[0]?.title}</h3>
                    <p style={{ fontFamily: 'var(--font-family-inter)' }} className="text-text-secondary max-w-sm lg:max-w-md text-sm md:text-base leading-relaxed">{steps[0]?.description}</p>
                  </div>
                </div>
              </motion.div>
              
              {/* Step 2 */}
              <motion.div 
                className="absolute top-[30%] lg:top-[32%] left-[10%] md:left-[20%] lg:left-[28%] xl:left-[32%] 2xl:left-[35%]"
                initial={{ opacity: 0, x: -30, y: 30 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4, type: 'spring', stiffness: 100, damping: 15 }}
              >
                <div className="flex items-start gap-4 lg:gap-6">
                  <motion.div className="relative" initial={{ scale: 0.8, rotate: 10 }} whileInView={{ scale: 1, rotate: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.5 }}>
                    <GlassShape variant="orb" size={100} style={{ width: 'clamp(60px, 6vw, 120px)', height: 'clamp(60px, 6vw, 120px)' }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FloatingSymbol symbol="message" size={50} style={{ width: 'clamp(30px, 3vw, 50px)', height: 'clamp(30px, 3vw, 50px)' }} />
                    </div>
                  </motion.div>
                  <div className="pt-4">
                    <span className="text-sm text-teal-mint font-medium">02</span>
                    <h3 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl lg:text-3xl xl:text-4xl font-semibold text-foreground mb-2">{steps[1]?.title}</h3>
                    <p style={{ fontFamily: 'var(--font-family-inter)' }} className="text-text-secondary max-w-sm lg:max-w-md text-sm md:text-base leading-relaxed">{steps[1]?.description}</p>
                  </div>
                </div>
              </motion.div>
              
              {/* Step 3 */}
              <motion.div 
                className="absolute top-[48%] lg:top-[50%] left-[15%] md:left-[35%] lg:left-[45%] xl:left-[48%] 2xl:left-[50%]"
                initial={{ opacity: 0, x: -20, y: 30 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.6, type: 'spring', stiffness: 100, damping: 15 }}
              >
                <div className="flex items-start gap-4 lg:gap-6">
                  <motion.div className="relative" initial={{ scale: 0.8, rotate: -10 }} whileInView={{ scale: 1, rotate: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.7 }}>
                    <GlassShape variant="orb" size={100} style={{ width: 'clamp(60px, 6vw, 120px)', height: 'clamp(60px, 6vw, 120px)' }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FloatingSymbol symbol="message" size={50} style={{ width: 'clamp(30px, 3vw, 50px)', height: 'clamp(30px, 3vw, 50px)' }} />
                    </div>
                  </motion.div>
                  <div className="pt-4">
                    <span className="text-sm text-teal-mint font-medium">03</span>
                    <h3 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl lg:text-3xl xl:text-4xl font-semibold text-foreground mb-2">{steps[2]?.title}</h3>
                    <p style={{ fontFamily: 'var(--font-family-inter)' }} className="text-text-secondary max-w-sm lg:max-w-md text-sm md:text-base leading-relaxed">{steps[2]?.description}</p>
                  </div>
                </div>
              </motion.div>
              
              {/* Step 4 */}
              <motion.div 
                className="absolute top-[66%] lg:top-[68%] left-[20%] md:left-[50%] lg:left-[60%] xl:left-[65%] 2xl:left-[67%]"
                initial={{ opacity: 0, x: -15, y: 35 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.8, type: 'spring', stiffness: 100, damping: 15 }}
              >
                <div className="flex items-start gap-4 lg:gap-6">
                  <motion.div className="relative" initial={{ scale: 0.8, rotate: 10 }} whileInView={{ scale: 1, rotate: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.9 }}>
                    <GlassShape variant="orb" size={100} style={{ width: 'clamp(60px, 6vw, 120px)', height: 'clamp(60px, 6vw, 120px)' }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FloatingSymbol symbol="shield" size={50} style={{ width: 'clamp(30px, 3vw, 50px)', height: 'clamp(30px, 3vw, 50px)' }} />
                    </div>
                  </motion.div>
                  <div className="pt-4">
                    <span className="text-sm text-teal-mint font-medium">04</span>
                    <h3 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl lg:text-3xl xl:text-4xl font-semibold text-foreground mb-2">{steps[3]?.title}</h3>
                    <p style={{ fontFamily: 'var(--font-family-inter)' }} className="text-text-secondary max-w-sm lg:max-w-md text-sm md:text-base leading-relaxed">{steps[3]?.description}</p>
                  </div>
                </div>
              </motion.div>
              
              {/* Step 5 */}
              <motion.div 
                className="absolute top-[82%] lg:top-[85%] left-[25%] md:left-[65%] lg:left-[75%] xl:left-[80%] 2xl:left-[82%]"
                initial={{ opacity: 0, x: -10, y: 40 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 1.0, type: 'spring', stiffness: 100, damping: 15 }}
              >
                <div className="flex items-start gap-4 lg:gap-6">
                  <motion.div className="relative" initial={{ scale: 0.8, rotate: -10 }} whileInView={{ scale: 1, rotate: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 1.1 }}>
                    <GlassShape variant="orb" size={100} style={{ width: 'clamp(60px, 6vw, 120px)', height: 'clamp(60px, 6vw, 120px)' }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FloatingSymbol symbol="star" size={50} style={{ width: 'clamp(30px, 3vw, 50px)', height: 'clamp(30px, 3vw, 50px)' }} />
                    </div>
                  </motion.div>
                  <div className="pt-4">
                    <span className="text-sm text-teal-mint font-medium">05</span>
                    <h3 style={{ fontFamily: 'var(--font-family-poppins)' }} className="text-2xl lg:text-3xl xl:text-4xl font-semibold text-foreground mb-2">{steps[4]?.title}</h3>
                    <p style={{ fontFamily: 'var(--font-family-inter)' }} className="text-text-secondary max-w-sm lg:max-w-md text-sm md:text-base leading-relaxed">{steps[4]?.description}</p>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </ParallaxLayer>

        {/* ═══ SCENE 4: TRUST & SAFETY ═══ */}

        <ParallaxLayer offset={o.trust} speed={0.1}>
          <div 
            className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse 100% 100% at 50% 40%, hsl(174 62% 28% / 0.1), transparent 60%)" }}
          />
        </ParallaxLayer>

        <ParallaxLayer offset={o.trust} speed={0.5}>
          <div className="h-screen flex flex-col justify-center px-5 md:px-12 lg:px-20">
            <div className="w-full max-w-7xl mx-auto">
              <motion.div 
                className="flex-1 flex flex-col justify-center max-w-2xl"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2, type: 'spring', stiffness: 100, damping: 15 }}
              >
                <motion.span 
                  className="inline-block px-4 py-1.5 md:py-2 mb-4 md:mb-6 text-xs md:text-sm font-medium text-[var(--color-section-primary)] glass-subtle rounded-full w-fit"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  Trust & Safety
                </motion.span>
                <motion.h2 
                  style={{ fontFamily: 'var(--font-family-poppins)' }}
                  className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-semibold mb-5 md:mb-8 leading-tight"
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
                  className="space-y-3 md:space-y-5"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  {trustItems.map((item, i) => (
                    <motion.div 
                      key={i} 
                      className="flex items-start gap-3 md:gap-4"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.5 + i * 0.1, type: 'spring', stiffness: 120, damping: 20 }}
                    >
                      <div className="w-2 h-2 mt-1.5 md:mt-2 rounded-full bg-teal-mint flex-shrink-0" />
                      <div>
                        <h4 
                          style={{ fontFamily: 'var(--font-family-poppins)' }}
                          className="font-medium text-sm md:text-base text-foreground mb-0.5 md:mb-1"
                        >
                          {item.label}
                        </h4>
                        <p 
                          style={{ fontFamily: 'var(--font-family-inter)' }}
                          className="text-xs md:text-sm text-text-secondary"
                        >
                          {item.desc}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            </div>
          </div>
        </ParallaxLayer>

        {/* ═══ SCENE 5: CTA ═══ */}

        <ParallaxLayer offset={o.cta} speed={0.1}>
          <div 
            className="absolute inset-0"
            style={{ 
              background: `
                radial-gradient(ellipse 100% 50% at 50% 100%, hsl(174 72% 40% / 0.1), transparent 60%),
                linear-gradient(0deg, rgba(200, 240, 235, 0.4) 0%, transparent 100%)
              `,
            }}
          />
        </ParallaxLayer>

        <ParallaxLayer offset={o.cta} speed={0.25}>
          <div className="absolute top-[10%] left-[10%] opacity-20 rotate-12">
            <GlassShape variant="prism" size={isMobile ? 80 : 120} />
          </div>
          <div className="absolute top-[20%] right-[15%] opacity-15 -rotate-6">
            <GlassShape variant="prism" size={isMobile ? 100 : 180} />
          </div>
        </ParallaxLayer>

        <ParallaxLayer offset={o.cta} speed={0.5}>
          <div className="h-screen flex flex-col items-center justify-center px-5 text-center" style={{ paddingTop: '6vh', paddingBottom: '10vh' }}>
            <h2 
              style={{ fontFamily: 'var(--font-family-poppins)' }} 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold mb-4 md:mb-6 leading-tight max-w-3xl"
            >
              Ready to find your
              <br />
              <span className="text-gradient">perfect match?</span>
            </h2>
            
            <p 
              style={{ fontFamily: 'var(--font-family-inter)' }}
              className="text-sm md:text-xl text-text-secondary mb-6 md:mb-8 max-w-xl"
            >
              Join thousands who've discovered trusted local experts through Skillance.
            </p>
            
            <div className="mb-6 md:mb-8">
              <DownloadCTA variant="full" />
            </div>
          </div>
        </ParallaxLayer>

        {/* Footer */}
        <ParallaxLayer offset={o.cta} speed={0.6}>
          <div className="absolute bottom-3 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 text-center px-4">
            <div 
              className="px-5 sm:px-8 py-2.5 sm:py-4 rounded-2xl bg-white/90"
              style={{ border: '1px solid rgba(200, 220, 215, 0.5)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)' }}
            >
              <p 
                style={{ fontFamily: 'var(--font-family-inter)' }}
                className="text-[10px] sm:text-sm text-text-secondary"
              >
                © Skillance. Connecting communities with trusted experts.
              </p>
            </div>
          </div>
        </ParallaxLayer>

      </ParallaxWithLenis>
      
      <FloatingCTA />
    </div>
  )
}

export default AppHomePage
