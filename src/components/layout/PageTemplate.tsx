import { useEffect } from 'react';
import { motion } from 'framer-motion';

interface PageTemplateProps {
  title: string;
  children: React.ReactNode;
  dark?: boolean;
}

const PageTemplate = ({ title, children, dark = false }: PageTemplateProps) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="pt-32 pb-24 lg:pt-48 lg:pb-40"
    >
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <h1 className={`font-serif text-5xl lg:text-7xl mb-12 lg:mb-16 ${dark ? 'text-white' : 'text-black'}`}>
          {title}
        </h1>
        <div className={`prose prose-lg max-w-none ${dark ? 'prose-invert' : 'prose-neutral'}`}>
          {children}
        </div>
      </div>
    </motion.div>
  );
};

export default PageTemplate;
