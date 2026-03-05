import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAdminTheme } from '@/context/AdminThemeContext';
import { Button } from '@/components/ui/button';
import { Users, Briefcase, ShieldCheck, Download, Calendar, TrendingUp, MessageSquare, Bell, Star } from 'lucide-react';
import { get } from '@/lib/api';
import StatsCard from '@/components/admin/dashboard/StatsCard';
import ActivityFeed from '@/components/admin/dashboard/ActivityFeed';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useAdminTheme();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [growthData, setGrowthData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);
  const [websiteMetrics, setWebsiteMetrics] = useState({ unreadMessages: 0, subscribers: 0, pendingReviews: 0 });

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        const [dashboardRes, userGrowthRes, freelancerGrowthRes, securityRes, messagesRes, subscribersRes, reviewsRes] = await Promise.all([
          get('/admin/dashboard'),
          get('/admin/analytics/user-growth?interval=daily'),
          get('/admin/analytics/freelancer-growth?interval=daily'),
          get('/admin/security/events?limit=10&orderBy=createdAt&orderDirection=desc').catch(() => null),
          get('/admin/contact-messages?status=new&limit=1').catch(() => null),
          get('/admin/notify-subscribers?limit=1').catch(() => null),
          get('/admin/website-reviews?status=pending&limit=1').catch(() => null),
        ]);

        if (dashboardRes.success && dashboardRes.data) {
          setDashboardData(dashboardRes.data);
        }

        if (userGrowthRes?.success && freelancerGrowthRes?.success) {
          const userSeries = userGrowthRes.data?.series ?? userGrowthRes.data?.data?.series ?? [];
          const freelancerSeries = freelancerGrowthRes.data?.series ?? freelancerGrowthRes.data?.data?.series ?? [];
          const dateMap = new Map();
          
          userSeries.forEach((item: any) => {
            const dateStr = new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (!dateMap.has(item.date)) dateMap.set(item.date, { name: dateStr, date: item.date, users: 0, freelancers: 0 });
            dateMap.get(item.date).users = item.cumulative;
          });

          freelancerSeries.forEach((item: any) => {
            const dateStr = new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (!dateMap.has(item.date)) dateMap.set(item.date, { name: dateStr, date: item.date, users: 0, freelancers: 0 });
            dateMap.get(item.date).freelancers = item.cumulative;
          });

          const sortedData = Array.from(dateMap.values())
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(-30);

          if (sortedData.length === 0) {
            const today = new Date();
            for (let i = 6; i >= 0; i--) {
              const d = new Date(today);
              d.setDate(today.getDate() - i);
              sortedData.push({ name: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), users: 0, freelancers: 0 });
            }
          }
          setGrowthData(sortedData);
        }

        if (securityRes?.success && securityRes.data?.events) {
          const mapped = securityRes.data.events.slice(0, 8).map((evt: any) => ({
            id: evt.id,
            type: evt.eventType === 'exploit_attempt' || evt.eventType === 'honeypot' ? 'security'
              : evt.eventType === 'rate_limited' ? 'login'
              : 'security',
            title: evt.eventType.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
            description: `${evt.method} ${evt.path} - ${evt.reason}`,
            timestamp: evt.createdAt,
          }));
          setActivities(mapped);
        }

        setWebsiteMetrics({
          unreadMessages: messagesRes?.success ? messagesRes.data?.pagination?.total ?? 0 : 0,
          subscribers: subscribersRes?.success ? subscribersRes.data?.pagination?.total ?? 0 : 0,
          pendingReviews: reviewsRes?.success ? reviewsRes.data?.pagination?.total ?? 0 : 0,
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const metrics = dashboardData ? [
    {
      title: 'Total Users',
      value: dashboardData.users.total.toLocaleString(),
      change: `+${dashboardData.users.newThisMonth} this month`,
      icon: Users,
      color: '#171717',
      data: growthData.map(d => ({ value: d.users }))
    },
    {
      title: 'Freelancers',
      value: dashboardData.freelancers.total.toLocaleString(),
      change: `${((dashboardData.freelancers.verified / (dashboardData.freelancers.total || 1)) * 100).toFixed(0)}% verified`,
      icon: Briefcase,
      color: '#8b5cf6',
      data: growthData.map(d => ({ value: d.freelancers }))
    },
    {
      title: 'Pending Reviews',
      value: dashboardData.pendingVerifications.count.toLocaleString(),
      change: dashboardData.pendingVerifications.count > 0 ? 'Needs attention' : 'All clear',
      icon: ShieldCheck,
      color: '#f59e0b',
      data: Array.from({ length: 15 }, () => ({ value: Math.max(0, dashboardData.pendingVerifications.count + (Math.random() * 2 - 1)) }))
    }
  ] : [];

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4 text-center">
          <div className="h-10 w-10 rounded-full border-t-2 border-black animate-spin" />
          <p className="text-neutral-400 text-sm tracking-wide">Loading dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <h1 className="font-serif text-4xl lg:text-5xl text-black dark:text-white leading-tight tracking-tight">
            Dashboard
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-2 font-light">
            Welcome, <span className="text-black dark:text-white font-medium">{user?.fullName || 'Administrator'}</span>. Latest 24hr data.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:border-neutral-300 dark:hover:border-neutral-600 rounded-full bg-transparent dark:bg-transparent">
            <Calendar className="mr-2 h-4 w-4" />
            Timeframe
          </Button>
          <Button className="bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-full shadow-xs">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <StatsCard key={metric.title} {...metric} index={index} />
        ))}
      </div>

      {/* Website Engagement */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard title="Unread Messages" value={websiteMetrics.unreadMessages} icon={MessageSquare} />
        <StatsCard title="Notify Subscribers" value={websiteMetrics.subscribers} icon={Bell} />
        <StatsCard title="Pending Reviews" value={websiteMetrics.pendingReviews} icon={Star} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 border-neutral-100 dark:border-neutral-700 bg-white dark:bg-neutral-900 overflow-hidden rounded-2xl shadow-sm dark:shadow-[0_1px_0_0_rgba(255,255,255,0.05)]">
          <CardHeader className="border-b border-neutral-100 dark:border-neutral-700/80 flex flex-row items-center justify-between pb-4 px-6">
            <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400 flex items-center gap-2 tracking-wide uppercase">
              <TrendingUp className="text-black dark:text-white" size={16} />
              Growth Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-8">
            <div className="h-[360px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#171717" stopOpacity={0.08}/>
                      <stop offset="95%" stopColor="#171717" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorFreelancers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.08}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#404040' : '#f5f5f5'} />
                  <XAxis dataKey="name" stroke={isDark ? '#737373' : '#d4d4d4'} fontSize={10} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke={isDark ? '#737373' : '#d4d4d4'} fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(1)}k` : val} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: isDark ? '#262626' : '#fff', border: isDark ? '1px solid #404040' : '1px solid #e5e5e5', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', padding: '10px 14px', color: isDark ? '#fff' : undefined }}
                    itemStyle={{ fontSize: '12px', fontWeight: 500, padding: '2px 0' }}
                    labelStyle={{ marginBottom: '6px', color: isDark ? '#a3a3a3' : '#737373', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                  />
                  <Area type="monotone" dataKey="users" name="Total Users" stroke="#171717" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
                  <Area type="monotone" dataKey="freelancers" name="Freelancers" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorFreelancers)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <ActivityFeed activities={activities} />
      </div>
    </div>
  );
};

export default AdminDashboard;
