import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Users, Briefcase, ShieldCheck, Download, Calendar, TrendingUp } from 'lucide-react';
import { get } from '@/lib/api';
import StatsCard from '@/components/admin/dashboard/StatsCard';
import ActivityFeed from '@/components/admin/dashboard/ActivityFeed';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [growthData, setGrowthData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        const [dashboardRes, userGrowthRes, freelancerGrowthRes] = await Promise.all([
          get('/admin/dashboard'),
          get('/admin/analytics/user-growth?interval=daily'),
          get('/admin/analytics/freelancer-growth?interval=daily')
        ]);

        if (dashboardRes.success && dashboardRes.data) {
          setDashboardData(dashboardRes.data);
        }

        if (userGrowthRes.success && freelancerGrowthRes.success) {
          const userSeries = userGrowthRes.data.data.series || [];
          const freelancerSeries = freelancerGrowthRes.data.data.series || [];
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
              sortedData.push({
                name: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
                users: 0, 
                freelancers: 0
              });
            }
          }
          setGrowthData(sortedData);
        }
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
      color: '#3b82f6',
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
      change: dashboardData.pendingVerifications.count > 0 ? 'Urgent attention' : 'All clear',
      icon: ShieldCheck,
      color: '#fbbf24',
      data: Array.from({ length: 15 }, () => ({ value: Math.max(0, dashboardData.pendingVerifications.count + (Math.random() * 2 - 1)) }))
    }
  ] : [];

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-t-2 border-white/30 animate-spin" />
            <div className="absolute inset-2 h-12 w-12 rounded-full border-t-2 border-white animate-spin" style={{ animationDirection: 'reverse' }} />
          </div>
          <p className="text-neutral-500 font-medium animate-pulse tracking-wide">Synthesizing platform insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-serif text-4xl text-white mb-2">Portfolio Overview</h1>
          <p className="text-neutral-400">Welcome, <span className="text-white font-medium">{user?.fullName || 'Administrator'}</span>. Dashboard reflects latest 24hr data.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white">
            <Calendar className="mr-2 h-4 w-4" />
            Timeframe
          </Button>
          <Button className="bg-white text-black hover:bg-neutral-200 shadow-xl shadow-white/5">
            <Download className="mr-2 h-4 w-4" />
            Intelligence Report
          </Button>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <StatsCard key={metric.title} {...metric} index={index} />
        ))}
      </div>

      {/* Detailed Insights */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <Card className="xl:col-span-2 border-neutral-800 bg-neutral-900/50 backdrop-blur-md overflow-hidden">
          <CardHeader className="border-b border-neutral-800/50 flex flex-row items-center justify-between pb-6">
            <CardTitle className="text-lg font-medium text-white flex items-center gap-3">
              <TrendingUp className="text-blue-400" size={20} />
              Platform Vitality
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-10">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorFreelancers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#262626" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#525252" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false}
                    dy={15}
                  />
                  <YAxis 
                    stroke="#525252" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(1)}k` : val}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 500, padding: '2px 0' }}
                    labelStyle={{ marginBottom: '10px', color: '#737373', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  />
                  <Area type="monotone" dataKey="users" name="Total Users" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorUsers)" />
                  <Area type="monotone" dataKey="freelancers" name="Verified Pros" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorFreelancers)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <ActivityFeed />
      </div>
    </div>
  );
};

export default AdminDashboard;
