import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

const MagneticElement = ({ 
  children, 
  className,
  strength = 0.5,
  range = 200,
  active = true
}) => {
  const ref = useRef(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e) => {
    if (!active) return

    const { clientX, clientY } = e
    const { left, top, width, height } = ref.current.getBoundingClientRect()
    
    const centerX = left + width / 2
    const centerY = top + height / 2
    
    const distance = Math.sqrt(
      Math.pow(clientX - centerX, 2) + Math.pow(clientY - centerY, 2)
    )

    if (distance < range) {
      const x = (clientX - centerX) * strength
      const y = (clientY - centerY) * strength
      setPosition({ x, y })
    } else {
      setPosition({ x: 0, y: 0 })
    }
  }

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 })
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={cn("relative", className)}
    >
      {children}
    </motion.div>
  )
}

export default MagneticElement

