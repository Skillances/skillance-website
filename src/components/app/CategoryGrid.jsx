import { motion } from 'framer-motion'
import Lottie from 'lottie-react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { SERVICE_CATEGORIES } from '@/utils/appConstants'
import { useInView } from 'react-intersection-observer'
import { fadeInUpStagger, cardHoverLift } from '@/utils/animations'
import { useState } from 'react'
import CategoryModal from './CategoryModal'

// Category-specific gradient colors
const gradientColors = [
  ['#3B82F6', '#2563EB'], // Blue
  ['#8B5CF6', '#7C3AED'], // Purple
  ['#10B981', '#059669'], // Green
  ['#F59E0B', '#D97706'], // Amber
  ['#EF4444', '#DC2626'], // Red
  ['#06B6D4', '#0891B2'], // Cyan
  ['#84CC16', '#65A30D'], // Lime
  ['#F97316', '#EA580C'], // Orange
  ['#EC4899', '#DB2777'], // Pink
  ['#6366F1', '#4F46E5'], // Indigo
  ['#14B8A6', '#0D9488'], // Teal
  ['#A855F7', '#9333EA'], // Violet
  ['#64748B', '#475569'], // Slate
]

const CategoryGrid = ({ limit }) => {
  const categories = limit ? SERVICE_CATEGORIES.slice(0, limit) : SERVICE_CATEGORIES
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  })
  const [loadedAnimations, setLoadedAnimations] = useState({})
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Popular categories (for demo purposes)
  const popularIds = ['handyman', 'education', 'fitness']

  const handleAnimationLoad = (categoryId, animationData) => {
    setLoadedAnimations((prev) => ({ ...prev, [categoryId]: animationData }))
  }

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedCategory(null), 300)
  }

  return (
    <>
      <motion.div
        ref={ref}
        variants={fadeInUpStagger.container}
        initial="initial"
        animate={inView ? 'animate' : 'initial'}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
      >
        {categories.map((category, index) => {
        const [color1, color2] = gradientColors[index % gradientColors.length]
        const isPopular = popularIds.includes(category.id)
        
        return (
          <motion.div
            key={category.id}
            variants={fadeInUpStagger.item}
          >
          <motion.div
            variants={cardHoverLift}
            initial="rest"
            whileHover="hover"
            className="h-full"
            onClick={() => handleCategoryClick(category.id)}
          >
            <Card className="h-full cursor-pointer group relative overflow-hidden shadow-md hover:shadow-2xl transition-shadow duration-300">
                {/* Gradient background on hover */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${color1}, ${color2})`
                  }}
                />

                {/* Popular badge */}
                {isPopular && (
                  <div className="absolute top-2 right-2 z-10">
                    <motion.span
                      className="text-xs px-2 py-1 rounded-full text-white font-semibold"
                      style={{ 
                        background: `linear-gradient(135deg, ${color1}, ${color2})`
                      }}
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    >
                      Popular
                    </motion.span>
                  </div>
                )}

                <CardHeader className="text-center relative z-10">
                  <motion.div 
                    className="w-24 h-24 mx-auto rounded-2xl flex items-center justify-center mb-4 relative"
                    style={{ 
                      background: `linear-gradient(135deg, ${color1}10, ${color2}10)`
                    }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  >
                    {/* Icon glow effect */}
                    <div 
                      className="absolute inset-0 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity"
                      style={{ 
                        background: `linear-gradient(135deg, ${color1}, ${color2})`
                      }}
                    />
                    
                    {/* Lottie Animation */}
                    <div className="w-20 h-20">
                      <Lottie
                        animationData={loadedAnimations[category.id]}
                        path={category.animation}
                        loop={true}
                        autoplay={true}
                        onLoad={(data) => handleAnimationLoad(category.id, data)}
                        style={{
                          width: '100%',
                          height: '100%',
                        }}
                      />
                    </div>
                  </motion.div>

                  <CardTitle 
                    style={{ fontFamily: 'var(--font-family-poppins)' }} 
                    className="text-lg mb-2 group-hover:text-[var(--color-primary)] transition-colors"
                  >
                    {category.name}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {category.description}
                  </CardDescription>

                  {category.subcategoryCount > 0 && (
                    <div className="mt-3">
                      <span 
                        className="text-xs px-3 py-1 rounded-full font-medium"
                        style={{ 
                          backgroundColor: `${color1}15`,
                          color: color1,
                        }}
                      >
                        {category.subcategoryCount}+ Services
                      </span>
                    </div>
                  )}
                </CardHeader>
              </Card>
            </motion.div>
          </motion.div>
        )
      })}
      </motion.div>

      {/* Category Modal */}
      {selectedCategory && (
        <CategoryModal
          categoryId={selectedCategory}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </>
  )
}

export default CategoryGrid

