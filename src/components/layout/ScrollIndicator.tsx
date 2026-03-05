import { useEffect, useState, useRef } from 'react';

const ScrollIndicator = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isIdle, setIsIdle] = useState(false);
  const idleTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      // Calculate scroll progress
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrolled = window.scrollY;
      const scrollProgress = documentHeight > 0 ? (scrolled / documentHeight) * 100 : 0;
      
      setScrollProgress(scrollProgress);
      setIsIdle(false);

      // Clear existing timeout
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }

      // Set idle state after 5 seconds of no scrolling
      idleTimeoutRef.current = window.setTimeout(() => {
        setIsIdle(true);
      }, 5000);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
    };
  }, []);

  // Calculate opacity - hidden at start and end, visible in between
  const opacity = (scrollProgress > 5 && scrollProgress < 95) ? 0.5 : 0;

  return (
    <div 
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-opacity duration-500"
      style={{ opacity }}
    >
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs uppercase tracking-widest text-neutral-400">Scroll</span>
        <div className="w-px h-12 bg-neutral-400 relative overflow-hidden">
          <div 
            className={`absolute left-0 w-full h-4 bg-black opacity-70 ${isIdle ? 'animate-bounce' : ''}`}
            style={{
              top: `calc(${scrollProgress}% * (100% - 33.33%))`,
              transition: isIdle ? 'none' : 'top 0.3s ease-out'
            }}
          />
        </div>
        <div className="text-xs text-neutral-500 mt-1">
          {Math.round(scrollProgress)}%
        </div>
      </div>
    </div>
  );
};

export default ScrollIndicator;
