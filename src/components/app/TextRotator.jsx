import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utils/cn'

const TextRotator = ({
  words,
  className = "",
  interval = 3000,
  textGradient = true,
  letterAnimation = true
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length)
    }, interval)

    return () => clearInterval(timer)
  }, [words.length, interval])

  // Animation variants for letter-by-letter effect
  const letterVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      filter: "blur(5px)",
      scale: 0.9
    },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      scale: 1,
      transition: {
        delay: i * 0.05,
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1]
      }
    }),
    exit: (i) => ({
      opacity: 0,
      y: -20,
      filter: "blur(5px)",
      scale: 0.9,
      transition: {
        delay: i * 0.02,
        duration: 0.3,
        ease: "easeInOut"
      }
    })
  }

  return (
    <span className={cn(
      "relative inline-block min-w-[200px] min-h-[1.2em]",
      !letterAnimation && textGradient && "bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-section-primary)] to-[var(--color-section-secondary)]",
      className
    )}>
      <AnimatePresence mode="wait">
        {letterAnimation ? (
          <motion.span
            key={currentIndex}
            className="absolute inset-0 flex items-center w-full"
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {words[currentIndex].split('').map((letter, i) => (
              <motion.span
                key={`${currentIndex}-${i}`}
                custom={i}
                variants={letterVariants}
                style={textGradient ? {
                  color: 'var(--color-section-primary)',
                  display: 'inline-block',
                } : { display: 'inline-block' }}
                className={letter === ' ' ? 'ml-2' : ''}
              >
                {letter === ' ' ? '\u00A0' : letter}
              </motion.span>
            ))}
          </motion.span>
        ) : (
          <motion.span
            key={currentIndex}
            className="absolute inset-0 flex items-center w-full"
            initial={{
              y: 40,
              opacity: 0,
              filter: "blur(8px)",
              scale: 0.95,
            }}
            animate={{
              y: 0,
              opacity: 1,
              filter: "blur(0px)",
              scale: 1,
            }}
            exit={{
              y: -40,
              opacity: 0,
              filter: "blur(8px)",
              scale: 0.95,
            }}
            transition={{
              y: { type: "spring", stiffness: 100, damping: 15 },
              opacity: { duration: 0.5 },
              filter: { duration: 0.4 },
              scale: { duration: 0.4 }
            }}
          >
            {words[currentIndex]}
          </motion.span>
        )}
      </AnimatePresence>
      <span className="opacity-0">{words[0]}</span>
    </span>
  )
}

export default TextRotator

