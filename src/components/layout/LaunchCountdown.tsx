import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';

const LaunchCountdown = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDarkSection, setIsDarkSection] = useState(true);
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      if (location.pathname !== '/') {
        setIsDarkSection(false);
        return;
      }

      const sections = [
        { id: 'home', dark: true },
        { id: 'mission', dark: false },
        { id: 'services', dark: false },
        { id: 'how-it-works', dark: false },
        { id: 'trust-safety', dark: true },
        { id: 'stats', dark: false },
        { id: 'testimonials', dark: true },
        { id: 'faq', dark: true },
        { id: 'reviews', dark: false },
        { id: 'cta', dark: false },
        { id: 'footer', dark: true },
      ];

      const isAtBottom = window.innerHeight + scrollY >= document.documentElement.scrollHeight - 50;
      
      if (isAtBottom) {
        setIsDarkSection(true);
      } else {
        const isMobile = window.innerWidth < 1024;
        const scrollThreshold = isMobile ? scrollY + 40 : scrollY + window.innerHeight - 100;
        
        for (const section of sections) {
          const el = document.getElementById(section.id);
          if (el) {
            const rect = el.getBoundingClientRect();
            const sectionTop = rect.top + scrollY;
            const sectionBottom = sectionTop + rect.height;
            
            if (scrollThreshold >= sectionTop && scrollThreshold < sectionBottom) {
              setIsDarkSection(section.dark);
              break;
            }
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [location.pathname]);

  useEffect(() => {
    const targetDate = new Date('2026-04-22T00:00:00').getTime();

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft(null);
      }
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft();

    return () => clearInterval(timer);
  }, []);

  const handleClick = () => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!timeLeft) return null;

  const bgColor = isDarkSection 
    ? 'rgba(255, 255, 255, 0.08)' 
    : 'rgba(0, 0, 0, 0.03)';
  const borderColor = isDarkSection ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)';
  const textColor = isDarkSection ? 'text-white' : 'text-black';
  const labelColor = isDarkSection ? 'text-white/40' : 'text-neutral-500';

  return (
    <AnimatePresence>
      <motion.button
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onClick={handleClick}
        className="fixed top-0 left-0 right-0 z-[60] lg:hidden bg-black text-white py-2 overflow-hidden active:scale-95 transition-transform"
      >
        <div className="flex items-center justify-center gap-4 text-[11px] font-medium tracking-[0.15em] uppercase px-4 whitespace-nowrap">
          <span className="opacity-60 text-[9px]">Launch:</span>
          <div className="flex items-center gap-2">
            <span>{timeLeft.days}D</span>
            <span className="opacity-20">/</span>
            <span>{timeLeft.hours.toString().padStart(2, '0')}H</span>
            <span className="opacity-20">/</span>
            <span>{timeLeft.minutes.toString().padStart(2, '0')}M</span>
          </div>
        </div>
      </motion.button>

      <motion.button
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        onClick={handleClick}
        className="fixed bottom-10 left-10 z-[55] hidden lg:block group active:scale-95 transition-transform"
      >
        <div 
          className="backdrop-blur-2xl border px-8 py-6 rounded-3xl transition-all duration-700 ease-in-out group-hover:bg-opacity-20"
          style={{ 
            backgroundColor: bgColor, 
            borderColor: borderColor,
            boxShadow: isDarkSection ? '0 20px 40px -20px rgba(0,0,0,0.5)' : '0 10px 30px -10px rgba(0,0,0,0.05)'
          }}
        >
          <div className="flex flex-col gap-1 capitalize">
            <span className={`text-[10px] uppercase tracking-[0.3em] font-medium ${labelColor} mb-2`}>
              Coming Socially
            </span>
            <ul className="flex items-baseline gap-6">
              <li className="flex flex-col items-center min-w-[3rem]">
                <span className={`font-serif text-3xl leading-none ${textColor}`}>{timeLeft.days}</span>
                <span className={`text-[9px] uppercase tracking-widest ${labelColor} mt-1`}>Days</span>
              </li>
              <span className={`opacity-20 font-light text-2xl ${textColor}`}>/</span>
              <li className="flex flex-col items-center min-w-[3rem]">
                <span className={`font-serif text-3xl leading-none ${textColor}`}>{timeLeft.hours.toString().padStart(2, '0')}</span>
                <span className={`text-[9px] uppercase tracking-widest ${labelColor} mt-1`}>Hrs</span>
              </li>
              <span className={`opacity-20 font-light text-2xl ${textColor}`}>/</span>
              <li className="flex flex-col items-center min-w-[3rem]">
                <span className={`font-serif text-3xl leading-none ${textColor}`}>{timeLeft.minutes.toString().padStart(2, '0')}</span>
                <span className={`text-[9px] uppercase tracking-widest ${labelColor} mt-1`}>Min</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.button>
    </AnimatePresence>
  );
};

export default LaunchCountdown;
