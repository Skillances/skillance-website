import { cn } from '@/lib/utils'

/**
 * GlassShape - Glass morphism shapes for parallax scenes
 * Adapted from reference with our color system
 */
export const GlassShape = ({ 
  variant = "orb", 
  size = 200, 
  className,
  style,
  children 
}) => {
  const baseStyles = {
    width: size,
    height: size,
    ...style,
  }

  const shapeContent = () => {
    switch (variant) {
      case "orb":
        return (
          <div 
            className={cn(
              "glass-orb rounded-full relative overflow-hidden",
              className
            )}
            style={baseStyles}
          >
            {/* Inner luminescence */}
            <div className="absolute inset-[15%] rounded-full bg-gradient-to-br from-[rgba(94,234,212,0.2)] via-transparent to-[rgba(20,184,166,0.1)] blur-xl" />
            {/* Caustic highlight */}
            <div className="absolute top-[10%] left-[20%] w-[40%] h-[15%] rounded-full bg-gradient-to-r from-transparent via-white/25 to-transparent blur-sm rotate-[-15deg]" />
            {/* Secondary refraction */}
            <div className="absolute bottom-[20%] right-[15%] w-[25%] h-[8%] rounded-full bg-[rgba(94,234,212,0.1)] blur-md rotate-[30deg]" />
            {children}
          </div>
        )

      case "orb-simple":
        return (
          <div
            className={cn("glass-orb-simple rounded-full relative overflow-hidden", className)}
            style={baseStyles}
          >
            {children}
          </div>
        )

      case "prism":
        return (
          <div 
            className={cn("relative overflow-hidden", className)}
            style={{
              ...baseStyles,
              background: "linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.02))",
              backdropFilter: "blur(40px)",
              WebkitBackdropFilter: "blur(40px)",
              border: "1px solid rgba(255,255,255,0.15)",
              clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
              boxShadow: "0 0 80px rgba(20,184,166,0.25), inset 0 0 40px rgba(94,234,212,0.1)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[rgba(94,234,212,0.1)] to-transparent" />
            {children}
          </div>
        )

      case "ring":
        return (
          <div className={cn("relative", className)} style={baseStyles}>
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                background: "transparent",
                border: `${size * 0.08}px solid rgba(255,255,255,0.08)`,
                boxShadow: `
                  0 0 60px rgba(94,234,212,0.2),
                  inset 0 0 40px rgba(94,234,212,0.1),
                  0 0 120px rgba(20,184,166,0.15)
                `,
              }}
            />
            {/* Light catch */}
            <div 
              className="absolute rounded-full"
              style={{
                top: "5%",
                left: "10%",
                width: "25%",
                height: "8%",
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                filter: "blur(2px)",
                transform: "rotate(-45deg)",
              }}
            />
            {children}
          </div>
        )

      case "shard":
        return (
          <div 
            className={cn("relative overflow-hidden", className)}
            style={{
              ...baseStyles,
              height: size * 2.5,
              background: "linear-gradient(180deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))",
              backdropFilter: "blur(30px)",
              WebkitBackdropFilter: "blur(30px)",
              border: "1px solid rgba(255,255,255,0.12)",
              clipPath: "polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)",
              boxShadow: "0 0 60px rgba(20,184,166,0.2)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[rgba(94,234,212,0.1)] via-transparent to-[rgba(20,184,166,0.05)]" />
            {children}
          </div>
        )

      case "arc":
        return (
          <div 
            className={cn("relative", className)}
            style={{
              ...baseStyles,
              height: size * 0.5,
            }}
          >
            <div 
              className="absolute inset-0"
              style={{
                background: "transparent",
                borderRadius: `${size}px ${size}px 0 0`,
                borderTop: `${size * 0.05}px solid rgba(255,255,255,0.1)`,
                borderLeft: `${size * 0.05}px solid rgba(255,255,255,0.08)`,
                borderRight: `${size * 0.05}px solid rgba(255,255,255,0.08)`,
                boxShadow: "0 -20px 60px rgba(94,234,212,0.15)",
              }}
            />
            {children}
          </div>
        )

      case "lens":
        return (
          <div 
            className={cn("relative overflow-hidden", className)}
            style={{
              ...baseStyles,
              height: size * 0.4,
              borderRadius: "50%",
              background: "linear-gradient(180deg, rgba(255,255,255,0.15), rgba(255,255,255,0.03))",
              backdropFilter: "blur(40px)",
              WebkitBackdropFilter: "blur(40px)",
              border: "1px solid rgba(255,255,255,0.2)",
              boxShadow: `
                0 20px 60px rgba(20,184,166,0.25),
                inset 0 -10px 30px rgba(94,234,212,0.1)
              `,
            }}
          >
            <div className="absolute top-[10%] left-[15%] w-[50%] h-[30%] bg-gradient-to-r from-transparent via-white/20 to-transparent blur-sm rounded-full" />
            {children}
          </div>
        )

      case "droplet":
        return (
          <div 
            className={cn("relative overflow-hidden", className)}
            style={{
              ...baseStyles,
              height: size * 1.4,
              background: "linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.03))",
              backdropFilter: "blur(40px)",
              WebkitBackdropFilter: "blur(40px)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "50% 50% 50% 50% / 30% 30% 70% 70%",
              boxShadow: "0 30px 80px rgba(20,184,166,0.25), inset 0 0 50px rgba(94,234,212,0.08)",
            }}
          >
            <div className="absolute top-[15%] left-[25%] w-[35%] h-[15%] rounded-full bg-gradient-to-r from-transparent via-white/25 to-transparent blur-sm rotate-[-20deg]" />
            {children}
          </div>
        )

      default:
        return null
    }
  }

  return shapeContent()
}

export default GlassShape
