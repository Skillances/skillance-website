import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';

interface ComingSoonPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const ComingSoonPopup = ({ isOpen, onClose }: ComingSoonPopupProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[2.5rem] overflow-hidden shadow-2xl"
          >
            <div className="p-8 lg:p-12 text-center">
              <button 
                onClick={onClose}
                className="absolute top-8 right-8 text-neutral-400 hover:text-black transition-colors"
              >
                <X className="w-6 h-6" />
              </button>


              <h3 className="font-serif text-4xl text-black mb-4 mt-4 text-center">Something <span className="italic">special</span> is cooking.</h3>
              <p className="text-neutral-500 font-light leading-relaxed mb-10 text-lg text-center">
                The Skillance mobile app is currently in development and will be launching in South Africa very soon.
              </p>

              <div className="space-y-4">
                <button 
                  onClick={onClose}
                  className="w-full py-5 bg-black text-white rounded-full text-sm font-semibold hover:bg-neutral-800 transition-all flex items-center justify-center gap-3 group"
                >
                  Join the Waitlist
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={onClose}
                  className="w-full py-5 bg-neutral-50 text-neutral-400 rounded-full text-sm font-medium hover:bg-neutral-100 hover:text-black transition-all"
                >
                  Keep Browsing
                </button>
              </div>
            </div>
            
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ComingSoonPopup;
