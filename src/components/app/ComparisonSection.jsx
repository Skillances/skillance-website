import { motion } from 'framer-motion'
import { X, Check, AlertCircle, Shield, CreditCard, Star, MapPin } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { useInView } from 'react-intersection-observer'
import { slideInFromLeft, slideInFromRight } from '@/utils/animations'

const beforePoints = [
  { icon: AlertCircle, text: 'Endless searching through classifieds', color: '#EF4444' },
  { icon: X, text: 'No way to verify freelancers', color: '#EF4444' },
  { icon: AlertCircle, text: 'Unsafe payment methods', color: '#EF4444' },
  { icon: X, text: 'No accountability or reviews', color: '#EF4444' },
]

const afterPoints = [
  { icon: Check, text: 'Find verified freelancers instantly', color: '#10B981' },
  { icon: Shield, text: 'ID-verified professionals', color: '#10B981' },
  { icon: CreditCard, text: 'Secure in-app payments', color: '#10B981' },
  { icon: Star, text: 'Verified reviews & ratings', color: '#10B981' },
]

const comparisonTable = [
  {
    feature: 'ID Verification',
    skillance: true,
    wordOfMouth: false,
    classifieds: false,
    otherApps: 'Some',
  },
  {
    feature: 'Location-Based Matching',
    skillance: true,
    wordOfMouth: false,
    classifieds: false,
    otherApps: 'Limited',
  },
  {
    feature: 'Secure Payments',
    skillance: true,
    wordOfMouth: false,
    classifieds: false,
    otherApps: true,
  },
  {
    feature: 'Reviews & Ratings',
    skillance: true,
    wordOfMouth: false,
    classifieds: false,
    otherApps: true,
  },
  {
    feature: '13+ Service Categories',
    skillance: true,
    wordOfMouth: false,
    classifieds: 'Limited',
    otherApps: 'Varies',
  },
  {
    feature: 'Real-Time Chat',
    skillance: true,
    wordOfMouth: false,
    classifieds: false,
    otherApps: 'Some',
  },
]

const ComparisonSection = () => {
  const { ref: refBefore, inView: inViewBefore } = useInView({
    threshold: 0.2,
    triggerOnce: true,
  })

  const { ref: refTable, inView: inViewTable } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  })

  return (
    <div className="py-20">
      <div className="container mx-auto container-padding max-w-7xl">
        {/* Before/After Comparison */}
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
            The Skillance Difference
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            See how Skillance transforms the way you find and hire freelancers
          </p>
        </motion.div>

        <div ref={refBefore} className="grid md:grid-cols-2 gap-8 mb-20">
          {/* Before */}
          <motion.div
            variants={slideInFromLeft}
            initial="initial"
            animate={inViewBefore ? "animate" : "initial"}
          >
            <Card className="p-8 h-full border-2 border-red-100 bg-gradient-to-br from-red-50 to-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <X size={24} className="text-red-500" />
                </div>
                <h3 
                  style={{ fontFamily: 'var(--font-family-poppins)' }} 
                  className="text-2xl font-bold text-red-900"
                >
                  Before Skillance
                </h3>
              </div>

              <div className="space-y-4">
                {beforePoints.map((point, index) => {
                  const Icon = point.icon
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={inViewBefore ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon size={14} style={{ color: point.color }} />
                      </div>
                      <p className="text-gray-700">{point.text}</p>
                    </motion.div>
                  )
                })}
              </div>
            </Card>
          </motion.div>

          {/* After */}
          <motion.div
            variants={slideInFromRight}
            initial="initial"
            animate={inViewBefore ? "animate" : "initial"}
          >
            <Card className="p-8 h-full border-2 border-green-100 bg-gradient-to-br from-green-50 to-white relative overflow-hidden">
              {/* Sparkle effect */}
              <div className="absolute top-4 right-4 text-6xl opacity-10">✨</div>

              <div className="flex items-center gap-3 mb-6">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'var(--color-section-primary)' }}
                >
                  <Check size={24} className="text-white" />
                </div>
                <h3 
                  style={{ fontFamily: 'var(--font-family-poppins)' }} 
                  className="text-2xl font-bold text-green-900"
                >
                  With Skillance
                </h3>
              </div>

              <div className="space-y-4">
                {afterPoints.map((point, index) => {
                  const Icon = point.icon
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={inViewBefore ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon size={14} style={{ color: point.color }} />
                      </div>
                      <p className="text-gray-700 font-medium">{point.text}</p>
                    </motion.div>
                  )
                })}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Comparison Table */}
        <div ref={refTable}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inViewTable ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h3 
              style={{ fontFamily: 'var(--font-family-poppins)' }} 
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Why Choose Skillance?
            </h3>
            <p className="text-lg text-text-secondary">
              Compare us to traditional methods
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inViewTable ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="p-4 text-left">
                        <span 
                          style={{ fontFamily: 'var(--font-family-poppins)' }} 
                          className="text-sm font-semibold"
                        >
                          Feature
                        </span>
                      </th>
                      <th className="p-4 text-center" style={{ backgroundColor: 'var(--color-section-primary)', opacity: 0.1 }}>
                        <span 
                          style={{ 
                            fontFamily: 'var(--font-family-poppins)',
                            color: 'var(--color-section-primary)',
                          }} 
                          className="text-sm font-bold"
                        >
                          Skillance
                        </span>
                      </th>
                      <th className="p-4 text-center">
                        <span 
                          style={{ fontFamily: 'var(--font-family-poppins)' }} 
                          className="text-sm font-semibold text-gray-600"
                        >
                          Word of Mouth
                        </span>
                      </th>
                      <th className="p-4 text-center">
                        <span 
                          style={{ fontFamily: 'var(--font-family-poppins)' }} 
                          className="text-sm font-semibold text-gray-600"
                        >
                          Classified Ads
                        </span>
                      </th>
                      <th className="p-4 text-center">
                        <span 
                          style={{ fontFamily: 'var(--font-family-poppins)' }} 
                          className="text-sm font-semibold text-gray-600"
                        >
                          Other Apps
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonTable.map((row, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={inViewTable ? { opacity: 1, x: 0 } : {}}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-gray-100"
                      >
                        <td className="p-4 font-medium text-gray-700">{row.feature}</td>
                        <td className="p-4 text-center" style={{ backgroundColor: 'var(--color-section-primary)', opacity: 0.05 }}>
                          {row.skillance === true ? (
                            <Check size={20} className="inline" style={{ color: 'var(--color-section-primary)' }} />
                          ) : (
                            <span className="text-gray-400">{row.skillance}</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {row.wordOfMouth === false ? (
                            <X size={20} className="inline text-gray-300" />
                          ) : (
                            <span className="text-gray-600">{row.wordOfMouth}</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {row.classifieds === false ? (
                            <X size={20} className="inline text-gray-300" />
                          ) : (
                            <span className="text-gray-600">{row.classifieds}</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {row.otherApps === true ? (
                            <Check size={20} className="inline text-gray-400" />
                          ) : (
                            <span className="text-gray-600">{row.otherApps}</span>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ComparisonSection

