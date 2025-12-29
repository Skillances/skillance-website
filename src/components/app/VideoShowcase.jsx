import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, X, Clock } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { videoPlaceholders } from '@/utils/appFeatures'
import { useInView } from 'react-intersection-observer'
import { slideInFromLeft, slideInFromRight } from '@/utils/animations'

const VideoShowcase = () => {
  const [selectedVideo, setSelectedVideo] = useState(null)
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  })

  return (
    <>
      <div ref={ref} className="container mx-auto container-padding max-w-7xl py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 
            style={{ fontFamily: 'var(--font-family-poppins)' }} 
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            See Skillance in Action
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Watch how easy it is to find freelancers, book services, and grow your business
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {videoPlaceholders.map((video, index) => {
            const isEven = index % 2 === 0
            
            return (
              <motion.div
                key={video.id}
                initial={isEven ? slideInFromLeft.initial : slideInFromRight.initial}
                animate={inView ? (isEven ? slideInFromLeft.animate : slideInFromRight.animate) : {}}
              >
                <Card 
                  className="group relative overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300"
                  onClick={() => setSelectedVideo(video)}
                >
                  {/* Video thumbnail placeholder */}
                  <div 
                    className="relative aspect-video overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${
                        index === 0 ? '#2563EB' : 
                        index === 1 ? '#7C3AED' : 
                        index === 2 ? '#10B981' : '#F59E0B'
                      }20, ${
                        index === 0 ? '#7C3AED' : 
                        index === 1 ? '#2563EB' : 
                        index === 2 ? '#06B6D4' : '#EF4444'
                      }20)`
                    }}
                  >
                    {/* Play button overlay */}
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors"
                      whileHover={{ scale: 1.05 }}
                    >
                      <motion.div
                        className="w-20 h-20 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: 'var(--color-section-primary)' }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Play size={32} fill="white" />
                      </motion.div>
                    </motion.div>

                    {/* Duration badge */}
                    <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 rounded-full bg-black/60 text-white text-sm">
                      <Clock size={14} />
                      <span>{video.duration}</span>
                    </div>

                    {/* App icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img 
                        src="/app_icon.png" 
                        alt="Skillance App" 
                        className="w-24 h-24 object-contain opacity-20"
                      />
                    </div>
                  </div>

                  {/* Video info */}
                  <div className="p-6">
                    <div className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-3"
                      style={{ 
                        backgroundColor: 'var(--color-section-primary)',
                        color: 'white',
                        opacity: 0.9,
                      }}
                    >
                      {video.category}
                    </div>
                    <h3 
                      style={{ fontFamily: 'var(--font-family-poppins)' }} 
                      className="text-xl font-bold mb-2 group-hover:text-[var(--color-section-primary)] transition-colors"
                    >
                      {video.title}
                    </h3>
                    <p className="text-text-secondary text-sm">
                      {video.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
              >
                <X size={24} />
              </button>

              {/* Video placeholder */}
              <div className="aspect-video bg-gray-900 flex items-center justify-center">
                <div className="text-center text-white p-8">
                  <img 
                    src="/app_icon.png" 
                    alt="Skillance App" 
                    className="w-32 h-32 object-contain mx-auto mb-4 opacity-50"
                  />
                  <Play size={64} className="mx-auto mb-4 opacity-50" />
                  <h3 className="text-2xl font-bold mb-2">{selectedVideo.title}</h3>
                  <p className="text-gray-300 mb-4">{selectedVideo.description}</p>
                  <p className="text-sm text-gray-400">
                    Video content will be added here
                  </p>
                </div>
              </div>

              {/* Video info */}
              <div className="p-6 bg-white">
                <h3 
                  style={{ fontFamily: 'var(--font-family-poppins)' }} 
                  className="text-2xl font-bold mb-2"
                >
                  {selectedVideo.title}
                </h3>
                <p className="text-text-secondary">
                  {selectedVideo.description}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default VideoShowcase

