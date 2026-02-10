import { useState } from 'react'
import Lottie from 'lottie-react'
import { useInView } from 'react-intersection-observer'
import { motion } from 'framer-motion'

/**
 * CategoryLottieSymbol - Lottie animation for category icons
 * Lazy loads when in viewport
 */
const CategoryLottieSymbol = ({
  category,
  size = 100,
  className = '',
  style = {},
  loop = true,
}) => {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
    rootMargin: '50px',
  })
  const [animationData, setAnimationData] = useState(null)

  return (
    <motion.div
      ref={ref}
      className={`relative ${className}`}
      style={{ width: size, height: size, ...style }}
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {inView && category?.animation ? (
        <Lottie
          animationData={animationData}
          path={category.animation}
          loop={loop}
          autoplay={true}
          onLoad={(data) => setAnimationData(data)}
          style={{ width: '100%', height: '100%' }}
        />
      ) : (
        <div className="w-full h-full bg-gray-100 rounded-full animate-pulse opacity-50" />
      )}
    </motion.div>
  )
}

export default CategoryLottieSymbol
