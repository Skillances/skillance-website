import { useEffect, useRef, ReactNode } from 'react'
import { createLenisInstance, startLenisRaf, prefersReducedMotion, type LenisConfig } from '@/lib/smoothScroll'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface SmoothScrollProviderProps {
  children: ReactNode
  config?: LenisConfig
  className?: string
}

export const SmoothScrollProvider = ({ 
  children, 
  config = {},
  className = ''
}: SmoothScrollProviderProps) => {
  const lenisRef = useRef<Lenis | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    // Prevent double init in React Strict Mode
    if (lenisRef.current) return

    try {
      const lenis = createLenisInstance(config, Lenis)
      lenisRef.current = lenis

      // Start RAF loop
      const cleanup = startLenisRaf(lenis, ScrollTrigger)
      cleanupRef.current = cleanup

      // Expose Lenis instance globally for ScrollToTop
      if (typeof window !== 'undefined') {
        ;(window as any).lenis = lenis
      }

      // Sync ScrollTrigger with Lenis
      ScrollTrigger.scrollerProxy(document.body, {
        scrollTop(value) {
          if (arguments.length) {
            lenis.scrollTo(value, { immediate: true })
          }
          return lenis.scroll
        },
        getBoundingClientRect() {
          return {
            top: 0,
            left: 0,
            width: window.innerWidth,
            height: window.innerHeight,
          }
        },
        pinType: document.body.style.transform ? 'transform' : 'fixed',
      })
    } catch (error) {
      console.error('Failed to initialize smooth scroll:', error)
    }

    // Cleanup on unmount
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current()
      }
      if (lenisRef.current) {
        lenisRef.current.destroy()
        lenisRef.current = null
      }
      if (typeof window !== 'undefined') {
        delete (window as any).lenis
      }
      ScrollTrigger.scrollerProxy(document.body, {})
    }
  }, []) // Empty deps - only init once

  // Handle reduced motion changes
  useEffect(() => {
    if (!lenisRef.current) return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = () => {
      if (mediaQuery.matches) {
        // Disable smooth scroll for reduced motion
        lenisRef.current?.stop()
      } else {
        lenisRef.current?.start()
      }
      ScrollTrigger.refresh()
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return (
    <div className={className} data-smooth-scroll>
      {children}
    </div>
  )
}

