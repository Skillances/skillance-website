import { motion } from 'framer-motion'

const PageHeader = ({ title, subtitle, breadcrumb = [] }) => {
  return (
    <div className="bg-surface-variant py-12 sm:py-16 md:py-20">
      <div className="container mx-auto container-padding max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          {breadcrumb.length > 0 && (
            <nav className="mb-3 sm:mb-4 text-xs sm:text-sm text-text-secondary">
              {breadcrumb.map((item, index) => (
                <span key={index}>
                  {index > 0 && <span className="mx-1.5 sm:mx-2">/</span>}
                  <span>{item}</span>
                </span>
              ))}
            </nav>
          )}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 px-4">
            {title}
          </h1>
          {subtitle && (
            <p className="text-base sm:text-lg md:text-xl text-text-secondary px-4">
              {subtitle}
            </p>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default PageHeader
