import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Shield, UserPlus, FileCheck, LogIn, AlertTriangle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const ActivityItem = ({ activity, index }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'security': return { icon: Shield, color: '#ef4444', bg: '#fee2e2' }
      case 'user_signup': return { icon: UserPlus, color: '#3b82f6', bg: '#dbeafe' }
      case 'verification': return { icon: FileCheck, color: '#10b981', bg: '#d1fae5' }
      case 'login': return { icon: LogIn, color: '#8b5cf6', bg: '#ede9fe' }
      default: return { icon: AlertTriangle, color: '#f59e0b', bg: '#fef3c7' }
    }
  }

  const { icon: Icon, color, bg } = getIcon(activity.type)

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex gap-4 items-start relative pb-8 last:pb-0"
    >
      {/* Connector Line */}
      <div className="absolute left-[18px] top-10 bottom-0 w-[2px] bg-slate-100 last:hidden" />
      
      <div 
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10 ring-4 ring-white"
        style={{ backgroundColor: bg, color: color }}
      >
        <Icon size={16} />
      </div>
      
      <div className="flex-1 min-w-0 pt-1">
        <div className="flex justify-between items-start gap-2">
          <p className="text-sm font-medium text-slate-900 line-clamp-1">
            {activity.title}
          </p>
          <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">
            {activity.timestamp ? formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true }) : 'Just now'}
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">
          {activity.description}
        </p>
      </div>
    </motion.div>
  )
}

const ActivityFeed = ({ activities = [] }) => {
  return (
    <Card className="h-full border-none shadow-lg bg-white/80 dark:bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900 dark:text-foreground">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="space-y-1">
            {activities.map((activity, index) => (
              <ActivityItem key={activity.id || index} activity={activity} index={index} />
            ))}
          </div>
        ) : (
           <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                 <Shield size={24} className="opacity-50" />
              </div>
              <p className="font-medium">No recent activity</p>
              <p className="text-sm">System events and logs will appear here.</p>
           </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ActivityFeed
