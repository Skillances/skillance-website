import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id?: string;
  type: 'security' | 'user_signup' | 'verification' | 'login' | string;
  title: string;
  description: string;
  timestamp?: string;
}

interface ActivityItemProps {
  activity: Activity;
  index: number;
}

const dotColor: Record<string, string> = {
  security: 'bg-red-400',
  user_signup: 'bg-blue-400',
  verification: 'bg-emerald-400',
  login: 'bg-violet-400',
};

const ActivityItem: React.FC<ActivityItemProps> = ({ activity, index }) => {
  const dot = dotColor[activity.type] || 'bg-neutral-300 dark:bg-neutral-600';

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex gap-3 items-start relative pb-5 last:pb-0"
    >
      <div className="absolute left-[4px] top-5 bottom-0 w-[1px] bg-neutral-100 dark:bg-neutral-700/50 last:hidden" />

      <div className={`w-[9px] h-[9px] rounded-full shrink-0 z-10 mt-[5px] ${dot}`} />

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <p className="text-[13px] font-medium text-black dark:text-white line-clamp-1 leading-snug">{activity.title}</p>
          <span className="text-[10px] text-neutral-400 dark:text-neutral-500 whitespace-nowrap shrink-0 pt-px">
            {activity.timestamp ? formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true }) : 'Just now'}
          </span>
        </div>
        <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5 line-clamp-2 leading-relaxed">{activity.description}</p>
      </div>
    </motion.div>
  );
};

interface ActivityFeedProps {
  activities?: Activity[];
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities = [] }) => {
  return (
    <Card className="h-full border-neutral-100 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 overflow-hidden rounded-2xl shadow-sm dark:shadow-[0_1px_0_0_rgba(255,255,255,0.06)]">
      <CardHeader className="border-b border-neutral-100 dark:border-neutral-700/80 pb-4 px-6">
        <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400 tracking-wide uppercase">System Feed</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {activities.length > 0 ? (
          <div className="space-y-0.5">
            {activities.map((activity, index) => (
              <ActivityItem key={activity.id || index} activity={activity} index={index} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="w-14 h-14 rounded-2xl bg-neutral-50 dark:bg-neutral-700/50 flex items-center justify-center mb-4 border border-neutral-100 dark:border-neutral-600">
              <Shield size={22} className="text-neutral-300 dark:text-neutral-500" />
            </div>
            <p className="font-serif text-base text-black dark:text-white">All Clear</p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1 max-w-[200px] leading-relaxed font-light">System activity is quiet. Logs appear as they occur.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
