import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// Check for reduced motion preference
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Lenis configuration
export interface LenisConfig {
  duration?: number
  easing?: (t: number) => number
  lerp?: number
  wheelMultiplier?: number
  touchMultiplier?: number
  infinite?: boolean
}

export const createLenisInstance = (config: LenisConfig = {}) => {
  const reducedMotion = prefersReducedMotion()

  const lenis = new Lenis({
    duration: config.duration ?? (reducedMotion ? 0 : 1.2),
    easing: config.easing ?? ((t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))),
    lerp: config.lerp ?? (reducedMotion ? 1 : 0.1),
    wheelMultiplier: config.wheelMultiplier ?? (reducedMotion ? 1 : 0.8),
    touchMultiplier: config.touchMultiplier ?? (reducedMotion ? 1 : 2),
    infinite: config.infinite ?? false,
    smoothWheel: !reducedMotion,
    smoothTouch: !reducedMotion,
  })

  return lenis
}

// RAF ticker for Lenis
export const raf = (time: number) => {
  // This will be set by the provider
}

let lenisInstance: Lenis | null = null
let rafId: number | null = null

export const startLenisRaf = (lenis: Lenis) => {
  lenisInstance = lenis
  
  const tick = (time: number) => {
    lenis.raf(time)
    rafId = requestAnimationFrame(tick)
  }
  
  rafId = requestAnimationFrame(tick)
  
  // Integrate with GSAP ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update)
  
  // Refresh ScrollTrigger on resize
  const handleResize = () => {
    ScrollTrigger.refresh()
  }
  window.addEventListener('resize', handleResize, { passive: true })
  
  return () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
    window.removeEventListener('resize', handleResize)
    lenisInstance = null
  }
}

export const stopLenisRaf = () => {
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
}

