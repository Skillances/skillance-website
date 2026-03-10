import React, { useState, useEffect, useCallback } from 'react';
import { get } from '@/lib/api';
import { Shield, AlertTriangle, Ban, Globe, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/components/admin/PageHeader';
import SearchFilter, { type FilterConfig } from '@/components/admin/SearchFilter';
import DataTable, { type Column } from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import StatsCard from '@/components/admin/dashboard/StatsCard';
import SecurityWorldMap from '@/components/admin/SecurityWorldMap';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface SecurityEvent { id: string; eventType: string; ipAddress: string; path: string; method: string; userAgent: string | null; reason: string; action: string | null; blockDuration: number | null; createdAt: string; }
interface SecurityStats { totalEvents: number; blockedCount: number; rateLimitedCount: number; exploitAttempts: number; uniqueIPs: number; topIPs: { ipAddress: string; count: number }[]; }
interface CountryData { countryCode: string; count: number; lat?: number; lon?: number; }

function getCountryName(code: string): string {
  if (code === 'XX') return 'Unknown (private IPs)';
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) ?? code;
  } catch {
    return code;
  }
}

const eventTypeColors: Record<string, string> = { blocked: 'error', rate_limited: 'warning', suspicious: 'warning', exploit_attempt: 'error', honeypot: 'error', scanning_pattern: 'info' };

