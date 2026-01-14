import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

export const DarkVeil = ({ 
  children, 
  className = '',
  intensity = 0.3,
  speed = 20
}) => {
  const containerRef = useRef(null)
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        mouseRef.current = {
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        }
        
        containerRef.current.style.setProperty('--mouse-x', `${mouseRef.current.x}%`)
        containerRef.current.style.setProperty('--mouse-y', `${mouseRef.current.y}%`)
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('mousemove', handleMouseMove)
      return () => container.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full h-full overflow-hidden", className)}
        style={{
          '--intensity': intensity,
          '--speed': `${speed}s`,
        }}
    >
      {/* Base gradient background */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.15) 0%, rgba(8, 145, 178, 0.15) 100%)',
        }}
      />

      {/* Animated mesh gradient veil */}
      <motion.div
        className="absolute inset-0 opacity-[var(--intensity)]"
        animate={{
          background: [
            'radial-gradient(circle at 20% 30%, rgba(20, 184, 166, 0.6) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 70%, rgba(8, 145, 178, 0.6) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 50%, rgba(20, 184, 166, 0.6) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 30%, rgba(20, 184, 166, 0.6) 0%, transparent 50%)',
          ],
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Mouse-reactive gradient */}
      <div
        className="absolute inset-0 opacity-[calc(var(--intensity)*0.5)] pointer-events-none"
        style={{
          background: `radial-gradient(circle 600px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(20, 184, 166, 0.5) 0%, rgba(8, 145, 178, 0.4) 40%, transparent 70%)`,
          transition: 'background 0.3s ease-out',
        }}
      />

      {/* Animated conic gradient overlay */}
      <motion.div
        className="absolute inset-0 opacity-[calc(var(--intensity)*0.3)]"
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: speed * 2,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          background: `conic-gradient(from 0deg at 50% 50%, 
            rgba(20, 184, 166, 0.1) 0deg,
            rgba(8, 145, 178, 0.1) 90deg,
            rgba(20, 184, 166, 0.1) 180deg,
            rgba(8, 145, 178, 0.1) 270deg,
            rgba(20, 184, 166, 0.1) 360deg
          )`,
          maskImage: 'radial-gradient(circle at center, black 30%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 30%, transparent 70%)',
        }}
      />

      {/* Subtle noise texture */}
      <div
        className="absolute inset-0 opacity-[calc(var(--intensity)*0.2)]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  )
}

export default DarkVeil

