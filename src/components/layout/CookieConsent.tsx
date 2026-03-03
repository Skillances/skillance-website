import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasConsented = localStorage.getItem('cookie-consent');
    if (!hasConsented) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'true');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:max-w-md z-[60]"
        >
          <div className="bg-white/80 backdrop-blur-xl border border-neutral-200 p-6 rounded-3xl shadow-2xl shadow-black/5">
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center flex-shrink-0">
                <Cookie className="text-white w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-serif text-xl text-black italic">Cookie Policy</h3>
                  <button 
                    onClick={() => setIsVisible(false)}
                    className="text-neutral-400 hover:text-black transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-neutral-600 text-sm leading-relaxed mb-6">
                  We use cookies to improve your experience and analyze platform traffic. 
                  By continuing to use Skillance, you agree to our{' '}
                  <Link to="/cookie-policy" className="text-black underline underline-offset-4 decoration-neutral-300">
                    Cookie Policy
                  </Link>.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleAccept}
                    className="flex-1 px-6 py-3 bg-black text-white text-sm font-medium rounded-xl transition-transform active:scale-95"
                  >
                    Accept All
                  </button>
                  <button
                    onClick={() => setIsVisible(false)}
                    className="px-6 py-3 bg-neutral-100 text-black text-sm font-medium rounded-xl transition-colors hover:bg-neutral-200"
                  >
                    Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
