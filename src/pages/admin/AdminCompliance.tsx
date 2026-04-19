import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { get } from '@/lib/api';
import {
  RefreshCw,
  Download,
  Cookie,
  CheckCircle2,
  XCircle,
  FileSignature,
  UserRound,
  Briefcase,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

interface TermsLogRow {
  id: string;
  createdAt: string;
  actorId: string | null;
  actorName: string | null;
  actorEmail: string | null;
  actorUserType: string | null;
  userCreatedAt: string | null;
  metadata: {
    role?: 'customer' | 'freelancer' | string;
    termsVersion?: string;
    privacyVersion?: string;
    latestTermsVersion?: string;
    latestPrivacyVersion?: string;
    source?: string;
  } | null;
  ipAddress: string | null;
  userAgent: string | null;
}

interface TermsPayload {
  generatedAt: string;
  action: string;
  termsVersionLatest: string;
  privacyVersionLatest: string;
  summary: {
    total: number;
    customers: number;
    freelancers: number;
    onLatestTerms: number;
    onLatestPrivacy: number;
    outdatedTerms: number;
    outdatedPrivacy: number;
  };
  concerns: string[];
  logs: TermsLogRow[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

type TabValue = 'cookies' | 'terms';
type RoleFilter = 'all' | 'customer' | 'freelancer';

const AdminCompliance: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab: TabValue =
    searchParams.get('tab') === 'terms' ? 'terms' : 'cookies';

  const setTab = (v: string) => {
    const next = new URLSearchParams(searchParams);
    if (v === 'cookies') next.delete('tab');
    else next.set('tab', v);
    setSearchParams(next, { replace: true });
  };

  const [cookieLoading, setCookieLoading] = useState(true);
  const [cookieData, setCookieData] = useState<CompliancePayload | null>(null);

  const [termsLoading, setTermsLoading] = useState(true);
  const [termsData, setTermsData] = useState<TermsPayload | null>(null);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [emailFilter, setEmailFilter] = useState('');
  const [emailFilterDebounced, setEmailFilterDebounced] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setEmailFilterDebounced(emailFilter.trim()), 300);
    return () => clearTimeout(t);
  }, [emailFilter]);

  const fetchCookieData = useCallback(async () => {
    try {
      setCookieLoading(true);
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
      if (res.success) setCookieData(res.data);
    } catch {
      toast.error('Failed to load cookie consent data');
    } finally {
      setCookieLoading(false);
    }
  }, []);

  const fetchTermsData = useCallback(async () => {
    try {
      setTermsLoading(true);
      const params = new URLSearchParams({
        limit: '200',
        offset: '0',
      });
      if (roleFilter !== 'all') params.set('role', roleFilter);
      if (emailFilterDebounced) params.set('actorEmail', emailFilterDebounced);
      const res = await get(`/admin/compliance/terms-acceptance?${params.toString()}`);
      if (res.success) setTermsData(res.data);
    } catch {
      toast.error('Failed to load terms acceptance data');
    } finally {
      setTermsLoading(false);
    }
  }, [roleFilter, emailFilterDebounced]);

  useEffect(() => {
    fetchCookieData();
  }, [fetchCookieData]);

  useEffect(() => {
    fetchTermsData();
  }, [fetchTermsData]);

  // ------- Cookie consent table columns (unchanged behavior) -------
  const cookieColumns: Column<ConsentLogRow>[] = useMemo(
    () => [
      {
        key: 'createdAt',
        header: 'Date & time',
        render: (r) => (
          <span className="text-neutral-600 text-sm">
            {new Date(r.createdAt).toLocaleString()}
          </span>
        ),
      },
      {
        key: 'user',
        header: 'User',
        render: (r) => (
          <div>
            <p className="text-black dark:text-white font-medium text-sm">
              {r.actorName || 'Anonymous'}
            </p>
            {r.actorEmail && (
              <p className="text-xs text-neutral-500 truncate max-w-[200px]">
                {r.actorEmail}
              </p>
            )}
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
        render: (r) => (
          <span className="text-neutral-500 text-sm">
            {r.metadata?.policyVersion ?? '—'}
          </span>
        ),
      },
      {
        key: 'ipAddress',
        header: 'IP',
        render: (r) => (
          <span className="text-neutral-500 text-xs font-mono">
            {r.ipAddress || '—'}
          </span>
        ),
      },
      {
        key: 'userAgent',
        header: 'User agent',
        render: (r) => (
          <span
            className="text-neutral-500 text-xs truncate block max-w-[220px]"
            title={r.userAgent ?? undefined}
          >
            {(r.userAgent || '—').slice(0, 80)}
          </span>
        ),
      },
    ],
    []
  );

  // ------- Terms acceptance table columns -------
  const formatExact = (iso: string | null) =>
    iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'medium' }) : '—';

  const latestTerms = termsData?.termsVersionLatest ?? '';
  const latestPrivacy = termsData?.privacyVersionLatest ?? '';

  const termsColumns: Column<TermsLogRow>[] = useMemo(
    () => [
      {
        key: 'createdAt',
        header: 'Accepted at',
        render: (r) => (
          <div className="min-w-[170px]">
            <p className="text-black dark:text-white text-sm font-medium">
              {formatExact(r.createdAt)}
            </p>
            <p className="text-xs text-neutral-500">
              {new Date(r.createdAt).toISOString()}
            </p>
          </div>
        ),
      },
      {
        key: 'userCreatedAt',
        header: 'Signed up at',
        render: (r) => (
          <div className="min-w-[170px]">
            <p className="text-black dark:text-white text-sm">
              {formatExact(r.userCreatedAt)}
            </p>
            {r.userCreatedAt && r.createdAt && (
              <p className="text-xs text-neutral-500">
                {(() => {
                  const diffMs =
                    new Date(r.createdAt).getTime() -
                    new Date(r.userCreatedAt).getTime();
                  const abs = Math.abs(diffMs);
                  if (abs < 2000) return 'at signup';
                  if (abs < 60_000) return `${Math.round(abs / 1000)}s after signup`;
                  if (abs < 3_600_000) return `${Math.round(abs / 60_000)}m after signup`;
                  if (abs < 86_400_000) return `${Math.round(abs / 3_600_000)}h after signup`;
                  return `${Math.round(abs / 86_400_000)}d after signup`;
                })()}
              </p>
            )}
          </div>
        ),
      },
      {
        key: 'user',
        header: 'User',
        render: (r) => (
          <div className="min-w-[200px]">
            {r.actorId ? (
              <Link
                to={`/admin/users/${r.actorId}`}
                className="text-black dark:text-white font-medium text-sm hover:underline"
              >
                {r.actorName || 'Unknown user'}
              </Link>
            ) : (
              <p className="text-black dark:text-white font-medium text-sm">
                {r.actorName || 'Unknown user'}
              </p>
            )}
            {r.actorEmail && (
              <p className="text-xs text-neutral-500 truncate max-w-[240px]">
                {r.actorEmail}
              </p>
            )}
          </div>
        ),
      },
      {
        key: 'role',
        header: 'Role',
        render: (r) => {
          const role =
            (r.metadata?.role as string | undefined) ||
            r.actorUserType ||
            '—';
          const cls =
            role === 'customer'
              ? 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200'
              : role === 'freelancer'
                ? 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200'
                : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200';
          return (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${cls}`}>
              {role}
            </span>
          );
        },
      },
      {
        key: 'termsVersion',
        header: 'Terms',
        render: (r) => {
          const v = r.metadata?.termsVersion ?? '—';
          const outdated = latestTerms && v !== '—' && v !== latestTerms;
          return (
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                outdated
                  ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
              }`}
              title={outdated ? `Latest is v${latestTerms}` : 'On latest version'}
            >
              v{v}
            </span>
          );
        },
      },
      {
        key: 'privacyVersion',
        header: 'Privacy',
        render: (r) => {
          const v = r.metadata?.privacyVersion ?? '—';
          const outdated = latestPrivacy && v !== '—' && v !== latestPrivacy;
          return (
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                outdated
                  ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
              }`}
              title={outdated ? `Latest is v${latestPrivacy}` : 'On latest version'}
            >
              v{v}
            </span>
          );
        },
      },
      {
        key: 'ipAddress',
        header: 'IP',
        render: (r) => (
          <span className="text-neutral-500 text-xs font-mono">
            {r.ipAddress || '—'}
          </span>
        ),
      },
    ],
    [latestTerms, latestPrivacy]
  );

  const exportCookieCsv = () => {
    if (!cookieData?.logs.length) {
      toast.message('No rows to export');
      return;
    }
    const headers = [
      'createdAt',
      'actorName',
      'actorEmail',
      'decision',
      'policyVersion',
      'analytics',
      'marketing',
      'ipAddress',
    ];
    const lines = [headers.join(',')];
    for (const r of cookieData.logs) {
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

  const exportTermsCsv = () => {
    if (!termsData?.logs.length) {
      toast.message('No rows to export');
      return;
    }
    const headers = [
      'acceptedAt',
      'signedUpAt',
      'userId',
      'actorName',
      'actorEmail',
      'role',
      'termsVersion',
      'privacyVersion',
      'ipAddress',
      'userAgent',
    ];
    const lines = [headers.join(',')];
    for (const r of termsData.logs) {
      const esc = (v: string | number | boolean | null | undefined) => {
        const s = v == null ? '' : String(v);
        if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
        return s;
      };
      lines.push(
        [
          esc(new Date(r.createdAt).toISOString()),
          esc(r.userCreatedAt ? new Date(r.userCreatedAt).toISOString() : ''),
          esc(r.actorId),
          esc(r.actorName),
          esc(r.actorEmail),
          esc(r.metadata?.role ?? r.actorUserType),
          esc(r.metadata?.termsVersion),
          esc(r.metadata?.privacyVersion),
          esc(r.ipAddress),
          esc(r.userAgent),
        ].join(',')
      );
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skillance-terms-acceptance-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Download started');
  };

  const cs = cookieData?.summary;
  const ts = termsData?.summary;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Compliance"
        description="POPIA / App Store / Play Store consent evidence from the audit trail"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={tab === 'cookies' ? fetchCookieData : fetchTermsData}
          className="rounded-full"
        >
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={tab === 'cookies' ? exportCookieCsv : exportTermsCsv}
          className="rounded-full"
          disabled={
            tab === 'cookies'
              ? !cookieData?.logs.length
              : !termsData?.logs.length
          }
        >
          <Download className="h-4 w-4 mr-2" /> Export CSV
        </Button>
      </PageHeader>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-xl">
          <TabsTrigger value="cookies" className="rounded-lg px-4">
            <Cookie className="h-4 w-4 mr-2" /> Cookie consent
          </TabsTrigger>
          <TabsTrigger value="terms" className="rounded-lg px-4">
            <FileSignature className="h-4 w-4 mr-2" /> Terms acceptance
          </TabsTrigger>
        </TabsList>

        {/* ---------- Cookie consent tab ---------- */}
        <TabsContent value="cookies" className="space-y-8 mt-6">
          {cookieLoading && !cookieData ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  className="h-28 bg-neutral-100 dark:bg-neutral-800 rounded-2xl"
                />
              ))}
            </div>
          ) : (
            <>
              <p className="text-xs text-neutral-500">
                Generated:{' '}
                {cookieData?.generatedAt
                  ? new Date(cookieData.generatedAt).toLocaleString()
                  : '—'}{' '}
                · Current policy version: {cookieData?.policyVersionLatest ?? '—'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatsCard
                  title="Total records"
                  value={cs?.total ?? 0}
                  change="Consent events"
                  icon={Cookie}
                />
                <StatsCard
                  title="Accepted (incl. custom)"
                  value={cs?.acceptedForDisplay ?? 0}
                  change={cs?.total ? `${cs.acceptedPct.toFixed(1)}%` : '0%'}
                  icon={CheckCircle2}
                />
                <StatsCard
                  title="Rejected non-essential"
                  value={cs?.rejectedNonEssential ?? 0}
                  change={cs?.total ? `${cs.rejectedPct.toFixed(1)}%` : '0%'}
                  icon={XCircle}
                />
              </div>

              {cookieData?.concerns && cookieData.concerns.length > 0 && (
                <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/80 dark:bg-amber-950/30 p-4">
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-200 mb-2">
                    Areas for review
                  </p>
                  <ul className="list-disc pl-5 text-sm text-amber-900/90 dark:text-amber-100/90 space-y-1">
                    {cookieData.concerns.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              <DataTable
                columns={cookieColumns}
                data={cookieData?.logs ?? []}
                isLoading={cookieLoading}
                emptyTitle="No consent records"
                emptyDescription="Events appear when visitors save cookie choices."
              />
            </>
          )}
        </TabsContent>

        {/* ---------- Terms acceptance tab ---------- */}
        <TabsContent value="terms" className="space-y-8 mt-6">
          {termsLoading && !termsData ? (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton
                  key={i}
                  className="h-28 bg-neutral-100 dark:bg-neutral-800 rounded-2xl"
                />
              ))}
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                <span>
                  Generated:{' '}
                  {termsData?.generatedAt
                    ? new Date(termsData.generatedAt).toLocaleString()
                    : '—'}
                </span>
                <span className="hidden sm:inline">·</span>
                <span>
                  Latest Terms v{termsData?.termsVersionLatest ?? '—'} · Privacy v
                  {termsData?.privacyVersionLatest ?? '—'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                  title="Total acceptances"
                  value={ts?.total ?? 0}
                  change="Signed Terms & Privacy"
                  icon={FileSignature}
                />
                <StatsCard
                  title="Customers"
                  value={ts?.customers ?? 0}
                  change={
                    ts?.total
                      ? `${((ts.customers / ts.total) * 100).toFixed(1)}%`
                      : '0%'
                  }
                  icon={UserRound}
                />
                <StatsCard
                  title="Freelancers"
                  value={ts?.freelancers ?? 0}
                  change={
                    ts?.total
                      ? `${((ts.freelancers / ts.total) * 100).toFixed(1)}%`
                      : '0%'
                  }
                  icon={Briefcase}
                />
                <StatsCard
                  title="On outdated version"
                  value={Math.max(
                    ts?.outdatedTerms ?? 0,
                    ts?.outdatedPrivacy ?? 0
                  )}
                  change={
                    ts?.total
                      ? `${ts.outdatedTerms} terms · ${ts.outdatedPrivacy} privacy`
                      : '0'
                  }
                  icon={AlertTriangle}
                />
              </div>

              {termsData?.concerns && termsData.concerns.length > 0 && (
                <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/80 dark:bg-amber-950/30 p-4">
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-200 mb-2">
                    Areas for review
                  </p>
                  <ul className="list-disc pl-5 text-sm text-amber-900/90 dark:text-amber-100/90 space-y-1">
                    {termsData.concerns.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-wrap items-end gap-3">
                <div className="min-w-[200px]">
                  <label className="block text-xs font-medium text-neutral-500 mb-1">
                    Role
                  </label>
                  <Select
                    value={roleFilter}
                    onValueChange={(v) => setRoleFilter(v as RoleFilter)}
                  >
                    <SelectTrigger className="h-9 rounded-lg">
                      <SelectValue placeholder="All roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All roles</SelectItem>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="freelancer">Freelancer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 min-w-[220px]">
                  <label className="block text-xs font-medium text-neutral-500 mb-1">
                    Search by email
                  </label>
                  <Input
                    value={emailFilter}
                    onChange={(e) => setEmailFilter(e.target.value)}
                    placeholder="jane@example.com"
                    className="h-9 rounded-lg"
                  />
                </div>
                {(roleFilter !== 'all' || emailFilter) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full"
                    onClick={() => {
                      setRoleFilter('all');
                      setEmailFilter('');
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </div>

              <DataTable
                columns={termsColumns}
                data={termsData?.logs ?? []}
                isLoading={termsLoading}
                emptyTitle="No terms acceptances yet"
                emptyDescription="Rows appear as new users sign up and agree to the Terms & Privacy Policy."
              />

              {termsData?.hasMore && (
                <p className="text-xs text-neutral-500">
                  Showing latest {termsData.logs.length} of {termsData.total}.
                  Narrow the filters to see older rows.
                </p>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminCompliance;
