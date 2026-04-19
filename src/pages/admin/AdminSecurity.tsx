import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { get, post } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { Shield, AlertTriangle, Ban, Globe, MapPin, AlertOctagon, Bug, Zap, RefreshCw, Download, Calendar as CalendarIcon, ShieldOff } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import StatusBadge from '@/components/admin/StatusBadge';
import StatsCard from '@/components/admin/dashboard/StatsCard';
import SecurityWorldMap, { type SecurityMapIpFocus } from '@/components/admin/SecurityWorldMap';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface SecurityEvent { id: string; eventType: string; ipAddress: string; path: string; method: string; userAgent: string | null; reason: string; action: string | null; blockDuration: number | null; createdAt: string; }
interface SecurityStats { totalEvents: number; blockedCount: number; rateLimitedCount: number; exploitAttempts: number; honeypotTriggers?: number; uniqueIPs: number; topIPs: { ipAddress: string; count: number }[]; }
interface CountryData { countryCode: string; count: number; lat?: number; lon?: number; }

function getCountryName(code: string): string {
  if (code === 'XX') return 'Unknown (private IPs)';
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) ?? code;
  } catch {
    return code;
  }
}

type IpGeoPayload = {
  found: boolean;
  lat?: number | null;
  lon?: number | null;
  countryCode?: string | null;
  region?: string | null;
  city?: string | null;
  timezone?: string | null;
};

/** Human-readable region line from geoip-lite fields. */
function formatIpGeoLabel(geo: IpGeoPayload | undefined): string {
  if (!geo?.found) return 'Location unknown (private or non-routable IP)';
  const parts: string[] = [];
  if (geo.city) parts.push(geo.city);
  if (geo.region) parts.push(geo.region);
  if (geo.countryCode) parts.push(getCountryName(geo.countryCode));
  const base = parts.join(', ');
  if (geo.timezone) return base ? `${base} · ${geo.timezone}` : geo.timezone;
  return base || 'Location unknown';
}

const eventTypeColors: Record<string, string> = {
  blocked: 'error',
  rate_limited: 'warning',
  suspicious: 'warning',
  exploit_attempt: 'critical',
  honeypot: 'critical',
  scanning_pattern: 'info',
};

const isCriticalEvent = (eventType: string) => eventType === 'exploit_attempt' || eventType === 'honeypot';

type DateRange = '24h' | '7d' | '30d' | 'custom';
type BlockedIpScope = 'all' | 'public' | 'private' | 'ipv6';

function isIpv6(ip: string): boolean {
  return ip.includes(':');
}

function isPrivateIpv4(ip: string): boolean {
  const match = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!match) return false;
  const a = Number(match[1]);
  const b = Number(match[2]);
  if (a === 10) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 127) return true;
  return false;
}

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