const AdminSecurity: React.FC = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 50;
  const [ipDialogOpen, setIpDialogOpen] = useState(false);
  const [ipHistory, setIpHistory] = useState<any[]>([]);
  const [ipAddress, setIpAddress] = useState('');
  const [ipLoading, setIpLoading] = useState(false);
  const [byCountry, setByCountry] = useState<CountryData[]>([]);
  const [byCountryLoading, setByCountryLoading] = useState(false);
  const [byCountryError, setByCountryError] = useState(false);

  const fetchEvents = useCallback(async () => { try { setIsLoading(true); const params = new URLSearchParams(); params.set('limit', String(pageSize)); params.set('offset', String((page - 1) * pageSize)); params.set('orderBy', 'createdAt'); params.set('orderDirection', 'desc'); if (eventTypeFilter !== 'all') params.set('eventType', eventTypeFilter); const res = await get(`/admin/security/events?${params.toString()}`); if (res.success) { setEvents(res.data.events || []); setTotal(res.data.total || 0); } } catch { toast.error('Failed to load security events'); } finally { setIsLoading(false); } }, [page, pageSize, eventTypeFilter]);
  const fetchStats = useCallback(async () => { try { const res = await get('/admin/security/statistics'); if (res.success) setStats(res.data); } catch {} }, []);
  const fetchByCountry = useCallback(async () => {
    try {
      setByCountryLoading(true);
      setByCountryError(false);
      const res = await get('/admin/security/by-country?limit=30');
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
  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchEvents(); }, [fetchEvents]);
  useEffect(() => { fetchByCountry(); }, [fetchByCountry]);

  const viewIpHistory = async (ip: string) => { setIpAddress(ip); setIpDialogOpen(true); setIpLoading(true); try { const res = await get(`/admin/security/ip/${encodeURIComponent(ip)}?limit=50`); if (res.success) setIpHistory(res.data.events || []); } catch { toast.error('Failed to load IP history'); } finally { setIpLoading(false); } };

  const filters: FilterConfig[] = [{ key: 'eventType', placeholder: 'Event Type', value: eventTypeFilter, onChange: (v) => { setEventTypeFilter(v); setPage(1); }, options: [{ label: 'All Events', value: 'all' }, { label: 'Blocked', value: 'blocked' }, { label: 'Rate Limited', value: 'rate_limited' }, { label: 'Suspicious', value: 'suspicious' }, { label: 'Exploit Attempt', value: 'exploit_attempt' }, { label: 'Honeypot', value: 'honeypot' }, { label: 'Scanning Pattern', value: 'scanning_pattern' }] }];

  const columns: Column<SecurityEvent>[] = [
    { key: 'createdAt', header: 'Time', render: (e) => <span className="text-neutral-400 dark:text-neutral-500 text-xs">{new Date(e.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span> },
    { key: 'eventType', header: 'Type', render: (e) => <StatusBadge status={(eventTypeColors[e.eventType] || 'info') as any} label={e.eventType.replace(/_/g, ' ')} /> },
    { key: 'ipAddress', header: 'IP Address', render: (e) => <button onClick={(ev) => { ev.stopPropagation(); viewIpHistory(e.ipAddress); }} className="text-black dark:text-white underline hover:text-neutral-600 dark:hover:text-neutral-300 font-mono text-xs transition-colors" aria-label={`View history for ${e.ipAddress}`}>{e.ipAddress}</button> },
    { key: 'method', header: 'Method', render: (e) => <span className="text-neutral-600 dark:text-neutral-400 font-mono text-xs">{e.method}</span> },
    { key: 'path', header: 'Path', render: (e) => <span className="text-neutral-500 dark:text-neutral-400 text-xs truncate max-w-[200px] block">{e.path}</span> },
    { key: 'reason', header: 'Reason', render: (e) => <span className="text-neutral-500 dark:text-neutral-400 text-xs truncate max-w-[250px] block">{e.reason}</span> },
  ];

  const statsCards = stats ? [
    { title: 'Total Events', value: stats.totalEvents.toLocaleString(), icon: Shield, color: '#171717' },
    { title: 'Blocked', value: stats.blockedCount.toLocaleString(), icon: Ban, color: '#ef4444' },
    { title: 'Rate Limited', value: stats.rateLimitedCount.toLocaleString(), icon: AlertTriangle, color: '#f59e0b' },
    { title: 'Unique IPs', value: stats.uniqueIPs.toLocaleString(), icon: Globe, color: '#8b5cf6' },
  ] : [];

  return (
    <div className="space-y-10">
      <PageHeader title="Security Logs" description="Monitor security events and threats" />
      {stats && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{statsCards.map((s, i) => <StatsCard key={s.title} {...s} index={i} />)}</div>}

      <Card className="border-neutral-100 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 rounded-2xl shadow-sm dark:shadow-[0_1px_0_0_rgba(255,255,255,0.06)] overflow-hidden">
        <CardHeader className="border-b border-neutral-100 dark:border-neutral-700/80 pb-4 px-6">
          <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400 tracking-wide uppercase flex items-center gap-2">
            <MapPin className="h-4 w-4" /> Events by Country
          </CardTitle>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">Hover over a circle to see details. Scroll to zoom, drag to pan.</p>
        </CardHeader>
        <CardContent className="p-0">
          {byCountryLoading ? (
            <div className="p-6">
              <Skeleton className="w-full h-[300px] rounded-lg bg-neutral-100 dark:bg-neutral-700" />
            </div>
          ) : byCountry.length > 0 ? (
            <>
              <SecurityWorldMap data={byCountry} />
              <div className="px-6 pb-5 pt-3 border-t border-neutral-100 dark:border-neutral-700/50">
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

      <SearchFilter searchValue="" onSearchChange={() => {}} searchPlaceholder="Security events" filters={filters} />
      <DataTable columns={columns} data={events} isLoading={isLoading} emptyTitle="No security events" emptyDescription="No events matching your filters" page={page} pageSize={pageSize} total={total} onPageChange={setPage} />

      <Dialog open={ipDialogOpen} onOpenChange={setIpDialogOpen}>
        <DialogContent className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-black dark:text-white sm:max-w-2xl max-h-[70vh] overflow-y-auto rounded-2xl shadow-soft-lg">
          <DialogHeader>
            <DialogTitle className="text-black dark:text-white font-serif text-xl flex items-center gap-2.5">
              <Globe className="h-5 w-5 text-neutral-400" /> IP History: {ipAddress}
            </DialogTitle>
          </DialogHeader>
          {ipLoading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 bg-neutral-100 rounded-xl" />)}</div>
          ) : ipHistory.length > 0 ? (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {ipHistory.map((evt: any) => (
                <div key={evt.id} className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-700">
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
