import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';

const LaunchCountdown = () => {
  const location = useLocation();
  const navigate = useNavigate();

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

  return (
    <AnimatePresence>
      <motion.button
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        onClick={handleClick}
        className="fixed top-0 left-0 right-0 z-[60] bg-black text-white h-8 flex items-center justify-center overflow-hidden active:scale-95 transition-transform"
      >
        <motion.div
          className="flex items-center justify-center gap-6 text-[11px] font-medium tracking-[0.15em] uppercase px-4 whitespace-nowrap"
        >
          <motion.div className="flex items-center gap-2">
            <span className="opacity-60 text-[9px]">Launch:</span>
            <span>To be Announced</span>
          </motion.div>
          <span className="hidden lg:inline opacity-40 lowercase italic tracking-normal border-l border-white/20 pl-6">
            Coming Soon to South Africa
          </span>
        </motion.div>
      </motion.button>
    </AnimatePresence>
  );
};

export default LaunchCountdown;
