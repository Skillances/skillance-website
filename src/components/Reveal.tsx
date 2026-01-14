import { useEffect, useRef, ReactNode } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { prefersReducedMotion } from '@/lib/smoothScroll'

interface RevealProps {
  children: ReactNode
  type?: 'image' | 'text' | 'fade'
  stagger?: number
  delay?: number
  start?: string | number
  end?: string | number
  className?: string
  style?: React.CSSProperties
}

export const Reveal = ({
  children,
  type = 'fade',
  stagger = 0.1,
  delay = 0,
  start = 'top 80%',
  end = 'top 20%',
  className = '',
  style = {},
}: RevealProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const ctxRef = useRef<gsap.Context | null>(null)

  useGSAP(() => {
    if (!containerRef.current) return

    const reducedMotion = prefersReducedMotion()
    
    ctxRef.current = gsap.context(() => {
      const children = containerRef.current?.children || []
      
      if (reducedMotion) {
        // Simple fade for reduced motion
        gsap.set(children, { opacity: 0 })
        gsap.to(children, {
          opacity: 1,
          duration: 0.6,
          delay,
          stagger: stagger * 0.5,
          scrollTrigger: {
            trigger: containerRef.current,
            start,
            toggleActions: 'play none none none',
          },
        })
        return
      }

      // Image reveal: parent overflow hidden, child animates yPercent
      if (type === 'image') {
        const child = children[0] as HTMLElement
        if (!child) return

        gsap.set(child, { yPercent: 10, opacity: 0 })
        gsap.to(child, {
          yPercent: 0,
          opacity: 1,
          duration: 1.2,
          ease: 'power2.out',
          delay,
          scrollTrigger: {
            trigger: containerRef.current,
            start,
            end,
            scrub: true,
            invalidateOnRefresh: true,
          },
        })
      } 
      // Text reveal: stagger children with y and opacity
      else if (type === 'text') {
        gsap.set(children, { y: 30, opacity: 0 })
        gsap.to(children, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          delay,
          stagger,
          scrollTrigger: {
            trigger: containerRef.current,
            start,
            toggleActions: 'play none none none',
          },
        })
      }
      // Fade reveal: simple opacity
      else {
        gsap.set(children, { opacity: 0 })
        gsap.to(children, {
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          delay,
          stagger,
          scrollTrigger: {
            trigger: containerRef.current,
            start,
            toggleActions: 'play none none none',
          },
        })
      }
    })

    return () => {
      ctxRef.current?.revert()
    }
  }, [type, stagger, delay, start, end])

  // Handle image loading for ScrollTrigger refresh
  useEffect(() => {
    if (type === 'image' && containerRef.current) {
      const images = containerRef.current.querySelectorAll('img')
      let loadedCount = 0
      const totalImages = images.length

      if (totalImages === 0) {
        ScrollTrigger.refresh()
        return
      }

      const handleLoad = () => {
        loadedCount++
        if (loadedCount === totalImages) {
          ScrollTrigger.refresh()
        }
      }

      images.forEach((img) => {
        if (img.complete) {
          handleLoad()
        } else {
          img.addEventListener('load', handleLoad, { once: true })
          img.addEventListener('error', handleLoad, { once: true })
        }
      })

      return () => {
        images.forEach((img) => {
          img.removeEventListener('load', handleLoad)
          img.removeEventListener('error', handleLoad)
        })
      }
    }
  }, [type, children])

  const overflowClass = type === 'image' ? 'overflow-hidden' : ''

  return (
    <div
      ref={containerRef}
      className={`${overflowClass} ${className}`}
      style={{
        willChange: prefersReducedMotion() ? 'auto' : 'transform, opacity',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

