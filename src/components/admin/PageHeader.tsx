import React from 'react';
import { motion } from 'framer-motion';

interface PageHeaderProps {
  title: React.ReactNode;
  description?: string;
  children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8"
    >
      <div className="min-w-0">
        <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-black dark:text-white leading-tight tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1.5 leading-relaxed max-w-lg font-light">
            {description}
          </p>
        )}
      </div>
      {children && <div className="flex items-center gap-3 shrink-0">{children}</div>}
    </motion.div>
  );
};

export default PageHeader;