const AdminSecurity: React.FC = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [criticalStats, setCriticalStats] = useState<{ exploitAttempts: number; honeypotTriggers: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange>('7d');
  const [searchValue, setSearchValue] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [pathSearchValue, setPathSearchValue] = useState('');
  const [pathSearchDebounced, setPathSearchDebounced] = useState('');
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d;
  });
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(() => new Date());
  const [orderBy, setOrderBy] = useState<'createdAt' | 'ipAddress' | 'eventType'>('createdAt');
  const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 50;
  const [ipDialogOpen, setIpDialogOpen] = useState(false);
  const [ipHistory, setIpHistory] = useState<any[]>([]);
  const [ipAddress, setIpAddress] = useState('');
  const [ipBlocked, setIpBlocked] = useState(false);
  const [ipLoading, setIpLoading] = useState(false);
  const [byCountry, setByCountry] = useState<CountryData[]>([]);
  const [byCountryLoading, setByCountryLoading] = useState(false);
  const [byCountryError, setByCountryError] = useState(false);
  const [blockedIps, setBlockedIps] = useState<string[]>([]);
  const [blockedIpsLoading, setBlockedIpsLoading] = useState(false);
  const [blockedIpSearch, setBlockedIpSearch] = useState('');
  const [blockedIpScope, setBlockedIpScope] = useState<BlockedIpScope>('all');
  const [mapIpFocus, setMapIpFocus] = useState<SecurityMapIpFocus | null>(null);
  const [mapGeoNotice, setMapGeoNotice] = useState<{ ip: string; message: string } | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(searchValue.trim()), 300);
    return () => clearTimeout(t);
  }, [searchValue]);

  useEffect(() => {
    const t = setTimeout(() => setPathSearchDebounced(pathSearchValue.trim()), 300);
    return () => clearTimeout(t);
  }, [pathSearchValue]);

  useEffect(() => {
    setPage(1);
  }, [searchDebounced, pathSearchDebounced]);

  const { start: startDate, end: endDate } = useMemo(() => {
    if (dateRange === 'custom' && customStartDate && customEndDate) {
      return getDateRange('custom', customStartDate, customEndDate);
    }
    return getDateRange(dateRange);
  }, [dateRange, customStartDate, customEndDate]);

  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.set('limit', String(pageSize));
      params.set('offset', String((page - 1) * pageSize));
      params.set('orderBy', orderBy);
      params.set('orderDirection', orderDirection);
      params.set('startDate', startDate.toISOString());
      params.set('endDate', endDate.toISOString());
      if (eventTypeFilter !== 'all') params.set('eventType', eventTypeFilter);
      if (searchDebounced) params.set('ipAddress', searchDebounced);
      if (pathSearchDebounced) {
        params.set('pathSearch', pathSearchDebounced);
        params.set('reasonSearch', pathSearchDebounced);
      }
      const res = await get(`${ApiPaths.admin.securityEvents}?${params.toString()}`);
      if (res.success) {
        setEvents(res.data.events || []);
        setTotal(res.data.total || 0);
      }
    } catch {
      toast.error('Failed to load security events');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, eventTypeFilter, searchDebounced, pathSearchDebounced, orderBy, orderDirection, startDate, endDate]);

  const fetchStats = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      params.set('startDate', startDate.toISOString());
      params.set('endDate', endDate.toISOString());
      const res = await get(`${ApiPaths.admin.securityStatistics}?${params.toString()}`);
      if (res.success) setStats(res.data);
    } catch {}
  }, [startDate, endDate]);

  const fetchCriticalStats = useCallback(async () => {
    try {
      const { start, end } = getDateRange('24h');
      const params = new URLSearchParams();
      params.set('startDate', start.toISOString());
      params.set('endDate', end.toISOString());
      const res = await get(`${ApiPaths.admin.securityStatistics}?${params.toString()}`);
      if (res.success) {
        setCriticalStats({
          exploitAttempts: res.data.exploitAttempts ?? 0,
          honeypotTriggers: res.data.honeypotTriggers ?? 0,
        });
      }
    } catch {}
  }, []);
  const fetchByCountry = useCallback(async () => {
    try {
      setByCountryLoading(true);
      setByCountryError(false);
      const res = await get(`${ApiPaths.admin.securityByCountry}?limit=30`);
      if (res.success) {
        setByCountry(Array.isArray(res.data) ? res.data : []);
      } else {
        setByCountry([]);
      }
    } catch (err: any) {
      setByCountry([]);
      const is404 = err?.status === 404 || err?.statusCode === 404;
      setByCountryError(!is404);
      if (!is404) toast.error('Failed to load country data');
    } finally {
      setByCountryLoading(false);
    }
  }, []);

  const fetchBlockedIps = useCallback(async () => {
    try {
      setBlockedIpsLoading(true);
      const res = await get(ApiPaths.admin.securityBlockedIps);
      if (res.success && Array.isArray(res.data)) {
        setBlockedIps(res.data);
      } else {
        setBlockedIps([]);
      }
    } catch {
      setBlockedIps([]);
    } finally {
      setBlockedIpsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);
  useEffect(() => {
    fetchByCountry();
  }, [fetchByCountry]);
  useEffect(() => {
    fetchBlockedIps();
  }, [fetchBlockedIps]);
  useEffect(() => {
    fetchCriticalStats();
  }, [fetchCriticalStats]);

  const filteredBlockedIps = useMemo(() => {
    const search = blockedIpSearch.trim().toLowerCase();
    return blockedIps.filter((ip) => {
      const normalized = ip.toLowerCase();
      if (search && !normalized.includes(search)) return false;
      if (blockedIpScope === 'all') return true;
      if (blockedIpScope === 'ipv6') return isIpv6(ip);
      if (blockedIpScope === 'private') return !isIpv6(ip) && isPrivateIpv4(ip);
      if (blockedIpScope === 'public') return !isIpv6(ip) && !isPrivateIpv4(ip);
      return true;
    });
  }, [blockedIps, blockedIpSearch, blockedIpScope]);

  const viewIpHistory = async (ip: string) => {
    document.getElementById('security-world-map')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setIpAddress(ip);
    setIpDialogOpen(true);
    setIpLoading(true);
    try {
      const res = await get(`${ApiPaths.admin.securityIp(ip)}?limit=50`);
      if (res.success) {
        setIpHistory(res.data.events || []);
        setIpBlocked(res.data.blocked ?? false);
        const geo = res.data.geo as IpGeoPayload | undefined;
        if (geo?.found && typeof geo.lat === 'number' && typeof geo.lon === 'number') {
          setMapIpFocus({
            ip,
            lat: geo.lat,
            lon: geo.lon,
            label: formatIpGeoLabel(geo),
          });
          setMapGeoNotice(null);
        } else {
          setMapIpFocus(null);
          setMapGeoNotice({ ip, message: formatIpGeoLabel(geo) });
        }
      }
    } catch {
      toast.error('Failed to load IP history');
    } finally {
      setIpLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchEvents();
    fetchStats();
    fetchCriticalStats();
    fetchByCountry();
    fetchBlockedIps();
    toast.success('Refreshed');
  };

  const handleBlockIp = async () => {
    if (!ipAddress.trim()) return;
    try {
      const res = await post(ApiPaths.admin.securityBlockIp, { ipAddress: ipAddress.trim(), durationHours: 24 });
      if (res.success) {
        toast.success(`IP ${ipAddress} blocked for 24 hours`);
        setIpBlocked(true);
        handleRefresh();
      }
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to block IP');
    }
  };

  const handleUnblockIp = async () => {
    if (!ipAddress.trim()) return;
    try {
      const res = await post(ApiPaths.admin.securityUnblockIp, { ipAddress: ipAddress.trim() });
      if (res.success) {
        toast.success(`IP ${ipAddress} unblocked`);
        setIpBlocked(false);
        handleRefresh();
      }
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to unblock IP');
    }
  };

  const handleUnblockFromList = async (ip: string) => {
    try {
      const res = await post(ApiPaths.admin.securityUnblockIp, { ipAddress: ip });
      if (res.success) {
        toast.success(`IP ${ip} unblocked`);
        setBlockedIps((prev) => prev.filter((x) => x !== ip));
        if (ipAddress === ip) setIpBlocked(false);
        handleRefresh();
      }
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to unblock IP');
    }
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
      if (eventTypeFilter !== 'all') params.set('eventType', eventTypeFilter);
      if (searchDebounced) params.set('ipAddress', searchDebounced);
      if (pathSearchDebounced) {
        params.set('pathSearch', pathSearchDebounced);
        params.set('reasonSearch', pathSearchDebounced);
      }
      const res = await get(`${ApiPaths.admin.securityEvents}?${params.toString()}`);
      const exportEvents = res.success ? (res.data.events || []) : [];
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Skillance Admin';
      workbook.created = new Date();
      const sheet = workbook.addWorksheet('Security Events', { views: [{ state: 'frozen', ySplit: 1 }] });
      sheet.columns = [
        { key: 'createdAt', width: 18, header: 'Time' },
        { key: 'eventType', width: 16, header: 'Type' },
        { key: 'ipAddress', width: 16, header: 'IP Address' },
        { key: 'method', width: 8, header: 'Method' },
        { key: 'path', width: 40, header: 'Path' },
        { key: 'reason', width: 36, header: 'Reason' },
      ];
      sheet.getRow(1).eachCell((c) => {
        c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF171717' } };
      });
      exportEvents.forEach((e: SecurityEvent) => {
        sheet.addRow({
          createdAt: new Date(e.createdAt).toLocaleString(),
          eventType: e.eventType,
          ipAddress: e.ipAddress,
          method: e.method,
          path: e.path,
          reason: e.reason,
        });
      });
      sheet.autoFilter = { from: 'A1', to: `F${exportEvents.length + 1}` };
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `skillance-security-events-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Excel exported');
    } catch (err) {
      console.error('Export failed:', err);
      toast.error('Export failed');
    }
  };

  const handleSort = (key: string) => {
    const k = key as 'createdAt' | 'ipAddress' | 'eventType';
    if (k !== 'createdAt' && k !== 'ipAddress' && k !== 'eventType') return;
    setOrderBy(k);
    setOrderDirection(orderBy === k && orderDirection === 'desc' ? 'asc' : 'desc');
    setPage(1);
  };

  const filters: FilterConfig[] = [
    {
      key: 'eventType',
      placeholder: 'Event Type',
      value: eventTypeFilter,
      onChange: (v) => {
        setEventTypeFilter(v);
        setPage(1);
      },
      options: [
        { label: 'All Events', value: 'all' },
        { label: 'Blocked', value: 'blocked' },
        { label: 'Rate Limited', value: 'rate_limited' },
        { label: 'Suspicious', value: 'suspicious' },
        { label: 'Exploit Attempt', value: 'exploit_attempt' },
        { label: 'Honeypot', value: 'honeypot' },
        { label: 'Scanning Pattern', value: 'scanning_pattern' },
      ],
    },
  ];

  const columns: Column<SecurityEvent>[] = [
    { key: 'createdAt', header: 'Time', sortable: true, render: (e) => <span className="text-neutral-400 dark:text-neutral-500 text-xs">{new Date(e.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span> },
    { key: 'eventType', header: 'Type', sortable: true, render: (e) => <StatusBadge status={(eventTypeColors[e.eventType] || 'info') as any} label={e.eventType.replace(/_/g, ' ')} /> },
    { key: 'ipAddress', header: 'IP Address', sortable: true, render: (e) => <button onClick={(ev) => { ev.stopPropagation(); viewIpHistory(e.ipAddress); }} className="text-black dark:text-white underline hover:text-neutral-600 dark:hover:text-neutral-300 font-mono text-xs transition-colors" aria-label={`View history for ${e.ipAddress}`}>{e.ipAddress}</button> },
    { key: 'method', header: 'Method', render: (e) => <span className="text-neutral-600 dark:text-neutral-400 font-mono text-xs">{e.method}</span> },
    { key: 'path', header: 'Path', render: (e) => <span className="text-neutral-500 dark:text-neutral-400 text-xs truncate max-w-[200px] block">{e.path}</span> },
    { key: 'reason', header: 'Reason', render: (e) => <span className="text-neutral-500 dark:text-neutral-400 text-xs truncate max-w-[250px] block">{e.reason}</span> },
  ];

  const statsCards = stats
    ? [
        { title: 'Total Events', value: stats.totalEvents.toLocaleString(), icon: Shield, color: '#171717' },
        { title: 'Blocked', value: stats.blockedCount.toLocaleString(), icon: Ban, color: '#ef4444' },
        { title: 'Rate Limited', value: stats.rateLimitedCount.toLocaleString(), icon: AlertTriangle, color: '#f59e0b' },
        { title: 'Exploit Attempts', value: stats.exploitAttempts.toLocaleString(), icon: Bug, color: '#dc2626' },
        { title: 'Honeypot Triggers', value: (stats.honeypotTriggers ?? 0).toLocaleString(), icon: Zap, color: '#b91c1c' },
        { title: 'Unique IPs', value: stats.uniqueIPs.toLocaleString(), icon: Globe, color: '#8b5cf6' },
      ]
    : [];

  const criticalCount = (criticalStats?.exploitAttempts ?? 0) + (criticalStats?.honeypotTriggers ?? 0);
  const showBreachAlert = criticalCount > 0;

  return (
    <div className="space-y-10">
      <PageHeader title="Security Logs" description="Monitor security events and threats">
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
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="rounded-xl border-neutral-200 dark:border-neutral-600 h-9"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="rounded-xl border-neutral-200 dark:border-neutral-600 h-9"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </PageHeader>

      {showBreachAlert && (
        <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 px-5 py-4 flex items-center gap-4">
          <AlertOctagon className="h-6 w-6 text-red-600 dark:text-red-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-red-800 dark:text-red-200">
              {criticalCount} critical event{criticalCount !== 1 ? 's' : ''} in the last 24 hours
            </p>
            <p className="text-sm text-red-600 dark:text-red-300 mt-0.5">
              {criticalStats?.exploitAttempts ? `${criticalStats.exploitAttempts} exploit attempt(s)` : ''}
              {criticalStats?.exploitAttempts && criticalStats?.honeypotTriggers ? ', ' : ''}
              {criticalStats?.honeypotTriggers ? `${criticalStats.honeypotTriggers} honeypot trigger(s)` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEventTypeFilter('exploit_attempt');
              setDateRange('24h');
              setPage(1);
              setTimeout(() => {
                document.getElementById('security-events-table')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 100);
            }}
            className="shrink-0 text-sm font-medium text-red-700 dark:text-red-300 hover:underline"
          >
            View exploit attempts
          </button>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {statsCards.map((s, i) => (
            <StatsCard key={s.title} {...s} index={i} />
          ))}
        </div>
      )}

      <Card
        id="security-world-map"
        className="border-neutral-100 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 rounded-2xl shadow-sm dark:shadow-[0_1px_0_0_rgba(255,255,255,0.06)] overflow-hidden scroll-mt-24"
      >
        <CardHeader className="border-b border-neutral-100 dark:border-neutral-700/80 pb-4 px-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400 tracking-wide uppercase flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Events by Country
              </CardTitle>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                Hover over a circle for counts. Scroll to zoom, drag to pan. Click an IP in the events table or blocked list to pan here and see GeoIP
                region.
              </p>
            </div>
            {(mapIpFocus || mapGeoNotice) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="shrink-0 rounded-lg h-8 text-xs text-neutral-600 dark:text-neutral-400"
                onClick={() => {
                  setMapIpFocus(null);
                  setMapGeoNotice(null);
                }}
              >
                Clear map
              </Button>
            )}
          </div>
          {mapGeoNotice && (
            <div className="mt-3 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/90 dark:bg-amber-950/40 px-3 py-2 text-xs text-amber-950 dark:text-amber-100">
              <span className="font-mono font-medium">{mapGeoNotice.ip}</span>
              <span className="text-amber-800 dark:text-amber-200"> — {mapGeoNotice.message}</span>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {byCountryLoading ? (
            <div className="p-6">
              <Skeleton className="w-full h-[300px] rounded-lg bg-neutral-100 dark:bg-neutral-700" />
            </div>
          ) : byCountry.length > 0 || mapIpFocus ? (
            <>
              <SecurityWorldMap data={byCountry} ipFocus={mapIpFocus} />
              <div className="px-6 pb-5 pt-3 border-t border-neutral-100 dark:border-neutral-700/50">
                {byCountry.length > 0 ? (
                  <div className="flex flex-wrap gap-x-5 gap-y-1">
                    {byCountry.slice(0, 12).map((c) => (
                      <span key={c.countryCode} className="text-[11px] text-neutral-500 dark:text-neutral-400 tabular-nums">
                        <span className="font-medium text-neutral-700 dark:text-neutral-300">{getCountryName(c.countryCode)}</span>{' '}
                        {c.count.toLocaleString()}
                      </span>
                    ))}
                    {byCountry.length > 12 && (
                      <span className="text-[11px] text-neutral-400 dark:text-neutral-500">+{byCountry.length - 12} more</span>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                    No country aggregates yet. The map still shows the selected IP when GeoIP resolves.
                  </p>
                )}
              </div>
            </>
          ) : byCountryError ? (
            <div className="py-10 text-center space-y-2">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Failed to load country data</p>
              <button type="button" onClick={fetchByCountry} className="text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:underline" aria-label="Retry loading map">Retry</button>
            </div>
          ) : (
            <p className="text-sm text-neutral-400 dark:text-neutral-500 py-10 text-center">No country data available</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-neutral-100 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 rounded-2xl shadow-sm dark:shadow-[0_1px_0_0_rgba(255,255,255,0.06)] overflow-hidden">
        <CardHeader className="border-b border-neutral-100 dark:border-neutral-700/80 pb-4 px-6">
          <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400 tracking-wide uppercase flex items-center gap-2">
            <Ban className="h-4 w-4" /> Currently Blocked IPs
          </CardTitle>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">IPs currently blocked in Redis. Click to view history or unblock.</p>
        </CardHeader>
        <CardContent className="p-6">
          {blockedIpsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 rounded-xl bg-neutral-100 dark:bg-neutral-700" />
              ))}
            </div>
          ) : blockedIps.length === 0 ? (
            <p className="text-sm text-neutral-400 dark:text-neutral-500 py-10 text-center">No IPs currently blocked</p>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  value={blockedIpSearch}
                  onChange={(e) => setBlockedIpSearch(e.target.value)}
                  placeholder="Search blocked IP"
                  className="h-9 w-full sm:w-[260px] rounded-xl border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800"
                />
                <Select value={blockedIpScope} onValueChange={(v) => setBlockedIpScope(v as BlockedIpScope)}>
                  <SelectTrigger className="h-9 w-[150px] rounded-xl border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800">
                    <SelectValue placeholder="Scope" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="public">Public IPv4</SelectItem>
                    <SelectItem value="private">Private IPv4</SelectItem>
                    <SelectItem value="ipv6">IPv6</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-xs text-neutral-400 dark:text-neutral-500 ml-auto">
                  {filteredBlockedIps.length} of {blockedIps.length}
                </span>
              </div>

              <div className="max-h-[420px] overflow-y-auto pr-1 space-y-2">
                {filteredBlockedIps.map((ip) => (
                  <div
                    key={ip}
                    className="flex items-center justify-between gap-4 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-700"
                  >
                    <button
                      type="button"
                      onClick={() => viewIpHistory(ip)}
                      className="font-mono text-sm text-black dark:text-white hover:text-neutral-600 dark:hover:text-neutral-300 underline hover:no-underline transition-colors"
                    >
                      {ip}
                    </button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnblockFromList(ip)}
                      className="rounded-lg shrink-0 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                    >
                      <ShieldOff className="h-4 w-4 mr-1.5" />
                      Unblock
                    </Button>
                  </div>
                ))}
                {filteredBlockedIps.length === 0 && (
                  <p className="text-sm text-neutral-400 dark:text-neutral-500 py-8 text-center">
                    No blocked IPs match these filters
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <SearchFilter
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Search by IP address"
        secondSearchValue={pathSearchValue}
        onSecondSearchChange={setPathSearchValue}
        secondSearchPlaceholder="Search path or reason"
        filters={filters}
      />
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Time range</span>
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
                <Button variant="outline" size="sm" className="rounded-xl h-9">
                  <CalendarIcon className="h-4 w-4 mr-1.5" />
                  {customStartDate ? format(customStartDate, 'PPP') : 'Start date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-2xl border-neutral-200 dark:border-neutral-700 shadow-xl bg-white dark:bg-neutral-900" align="start" sideOffset={8}>
                <Calendar mode="single" selected={customStartDate} onSelect={(d) => { setCustomStartDate(d); setPage(1); }} initialFocus />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-xl h-9 border-neutral-200 dark:border-neutral-600 hover:border-neutral-300 dark:hover:border-neutral-500">
                  <CalendarIcon className="h-4 w-4 mr-1.5" />
                  {customEndDate ? format(customEndDate, 'PPP') : 'End date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-2xl border-neutral-200 dark:border-neutral-700 shadow-xl bg-white dark:bg-neutral-900" align="start" sideOffset={8}>
                <Calendar mode="single" selected={customEndDate} onSelect={(d) => { setCustomEndDate(d); setPage(1); }} initialFocus />
              </PopoverContent>
            </Popover>
          </>
        )}
      </div>
      <div id="security-events-table">
        <DataTable
          columns={columns}
          data={events}
          isLoading={isLoading}
          emptyTitle="No security events"
          emptyDescription="No events matching your filters"
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          sortKey={orderBy}
          sortDirection={orderDirection}
          onSort={handleSort}
          getRowClassName={(e) => (isCriticalEvent(e.eventType) ? 'bg-red-50/80 dark:bg-red-950/30 border-l-4 border-l-red-400 dark:border-l-red-600' : undefined)}
        />
      </div>

      <Dialog open={ipDialogOpen} onOpenChange={setIpDialogOpen}>
        <DialogContent className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-black dark:text-white sm:max-w-2xl max-h-[70vh] overflow-y-auto rounded-2xl shadow-soft-lg">
          <DialogHeader>
            <DialogTitle className="text-black dark:text-white font-serif text-xl flex items-center gap-2.5">
              <Globe className="h-5 w-5 text-neutral-400" /> IP History: {ipAddress}
            </DialogTitle>
          </DialogHeader>
          {ipAddress && (
            <div className="flex justify-end gap-2 -mt-2 mb-2">
              {ipBlocked ? (
                <Button variant="outline" size="sm" onClick={handleUnblockIp} className="rounded-lg border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50">
                  <ShieldOff className="h-4 w-4 mr-2" />
                  Unblock IP
                </Button>
              ) : (
                <Button variant="destructive" size="sm" onClick={handleBlockIp} className="rounded-lg">
                  <Ban className="h-4 w-4 mr-2" />
                  Block IP (24h)
                </Button>
              )}
            </div>
          )}
          {ipLoading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 bg-neutral-100 rounded-xl" />)}</div>
          ) : ipHistory.length > 0 ? (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {ipHistory.map((evt: any) => (
                <div key={evt.id} className={`flex items-start gap-3 p-3 rounded-xl border ${isCriticalEvent(evt.eventType) ? 'bg-red-50/50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50' : 'bg-neutral-50 dark:bg-neutral-800/50 border-neutral-100 dark:border-neutral-700'}`}>
                  <div className="shrink-0 mt-0.5"><StatusBadge status={(eventTypeColors[evt.eventType] || 'info') as any} label={evt.eventType.replace(/_/g, ' ')} /></div>
                  <div className="min-w-0 flex-1"><p className="text-xs text-neutral-600 dark:text-neutral-300">{evt.reason}</p><p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1 font-mono">{evt.method} {evt.path}</p></div>
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 shrink-0">{new Date(evt.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-400 text-sm text-center py-8">No events found for this IP</p>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default AdminSecurity;
