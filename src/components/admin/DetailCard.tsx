import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface DetailField {
  label: string;
  value: React.ReactNode;
  fullWidth?: boolean;
}

interface DetailCardProps {
  title: string;
  fields: DetailField[];
  className?: string;
  children?: React.ReactNode;
}

const DetailCard: React.FC<DetailCardProps> = ({ title, fields, className, children }) => {
  return (
    <Card className={cn('border-neutral-100 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 rounded-2xl shadow-sm dark:shadow-[0_1px_0_0_rgba(255,255,255,0.06)]', className)}>
      <CardHeader className="border-b border-neutral-100 dark:border-neutral-700/80 pb-4 px-6">
        <CardTitle className="text-base font-serif text-black dark:text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5">
          {fields.map((field, i) => (
            <div key={i} className={cn(field.fullWidth && 'sm:col-span-2')}>
              <p className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em] font-medium mb-1.5">{field.label}</p>
              <div className="text-sm text-black dark:text-neutral-200 leading-relaxed">
                {field.value || <span className="text-neutral-300 dark:text-neutral-500 italic">Not provided</span>}
              </div>
            </div>
          ))}
        </div>
        {children}
      </CardContent>
    </Card>
  );
};

export default DetailCard;
