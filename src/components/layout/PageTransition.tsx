import { motion } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
  /** Unique key that triggers the animation — use the route pathname */
  routeKey: string;
}

/**
 * Fast vertical scroll-wipe transition — feels like the page instantly
 * scrolls away upward and the new one rushes in from below.
 * Enter: 320ms — new page slides up from +32px, fades in.
 * Exit:  160ms — current page slides out upward to -20px, fades out.
 * Both use the same expo-out curve so the rhythm is identical.
 * Only transform + opacity → no layout reflow, GPU-composited.
 */
const PageTransition = ({ children, routeKey }: PageTransitionProps) => (
  <motion.div
    key={routeKey}
    initial={{ opacity: 0, y: 32 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{
      duration: 0.32,
      ease: [0.22, 1, 0.36, 1],
    }}
    style={{ willChange: 'opacity, transform' }}
  >
    {children}
  </motion.div>
);

export default PageTransition;
