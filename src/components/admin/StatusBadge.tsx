import React from 'react';
import { cn } from '@/lib/utils';

type StatusType =
  | 'verified'
  | 'pending'
  | 'rejected'
  | 'not_submitted'
  | 'active'
  | 'suspended'
  | 'banned'
  | 'admin'
  | 'customer'
  | 'freelancer'
  | 'info'
  | 'warning'
  | 'error'
  | 'success'
  | 'critical';

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  verified: { label: 'Verified', className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' },
  pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300' },
  rejected: { label: 'Rejected', className: 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300' },
  not_submitted: { label: 'Not Submitted', className: 'bg-neutral-50 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400' },
  active: { label: 'Active', className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' },
  suspended: { label: 'Suspended', className: 'bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300' },
  banned: { label: 'Banned', className: 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300' },
  admin: { label: 'Admin', className: 'bg-black text-white dark:bg-white dark:text-black' },
  customer: { label: 'Customer', className: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400' },
  freelancer: { label: 'Freelancer', className: 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300' },
  info: { label: 'Info', className: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300' },
  warning: { label: 'Warning', className: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300' },
  error: { label: 'Error', className: 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300' },
  success: { label: 'Success', className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' },
  critical: { label: 'Critical', className: 'bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-200 font-semibold ring-1 ring-red-300 dark:ring-red-800' },
};

interface StatusBadgeProps {
  status: StatusType | string;
  label?: string;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, className }) => {
  const config = statusConfig[status as StatusType] || {
    label: status,
    className: 'bg-neutral-100 text-neutral-500',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase',
        config.className,
        className
      )}
    >
      {label || config.label}
    </span>
  );
};

export default StatusBadge;
