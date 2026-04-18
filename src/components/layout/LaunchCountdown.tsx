import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';

const LaunchCountdown = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
  } | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      // Logic for top bar visibility if needed
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
    const targetDate = new Date('2026-06-01T00:00:00').getTime();

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
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

  return (
    <AnimatePresence>
      <motion.button
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onClick={handleClick}
        className="fixed top-0 left-0 right-0 z-[60] bg-black text-white h-8 flex items-center justify-center overflow-hidden active:scale-95 transition-transform"
      >
        <div className="flex items-center justify-center gap-6 text-[11px] font-medium tracking-[0.15em] uppercase px-4 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <span className="opacity-60 text-[9px]">Launch:</span>
            <span>{timeLeft.days}D</span>
            <span className="opacity-20">/</span>
            <span>{timeLeft.hours.toString().padStart(2, '0')}H</span>
            <span className="opacity-20">/</span>
            <span>{timeLeft.minutes.toString().padStart(2, '0')}M</span>
          </div>
          <span className="hidden lg:inline opacity-40 lowercase italic tracking-normal border-l border-white/20 pl-6">Coming Soon to South Africa</span>
        </div>
      </motion.button>
    </AnimatePresence>
  );
};

export default LaunchCountdown;
