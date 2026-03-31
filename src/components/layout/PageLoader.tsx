import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HandWrittenTitle } from '../ui/hand-writing-text';

interface PageLoaderProps {
  onComplete: () => void;
}

const PageLoader = ({ onComplete }: PageLoaderProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false); // New state to control exit animation

  useEffect(() => {
    // Check if we've already shown the loader in this session
    const hasLoaded = sessionStorage.getItem('skillance_loaded');
    
    if (hasLoaded) {
      onComplete();
      setIsVisible(false); // Immediate hide if loaded
      return;
    }

    // Timer to signal completion after the handwriting animation has run
    const timer = setTimeout(() => {
      // Mark as loaded for this session ONLY AFTER the first time it fully finishes
      sessionStorage.setItem('skillance_loaded', 'true');
      setIsExiting(true);
    }, 2800);

    return () => {
      clearTimeout(timer);
    }
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && !isExiting && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onAnimationComplete={() => {
            onComplete();
            setIsVisible(false);
          }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[105] bg-white flex items-center justify-center overflow-hidden"
        >
          <div className="w-full max-w-2xl px-8">
            <HandWrittenTitle 
              title="Skillance" 
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PageLoader;
