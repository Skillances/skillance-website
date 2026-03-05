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
  | 'success';

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  verified: { label: 'Verified', className: 'bg-emerald-50 text-emerald-700' },
  pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700' },
  rejected: { label: 'Rejected', className: 'bg-red-50 text-red-700' },
  not_submitted: { label: 'Not Submitted', className: 'bg-neutral-50 text-neutral-500' },
  active: { label: 'Active', className: 'bg-emerald-50 text-emerald-700' },
  suspended: { label: 'Suspended', className: 'bg-orange-50 text-orange-700' },
  banned: { label: 'Banned', className: 'bg-red-50 text-red-700' },
  admin: { label: 'Admin', className: 'bg-black text-white' },
  customer: { label: 'Customer', className: 'bg-neutral-100 text-neutral-600' },
  freelancer: { label: 'Freelancer', className: 'bg-violet-50 text-violet-700' },
  info: { label: 'Info', className: 'bg-blue-50 text-blue-700' },
  warning: { label: 'Warning', className: 'bg-amber-50 text-amber-700' },
  error: { label: 'Error', className: 'bg-red-50 text-red-700' },
  success: { label: 'Success', className: 'bg-emerald-50 text-emerald-700' },
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
