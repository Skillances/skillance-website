import { motion } from 'framer-motion'
import { Image, Video, FileImage } from 'lucide-react'

/**
 * GlassPlaceholder - Clear placeholder for future glass assets
 * Shows asset type, role, and motion intent
 */
const GlassPlaceholder = ({
  label,
  assetType = 'image', // 'image', 'gif', 'svg'
  role = 'icon', // 'icon', 'illustration', 'background', 'decorative'
  motionIntent = 'static', // 'static', 'float', 'parallax-slow', 'parallax-fast'
  size = 'medium',
  icon: Icon,
  className = '',
  style = {},
}) => {
  const sizeClasses = {
    small: 'w-20 h-20 text-xs',
    medium: 'w-28 h-28 text-sm',
    large: 'w-36 h-36 text-base',
    xl: 'w-48 h-48 text-lg',
    xxl: 'w-64 h-64 text-xl',
  }

  const iconSizes = {
    small: 24,
    medium: 32,
    large: 40,
    xl: 48,
    xxl: 64,
  }

  const assetTypeIcons = {
    image: Image,
    gif: Video,
    svg: FileImage,
  }

  const AssetIcon = assetTypeIcons[assetType] || Image

  // Motion intent visual indicator
  const getMotionIndicator = () => {
    switch (motionIntent) {
      case 'float':
        return '↑↓ Float'
      case 'parallax-slow':
        return '→ Slow'
      case 'parallax-fast':
        return '→→ Fast'
      default:
        return '● Static'
    }
  }

  return (
    <motion.div
      className={`glass-placeholder ${sizeClasses[size]} ${className}`}
      style={style}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      {/* Asset Type Icon */}
      <div className="mb-2" style={{ color: 'var(--color-section-primary)', opacity: 0.8 }}>
        {Icon ? (
          <Icon size={iconSizes[size]} />
        ) : (
          <AssetIcon size={iconSizes[size]} />
        )}
      </div>

      {/* Label */}
      {label && (
        <span className="glass-placeholder-label mb-1">
          {label}
        </span>
      )}

      {/* Asset Type Badge */}
      <div className="text-[10px] font-medium text-text-secondary uppercase tracking-wide mb-1">
        {assetType.toUpperCase()}
      </div>

      {/* Role Badge */}
      <div className="text-[10px] font-medium text-text-tertiary uppercase tracking-wide mb-1">
        {role}
      </div>

      {/* Motion Intent Indicator */}
      <div className="text-[9px] font-semibold text-[var(--color-section-primary)] opacity-70">
        {getMotionIndicator()}
      </div>
    </motion.div>
  )
}

export default GlassPlaceholder
