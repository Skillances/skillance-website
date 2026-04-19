import React, { useState, useEffect } from 'react';
import { get } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import PageHeader from '@/components/admin/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useAdminTheme } from '@/context/AdminThemeContext';

const LIGHT_COLORS = ['#171717', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16'];
const DARK_COLORS = ['#e5e5e5', '#a78bfa', '#34d399', '#fbbf24', '#f87171', '#f472b6', '#22d3ee', '#a3e635'];

/**
 * Backend sends `date` as YYYY-MM-DD (daily), YYYY-Www (weekly ISO week), or YYYY-MM (monthly).
 * Only the daily form is reliably parseable with `new Date(string)`.
 */
function formatAnalyticsChartLabel(raw: string | undefined | null, interval: string): string {
  if (raw == null || raw === '') return '';

  const s = String(raw).trim();

  if (interval === 'weekly') {
    const m = s.match(/^(\d{4})-W(\d{1,2})$/i);
    if (m) {
      const year = m[1];
      const week = parseInt(m[2], 10);
      return `Week ${week}, ${year}`;
    }
  }

  if (interval === 'monthly') {
    const m = s.match(/^(\d{4})-(\d{2})$/);
    if (m) {
      const d = new Date(Number(m[1]), Number(m[2]) - 1, 1);
      if (!Number.isNaN(d.getTime())) {
        return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }
    }
  }

  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  return s;
}

const AdminAnalytics: React.FC = () => {
  const { isDark } = useAdminTheme();
  const [interval, setInterval] = useState<string>('daily');
  const [userGrowth, setUserGrowth] = useState<any[]>([]);
  const [freelancerGrowth, setFreelancerGrowth] = useState<any[]>([]);
  const [categoryTrends, setCategoryTrends] = useState<any[]>([]);
  const [verificationTrends, setVerificationTrends] = useState<any[]>([]);
  const [userDistribution, setUserDistribution] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [ugRes, fgRes, ctRes, vtRes, udRes] = await Promise.all([
          get(`${ApiPaths.admin.analyticsUserGrowth}?interval=${interval}`),
          get(`${ApiPaths.admin.analyticsFreelancerGrowth}?interval=${interval}`),
          get(ApiPaths.admin.analyticsCategoryTrends),
          get(ApiPaths.admin.analyticsVerificationTrends),
          get(ApiPaths.admin.analyticsUserDistribution),
        ]);
        if (ugRes.success) {
          const series = ugRes.data?.data?.series || ugRes.data?.series || [];
          setUserGrowth(
            series.map((d: any) => ({
              name: formatAnalyticsChartLabel(d.date, interval),
              count: d.count,
              cumulative: d.cumulative,
            })),
          );
        }
        if (fgRes.success) {
          const series = fgRes.data?.data?.series || fgRes.data?.series || [];
          setFreelancerGrowth(
            series.map((d: any) => ({
              name: formatAnalyticsChartLabel(d.date, interval),
              count: d.count,
              cumulative: d.cumulative,
            })),
          );
        }
        if (ctRes.success) { const rawData = ctRes.data || []; const grouped: Record<string, number> = {}; rawData.forEach((d: any) => { const name = d.categoryName || d.name || 'Unknown'; grouped[name] = (grouped[name] || 0) + (d.count || d.freelancerCount || 0); }); setCategoryTrends(Object.entries(grouped).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 10)); }
        if (vtRes.success) { setVerificationTrends((vtRes.data || []).map((d: any) => ({ name: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), pending: d.pending || 0, verified: d.verified || 0, rejected: d.rejected || 0 }))); }
        if (udRes.success) setUserDistribution(udRes.data);
      } catch { toast.error('Failed to load analytics'); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, [interval]);

  const distributionData = userDistribution ? [{ name: 'Customers', value: userDistribution.customers || 0 }, { name: 'Freelancers', value: userDistribution.freelancers || 0 }].filter((d) => d.value > 0) : [];
  const axisColor = isDark ? '#a3a3a3' : '#a3a3a3';
  const gridColor = isDark ? '#404040' : '#f0f0f0';
  const usersStroke = isDark ? '#e5e5e5' : '#171717';
  const usersGradientTop = isDark ? '#e5e5e5' : '#171717';
  const pieColors = isDark ? DARK_COLORS : LIGHT_COLORS;
  const tooltipStyle = {
    contentStyle: { backgroundColor: isDark ? '#262626' : '#fff', border: isDark ? '1px solid #404040' : '1px solid #e5e5e5', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', padding: '10px 14px', color: isDark ? '#fff' : undefined },
    itemStyle: { fontSize: '12px', fontWeight: 500, padding: '2px 0', color: isDark ? '#f5f5f5' : undefined },
    labelStyle: { marginBottom: '6px', color: isDark ? '#a3a3a3' : '#a3a3a3', fontSize: '10px', textTransform: 'uppercase' as const, letterSpacing: '0.1em' },
  };

  if (loading) return (<div className="space-y-10"><PageHeader title="Analytics" description="Platform analytics and insights" /><div className="grid grid-cols-1 lg:grid-cols-2 gap-6">{[1,2,3,4].map(i => <Skeleton key={i} className="h-80 bg-neutral-100 rounded-2xl" />)}</div></div>);

  const chartCard = (title: string, children: React.ReactNode, span?: boolean) => (
    <Card className={`border-neutral-100 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 rounded-2xl shadow-sm dark:shadow-[0_1px_0_0_rgba(255,255,255,0.06)] ${span ? 'lg:col-span-2' : ''}`}>
      <CardHeader className="border-b border-neutral-100 dark:border-neutral-700/80 pb-4 px-6"><CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400 tracking-wide uppercase">{title}</CardTitle></CardHeader>
      <CardContent className="p-6"><div className="h-[300px]">{children}</div></CardContent>
    </Card>
  );

  return (
    <div className="space-y-10">
      <PageHeader title="Analytics" description="Platform analytics and insights">
        <Select value={interval} onValueChange={setInterval}>
          <SelectTrigger className="w-[140px] bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-600 text-neutral-600 dark:text-neutral-200 rounded-full hover:border-neutral-300 dark:hover:border-neutral-500">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-600 rounded-xl shadow-soft">
            <SelectItem value="daily" className="text-neutral-600 dark:text-neutral-300 focus:bg-neutral-50 dark:focus:bg-neutral-700 focus:text-black dark:focus:text-white rounded-lg">Daily</SelectItem>
            <SelectItem value="weekly" className="text-neutral-600 dark:text-neutral-300 focus:bg-neutral-50 dark:focus:bg-neutral-700 focus:text-black dark:focus:text-white rounded-lg">Weekly</SelectItem>
            <SelectItem value="monthly" className="text-neutral-600 dark:text-neutral-300 focus:bg-neutral-50 dark:focus:bg-neutral-700 focus:text-black dark:focus:text-white rounded-lg">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {chartCard('User Growth', <ResponsiveContainer width="100%" height="100%"><AreaChart data={userGrowth}><defs><linearGradient id="ugGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={usersGradientTop} stopOpacity={0.14} /><stop offset="95%" stopColor={usersGradientTop} stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} /><XAxis dataKey="name" stroke={axisColor} fontSize={10} tickLine={false} axisLine={false} /><YAxis stroke={axisColor} fontSize={10} tickLine={false} axisLine={false} /><Tooltip {...tooltipStyle} /><Area type="monotone" dataKey="cumulative" name="Total Users" stroke={usersStroke} strokeWidth={2} fill="url(#ugGrad)" /></AreaChart></ResponsiveContainer>)}
        {chartCard('Freelancer Growth', <ResponsiveContainer width="100%" height="100%"><AreaChart data={freelancerGrowth}><defs><linearGradient id="fgGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.18} /><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} /><XAxis dataKey="name" stroke={axisColor} fontSize={10} tickLine={false} axisLine={false} /><YAxis stroke={axisColor} fontSize={10} tickLine={false} axisLine={false} /><Tooltip {...tooltipStyle} /><Area type="monotone" dataKey="cumulative" name="Total Freelancers" stroke="#8b5cf6" strokeWidth={2} fill="url(#fgGrad)" /></AreaChart></ResponsiveContainer>)}
        {chartCard('Category Popularity', categoryTrends.length > 0 ? <ResponsiveContainer width="100%" height="100%"><BarChart data={categoryTrends} layout="vertical"><CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} /><XAxis type="number" stroke={axisColor} fontSize={10} tickLine={false} axisLine={false} /><YAxis type="category" dataKey="name" stroke={axisColor} fontSize={10} tickLine={false} axisLine={false} width={100} /><Tooltip {...tooltipStyle} /><Bar dataKey="count" name="Freelancers" fill="#10b981" radius={[0, 4, 4, 0]} /></BarChart></ResponsiveContainer> : <div className="h-full flex items-center justify-center text-neutral-400 text-sm">No category data available</div>)}
        {chartCard('User Distribution', distributionData.length > 0 ? <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={distributionData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={4} dataKey="value" label={false} labelLine={false}>{distributionData.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}</Pie><Tooltip {...tooltipStyle} /><Legend wrapperStyle={{ fontSize: '12px', color: isDark ? '#d4d4d4' : '#737373' }} /></PieChart></ResponsiveContainer> : <div className="h-full flex items-center justify-center text-neutral-400 text-sm">No distribution data</div>)}
        {chartCard('Verification Trends', verificationTrends.length > 0 ? <ResponsiveContainer width="100%" height="100%"><AreaChart data={verificationTrends}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} /><XAxis dataKey="name" stroke={axisColor} fontSize={10} tickLine={false} axisLine={false} /><YAxis stroke={axisColor} fontSize={10} tickLine={false} axisLine={false} /><Tooltip {...tooltipStyle} /><Legend wrapperStyle={{ fontSize: '12px', color: isDark ? '#d4d4d4' : '#737373' }} /><Area type="monotone" dataKey="verified" name="Verified" stroke="#10b981" fill="#10b981" fillOpacity={0.08} strokeWidth={2} /><Area type="monotone" dataKey="pending" name="Pending" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.08} strokeWidth={2} /><Area type="monotone" dataKey="rejected" name="Rejected" stroke="#ef4444" fill="#ef4444" fillOpacity={0.08} strokeWidth={2} /></AreaChart></ResponsiveContainer> : <div className="h-full flex items-center justify-center text-neutral-400 text-sm">No verification trend data</div>, true)}
      </div>
    </div>
  );
};

export default AdminAnalytics;
