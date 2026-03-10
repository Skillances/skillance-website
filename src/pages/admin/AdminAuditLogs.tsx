import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { get } from '@/lib/api';
import { ClipboardList, RefreshCw, Download, Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import PageHeader from '@/components/admin/PageHeader';
import SearchFilter, { type FilterConfig } from '@/components/admin/SearchFilter';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DataTable, { type Column } from '@/components/admin/DataTable';
import StatsCard from '@/components/admin/dashboard/StatsCard';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AuditLog {
  id: string;
  action: string;
  actorId: string | null;
  actorType: string | null;
  actorName?: string | null;
  actorEmail?: string | null;
  resource: string | null;
  resourceId: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

interface AuditStats {
  total: number;
  byAction: { action: string; count: number }[];
  byDay: { date: string; count: number }[];
}

type DateRange = '24h' | '7d' | '30d' | 'custom';

function getDateRange(range: DateRange, customStart?: Date, customEnd?: Date): { start: Date; end: Date } {
  if (range === 'custom' && customStart && customEnd) {
    return { start: customStart, end: customEnd };
  }
  const end = new Date();
  const start = new Date();
  if (range === '24h') start.setHours(start.getHours() - 24);
  else if (range === '7d') start.setDate(start.getDate() - 7);
  else start.setDate(start.getDate() - 30);
  return { start, end };
}

const ACTION_OPTIONS = [
  { label: 'All Actions', value: 'all' },
  { label: 'Register Customer', value: 'register_customer' },
  { label: 'Register Freelancer', value: 'register_freelancer' },
  { label: 'Login', value: 'login' },
  { label: 'Logout', value: 'logout' },
  { label: 'Password Reset', value: 'password_reset_requested' },
  { label: 'Booking Create', value: 'booking_create' },
  { label: 'Booking Accept', value: 'booking_accept' },
  { label: 'Booking Decline', value: 'booking_decline' },
  { label: 'Booking Cancel', value: 'booking_cancel' },
  { label: 'Favorite Add', value: 'favorite_add' },
  { label: 'Favorite Remove', value: 'favorite_remove' },
  { label: 'Profile Update', value: 'profile_update' },
  { label: 'Freelancer Profile Update', value: 'freelancer_profile_update' },
];

const RESOURCE_OPTIONS = [
  { label: 'All Resources', value: 'all' },
  { label: 'User', value: 'user' },
  { label: 'Booking', value: 'booking' },
  { label: 'Favorite', value: 'favorite' },
  { label: 'Freelancer', value: 'freelancer' },
];

function normalizeAuditLog(raw: unknown): AuditLog {
  const o = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
  const get = (camel: string, snake: string) =>
    (o[camel] ?? o[snake] ?? null) as string | null | undefined;
  return {
    id: String(get('id', 'id') ?? ''),
    action: String(get('action', 'action') ?? ''),
    actorId: get('actorId', 'actor_id') ?? null,
    actorType: get('actorType', 'actor_type') ?? null,
    actorName: (get('actorName', 'actor_name') ?? null) as string | null | undefined,
    actorEmail: (get('actorEmail', 'actor_email') ?? null) as string | null | undefined,
    resource: get('resource', 'resource') ?? null,
    resourceId: get('resourceId', 'resource_id') ?? null,
    metadata: (o.metadata as Record<string, unknown> | null) ?? null,
    ipAddress: get('ipAddress', 'ip_address') ?? null,
    userAgent: get('userAgent', 'user_agent') ?? null,
    createdAt: String(get('createdAt', 'created_at') ?? ''),
  };
}

const tooltipStyle = {
  contentStyle: { backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: '10px 14px' },
  itemStyle: { fontSize: '12px', fontWeight: 500, padding: '2px 0' },
  labelStyle: { marginBottom: '6px', color: '#a3a3a3', fontSize: '10px', textTransform: 'uppercase' as const, letterSpacing: '0.1em' },
};

const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('all');
  const [resourceFilter, setResourceFilter] = useState('all');
  const [actorSearch, setActorSearch] = useState('');
  const [actorSearchDebounced, setActorSearchDebounced] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>('7d');
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d;
  });
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(() => new Date());
  const [orderBy, setOrderBy] = useState<'createdAt' | 'action' | 'actorId'>('createdAt');
  const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 50;

  useEffect(() => {
    const t = setTimeout(() => setActorSearchDebounced(actorSearch.trim()), 300);
    return () => clearTimeout(t);
  }, [actorSearch]);

  useEffect(() => {
    setPage(1);
  }, [actorSearchDebounced, actionFilter, resourceFilter]);

  const { start: startDate, end: endDate } = useMemo(() => {
    if (dateRange === 'custom' && customStartDate && customEndDate) {
      return getDateRange('custom', customStartDate, customEndDate);
    }
    return getDateRange(dateRange);
  }, [dateRange, customStartDate, customEndDate]);

  const fetchLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.set('limit', String(pageSize));
      params.set('offset', String((page - 1) * pageSize));
      params.set('orderBy', orderBy);
      params.set('orderDirection', orderDirection);
      params.set('startDate', startDate.toISOString());
      params.set('endDate', endDate.toISOString());
      if (actionFilter !== 'all') params.set('action', actionFilter);
      if (resourceFilter !== 'all') params.set('resource', resourceFilter);
      if (actorSearchDebounced) {
        if (actorSearchDebounced.includes('@')) {
          params.set('actorEmail', actorSearchDebounced);
        } else {
          params.set('actorId', actorSearchDebounced);
        }
      }
      const res = await get(`/admin/audit-logs?${params.toString()}`);
      if (res.success) {
        const rawLogs = res.data?.logs ?? (Array.isArray(res.data) ? res.data : []);
        const normalized = (rawLogs as unknown[]).map(normalizeAuditLog);
        setLogs(normalized);
        setTotal(res.data?.total ?? normalized.length);
      }
    } catch {
      toast.error('Failed to load audit logs');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, actionFilter, resourceFilter, actorSearchDebounced, orderBy, orderDirection, startDate, endDate]);

  const fetchStats = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      params.set('startDate', startDate.toISOString());
      params.set('endDate', endDate.toISOString());
      const res = await get(`/admin/audit-logs/stats?${params.toString()}`);
      if (res.success) setStats(res.data);
    } catch {}
  }, [startDate, endDate]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleRefresh = () => {
    fetchLogs();
    fetchStats();
    toast.success('Refreshed');
  };

  const handleExport = async () => {
    try {
      const ExcelJS = (await import('exceljs')).default;
      const params = new URLSearchParams();
      params.set('limit', '1000');
      params.set('offset', '0');
      params.set('orderBy', orderBy);
      params.set('orderDirection', orderDirection);
      params.set('startDate', startDate.toISOString());
      params.set('endDate', endDate.toISOString());
      if (actionFilter !== 'all') params.set('action', actionFilter);
      if (resourceFilter !== 'all') params.set('resource', resourceFilter);
      if (actorSearchDebounced) {
        if (actorSearchDebounced.includes('@')) {
          params.set('actorEmail', actorSearchDebounced);
        } else {
          params.set('actorId', actorSearchDebounced);
        }
      }
      const res = await get(`/admin/audit-logs?${params.toString()}`);
      const rawExport = res.success ? (res.data?.logs ?? (Array.isArray(res.data) ? res.data : [])) : [];
      const exportLogs = (rawExport as unknown[]).map(normalizeAuditLog);
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Skillance Admin';
      workbook.created = new Date();
      const sheet = workbook.addWorksheet('Audit Logs', { views: [{ state: 'frozen', ySplit: 1 }] });
      sheet.columns = [
        { key: 'createdAt', width: 20, header: 'Time' },
        { key: 'action', width: 24, header: 'Action' },
        { key: 'actorName', width: 24, header: 'User' },
        { key: 'actorEmail', width: 32, header: 'Email' },
        { key: 'actorId', width: 38, header: 'Actor ID' },
        { key: 'resource', width: 14, header: 'Resource' },
        { key: 'resourceId', width: 38, header: 'Resource ID' },
        { key: 'ipAddress', width: 16, header: 'IP Address' },
      ];
      sheet.getRow(1).eachCell((c) => {
        c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF171717' } };
      });
      exportLogs.forEach((e: AuditLog) => {
        sheet.addRow({
          createdAt: new Date(String(e.createdAt).replace(' ', 'T')).toLocaleString(),
          action: e.action,
          actorName: e.actorName ?? '',
          actorEmail: e.actorEmail ?? '',
          actorId: e.actorId ?? '',
          resource: e.resource ?? '',
          resourceId: e.resourceId ?? '',
          ipAddress: e.ipAddress ?? '',
        });
      });
      sheet.autoFilter = { from: 'A1', to: `H${exportLogs.length + 1}` };
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `skillance-audit-logs-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Excel exported');
    } catch (err) {
      console.error('Export failed:', err);
      toast.error('Export failed');
    }
  };

  const handleSort = (key: string) => {
    const k = key as 'createdAt' | 'action' | 'actorId';
    if (k !== 'createdAt' && k !== 'action' && k !== 'actorId') return;
    setOrderBy(k);
    setOrderDirection(orderBy === k && orderDirection === 'desc' ? 'asc' : 'desc');
    setPage(1);
  };

  const filters: FilterConfig[] = [
    {
      key: 'action',
      placeholder: 'Action',
      value: actionFilter,
      onChange: (v) => { setActionFilter(v); setPage(1); },
      options: ACTION_OPTIONS,
    },
    {
      key: 'resource',
      placeholder: 'Resource',
      value: resourceFilter,
      onChange: (v) => { setResourceFilter(v); setPage(1); },
      options: RESOURCE_OPTIONS,
    },
  ];

  const formatTime = (val: string | null | undefined) => {
    if (!val) return '-';
    const s = String(val).replace(' ', 'T');
    const d = new Date(s);
    return !Number.isNaN(d.getTime()) ? d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
  };

  const columns: Column<AuditLog>[] = [
    { key: 'createdAt', header: 'Time', sortable: true, render: (e) => <span className="text-neutral-400 dark:text-neutral-500 text-xs">{formatTime(e.createdAt)}</span> },
    { key: 'action', header: 'Action', sortable: true, render: (e) => <span className="text-neutral-700 dark:text-neutral-200 text-sm font-medium">{(e.action ?? '').replace(/_/g, ' ') || '-'}</span> },
    { key: 'actor', header: 'User', sortable: true, render: (e) => {
      const label = e.actorName ?? e.actorEmail ?? (e.actorId ? `ID: ${e.actorId.slice(0, 8)}...` : '-');
      if (e.actorId) {
        return (
          <Link to={`/admin/users/${e.actorId}`} className="text-xs font-medium text-neutral-700 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white truncate max-w-[180px] block underline hover:no-underline" title={e.actorEmail ?? undefined}>
            {label}
          </Link>
        );
      }
      return <span className="text-xs text-neutral-500 dark:text-neutral-400 truncate max-w-[180px] block" title={e.actorEmail ?? undefined}>{label}</span>;
    } },
    { key: 'resource', header: 'Resource', render: (e) => <span className="text-neutral-500 dark:text-neutral-400 text-xs">{e.resource ?? '-'}</span> },
    { key: 'resourceId', header: 'Resource ID', render: (e) => <span className="font-mono text-xs text-neutral-500 dark:text-neutral-400 truncate max-w-[140px] block">{e.resourceId ?? '-'}</span> },
    { key: 'ipAddress', header: 'IP', render: (e) => <span className="font-mono text-xs text-neutral-400 dark:text-neutral-500">{e.ipAddress ?? '-'}</span> },
    { key: 'metadata', header: 'Details', render: (e) => {
      if (!e.metadata || typeof e.metadata !== 'object') return <span className="text-xs text-neutral-400 dark:text-neutral-500">-</span>;
      try {
        const s = JSON.stringify(e.metadata);
        return <span className="text-xs text-neutral-400 dark:text-neutral-500 truncate max-w-[120px] block">{s.length > 50 ? s.slice(0, 50) + '...' : s}</span>;
      } catch {
        return <span className="text-xs text-neutral-400 dark:text-neutral-500">-</span>;
      }
    } },
  ];

  const statsCards = stats
    ? [
        { title: 'Total Events', value: stats.total.toLocaleString(), icon: ClipboardList, color: '#171717' },
        { title: 'Top Action', value: (stats.byAction[0]?.action && String(stats.byAction[0].action).replace(/_/g, ' ')) || '-', icon: ClipboardList, color: '#8b5cf6' },
        { title: 'Actions Tracked', value: String(stats.byAction.length), icon: ClipboardList, color: '#10b981' },
      ]
    : [];

  const chartData = (stats?.byDay ?? [])
    .filter((d): d is { date: string; count: number } => Boolean(d?.date))
    .map((d) => {
      const dateStr = typeof d.date === 'string' ? d.date : String(d.date);
      const parsed = new Date(dateStr);
      const name = !Number.isNaN(parsed.getTime()) ? parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-';
      return { name, count: Number(d.count) || 0 };
    })
    .filter((d) => d.name !== '-');

  return (
    <div className="space-y-10">
      <PageHeader title="Audit Logs" description="Track user actions across the app">
        <div className="flex flex-wrap items-center gap-2">
          <Select value={dateRange} onValueChange={(v) => { setDateRange(v as DateRange); setPage(1); }}>
            <SelectTrigger className="w-[140px] h-9 rounded-xl border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
          {dateRange === 'custom' && (
            <>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-xl h-9 border-neutral-200 dark:border-neutral-600 hover:border-neutral-300 dark:hover:border-neutral-500">
                    <CalendarIcon className="h-4 w-4 mr-1.5" />
                    {customStartDate ? format(customStartDate, 'MMM d') : 'Start'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-2xl border-neutral-200 dark:border-neutral-700 shadow-xl bg-white dark:bg-neutral-900" align="end" sideOffset={8}>
                  <Calendar mode="single" selected={customStartDate} onSelect={(d) => { setCustomStartDate(d); setPage(1); }} initialFocus />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-xl h-9 border-neutral-200 dark:border-neutral-600 hover:border-neutral-300 dark:hover:border-neutral-500">
                    <CalendarIcon className="h-4 w-4 mr-1.5" />
                    {customEndDate ? format(customEndDate, 'MMM d') : 'End'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-2xl border-neutral-200 dark:border-neutral-700 shadow-xl bg-white dark:bg-neutral-900" align="end" sideOffset={8}>
                  <Calendar mode="single" selected={customEndDate} onSelect={(d) => { setCustomEndDate(d); setPage(1); }} initialFocus />
                </PopoverContent>
              </Popover>
            </>
          )}
          <Button variant="outline" size="sm" onClick={handleRefresh} className="rounded-xl border-neutral-200 dark:border-neutral-600 h-9">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} className="rounded-xl border-neutral-200 dark:border-neutral-600 h-9">
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </PageHeader>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {statsCards.map((s, i) => (
            <StatsCard key={s.title} {...s} index={i} />
          ))}
        </div>
      )}

      {chartData.length > 0 && (
        <Card className="border-neutral-100 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 rounded-2xl shadow-sm dark:shadow-[0_1px_0_0_rgba(255,255,255,0.06)] overflow-hidden">
          <CardHeader className="border-b border-neutral-100 dark:border-neutral-700/80 pb-4 px-6">
            <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400 tracking-wide uppercase">
              Actions Over Time
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" className="dark:stroke-neutral-600" />
                  <XAxis dataKey="name" stroke="#a3a3a3" fontSize={11} tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis stroke="#a3a3a3" fontSize={11} tickLine={false} axisLine={false} tickMargin={8} domain={[0, 'auto']} />
                  <Tooltip {...tooltipStyle} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Events"
                    stroke="#171717"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    dot={{ fill: '#171717', strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, fill: '#171717', stroke: '#fff', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <SearchFilter
        searchValue={actorSearch}
        onSearchChange={setActorSearch}
        searchPlaceholder="Search by user ID or email"
        filters={filters}
      />

      <DataTable
        columns={columns}
        data={logs}
        isLoading={isLoading}
        emptyTitle="No audit logs"
        emptyDescription="No logs matching your filters"
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        sortKey={orderBy}
        sortDirection={orderDirection}
        onSort={handleSort}
      />
    </div>
  );
};

export default AdminAuditLogs;
