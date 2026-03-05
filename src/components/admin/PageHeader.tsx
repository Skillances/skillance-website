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
      className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10"
    >
      <div>
        <h1 className="font-serif text-4xl lg:text-5xl text-black dark:text-white leading-tight tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-2 leading-relaxed max-w-lg font-light">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-3 shrink-0">{children}</div>}
    </motion.div>
  );
};

export default PageHeader;
