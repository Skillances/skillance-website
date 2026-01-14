import { useRef, useEffect } from 'react'
import { cn } from '@/utils/cn'

const GlowEffect = ({ 
  children, 
  className,
  glowColor = "var(--color-section-primary)",
  glowSize = 200,
  glowOpacity = 0.15,
  borderGlow = true
}) => {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      container.style.setProperty('--mouse-x', `${x}px`)
      container.style.setProperty('--mouse-y', `${y}px`)
    }

    container.addEventListener('mousemove', handleMouseMove)
    return () => container.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div 
      ref={containerRef}
      className={cn("relative group overflow-hidden", className)}
      style={{
        '--glow-color': glowColor,
        '--glow-size': `${glowSize}px`,
        '--glow-opacity': glowOpacity,
      }}
    >
      <div 
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
        style={{
          background: `radial-gradient(var(--glow-size) circle at var(--mouse-x) var(--mouse-y), var(--glow-color), transparent 40%)`
        }}
      />
      
      {borderGlow && (
        <div 
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
          style={{
            background: `radial-gradient(var(--glow-size) circle at var(--mouse-x) var(--mouse-y), var(--glow-color), transparent 40%)`,
            maskImage: 'linear-gradient(black, black) content-box, linear-gradient(black, black)',
            maskComposite: 'exclude',
            padding: '2px', // Border width
          }}
        />
      )}

      {children}
    </div>
  )
}

export default GlowEffect

