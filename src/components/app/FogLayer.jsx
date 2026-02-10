import { cn } from '@/lib/utils'

/**
 * FogLayer - Atmospheric fog effects
 * Adapted from reference with our color system
 */
export const FogLayer = ({ 
  variant = "bottom", 
  intensity = "medium",
  className 
}) => {
  const intensityValues = {
    light: 0.3,
    medium: 0.5,
    heavy: 0.7,
  }

  const opacity = intensityValues[intensity]

  const getFogStyle = () => {
    switch (variant) {
      case "top":
        return {
          background: `linear-gradient(180deg, 
            rgba(20,184,166,${opacity * 0.1}) 0%, 
            rgba(20,184,166,${opacity * 0.05}) 30%,
            transparent 100%
          )`,
        }
      case "bottom":
        return {
          background: `linear-gradient(0deg, 
            rgba(20,184,166,${opacity * 0.1}) 0%, 
            rgba(20,184,166,${opacity * 0.05}) 30%,
            transparent 100%
          )`,
        }
      case "full":
        return {
          background: `linear-gradient(180deg, 
            rgba(20,184,166,${opacity * 0.08}) 0%, 
            transparent 20%,
            transparent 80%,
            rgba(20,184,166,${opacity * 0.08}) 100%
          )`,
        }
      case "radial":
        return {
          background: `radial-gradient(ellipse 80% 60% at 50% 50%, 
            transparent 0%, 
            rgba(20,184,166,${opacity * 0.1}) 100%
          )`,
        }
      case "ambient":
        return {
          background: `
            radial-gradient(ellipse 100% 40% at 50% 0%, rgba(20,184,166,${opacity * 0.15}), transparent 60%),
            radial-gradient(ellipse 80% 50% at 20% 80%, rgba(94,234,212,${opacity * 0.08}), transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 60%, rgba(94,234,212,${opacity * 0.1}), transparent 50%)
          `,
        }
      default:
        return {}
    }
  }

  return (
    <div 
      className={cn("absolute inset-0 pointer-events-none", className)}
      style={getFogStyle()}
    />
  )
}

export default FogLayer
