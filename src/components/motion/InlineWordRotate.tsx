import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { EASE_OUT } from '@/lib/motion';

type InlineWordRotateProps = {
  words: string[];
  className?: string;
  /** Pause rotation when this element leaves the viewport. */
  observeRootId?: string;
};

export default function InlineWordRotate({
  words,
  className = 'italic text-center w-full block',
  observeRootId,
}: InlineWordRotateProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion || paused || words.length < 2) return;
    const interval = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2800);
    return () => window.clearInterval(interval);
  }, [words, reducedMotion, paused]);

  useEffect(() => {
    if (reducedMotion || !observeRootId) return;
    const root = document.getElementById(observeRootId);
    if (!root) return;
    const observer = new IntersectionObserver(
      ([entry]) => setPaused(!entry.isIntersecting),
      { threshold: 0.15 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, [observeRootId, reducedMotion]);

  if (reducedMotion) {
    return <span className={className}>{words[0]}</span>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={words[index]}
        initial={{ opacity: 0, transform: 'translateY(6px)' }}
        animate={{ opacity: 1, transform: 'translateY(0)' }}
        exit={{ opacity: 0, transform: 'translateY(-4px)' }}
        transition={{ duration: 0.28, ease: EASE_OUT }}
        className={className}
      >
        {words[index]}
      </motion.span>
    </AnimatePresence>
  );
}
