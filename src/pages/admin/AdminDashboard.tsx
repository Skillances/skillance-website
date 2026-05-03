import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useAdminTheme } from '@/context/AdminThemeContext';
import { Button } from '@/components/ui/button';
import { Users, Briefcase, ShieldCheck, Download, Calendar, TrendingUp, MessageSquare, Bell, Star, ChevronDown } from 'lucide-react';
import StatsCard from '@/components/admin/dashboard/StatsCard';
import ActivityFeed from '@/components/admin/dashboard/ActivityFeed';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/queryKeys';
import {
  fetchAdminDashboardBundle,
  type TimeframeKey,
} from '@/lib/adminDashboardBundle';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const TIMEFRAME_OPTIONS: { key: TimeframeKey; label: string }[] = [
  { key: '24h', label: 'Last 24 hours' },
  { key: '7d', label: 'Last 7 days' },
  { key: '30d', label: 'Last 30 days' },
  { key: '90d', label: 'Last 90 days' },
];

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useAdminTheme();
  const [timeframe, setTimeframe] = useState<TimeframeKey>('30d');

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.admin.dashboard(timeframe),
    queryFn: () => fetchAdminDashboardBundle(timeframe),
  });

  const dashboardData = data?.dashboardData ?? null;
  const growthData = data?.growthData ?? [];
  const activities = data?.activities ?? [];
  const websiteMetrics = data?.websiteMetrics ?? {
    unreadMessages: 0,
    subscribers: 0,
    pendingReviews: 0,
  };
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
      data: Array.from({ length: 15 }, () => ({ value: dashboardData.pendingVerifications.count }))
    }
  ] : [];

  const axisColor = isDark ? '#a3a3a3' : '#a3a3a3';
  const gridColor = isDark ? '#404040' : '#f0f0f0';
  const usersStroke = isDark ? '#e5e5e5' : '#171717';
  const usersGradientTop = isDark ? '#e5e5e5' : '#171717';

  const handleExport = async () => {
    try {
      const ExcelJS = (await import('exceljs')).default;
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Skillance Admin';
      workbook.created = new Date();

      const summarySheet = workbook.addWorksheet('Summary', { views: [{ state: 'frozen', ySplit: 1 }] });
      summarySheet.columns = [{ width: 28 }, { width: 16 }];
      summarySheet.addRow(['Skillance Admin Dashboard', '']);
      summarySheet.mergeCells('A1:B1');
      summarySheet.getCell('A1').font = { bold: true, size: 14 };
      summarySheet.addRow(['Exported', new Date().toLocaleString()]);
      summarySheet.addRow([]);
      summarySheet.addRow(['Metric', 'Value']).eachCell((c) => { c.font = { bold: true }; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E5E5' } }; });
      if (dashboardData) {
        summarySheet.addRow(['Total Users', dashboardData.users?.total ?? 0]);
        summarySheet.addRow(['New Users This Month', dashboardData.users?.newThisMonth ?? 0]);
        summarySheet.addRow(['Freelancers', dashboardData.freelancers?.total ?? 0]);
        summarySheet.addRow(['Verified Freelancers', dashboardData.freelancers?.verified ?? 0]);
        summarySheet.addRow(['Verification Rate', `${((dashboardData.freelancers?.verified ?? 0) / ((dashboardData.freelancers?.total ?? 1) || 1) * 100).toFixed(1)}%`]);
        summarySheet.addRow(['Pending Verifications', dashboardData.pendingVerifications?.count ?? 0]);
      }
      summarySheet.addRow(['Unread Messages', websiteMetrics.unreadMessages]);
      summarySheet.addRow(['Notify Subscribers', websiteMetrics.subscribers]);
      summarySheet.addRow(['Pending Reviews', websiteMetrics.pendingReviews]);

      const rawSheet = workbook.addWorksheet('Raw Growth Data', { views: [{ state: 'frozen', ySplit: 1 }] });
      rawSheet.columns = [
        { key: 'period', width: 14, header: 'Period' },
        { key: 'users', width: 12, header: 'Users' },
        { key: 'freelancers', width: 14, header: 'Freelancers' },
      ];
      rawSheet.getRow(1).eachCell((c) => {
        c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF171717' } };
      });
      growthData.forEach((d) => rawSheet.addRow({ period: d.name ?? d.date ?? '', users: d.users ?? 0, freelancers: d.freelancers ?? 0 }));
      rawSheet.autoFilter = { from: 'A1', to: `C${growthData.length + 1}` };

      const pivotSheet = workbook.addWorksheet('Pivot Overview', { views: [{ state: 'frozen', ySplit: 1 }] });
      pivotSheet.columns = [{ width: 22 }, { width: 14 }];
      pivotSheet.addRow(['Growth Summary', '']);
      pivotSheet.mergeCells('A1:B1');
      pivotSheet.getCell('A1').font = { bold: true, size: 12 };
      pivotSheet.addRow([]);
      pivotSheet.addRow(['Metric', 'Value']).eachCell((c) => { c.font = { bold: true }; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E5E5' } }; });
      const totalUsers = growthData.length ? growthData[growthData.length - 1]?.users ?? 0 : 0;
      const totalFreelancers = growthData.length ? growthData[growthData.length - 1]?.freelancers ?? 0 : 0;
      const avgUsers = growthData.length ? growthData.reduce((s, d) => s + (d.users ?? 0), 0) / growthData.length : 0;
      const avgFreelancers = growthData.length ? growthData.reduce((s, d) => s + (d.freelancers ?? 0), 0) / growthData.length : 0;
      pivotSheet.addRow(['Periods in range', growthData.length]);
      pivotSheet.addRow(['Cumulative users (end)', totalUsers]);
      pivotSheet.addRow(['Cumulative freelancers (end)', totalFreelancers]);
      pivotSheet.addRow(['Avg users per period', Math.round(avgUsers * 10) / 10]);
      pivotSheet.addRow(['Avg freelancers per period', Math.round(avgFreelancers * 10) / 10]);

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `skillance-dashboard-${new Date().toISOString().slice(0, 10)}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Excel exported');
    } catch (err) {
      console.error('Export failed:', err);
      toast.error('Export failed');
    }
  };

  const errMessage =
    error instanceof Error
      ? error.message
      : error && typeof error === 'object' && 'message' in error
        ? String((error as { message?: unknown }).message)
        : 'Failed to load dashboard';

  if (isError) {
    return (
      <div className="space-y-6 max-w-lg">
        <Alert variant="destructive">
          <AlertTitle>Dashboard unavailable</AlertTitle>
          <AlertDescription>{errMessage}</AlertDescription>
        </Alert>
        <Button type="button" onClick={() => void refetch()} variant="outline" className="rounded-full">
          Retry
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <Skeleton className="h-10 w-64 rounded-lg bg-neutral-100 dark:bg-neutral-800" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-40 rounded-full bg-neutral-100 dark:bg-neutral-800" />
            <Skeleton className="h-10 w-28 rounded-full bg-neutral-100 dark:bg-neutral-800" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36 rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={`w-${i}`} className="h-36 rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
          ))}
        </div>
        <Skeleton className="h-96 w-full rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
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
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8"
      >
        <div className="min-w-0">
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-black dark:text-white leading-tight tracking-tight">
            Dashboard
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1.5 leading-relaxed max-w-lg font-light">
            Welcome, <span className="text-black dark:text-white font-medium">{user?.fullName || 'Administrator'}</span>. {TIMEFRAME_OPTIONS.find((o) => o.key === timeframe)?.label ?? 'Latest data'}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:border-neutral-300 dark:hover:border-neutral-600 rounded-full bg-transparent dark:bg-transparent">
                <Calendar className="mr-2 h-4 w-4" />
                {TIMEFRAME_OPTIONS.find((o) => o.key === timeframe)?.label ?? 'Timeframe'}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[160px]">
              {TIMEFRAME_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.key}
                  onClick={() => setTimeframe(opt.key)}
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            className="bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-full shadow-xs"
            onClick={handleExport}
          >
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
        <StatsCard
          title="Unread Messages"
          value={websiteMetrics.unreadMessages}
          icon={MessageSquare}
          data={Array.from({ length: 15 }, () => ({ value: websiteMetrics.unreadMessages }))}
        />
        <StatsCard
          title="Notify Subscribers"
          value={websiteMetrics.subscribers}
          icon={Bell}
          data={Array.from({ length: 15 }, () => ({ value: websiteMetrics.subscribers }))}
        />
        <StatsCard
          title="Pending Reviews"
          value={websiteMetrics.pendingReviews}
          icon={Star}
          data={Array.from({ length: 15 }, () => ({ value: websiteMetrics.pendingReviews }))}
        />
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
                      <stop offset="5%" stopColor={usersGradientTop} stopOpacity={0.14}/>
                      <stop offset="95%" stopColor={usersGradientTop} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorFreelancers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.08}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                  <XAxis dataKey="name" stroke={axisColor} fontSize={10} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke={axisColor} fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(1)}k` : val} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: isDark ? '#262626' : '#fff', border: isDark ? '1px solid #404040' : '1px solid #e5e5e5', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', padding: '10px 14px', color: isDark ? '#fff' : undefined }}
                    itemStyle={{ fontSize: '12px', fontWeight: 500, padding: '2px 0' }}
                    labelStyle={{ marginBottom: '6px', color: isDark ? '#a3a3a3' : '#737373', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                  />
                  <Area type="monotone" dataKey="users" name="Total Users" stroke={usersStroke} strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
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
