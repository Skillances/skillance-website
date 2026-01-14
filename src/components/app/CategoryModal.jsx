import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight } from 'lucide-react'
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
                      className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors z-10"
                    >
                      <X size={24} />
                    </button>

                    <div className="flex items-center gap-6">
                      {/* Animation */}
                      <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                        <div className="w-20 h-20">
                          {isOpen ? (
                            <Lottie
                              animationData={loadedAnimation}
                              path={category.animation}
                              loop={true}
                              autoplay={true}
                              onLoad={(data) => setLoadedAnimation(data)}
                            />
                          ) : (
                            <div className="w-full h-full bg-white/10 rounded-lg animate-pulse" />
                          )}
                        </div>
                      </div>

                      <div className="flex-1">
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
                      className="text-xl font-bold mb-6 text-text-primary"
                    >
                      Available Services
                    </h3>

                    {/* Improved List Design */}
                    <div className="space-y-3">
                      {category.subcategories?.map((sub, index) => (
                        <motion.div
                          key={sub.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05, type: 'spring', stiffness: 100 }}
                          className="group relative"
                        >
                          <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/10">
                            <div className="p-5">
                              <div className="flex items-start gap-4">
                                {/* Colored indicator */}
                                <div 
                                  className="w-1.5 h-full min-h-[40px] rounded-full flex-shrink-0 mt-1 transition-all duration-300 group-hover:w-2"
                                  style={{ backgroundColor: color1 }}
                                />
                                
                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                      <h4 
                                        style={{ fontFamily: 'var(--font-family-poppins)' }}
                                        className="font-semibold text-lg mb-1.5 text-text-primary group-hover:text-primary transition-colors"
                                      >
                                        {sub.name}
                                      </h4>
                                      
                                      {sub.subcategories && (
                                        <p className="text-sm text-text-secondary mb-3">
                                          {sub.subcategories.length} {sub.subcategories.length === 1 ? 'specialization' : 'specializations'} available
                                        </p>
                                      )}
                                      
                                      {/* Grades/Tags */}
                                      {sub.grades && sub.grades.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                          {sub.grades.slice(0, 4).map((grade, i) => (
                                            <motion.span
                                              key={i}
                                              initial={{ opacity: 0, scale: 0.8 }}
                                              animate={{ opacity: 1, scale: 1 }}
                                              transition={{ delay: index * 0.05 + i * 0.02 }}
                                              className="text-xs font-medium px-3 py-1.5 rounded-full transition-all duration-300 group-hover:scale-105"
                                              style={{
                                                backgroundColor: `${color1}15`,
                                                color: color1,
                                              }}
                                            >
                                              {grade}
                                            </motion.span>
                                          ))}
                                          {sub.grades.length > 4 && (
                                            <span className="text-xs text-text-secondary px-3 py-1.5">
                                              +{sub.grades.length - 4} more
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                    
                                    {/* Chevron icon */}
                                    <ChevronRight 
                                      size={20} 
                                      className="text-text-secondary group-hover:text-primary group-hover:translate-x-1 transition-all duration-300 flex-shrink-0 mt-1"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Hover gradient overlay */}
                            <div 
                              className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none"
                              style={{
                                background: `linear-gradient(135deg, ${color1}, ${color2})`
                              }}
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Coming Soon Badge */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="mt-8 p-6 rounded-xl text-center border-2 border-dashed transition-all duration-300 hover:border-solid"
                      style={{ 
                        backgroundColor: `${color1}08`,
                        borderColor: `${color1}30`
                      }}
                    >
                      <p 
                        className="text-lg font-semibold mb-2"
                        style={{ color: color1 }}
                      >
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
