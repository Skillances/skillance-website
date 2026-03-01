import { memo, useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Lottie from 'lottie-react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { SERVICE_CATEGORIES } from '@/utils/appConstants'
import { useInView } from 'react-intersection-observer'
import { fadeInUpStagger } from '@/utils/animations'
import CategoryModal from './CategoryModal'

const gradientColors = [
  ['#3B82F6', '#2563EB'],
  ['#8B5CF6', '#7C3AED'],
  ['#10B981', '#059669'],
  ['#F59E0B', '#D97706'],
  ['#EF4444', '#DC2626'],
  ['#06B6D4', '#0891B2'],
  ['#84CC16', '#65A30D'],
  ['#F97316', '#EA580C'],
  ['#EC4899', '#DB2777'],
  ['#6366F1', '#4F46E5'],
  ['#14B8A6', '#0D9488'],
  ['#A855F7', '#9333EA'],
  ['#64748B', '#475569'],
]

// Lottie only mounts when in view; once in view we keep it mounted so scroll doesn't re-trigger load
const LazyLottieAnimation = memo(function LazyLottieAnimation({ animationPath }) {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
    rootMargin: '80px',
  })
  const [hasBeenInView, setHasBeenInView] = useState(false)

  useEffect(() => {
    if (inView) setHasBeenInView(true)
  }, [inView])

  const showLottie = hasBeenInView || inView

  return (
    <div ref={ref} className="w-16 h-16">
      {showLottie ? (
        <Lottie
          path={animationPath}
          loop={true}
          autoplay={true}
          renderer="canvas"
          style={{ width: '100%', height: '100%' }}
        />
      ) : (
        <div className="w-full h-full bg-gray-100 rounded-lg animate-pulse" aria-hidden />
      )}
    </div>
  )
})

const CategoryCard = memo(function CategoryCard({
  category,
  index,
  isPopular,
  onClick,
}) {
  const [color1, color2] = gradientColors[index % gradientColors.length]

  return (
    <motion.div variants={fadeInUpStagger.item} className="h-full">
      <div onClick={() => onClick(category.id)} className="h-full cursor-pointer" role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onClick(category.id)}>
        <Card className="h-full relative overflow-hidden border border-gray-100 bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500"
            style={{ backgroundImage: `linear-gradient(135deg, ${color1}, ${color2})` }}
            aria-hidden
          />
          {isPopular && (
            <div className="absolute top-3 right-3 z-20">
              <span
                className="text-[10px] px-2 py-1 rounded-full text-white font-bold tracking-wide uppercase shadow-sm"
                style={{ background: `linear-gradient(135deg, ${color1}, ${color2})` }}
              >
                Popular
              </span>
            </div>
          )}
          <CardHeader className="text-center relative z-10 p-6 flex flex-col h-full">
            <div
              className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-4 relative"
              style={{ background: `linear-gradient(135deg, ${color1}15, ${color2}15)` }}
            >
              <LazyLottieAnimation animationPath={category.animation} />
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
                  style={{ backgroundColor: `${color1}10`, color: color1 }}
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
})

const CategoryGrid = ({ limit }) => {
  const categories = limit ? SERVICE_CATEGORIES.slice(0, limit) : SERVICE_CATEGORIES
  const { ref, inView } = useInView({
    threshold: 0.08,
    triggerOnce: true,
    rootMargin: '60px',
  })
  const [hasAnimated, setHasAnimated] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    if (inView) setHasAnimated(true)
  }, [inView])

  const popularIds = ['handyman', 'education', 'fitness']

  const handleCategoryClick = useCallback((categoryId) => {
    setSelectedCategory(categoryId)
    setIsModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedCategory(null), 300)
  }, [])

  return (
    <>
      <motion.div
        ref={ref}
        variants={fadeInUpStagger.container}
        initial="initial"
        animate={hasAnimated ? 'animate' : 'initial'}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
      >
        {categories.map((category, index) => (
          <CategoryCard
            key={category.id}
            category={category}
            index={index}
            isPopular={popularIds.includes(category.id)}
            onClick={handleCategoryClick}
          />
        ))}
      </motion.div>
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
