import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Shield, UserPlus, FileCheck, LogIn, AlertTriangle, type LucideIcon } from 'lucide-react';
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

const ActivityItem: React.FC<ActivityItemProps> = ({ activity, index }) => {
  const getIcon = (type: string): { icon: LucideIcon; color: string; bg: string } => {
    switch (type) {
      case 'security': return { icon: Shield, color: '#f87171', bg: '#450a0a' };
      case 'user_signup': return { icon: UserPlus, color: '#60a5fa', bg: '#172554' };
      case 'verification': return { icon: FileCheck, color: '#4ade80', bg: '#064e3b' };
      case 'login': return { icon: LogIn, color: '#a78bfa', bg: '#2e1065' };
      default: return { icon: AlertTriangle, color: '#fbbf24', bg: '#451a03' };
    }
  };

  const { icon: Icon, color, bg } = getIcon(activity.type);

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="flex gap-4 items-start relative pb-8 last:pb-0"
    >
      <div className="absolute left-[18px] top-10 bottom-0 w-[1px] bg-neutral-800 last:hidden" />
      
      <div 
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10 border border-neutral-800 backdrop-blur-md"
        style={{ backgroundColor: bg, color: color }}
      >
        <Icon size={16} />
      </div>
      
      <div className="flex-1 min-w-0 pt-1">
        <div className="flex justify-between items-start gap-2">
          <p className="text-sm font-medium text-white line-clamp-1">
            {activity.title}
          </p>
          <span className="text-[10px] text-neutral-500 uppercase tracking-tighter whitespace-nowrap shrink-0">
            {activity.timestamp ? formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true }) : 'Just now'}
          </span>
        </div>
        <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
          {activity.description}
        </p>
      </div>
    </motion.div>
  );
};

interface ActivityFeedProps {
  activities?: Activity[];
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities = [] }) => {
  return (
    <Card className="h-full border-neutral-800 bg-neutral-900/50 backdrop-blur-md overflow-hidden">
      <CardHeader className="border-b border-neutral-800/50 pb-4">
        <CardTitle className="text-md font-medium text-white">System Feed</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {activities.length > 0 ? (
          <div className="space-y-1">
            {activities.map((activity, index) => (
              <ActivityItem key={activity.id || index} activity={activity} index={index} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-neutral-800/50 flex items-center justify-center mb-4 border border-neutral-700/50">
              <Shield size={24} className="text-neutral-600" />
            </div>
            <p className="font-medium text-white text-sm">Clear Horizons</p>
            <p className="text-xs text-neutral-500 mt-1 max-w-[200px]">System activity is currently quiet. Logs will appear as they occur.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
