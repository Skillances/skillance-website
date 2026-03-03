import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const ScrollIndicator = () => {
  const indicatorRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      // Don't show on hero section (first screen)
      const isAtHeroSection = window.scrollY < window.innerHeight * 0.8;
      
      if (isAtHeroSection) {
        if (indicatorRef.current) {
          gsap.to(indicatorRef.current, {
            opacity: 0,
            y: 20,
            duration: 0.2,
            ease: 'power3.in'
          });
        }
        return;
      }
      
      // Hide indicator on scroll
      if (indicatorRef.current) {
        gsap.to(indicatorRef.current, {
          opacity: 0,
          y: 20,
          duration: 0.2,
          ease: 'power3.in'
        });
      }
      
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Show indicator after idle period (faster - 2 seconds instead of 3)
      timeoutRef.current = setTimeout(showIndicator, 2000);
    };

    const showIndicator = () => {
      const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100;
      
      // Don't show on hero section
      const isAtHeroSection = window.scrollY < window.innerHeight * 0.8;
      
      if (!isAtBottom && !isAtHeroSection && indicatorRef.current) {
        gsap.to(indicatorRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: 'power3.out'
        });
      }
    };

    // Initial setup
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    
    // Show indicator after initial load (but not on hero)
    timeoutRef.current = setTimeout(showIndicator, 3000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={indicatorRef} 
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 opacity-0 transform translate-y-5 pointer-events-none"
    >
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs uppercase tracking-widest text-neutral-500">Scroll</span>
        <div className="w-px h-12 bg-neutral-300 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-4 bg-neutral-500 animate-bounce" />
        </div>
      </div>
    </div>
  );
};

export default ScrollIndicator;
