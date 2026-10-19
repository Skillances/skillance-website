import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: React.ReactNode;
  description?: string;
  children?: React.ReactNode;
  /** Visible in-content title. Default false — section name is shown in the admin top bar. */
  showTitle?: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, children, showTitle = false }) => {
  const hasTextBlock = showTitle || Boolean(description);
  const srOnlyTitle = !showTitle && typeof title === 'string' ? title : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'flex flex-col sm:flex-row justify-between gap-4 mb-8',
        hasTextBlock ? 'sm:items-end' : 'sm:items-center',
        !hasTextBlock && !children && 'mb-0',
      )}
    >
      {hasTextBlock || srOnlyTitle ? (
        <div className="min-w-0">
          {showTitle ? (
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-black dark:text-white leading-tight tracking-tight">
              {title}
            </h1>
          ) : srOnlyTitle ? (
            <h1 className="sr-only">{srOnlyTitle}</h1>
          ) : null}
          {description && (
            <p
              className={cn(
                'text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed max-w-lg font-light',
                showTitle ? 'mt-1.5' : 'mt-0',
              )}
            >
              {description}
            </p>
          )}
        </div>
      ) : null}
      {children && <div className="flex items-center gap-3 shrink-0">{children}</div>}
    </motion.div>
  );
};

export default PageHeader;
