import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { cn } from '@/utils/cn'

const Card3D = ({ 
  children, 
  className,
  depth = 20, // Maximum rotation in degrees
  perspective = 1000,
  scaleOnHover = 1.05
}) => {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Smooth out the mouse movement
  const mouseX = useSpring(x, { stiffness: 150, damping: 15 })
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 })

  // Transform mouse position to rotation
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [depth, -depth])
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-depth, depth])

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    
    // Calculate normalized position (-0.5 to 0.5)
    const width = rect.width
    const height = rect.height
    const mouseXPos = e.clientX - rect.left
    const mouseYPos = e.clientY - rect.top
    
    const xPct = mouseXPos / width - 0.5
    const yPct = mouseYPos / height - 0.5
    
    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective,
        transformStyle: "preserve-3d",
      }}
      whileHover={{ scale: scaleOnHover }}
      className={cn("relative", className)}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative w-full h-full"
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

export default Card3D

