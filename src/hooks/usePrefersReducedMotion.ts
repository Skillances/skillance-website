import { useEffect, useState } from 'react';
import { getPrefersReducedMotion } from '@/lib/motion';

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(getPrefersReducedMotion);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
