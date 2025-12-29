import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import Lottie from 'lottie-react'
import { Card } from '@/components/ui/card'
import { CATEGORY_HIERARCHY } from '@/utils/categoriesData'
import { useState } from 'react'

const CategoryModal = ({ categoryId, isOpen, onClose }) => {
  const category = CATEGORY_HIERARCHY[categoryId]
  const [loadedAnimation, setLoadedAnimation] = useState(null)

  if (!category) return null

  const gradientColors = [
    ['#3B82F6', '#2563EB'], // Blue
    ['#8B5CF6', '#7C3AED'], // Purple
    ['#10B981', '#059669'], // Green
  ]
  const [color1, color2] = gradientColors[0]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[101] overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="relative w-full max-w-4xl"
                onClick={(e) => e.stopPropagation()}
              >
                <Card className="bg-white shadow-2xl overflow-hidden">
                  {/* Header */}
                  <div 
                    className="relative p-8 text-white"
                    style={{ background: `linear-gradient(135deg, ${color1}, ${color2})` }}
                  >
                    <button
                      onClick={onClose}
                      className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                      <X size={24} />
                    </button>

                    <div className="flex items-center gap-6">
                      {/* Animation */}
                      <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <div className="w-20 h-20">
                          <Lottie
                            animationData={loadedAnimation}
                            path={category.animation}
                            loop={true}
                            autoplay={true}
                            onLoad={(data) => setLoadedAnimation(data)}
                          />
                        </div>
                      </div>

                      <div>
                        <h2 
                          style={{ fontFamily: 'var(--font-family-poppins)' }}
                          className="text-3xl font-bold mb-2"
                        >
                          {category.name}
                        </h2>
                        <p className="text-white/90 text-lg">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8 max-h-[60vh] overflow-y-auto">
                    <h3 
                      style={{ fontFamily: 'var(--font-family-poppins)' }}
                      className="text-xl font-bold mb-6"
                    >
                      Available Services
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4">
                      {category.subcategories?.map((sub, index) => (
                        <motion.div
                          key={sub.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <div className="p-4 rounded-lg border border-border hover:border-primary hover:shadow-md transition-all cursor-pointer">
                            <div className="flex items-start gap-3">
                              <div 
                                className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                                style={{ backgroundColor: color1 }}
                              />
                              <div className="flex-1">
                                <div 
                                  style={{ fontFamily: 'var(--font-family-poppins)' }}
                                  className="font-semibold mb-1"
                                >
                                  {sub.name}
                                </div>
                                {sub.subcategories && (
                                  <div className="text-sm text-text-secondary">
                                    {sub.subcategories.length} specializations
                                  </div>
                                )}
                                {sub.grades && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {sub.grades.slice(0, 3).map((grade, i) => (
                                      <span
                                        key={i}
                                        className="text-xs px-2 py-1 rounded-full"
                                        style={{
                                          backgroundColor: `${color1}15`,
                                          color: color1,
                                        }}
                                      >
                                        {grade}
                                      </span>
                                    ))}
                                    {sub.grades.length > 3 && (
                                      <span className="text-xs text-text-secondary px-2 py-1">
                                        +{sub.grades.length - 3} more
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Coming Soon Badge */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="mt-8 p-6 rounded-lg text-center"
                      style={{ backgroundColor: `${color1}10` }}
                    >
                      <p className="text-lg font-semibold mb-2" style={{ color: color1 }}>
                        Coming Soon!
                      </p>
                      <p className="text-sm text-text-secondary">
                        These services will be available when Skillance launches on iOS & Android
                      </p>
                    </motion.div>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

export default CategoryModal

