import React from 'react';
import { type LucideIcon, Inbox } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  children?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  children,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-neutral-50 dark:bg-neutral-700/50 flex items-center justify-center mb-5 border border-neutral-100 dark:border-neutral-600">
        <Icon size={28} className="text-neutral-300 dark:text-neutral-500" />
      </div>
      <p className="font-serif text-lg text-black dark:text-white mb-1">{title}</p>
      {description && (
        <p className="text-sm text-neutral-400 dark:text-neutral-500 max-w-sm leading-relaxed font-light">{description}</p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </motion.div>
  );
};

export default EmptyState;
