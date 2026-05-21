import { motion } from 'framer-motion';
import { EASE_OUT } from '@/lib/motion';

interface PageTransitionProps {
  children: React.ReactNode;
  /** Unique key that triggers the animation — use the route pathname */
  routeKey: string;
}

const enter = { opacity: 0, transform: 'translateY(24px)' };
const center = { opacity: 1, transform: 'translateY(0)' };
const exit = { opacity: 0, transform: 'translateY(-16px)' };

/**
 * Route transition — transform + opacity only (GPU-friendly).
 */
const PageTransition = ({ children, routeKey }: PageTransitionProps) => (
  <motion.div
    key={routeKey}
    initial={enter}
    animate={center}
    exit={exit}
    transition={{
      duration: 0.28,
      ease: EASE_OUT,
    }}
    style={{ willChange: 'opacity, transform' }}
  >
    {children}
  </motion.div>
);

export default PageTransition;
