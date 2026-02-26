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
            {/* Inner luminescence - Optimized */}
            <div className="absolute inset-[15%] rounded-full" 
              style={{ background: "radial-gradient(circle, rgba(94,234,212,0.15) 0%, transparent 70%)" }} 
            />
            {/* Caustic highlight - Optimized */}
            <div className="absolute top-[10%] left-[20%] w-[40%] h-[15%] rounded-full rotate-[-15deg]" 
              style={{ background: "radial-gradient(ellipse, rgba(255,255,255,0.4) 0%, transparent 60%)" }}
            />
            {/* Secondary refraction - Optimized */}
            <div className="absolute bottom-[20%] right-[15%] w-[25%] h-[8%] rounded-full rotate-[30deg]" 
              style={{ background: "radial-gradient(ellipse, rgba(94,234,212,0.2) 0%, transparent 70%)" }}
            />
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
              background: "linear-gradient(135deg, rgba(230,255,250,0.4), rgba(255,255,255,0.1))",
              border: "1px solid rgba(255,255,255,0.3)",
              clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
              boxShadow: "0 0 80px rgba(20,184,166,0.15), inset 0 0 40px rgba(255,255,255,0.4)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[rgba(94,234,212,0.15)] to-transparent" />
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
            {/* Light catch - Optimized */}
            <div 
              className="absolute rounded-full"
              style={{
                top: "5%",
                left: "10%",
                width: "25%",
                height: "8%",
                background: "radial-gradient(ellipse, rgba(255,255,255,0.4) 0%, transparent 70%)",
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
              background: "linear-gradient(180deg, rgba(230,255,250,0.3), rgba(255,255,255,0.05))",
              border: "1px solid rgba(255,255,255,0.2)",
              clipPath: "polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)",
              boxShadow: "0 0 60px rgba(20,184,166,0.15)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[rgba(94,234,212,0.15)] via-transparent to-[rgba(20,184,166,0.05)]" />
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
              background: "linear-gradient(180deg, rgba(230,255,250,0.4), rgba(255,255,255,0.1))",
              border: "1px solid rgba(255,255,255,0.3)",
              boxShadow: `
                0 20px 60px rgba(20,184,166,0.15),
                inset 0 -10px 30px rgba(255,255,255,0.4)
              `,
            }}
          >
            <div className="absolute top-[10%] left-[15%] w-[50%] h-[30%] bg-gradient-to-r from-transparent via-white/40 to-transparent blur-sm rounded-full" />
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
              background: "linear-gradient(180deg, rgba(230,255,250,0.3), rgba(255,255,255,0.05))",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "50% 50% 50% 50% / 30% 30% 70% 70%",
              boxShadow: "0 30px 80px rgba(20,184,166,0.15), inset 0 0 50px rgba(255,255,255,0.3)",
            }}
          >
            <div className="absolute top-[15%] left-[25%] w-[35%] h-[15%] rounded-full bg-gradient-to-r from-transparent via-white/40 to-transparent blur-sm rotate-[-20deg]" />
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
