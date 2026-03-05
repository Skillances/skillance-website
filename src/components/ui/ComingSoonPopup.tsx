import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ComingSoonPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const ComingSoonPopup = ({ isOpen, onClose }: ComingSoonPopupProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    onClose();
    navigate('/coming-soon');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-6 left-6 right-6 z-[100] md:left-auto md:right-6 md:max-w-md"
        >
          <div
            onClick={handleClick}
            className="bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6 cursor-pointer hover:shadow-3xl transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Smartphone className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-black text-sm">Mobile App Coming Soon</h4>
                  <p className="text-neutral-600 text-xs mt-1">
                    Be the first to know when we launch in South Africa
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="text-neutral-400 hover:text-black transition-colors ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-4 pt-4 border-t border-neutral-100">
              <div className="text-xs text-neutral-500 text-center">
                Click to learn more →
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ComingSoonPopup;
