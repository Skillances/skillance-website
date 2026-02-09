import { motion } from 'framer-motion'

/**
 * FlowingBackground - Adds texture and life to scene backgrounds
 * Adapted from reference with our color system
 */
export const FlowingBackground = ({ variant = "hero" }) => {
  const getShapes = () => {
    switch (variant) {
      case "hero":
        return (
          <>
            {/* Large ambient glow top */}
            <div 
              className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-[150%] h-[80%] rounded-full opacity-30"
              style={{ 
                background: "radial-gradient(ellipse at center, rgba(20, 184, 166, 0.3), transparent 70%)" 
              }}
            />
            {/* Floating teal blob left */}
            <motion.div
              animate={{ 
                y: [-20, 20, -20],
                x: [-10, 10, -10],
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              className="absolute rounded-full opacity-60 blur-[80px] w-[400px] h-[400px] -left-20 top-1/4"
              style={{ background: 'rgba(20, 184, 166, 0.2)' }}
            />
            {/* Floating mint blob right */}
            <motion.div
              animate={{ 
                y: [20, -20, 20],
                x: [10, -10, 10],
              }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
              className="absolute rounded-full opacity-60 blur-[80px] w-[500px] h-[500px] -right-32 top-1/3"
              style={{ background: 'rgba(94, 234, 212, 0.1)' }}
            />
            {/* Bottom gradient fade */}
            <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background to-transparent" />
          </>
        )
      case "services":
        return (
          <>
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.2, 0.3, 0.2],
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              className="absolute rounded-full opacity-60 blur-[80px] w-[600px] h-[600px] left-1/4 top-1/4"
              style={{ background: 'rgba(20, 184, 166, 0.3)' }}
            />
            <motion.div
              animate={{ 
                y: [0, 40, 0],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
              className="absolute rounded-full opacity-60 blur-[80px] w-[300px] h-[300px] right-1/4 bottom-1/4"
              style={{ background: 'rgba(94, 234, 212, 0.15)' }}
            />
          </>
        )
      case "trust":
        return (
          <>
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full opacity-20"
              style={{ 
                background: "radial-gradient(circle at center, rgba(94, 234, 212, 0.2), transparent 60%)" 
              }}
            />
          </>
        )
      case "cta":
        return (
          <>
            <motion.div
              animate={{ 
                y: [-30, 30, -30],
                rotate: [0, 5, 0],
              }}
              transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
              className="absolute rounded-full opacity-60 blur-[80px] w-[700px] h-[400px] left-1/2 -translate-x-1/2 top-1/4"
              style={{ background: 'rgba(20, 184, 166, 0.25)' }}
            />
            <div 
              className="absolute inset-0"
              style={{ 
                background: "radial-gradient(ellipse 100% 60% at 50% 100%, rgba(20, 184, 166, 0.15), transparent)" 
              }}
            />
          </>
        )
      default:
        return null
    }
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {getShapes()}
    </div>
  )
}

export default FlowingBackground
