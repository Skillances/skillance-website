/**
 * Parallax Configuration
 * Defines speeds and offsets for depth layers
 * Following Duolingo motion principles: slow backgrounds, faster foregrounds
 */

// Parallax speeds for depth layers
export const PARALLAX_SPEEDS = {
  // Background layers - slowest
  BACKGROUND_SLOWEST: 0.05,
  BACKGROUND_SLOW: 0.1,
  BACKGROUND_MEDIUM: 0.15,
  
  // Mid environment layers
  MID_SLOW: 0.2,
  MID_MEDIUM: 0.3,
  
  // Sticky anchor layers
  ANCHOR_MEDIUM: 0.4,
  
  // Foreground layers - fastest
  FOREGROUND_SLOW: 0.5,
  FOREGROUND_MEDIUM: 0.6,
  FOREGROUND_FAST: 0.7,
  
  // Static (no parallax)
  STATIC: 0,
}

// Scene offsets (each scene is 1 page)
export const SCENE_OFFSETS = {
  HERO: 0,
  SERVICES: 1,
  HOW_IT_WORKS: 2,
  TRUST: 3,
  BENEFITS: 4,
  CTA: 5,
}

// Total number of parallax pages
export const SCENE_PAGES = 5

// Device detection
export const isMobile = () => {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
}

export const isTablet = () => {
  if (typeof window === 'undefined') return false
  return window.innerWidth >= 768 && window.innerWidth < 1024
}

// Reduced motion preference
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
