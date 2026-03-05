import React, { useState, useEffect } from 'react';
import { get } from '@/lib/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import PageHeader from '@/components/admin/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const COLORS = ['#171717', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16'];
const tooltipStyle = {
  contentStyle: { backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: '10px 14px' },
  itemStyle: { fontSize: '12px', fontWeight: 500, padding: '2px 0' },
  labelStyle: { marginBottom: '6px', color: '#a3a3a3', fontSize: '10px', textTransform: 'uppercase' as const, letterSpacing: '0.1em' },
};

const AdminAnalytics: React.FC = () => {
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
        const [ugRes, fgRes, ctRes, vtRes, udRes] = await Promise.all([get(`/admin/analytics/user-growth?interval=${interval}`), get(`/admin/analytics/freelancer-growth?interval=${interval}`), get('/admin/analytics/category-trends'), get('/admin/analytics/verification-trends'), get('/admin/analytics/user-distribution')]);
        if (ugRes.success) { const series = ugRes.data?.data?.series || ugRes.data?.series || []; setUserGrowth(series.map((d: any) => ({ name: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), count: d.count, cumulative: d.cumulative }))); }
        if (fgRes.success) { const series = fgRes.data?.data?.series || fgRes.data?.series || []; setFreelancerGrowth(series.map((d: any) => ({ name: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), count: d.count, cumulative: d.cumulative }))); }
        if (ctRes.success) { const rawData = ctRes.data || []; const grouped: Record<string, number> = {}; rawData.forEach((d: any) => { const name = d.categoryName || d.name || 'Unknown'; grouped[name] = (grouped[name] || 0) + (d.count || d.freelancerCount || 0); }); setCategoryTrends(Object.entries(grouped).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 10)); }
        if (vtRes.success) { setVerificationTrends((vtRes.data || []).map((d: any) => ({ name: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), pending: d.pending || 0, verified: d.verified || 0, rejected: d.rejected || 0 }))); }
        if (udRes.success) setUserDistribution(udRes.data);
      } catch { toast.error('Failed to load analytics'); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, [interval]);

  const distributionData = userDistribution ? [{ name: 'Customers', value: userDistribution.customers || 0 }, { name: 'Freelancers', value: userDistribution.freelancers || 0 }].filter((d) => d.value > 0) : [];

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
          <SelectTrigger className="w-[140px] bg-white border-neutral-200 text-neutral-600 rounded-full hover:border-neutral-300"><SelectValue /></SelectTrigger>
          <SelectContent className="bg-white border-neutral-200 rounded-xl shadow-soft">
            <SelectItem value="daily" className="text-neutral-600 focus:bg-neutral-50 focus:text-black rounded-lg">Daily</SelectItem>
            <SelectItem value="weekly" className="text-neutral-600 focus:bg-neutral-50 focus:text-black rounded-lg">Weekly</SelectItem>
            <SelectItem value="monthly" className="text-neutral-600 focus:bg-neutral-50 focus:text-black rounded-lg">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {chartCard('User Growth', <ResponsiveContainer width="100%" height="100%"><AreaChart data={userGrowth}><defs><linearGradient id="ugGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#171717" stopOpacity={0.08} /><stop offset="95%" stopColor="#171717" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" /><XAxis dataKey="name" stroke="#d4d4d4" fontSize={10} tickLine={false} axisLine={false} /><YAxis stroke="#d4d4d4" fontSize={10} tickLine={false} axisLine={false} /><Tooltip {...tooltipStyle} /><Area type="monotone" dataKey="cumulative" name="Total Users" stroke="#171717" strokeWidth={2} fill="url(#ugGrad)" /></AreaChart></ResponsiveContainer>)}
        {chartCard('Freelancer Growth', <ResponsiveContainer width="100%" height="100%"><AreaChart data={freelancerGrowth}><defs><linearGradient id="fgGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.08} /><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" /><XAxis dataKey="name" stroke="#d4d4d4" fontSize={10} tickLine={false} axisLine={false} /><YAxis stroke="#d4d4d4" fontSize={10} tickLine={false} axisLine={false} /><Tooltip {...tooltipStyle} /><Area type="monotone" dataKey="cumulative" name="Total Freelancers" stroke="#8b5cf6" strokeWidth={2} fill="url(#fgGrad)" /></AreaChart></ResponsiveContainer>)}
        {chartCard('Category Popularity', categoryTrends.length > 0 ? <ResponsiveContainer width="100%" height="100%"><BarChart data={categoryTrends} layout="vertical"><CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f5f5f5" /><XAxis type="number" stroke="#d4d4d4" fontSize={10} tickLine={false} axisLine={false} /><YAxis type="category" dataKey="name" stroke="#d4d4d4" fontSize={10} tickLine={false} axisLine={false} width={100} /><Tooltip {...tooltipStyle} /><Bar dataKey="count" name="Freelancers" fill="#10b981" radius={[0, 4, 4, 0]} /></BarChart></ResponsiveContainer> : <div className="h-full flex items-center justify-center text-neutral-400 text-sm">No category data available</div>)}
        {chartCard('User Distribution', distributionData.length > 0 ? <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={distributionData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>{distributionData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}</Pie><Tooltip {...tooltipStyle} /><Legend wrapperStyle={{ fontSize: '12px', color: '#737373' }} /></PieChart></ResponsiveContainer> : <div className="h-full flex items-center justify-center text-neutral-400 text-sm">No distribution data</div>)}
        {chartCard('Verification Trends', verificationTrends.length > 0 ? <ResponsiveContainer width="100%" height="100%"><AreaChart data={verificationTrends}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" /><XAxis dataKey="name" stroke="#d4d4d4" fontSize={10} tickLine={false} axisLine={false} /><YAxis stroke="#d4d4d4" fontSize={10} tickLine={false} axisLine={false} /><Tooltip {...tooltipStyle} /><Legend wrapperStyle={{ fontSize: '12px', color: '#737373' }} /><Area type="monotone" dataKey="verified" name="Verified" stroke="#10b981" fill="#10b981" fillOpacity={0.05} strokeWidth={2} /><Area type="monotone" dataKey="pending" name="Pending" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.05} strokeWidth={2} /><Area type="monotone" dataKey="rejected" name="Rejected" stroke="#ef4444" fill="#ef4444" fillOpacity={0.05} strokeWidth={2} /></AreaChart></ResponsiveContainer> : <div className="h-full flex items-center justify-center text-neutral-400 text-sm">No verification trend data</div>, true)}
      </div>
    </div>
  );
};

export default AdminAnalytics;
