import { motion } from 'framer-motion'
import Lottie from 'lottie-react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { SERVICE_CATEGORIES } from '@/utils/appConstants'
import { useInView } from 'react-intersection-observer'
import { fadeInUpStagger } from '@/utils/animations'
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
              className="h-full"
            >
              <div 
                onClick={() => handleCategoryClick(category.id)}
                className="h-full cursor-pointer"
              >
                <Card 
                  className="h-full relative overflow-hidden border border-gray-100 bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                >

                      {/* Animated Gradient Background on Hover */}
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 bg-linear-to-br"
                        style={{
                          backgroundImage: `linear-gradient(135deg, ${color1}, ${color2})`
                        }}
                      />

                      {/* Popular badge */}
                      {isPopular && (
                        <div className="absolute top-3 right-3 z-20">
                          <motion.span
                            className="text-[10px] px-2 py-1 rounded-full text-white font-bold tracking-wide uppercase shadow-sm"
                            style={{ 
                              background: `linear-gradient(135deg, ${color1}, ${color2})`
                            }}
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            Popular
                          </motion.span>
                        </div>
                      )}

                      <CardHeader className="text-center relative z-10 p-6 flex flex-col h-full">
                        <div 
                          className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-4 relative"
                          style={{ 
                            background: `linear-gradient(135deg, ${color1}15, ${color2}15)`
                          }}
                        >
                          {/* Lottie Animation */}
                          <div className="w-16 h-16">
                            <Lottie
                              animationData={loadedAnimations[category.id]}
                              path={category.animation}
                              loop={true}
                              autoplay={true}
                              onLoad={(data) => handleAnimationLoad(category.id, data)}
                              style={{ width: '100%', height: '100%' }}
                            />
                          </div>
                        </div>

                        <CardTitle 
                          style={{ fontFamily: 'var(--font-family-poppins)' }} 
                          className="text-lg font-bold mb-2 transition-colors group-hover:text-(--color-section-primary)"
                        >
                          {category.name}
                        </CardTitle>
                        
                        <CardDescription className="text-sm text-text-secondary line-clamp-2 mb-4 grow">
                          {category.description}
                        </CardDescription>

                        {category.subcategoryCount > 0 && (
                          <div className="mt-auto pt-2">
                            <span 
                              className="text-xs font-semibold px-3 py-1 rounded-full inline-block transition-colors"
                              style={{ 
                                backgroundColor: `${color1}10`,
                                color: color1,
                              }}
                            >
                              {category.subcategoryCount}+ Services
                            </span>
                          </div>
                        )}
                      </CardHeader>
                    </Card>
              </div>
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
