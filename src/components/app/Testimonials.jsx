import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react'
import { Card } from '@/components/ui/card'
import Card3D from './Card3D'
import MagneticElement from './MagneticElement'

/**
 * TESTIMONIALS DATA STRUCTURE
 * 
 * To add testimonials data, import it here and assign to the `testimonials` variable below.
 * 
 * Expected data structure:
 * 
 * const testimonials = [
 *   {
 *     id: number,                    // Unique identifier
 *     name: string,                   // Person's name (e.g., 'Sarah Johnson')
 *     role: string,                  // Their role (e.g., 'Customer', 'Freelancer - Tutor')
 *     category: string,               // Service category (e.g., 'Dog Walking', 'Education')
 *     rating: number,                 // Rating out of 5 (1-5)
 *     quote: string,                 // The testimonial quote text
 *     image: string,                  // Optional: path to avatar image (e.g., '/avatars/customer1.jpg')
 *   },
 *   // ... more testimonials
 * ]
 * 
 * Example:
 * import { testimonialsData } from '@/utils/testimonialData'
 * const testimonials = testimonialsData
 */

// TODO: Import your testimonials data here
// import { testimonials } from '@/utils/testimonialData'
import { testimonials } from '@/utils/testimonialData'

const Testimonials = () => {
  // Don't render if no testimonials data
  if (!testimonials || testimonials.length === 0) {
    return null
  }
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  }

  const swipeConfidenceThreshold = 10000
  const swipePower = (offset, velocity) => {
    return Math.abs(offset) * velocity
  }

  const paginate = (newDirection) => {
    setDirection(newDirection)
    setCurrentIndex((prevIndex) => {
      let nextIndex = prevIndex + newDirection
      if (nextIndex < 0) nextIndex = testimonials.length - 1
      if (nextIndex >= testimonials.length) nextIndex = 0
      return nextIndex
    })
  }

  // Auto-rotate every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      paginate(1)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const currentTestimonial = testimonials[currentIndex]

  return (
    <div className="py-20 bg-white">
      <div className="container mx-auto container-padding max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 
            style={{ fontFamily: 'var(--font-family-poppins)' }} 
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            What Our Users Say
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Real stories from customers and freelancers who love using Skillance
          </p>
        </motion.div>

        <div className="relative">
          {/* Navigation buttons with magnetic effect */}
          <MagneticElement strength={0.2} range={100}>
            <motion.button
              onClick={() => paginate(-1)}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
              style={{ backgroundColor: 'var(--color-section-primary)' }}
              aria-label="Previous testimonial"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft size={24} className="text-white" />
            </motion.button>
          </MagneticElement>

          <MagneticElement strength={0.2} range={100}>
            <motion.button
              onClick={() => paginate(1)}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
              style={{ backgroundColor: 'var(--color-section-primary)' }}
              aria-label="Next testimonial"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight size={24} className="text-white" />
            </motion.button>
          </MagneticElement>

          {/* Testimonial card */}
          <div className="px-16">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = swipePower(offset.x, velocity.x)

                  if (swipe < -swipeConfidenceThreshold) {
                    paginate(1)
                  } else if (swipe > swipeConfidenceThreshold) {
                    paginate(-1)
                  }
                }}
              >
                <Card3D depth={10} scaleOnHover={1.01}>
                  <Card className="p-8 md:p-12 relative overflow-hidden">
                  {/* Quote icon background */}
                  <div className="absolute top-4 right-4 opacity-5">
                    <Quote size={120} style={{ color: 'var(--color-section-primary)' }} />
                  </div>

                  <div className="relative z-10">
                    {/* Rating stars with animation */}
                    <div className="flex items-center justify-center gap-1 mb-6">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ 
                            delay: i * 0.1,
                            type: 'spring',
                            stiffness: 200,
                            damping: 15,
                          }}
                          whileHover={{ scale: 1.2, rotate: 360 }}
                        >
                          <Star
                            size={24}
                            fill={i < currentTestimonial.rating ? '#F59E0B' : 'none'}
                            stroke={i < currentTestimonial.rating ? '#F59E0B' : '#D1D5DB'}
                          />
                        </motion.div>
                      ))}
                    </div>

                    {/* Quote */}
                    <blockquote className="text-xl md:text-2xl text-center text-text-primary mb-8 leading-relaxed">
                      "{currentTestimonial.quote}"
                    </blockquote>

                    {/* Author with animated avatar */}
                    <div className="flex flex-col items-center">
                      {/* Avatar placeholder with animation */}
                      <motion.div 
                        className="w-16 h-16 rounded-full mb-4 flex items-center justify-center text-white text-2xl font-bold relative overflow-hidden"
                        style={{ backgroundColor: 'var(--color-section-primary)' }}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ 
                          delay: 0.5,
                          type: 'spring',
                          stiffness: 200,
                          damping: 15,
                        }}
                        whileHover={{ scale: 1.1, rotate: 360 }}
                      >
                        {/* Gradient overlay for depth */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                        <span className="relative z-10">{currentTestimonial.name.charAt(0)}</span>
                      </motion.div>

                      <h4 
                        style={{ fontFamily: 'var(--font-family-poppins)' }} 
                        className="text-lg font-bold"
                      >
                        {currentTestimonial.name}
                      </h4>
                      <p className="text-text-secondary text-sm mb-2">
                        {currentTestimonial.role}
                      </p>
                      <span 
                        className="inline-block px-3 py-1 rounded-full text-xs font-medium"
                        style={{ 
                          backgroundColor: 'var(--color-section-primary)',
                          color: 'white',
                          opacity: 0.9,
                        }}
                      >
                        {currentTestimonial.category}
                      </span>
                    </div>
                  </div>
                  </Card>
                </Card3D>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dot indicators with animations */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1)
                  setCurrentIndex(index)
                }}
                className="transition-all"
                aria-label={`Go to testimonial ${index + 1}`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                <motion.div
                  className={`rounded-full ${
                    index === currentIndex ? 'w-8 h-2' : 'w-2 h-2'
                  }`}
                  style={{
                    backgroundColor: index === currentIndex
                      ? 'var(--color-section-primary)'
                      : '#D1D5DB',
                  }}
                  animate={{
                    scale: index === currentIndex ? [1, 1.1, 1] : 1,
                  }}
                  transition={{
                    duration: 2,
                    repeat: index === currentIndex ? Infinity : 0,
                  }}
                />
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Testimonials

