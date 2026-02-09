import { cn } from '@/lib/utils'
import { Search, MessageSquare, Star, Zap, Navigation, Hand, Sparkles, ShieldCheck } from 'lucide-react'

/**
 * FloatingSymbol - SVG symbols with glass aesthetic
 * Some use animated icons, some use static SVGs
 */
export const FloatingSymbol = ({ 
  symbol, 
  size = 120, 
  className,
  style 
}) => {
  // Map symbols to lucide icons (animated) or custom SVGs (static)
  const iconMap = {
    magnifier: Search,
    message: MessageSquare,
    star: Star,
    bolt: Zap,
    compass: Navigation,
    hand: Hand,
    spark: Sparkles,
    shield: ShieldCheck,
  }

  // Use animated icons for some symbols
  const useIcon = ['magnifier', 'message', 'star', 'shield'].includes(symbol)
  
  if (useIcon && iconMap[symbol]) {
    const Icon = iconMap[symbol]
    return (
      <div 
        className={cn("relative flex items-center justify-center", className)}
        style={{ 
          width: size, 
          height: size,
          filter: "drop-shadow(0 0 30px rgba(94,234,212,0.3))",
          ...style 
        }}
      >
        <Icon 
          size={size * 0.6} 
          className="text-[var(--color-section-primary)]"
          style={{ opacity: 0.9 }}
        />
      </div>
    )
  }

  // Custom SVG for others
  const getSymbolPath = () => {
    const tealGradient = {
      start: "rgba(94,234,212,0.9)",
      mid: "rgba(94,234,212,0.7)",
      end: "rgba(20,184,166,0.5)",
    }

    switch (symbol) {
      case "bolt":
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="boltGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={tealGradient.start} />
                <stop offset="100%" stopColor={tealGradient.mid} />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path 
              d="M55 10 L25 50 L45 50 L40 90 L75 45 L52 45 Z" 
              fill="none" 
              stroke="url(#boltGrad)" 
              strokeWidth="4"
              strokeLinejoin="round"
              filter="url(#glow)"
            />
          </svg>
        )

      case "compass":
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="compGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={tealGradient.start} />
                <stop offset="100%" stopColor={tealGradient.end} />
              </linearGradient>
            </defs>
            <circle 
              cx="50" cy="50" r="38" 
              fill="none" 
              stroke="url(#compGrad)" 
              strokeWidth="4"
              filter="url(#glow)"
            />
            <path 
              d="M50 20 L55 50 L50 80 L45 50 Z" 
              fill="none" 
              stroke={tealGradient.start} 
              strokeWidth="2"
              strokeOpacity="0.7"
            />
            <circle cx="50" cy="50" r="5" fill={tealGradient.mid} fillOpacity="0.5" />
          </svg>
        )

      case "hand":
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="handGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={tealGradient.start} />
                <stop offset="100%" stopColor={tealGradient.end} />
              </linearGradient>
            </defs>
            <path 
              d="M30 55 L30 35 Q30 30 35 30 Q40 30 40 35 L40 50 L40 25 Q40 20 45 20 Q50 20 50 25 L50 50 L50 22 Q50 17 55 17 Q60 17 60 22 L60 50 L60 28 Q60 23 65 23 Q70 23 70 28 L70 60 Q70 80 50 85 L35 85 Q25 85 25 70 L25 55 Q25 50 30 55 Z" 
              fill="none" 
              stroke="url(#handGrad)" 
              strokeWidth="3"
              strokeLinejoin="round"
              filter="url(#glow)"
            />
          </svg>
        )

      case "spark":
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="sparkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={tealGradient.start} />
                <stop offset="100%" stopColor={tealGradient.mid} />
              </linearGradient>
            </defs>
            <path 
              d="M50 10 L53 40 L80 25 L58 48 L90 50 L58 52 L80 75 L53 60 L50 90 L47 60 L20 75 L42 52 L10 50 L42 48 L20 25 L47 40 Z" 
              fill="none" 
              stroke="url(#sparkGrad)" 
              strokeWidth="2"
              strokeLinejoin="round"
              filter="url(#glow)"
            />
            <circle cx="50" cy="50" r="6" fill={tealGradient.start} fillOpacity="0.5" />
          </svg>
        )

      default:
        return null
    }
  }

  return (
    <div 
      className={cn("relative", className)}
      style={{ 
        width: size, 
        height: size,
        filter: "drop-shadow(0 0 30px rgba(94,234,212,0.3))",
        ...style 
      }}
    >
      {getSymbolPath()}
    </div>
  )
}

export default FloatingSymbol
