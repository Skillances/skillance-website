import { useEffect, useRef, ReactNode } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { prefersReducedMotion } from '@/lib/smoothScroll'

interface ParallaxProps {
  children: ReactNode
  speed?: number // Positive = moves slower (parallax down), negative = moves faster (parallax up)
  start?: string | number
  end?: string | number
  className?: string
  style?: React.CSSProperties
}

export const Parallax = ({
  children,
  speed = 0.2,
  start = 'top bottom',
  end = 'bottom top',
  className = '',
  style = {},
}: ParallaxProps) => {
  const elementRef = useRef<HTMLDivElement>(null)
  const ctxRef = useRef<gsap.Context | null>(null)

  useGSAP(() => {
    if (!elementRef.current) return

    const reducedMotion = prefersReducedMotion()
    if (reducedMotion) {
      // Minimal animation for reduced motion
      gsap.set(elementRef.current, { opacity: 1 })
      return
    }

    ctxRef.current = gsap.context(() => {
      gsap.to(elementRef.current, {
        yPercent: speed * 100,
        ease: 'none',
        scrollTrigger: {
          trigger: elementRef.current,
          start,
          end,
          scrub: true,
          invalidateOnRefresh: true,
        },
      })
    })

    return () => {
      ctxRef.current?.revert()
    }
  }, [speed, start, end])

  return (
    <div
      ref={elementRef}
      className={className}
      style={{
        willChange: prefersReducedMotion() ? 'auto' : 'transform',
        transform: 'translate3d(0, 0, 0)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

