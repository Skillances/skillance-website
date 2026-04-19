import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { get } from '@/lib/api';
import { RefreshCw, Download, Cookie, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/admin/PageHeader';
import StatsCard from '@/components/admin/dashboard/StatsCard';
import DataTable, { type Column } from '@/components/admin/DataTable';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface ConsentLogRow {
  id: string;
  createdAt: string;
  actorId: string | null;
  actorName: string | null;
  actorEmail: string | null;
  metadata: {
    policyVersion?: string;
    decision?: string;
    analytics?: boolean;
    marketing?: boolean;
  } | null;
  ipAddress: string | null;
  userAgent: string | null;
}

interface CompliancePayload {
  generatedAt: string;
  policyVersionLatest: string;
  summary: {
    total: number;
    acceptedAll: number;
    rejectedNonEssential: number;
    essentialOnly: number;
    acceptedForDisplay: number;
    acceptedPct: number;
    rejectedPct: number;
  };
  outdatedPolicyCount: number;
  concerns: string[];
  logs: ConsentLogRow[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

const AdminCompliance: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CompliancePayload | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);
      const params = new URLSearchParams({
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        limit: '200',
        offset: '0',
      });
      const res = await get(`/admin/compliance/cookie-consent?${params.toString()}`);
      if (res.success) setData(res.data);
    } catch {
      toast.error('Failed to load compliance data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns: Column<ConsentLogRow>[] = useMemo(
    () => [
      {
        key: 'createdAt',
        header: 'Date & time',
        render: (r) => <span className="text-neutral-600 text-sm">{new Date(r.createdAt).toLocaleString()}</span>,
      },
      {
        key: 'user',
        header: 'User',
        render: (r) => (
          <div>
            <p className="text-black dark:text-white font-medium text-sm">{r.actorName || 'Anonymous'}</p>
            {r.actorEmail && <p className="text-xs text-neutral-500 truncate max-w-[200px]">{r.actorEmail}</p>}
          </div>
        ),
      },
      {
        key: 'decision',
        header: 'Consent',
        render: (r) => {
          const d = r.metadata?.decision ?? '—';
          const cls =
            d === 'accepted_all'
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
              : d === 'essential_only'
                ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100'
                : d === 'rejected_non_essential'
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200'
                  : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200';
          return (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cls}`}>
              {d}
            </span>
          );
        },
      },
      {
        key: 'policyVersion',
        header: 'Policy version',
        render: (r) => <span className="text-neutral-500 text-sm">{r.metadata?.policyVersion ?? '—'}</span>,
      },
      {
        key: 'ipAddress',
        header: 'IP',
        render: (r) => <span className="text-neutral-500 text-xs font-mono">{r.ipAddress || '—'}</span>,
      },
      {
        key: 'userAgent',
        header: 'User agent',
        render: (r) => (
          <span className="text-neutral-500 text-xs truncate block max-w-[220px]" title={r.userAgent ?? undefined}>
            {(r.userAgent || '—').slice(0, 80)}
          </span>
        ),
      },
    ],
    []
  );

  const exportCsv = () => {
    if (!data?.logs.length) {
      toast.message('No rows to export');
      return;
    }
    const headers = ['createdAt', 'actorName', 'actorEmail', 'decision', 'policyVersion', 'analytics', 'marketing', 'ipAddress'];
    const lines = [headers.join(',')];
    for (const r of data.logs) {
      const esc = (v: string | number | boolean | null | undefined) => {
        const s = v == null ? '' : String(v);
        if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
        return s;
      };
      lines.push(
        [
          esc(new Date(r.createdAt).toISOString()),
          esc(r.actorName),
          esc(r.actorEmail),
          esc(r.metadata?.decision),
          esc(r.metadata?.policyVersion),
          esc(r.metadata?.analytics),
          esc(r.metadata?.marketing),
          esc(r.ipAddress),
        ].join(',')
      );
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skillance-cookie-consent-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Download started');
  };

  if (loading && !data) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-72 bg-neutral-100 dark:bg-neutral-800 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 bg-neutral-100 dark:bg-neutral-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const s = data?.summary;

  return (
    <div className="space-y-10">
      <PageHeader title="Cookie consent" description="POPIA consent events (last 30 days) from audit trail">
        <Button variant="outline" size="sm" onClick={fetchData} className="rounded-full">
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
        <Button variant="outline" size="sm" onClick={exportCsv} className="rounded-full" disabled={!data?.logs.length}>
          <Download className="h-4 w-4 mr-2" /> Export CSV
        </Button>
      </PageHeader>

      <p className="text-xs text-neutral-500">
        Generated: {data?.generatedAt ? new Date(data.generatedAt).toLocaleString() : '—'} · Current policy version:{' '}
        {data?.policyVersionLatest ?? '—'}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard title="Total records" value={s?.total ?? 0} change="Consent events" icon={Cookie} />
        <StatsCard
          title="Accepted (incl. custom)"
          value={s?.acceptedForDisplay ?? 0}
          change={s?.total ? `${s.acceptedPct.toFixed(1)}%` : '0%'}
          icon={CheckCircle2}
        />
        <StatsCard
          title="Rejected non-essential"
          value={s?.rejectedNonEssential ?? 0}
          change={s?.total ? `${s.rejectedPct.toFixed(1)}%` : '0%'}
          icon={XCircle}
        />
      </div>

      {data?.concerns && data.concerns.length > 0 && (
        <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/80 dark:bg-amber-950/30 p-4">
          <p className="text-sm font-medium text-amber-900 dark:text-amber-200 mb-2">Areas for review</p>
          <ul className="list-disc pl-5 text-sm text-amber-900/90 dark:text-amber-100/90 space-y-1">
            {data.concerns.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      <DataTable
        columns={columns}
        data={data?.logs ?? []}
        isLoading={loading}
        emptyTitle="No consent records"
        emptyDescription="Events appear when visitors save cookie choices."
      />
    </div>
  );
};

export default AdminCompliance;
