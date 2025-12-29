import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { interactiveFeatures } from '@/utils/appFeatures'
import { Smartphone } from 'lucide-react'
import { Card } from '@/components/ui/card'

const featureKeys = Object.keys(interactiveFeatures)

const InteractiveDemo = () => {
  const [activeFeature, setActiveFeature] = useState(featureKeys[0])
  const currentFeature = interactiveFeatures[activeFeature]

  return (
    <div className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto container-padding max-w-7xl">
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
            Explore the Features
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Click through different app screens to see what makes Skillance special
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-12 items-center">
          {/* Feature tabs (left side) */}
          <div className="space-y-3">
            {featureKeys.map((key, index) => {
              const feature = interactiveFeatures[key]
              const isActive = activeFeature === key
              
              return (
                <motion.button
                  key={key}
                  onClick={() => setActiveFeature(key)}
                  className={`w-full text-left p-4 rounded-lg transition-all ${
                    isActive ? 'shadow-lg' : 'hover:shadow-md'
                  }`}
                  style={{
                    backgroundColor: isActive ? 'var(--color-section-primary)' : 'white',
                    color: isActive ? 'white' : 'inherit',
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <h3 
                    style={{ fontFamily: 'var(--font-family-poppins)' }} 
                    className="font-bold mb-1"
                  >
                    {feature.title}
                  </h3>
                  <p className={`text-sm ${isActive ? 'text-white/90' : 'text-text-secondary'}`}>
                    {feature.description}
                  </p>
                </motion.button>
              )
            })}
          </div>

          {/* Phone mockup (center) */}
          <div className="flex justify-center">
            <div className="relative">
              {/* Phone frame */}
              <div 
                className="relative rounded-[40px] border-[14px] border-gray-800 overflow-hidden shadow-2xl"
                style={{
                  width: '300px',
                  height: '600px',
                }}
              >
                {/* Phone notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-2xl z-10" />

                {/* Screen content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeFeature}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full flex items-center justify-center relative"
                    style={{ backgroundColor: currentFeature.screenColor }}
                  >
                    {/* App Icon */}
                    <div className="absolute inset-0 flex items-center justify-center p-8">
                      <motion.img
                        src="/app_icon.png"
                        alt="Skillance App"
                        className="w-32 h-32 object-contain opacity-80"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>

                    {/* Hotspots */}
                    {currentFeature.hotspots.map((hotspot, index) => (
                      <motion.div
                        key={index}
                        className="absolute group"
                        style={{
                          left: `${hotspot.x}%`,
                          top: `${hotspot.y}%`,
                          transform: 'translate(-50%, -50%)',
                        }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.3 }}
                      >
                        <motion.div
                          className="w-8 h-8 rounded-full cursor-pointer relative"
                          style={{ backgroundColor: 'var(--color-section-primary)' }}
                          whileHover={{ scale: 1.2 }}
                          animate={{
                            scale: [1, 1.1, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: index * 0.2,
                          }}
                        >
                          {/* Pulse ring */}
                          <div 
                            className="absolute inset-0 rounded-full animate-ping"
                            style={{ backgroundColor: 'var(--color-section-primary)', opacity: 0.3 }}
                          />
                        </motion.div>

                        {/* Tooltip */}
                        <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                          <div className="glass-card px-3 py-2 rounded-lg shadow-lg">
                            <p className="text-sm font-medium">{hotspot.label}</p>
                            <p className="text-xs text-text-secondary">{hotspot.detail}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Feature details (right side) */}
          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeature}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="p-6">
                  <h3 
                    style={{ fontFamily: 'var(--font-family-poppins)' }} 
                    className="text-2xl font-bold mb-4"
                  >
                    {currentFeature.title}
                  </h3>
                  <p className="text-text-secondary mb-6">
                    {currentFeature.description}
                  </p>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm uppercase text-gray-500">Key Points:</h4>
                    {currentFeature.hotspots.map((hotspot, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <div 
                          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-white text-xs font-bold"
                          style={{ backgroundColor: 'var(--color-section-primary)' }}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{hotspot.label}</p>
                          <p className="text-xs text-text-secondary">{hotspot.detail}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InteractiveDemo

