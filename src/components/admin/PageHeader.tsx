import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  /** Shown in the sticky admin top bar via nav; omit in-content title unless `showTitle`. */
  title?: React.ReactNode;
  /** When true, renders an in-content h1 (e.g. entity name on detail pages). */
  showTitle?: boolean;
  description?: string;
  children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, showTitle = false, description, children }) => {
  const hasHeadingBlock = (showTitle && title) || description;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'flex flex-col sm:flex-row sm:items-end justify-between gap-4',
        hasHeadingBlock ? 'mb-8' : children ? 'mb-6' : 'mb-0',
      )}
    >
      <div className="min-w-0">
        {showTitle && title ? (
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-black dark:text-white leading-tight tracking-tight">
            {title}
          </h1>
        ) : null}
        {description && (
          <p
            className={cn(
              'text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed max-w-lg font-light',
              showTitle && title ? 'mt-1.5' : undefined,
            )}
          >
            {description}
          </p>
        )}
      </div>
      {children && <div className="flex items-center gap-3 shrink-0">{children}</div>}
    </motion.div>
  );
};

export default PageHeader;
