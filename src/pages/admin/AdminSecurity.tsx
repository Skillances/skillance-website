import React, { useState, useEffect, useCallback } from 'react';
import { get } from '@/lib/api';
import { Shield, AlertTriangle, Ban, Eye, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PageHeader from '@/components/admin/PageHeader';
import SearchFilter, { type FilterConfig } from '@/components/admin/SearchFilter';
import DataTable, { type Column } from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import StatsCard from '@/components/admin/dashboard/StatsCard';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface SecurityEvent { id: string; eventType: string; ipAddress: string; path: string; method: string; userAgent: string | null; reason: string; action: string | null; blockDuration: number | null; createdAt: string; }
interface SecurityStats { totalEvents: number; blockedCount: number; rateLimitedCount: number; exploitAttempts: number; uniqueIPs: number; topIPs: { ipAddress: string; count: number }[]; }

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

  const fetchEvents = useCallback(async () => { try { setIsLoading(true); const params = new URLSearchParams(); params.set('limit', String(pageSize)); params.set('offset', String((page - 1) * pageSize)); params.set('orderBy', 'createdAt'); params.set('orderDirection', 'desc'); if (eventTypeFilter !== 'all') params.set('eventType', eventTypeFilter); const res = await get(`/admin/security/events?${params.toString()}`); if (res.success) { setEvents(res.data.events || []); setTotal(res.data.total || 0); } } catch { toast.error('Failed to load security events'); } finally { setIsLoading(false); } }, [page, pageSize, eventTypeFilter]);
  const fetchStats = useCallback(async () => { try { const res = await get('/admin/security/statistics'); if (res.success) setStats(res.data); } catch {} }, []);
  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const viewIpHistory = async (ip: string) => { setIpAddress(ip); setIpDialogOpen(true); setIpLoading(true); try { const res = await get(`/admin/security/ip/${encodeURIComponent(ip)}?limit=50`); if (res.success) setIpHistory(res.data.events || []); } catch { toast.error('Failed to load IP history'); } finally { setIpLoading(false); } };

  const filters: FilterConfig[] = [{ key: 'eventType', placeholder: 'Event Type', value: eventTypeFilter, onChange: (v) => { setEventTypeFilter(v); setPage(1); }, options: [{ label: 'All Events', value: 'all' }, { label: 'Blocked', value: 'blocked' }, { label: 'Rate Limited', value: 'rate_limited' }, { label: 'Suspicious', value: 'suspicious' }, { label: 'Exploit Attempt', value: 'exploit_attempt' }, { label: 'Honeypot', value: 'honeypot' }, { label: 'Scanning Pattern', value: 'scanning_pattern' }] }];

  const columns: Column<SecurityEvent>[] = [
    { key: 'createdAt', header: 'Time', render: (e) => <span className="text-neutral-400 text-xs">{new Date(e.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span> },
    { key: 'eventType', header: 'Type', render: (e) => <StatusBadge status={(eventTypeColors[e.eventType] || 'info') as any} label={e.eventType.replace(/_/g, ' ')} /> },
    { key: 'ipAddress', header: 'IP Address', render: (e) => <button onClick={(ev) => { ev.stopPropagation(); viewIpHistory(e.ipAddress); }} className="text-black underline hover:text-neutral-600 font-mono text-xs transition-colors">{e.ipAddress}</button> },
    { key: 'method', header: 'Method', render: (e) => <span className="text-neutral-600 font-mono text-xs">{e.method}</span> },
    { key: 'path', header: 'Path', render: (e) => <span className="text-neutral-500 text-xs truncate max-w-[200px] block">{e.path}</span> },
    { key: 'reason', header: 'Reason', render: (e) => <span className="text-neutral-500 text-xs truncate max-w-[250px] block">{e.reason}</span> },
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
      <SearchFilter searchValue="" onSearchChange={() => {}} searchPlaceholder="Security events" filters={filters} />
      <DataTable columns={columns} data={events} isLoading={isLoading} emptyTitle="No security events" emptyDescription="No events matching your filters" page={page} pageSize={pageSize} total={total} onPageChange={setPage} />

      <Dialog open={ipDialogOpen} onOpenChange={setIpDialogOpen}>
        <DialogContent className="bg-white border-neutral-200 text-black sm:max-w-2xl max-h-[70vh] overflow-y-auto rounded-2xl shadow-soft-lg">
          <DialogHeader>
            <DialogTitle className="text-black font-serif text-xl flex items-center gap-2.5">
              <Globe className="h-5 w-5 text-neutral-400" /> IP History: {ipAddress}
            </DialogTitle>
          </DialogHeader>
          {ipLoading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 bg-neutral-100 rounded-xl" />)}</div>
          ) : ipHistory.length > 0 ? (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {ipHistory.map((evt: any) => (
                <div key={evt.id} className="flex items-start gap-3 p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                  <div className="shrink-0 mt-0.5"><StatusBadge status={(eventTypeColors[evt.eventType] || 'info') as any} label={evt.eventType.replace(/_/g, ' ')} /></div>
                  <div className="min-w-0 flex-1"><p className="text-xs text-neutral-600">{evt.reason}</p><p className="text-[10px] text-neutral-400 mt-1 font-mono">{evt.method} {evt.path}</p></div>
                  <span className="text-[10px] text-neutral-400 shrink-0">{new Date(evt.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
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
