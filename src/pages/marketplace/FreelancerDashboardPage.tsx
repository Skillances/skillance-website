import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Award,
  BadgeCheck,
  CalendarClock,
  ChevronRight,
  FileText,
  Images,
  MapPin,
  Package,
  Receipt,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  UserRound,
} from 'lucide-react';
import { get } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { useAuth } from '@/context/AuthContext';
import EarningsTrendChart, { type TrendPoint } from '@/components/marketplace/EarningsTrendChart';
import BookingRow from '@/components/marketplace/BookingRow';
import ApplicationStatusCard from '@/components/marketplace/ApplicationStatusCard';
import { MkCard, MkErrorState, MkPageHeader, MkSectionTitle, MkSkeleton, MkSwap } from '@/components/marketplace/ui';
import { apiErrorMessage, listFrom, unwrap } from '@/lib/marketplace/apiHelpers';
import { bookingKeys, fetchFreelancerBookings } from '@/lib/marketplace/bookings';
import { useCategories } from '@/lib/marketplace/categories';
import { formatZar } from '@/lib/marketplace/theme';
import { formatDateTime, sastNow } from '@/lib/marketplace/time';
import { cn } from '@/lib/utils';

type Stats = {
  earnings?: { today?: number; thisWeek?: number; thisMonth?: number; allTime?: number; monthlyComparison?: { current?: number; previous?: number; change?: number } };
  bookings?: { total?: number; pending?: number; thisWeek?: number; today?: number };
  metrics?: { responseRate?: number; averageRating?: number; totalReviews?: number };
};
type Completion = { isComplete?: boolean; isListed?: boolean; missingFields?: string[]; completionPercentage?: number };
type Activity = { type: string; title: string; description?: string; timestamp: string; actionUrl?: string };

/** Profile-completion items (API strings) to the web page that fixes each one. */
const COMPLETION_LINKS: Record<string, { to: string | null; hint: string }> = {
  'ID verification': { to: '/work/verification', hint: 'Upload your ID so customers can trust you' },
  'Service categories': { to: '/work/profile', hint: 'Choose the services you offer' },
  'Service location': { to: '/work/locations', hint: 'Tell customers where you work' },
  Availability: { to: '/work/availability', hint: 'Set the times you can take bookings' },
  Bio: { to: '/work/profile', hint: 'Introduce yourself in a few lines' },
  'Payout details': { to: null, hint: 'Add payout details in the Skillance mobile app' },
};

const TOOLS = [
  { to: '/work/profile', label: 'Profile and services', icon: UserRound },
  { to: '/work/locations', label: 'Service locations', icon: MapPin },
  { to: '/work/availability', label: 'Availability', icon: CalendarClock },
  { to: '/work/portfolio', label: 'Previous work', icon: Images },
  { to: '/work/certifications', label: 'Certifications', icon: Award },
  { to: '/work/verification', label: 'ID verification', icon: BadgeCheck },
  { to: '/work/police-clearance', label: 'Police clearance', icon: ShieldCheck },
  { to: '/work/products', label: 'Digital products', icon: Package },
  { to: '/work/invoices', label: 'Invoices', icon: Receipt },
];

function Metric({ label, value, sub }: { label: string; value: string; sub?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-mk-border p-4">
      <p className="text-[13px] text-mk-text-secondary">{label}</p>
      <p className="mt-1 font-mk-display text-[20px] font-bold">{value}</p>
      {sub && <div className="mt-0.5 text-[12px] text-mk-text-tertiary">{sub}</div>}
    </div>
  );
}

export default function FreelancerDashboardPage() {
  const { user } = useAuth();
  const fid = user?.freelancerId ?? null;
  const categories = useCategories();

  const stats = useQuery({
    queryKey: ['marketplace', 'dash', 'stats', fid],
    enabled: !!fid,
    queryFn: async () => unwrap<Stats>(await get(ApiPaths.marketplace.freelancerDashboardStats(fid!))),
  });
  const trend = useQuery({
    queryKey: ['marketplace', 'dash', 'trend', fid],
    enabled: !!fid,
    queryFn: async () => listFrom<TrendPoint>(await get(`${ApiPaths.marketplace.freelancerEarningsTrend(fid!)}?period=weekly&count=8`)),
  });
  const activity = useQuery({
    queryKey: ['marketplace', 'dash', 'activity', fid],
    enabled: !!fid,
    queryFn: async () => listFrom<Activity>(await get(`${ApiPaths.marketplace.freelancerDashboardActivity(fid!)}?limit=10`)),
  });
  const completion = useQuery({
    queryKey: ['marketplace', 'dash', 'completion'],
    enabled: !!fid,
    queryFn: async () => unwrap<Completion>(await get(ApiPaths.marketplace.myProfileCompletion)),
  });
  // Upcoming list from the jobs API (its times are SAST, unlike the stats payload).
  const jobs = useQuery({ queryKey: bookingKeys.freelancer(fid ?? ''), enabled: !!fid, queryFn: () => fetchFreelancerBookings(fid!) });

  if (!fid) {
    return (
      <>
        <MkPageHeader title="Dashboard" />
        <ApplicationStatusCard />
      </>
    );
  }

  const s = stats.data;
  const change = s?.earnings?.monthlyComparison?.change;
  const today = sastNow().date;
  const upcoming = (jobs.data?.items ?? [])
    .filter((b) => ['pending', 'confirmed', 'inprogress', 'in_progress'].includes(String(b.status).toLowerCase()) && b.scheduledDate.slice(0, 10) >= today)
    .slice(0, 5);
  const missing = completion.data?.missingFields ?? [];

  return (
    <div className="space-y-8">
      <MkPageHeader title={`Hi ${user?.firstName || user?.fullName?.split(' ')[0] || 'there'}`} subtitle="Here is how your work is going." />

      {completion.data && !completion.data.isListed && missing.length > 0 && (
        <MkCard className="border-mk-primary">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-[17px]">Complete your profile</h2>
              <p className="text-[14px] text-mk-text-secondary">Customers can find and book you once these are done.</p>
            </div>
            <span className="font-mk-display text-[20px] font-bold">{completion.data.completionPercentage ?? 0}%</span>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-mk-muted" aria-hidden="true">
            <div className="h-full rounded-full bg-mk-accent transition-[width] duration-300 ease-out" style={{ width: `${completion.data.completionPercentage ?? 0}%` }} />
          </div>
          <ul className="mt-3 divide-y divide-mk-divider">
            {missing.map((m) => {
              const link = COMPLETION_LINKS[m];
              const body = (
                <>
                  <span className="min-w-0 flex-1">
                    <span className="block font-mk-display text-[14px] font-semibold">{m}</span>
                    <span className="block text-[13px] text-mk-text-secondary">{link?.hint ?? 'Finish this step'}</span>
                  </span>
                  {link?.to && <ChevronRight className="h-4 w-4 shrink-0 text-mk-text-tertiary" aria-hidden="true" />}
                </>
              );
              return (
                <li key={m}>
                  {link?.to ? (
                    <Link to={link.to} className="flex min-h-12 items-center gap-3 py-2.5">
                      {body}
                    </Link>
                  ) : (
                    <div className="flex min-h-12 items-center gap-3 py-2.5">{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </MkCard>
      )}

      <section aria-label="Earnings overview">
        <MkSwap id={stats.isPending ? 'l' : stats.isError ? 'e' : 'd'}>
          {stats.isPending ? (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {Array.from({ length: 4 }, (_, i) => (
                <MkSkeleton key={i} className="h-24 rounded-2xl" />
              ))}
            </div>
          ) : stats.isError ? (
            <MkErrorState message={apiErrorMessage(stats.error, 'Your stats could not be loaded.')} onRetry={() => void stats.refetch()} retrying={stats.isRefetching} />
          ) : (
            <div className="space-y-3">
              <div className="rounded-2xl bg-mk-primary p-5 text-mk-on-primary shadow-mk-hero">
                <p className="text-[13px] opacity-75">Earnings this month</p>
                <p className="mt-1 font-mk-display text-[32px] font-bold leading-tight">{formatZar(s?.earnings?.thisMonth ?? 0)}</p>
                <p className="mt-1 text-[13px] opacity-75">
                  This month · {s?.bookings?.thisWeek ?? 0} bookings this week
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-mk-secondary pt-3 text-[14px]">
                  <div>
                    <p className="opacity-75">Today's earnings</p>
                    <p className="font-mk-display font-semibold">{formatZar(s?.earnings?.today ?? 0)}</p>
                  </div>
                  <div>
                    <p className="opacity-75">This week</p>
                    <p className="font-mk-display font-semibold">{formatZar(s?.earnings?.thisWeek ?? 0)}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Metric
                  label="Weekly earnings"
                  value={formatZar(s?.earnings?.thisWeek ?? 0)}
                  sub={
                    typeof change === 'number' ? (
                      <span className={cn('inline-flex items-center gap-1', change >= 0 ? 'text-mk-success' : 'text-mk-error')}>
                        {change >= 0 ? <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" /> : <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />}
                        {change >= 0 ? 'Up' : 'Down'} {Math.abs(change).toFixed(1)}% from last month
                      </span>
                    ) : undefined
                  }
                />
                <Metric label="Response rate" value={`${Math.round(s?.metrics?.responseRate ?? 0)}%`} />
                <Metric label="Rating" value={(s?.metrics?.averageRating ?? 0).toFixed(1)} sub={`${s?.metrics?.totalReviews ?? 0} reviews`} />
                <Metric label="Bookings" value={String(s?.bookings?.total ?? 0)} sub={`${s?.bookings?.pending ?? 0} pending`} />
              </div>
            </div>
          )}
        </MkSwap>
      </section>

      <section>
        <MkSectionTitle action={<Link to="/work/earnings" className="inline-flex min-h-11 items-center text-[13px] font-semibold text-mk-text-secondary hover:text-mk-text-primary">Earnings report</Link>}>
          Weekly earnings, last 8 weeks
        </MkSectionTitle>
        <MkCard>
          {trend.isPending ? (
            <MkSkeleton className="h-56 w-full" />
          ) : trend.isError ? (
            <MkErrorState message={apiErrorMessage(trend.error)} onRetry={() => void trend.refetch()} />
          ) : (trend.data ?? []).length === 0 ? (
            <p className="py-10 text-center text-[14px] text-mk-text-secondary">Earnings show here after your first completed booking.</p>
          ) : (
            <EarningsTrendChart points={trend.data ?? []} label="Weekly earnings, last 8 weeks" />
          )}
        </MkCard>
      </section>

      <section>
        <MkSectionTitle action={<Link to="/work/jobs" className="inline-flex min-h-11 items-center text-[13px] font-semibold text-mk-text-secondary hover:text-mk-text-primary">All jobs</Link>}>
          Upcoming
        </MkSectionTitle>
        {jobs.isPending ? (
          <MkSkeleton className="h-20 w-full rounded-2xl" />
        ) : jobs.isError ? (
          <MkErrorState message={apiErrorMessage(jobs.error)} onRetry={() => void jobs.refetch()} />
        ) : upcoming.length === 0 ? (
          <p className="rounded-2xl border border-mk-border p-4 text-[14px] text-mk-text-secondary">
            No upcoming jobs. Keep your availability up to date so customers can book you.
          </p>
        ) : (
          <ul className="space-y-3">
            {upcoming.map((b) => (
              <li key={b.id}>
                <BookingRow booking={b} role="freelancer" categories={categories.data} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <MkSectionTitle>Recent activity</MkSectionTitle>
        {activity.isPending ? (
          <MkSkeleton className="h-24 w-full rounded-2xl" />
        ) : activity.isError ? (
          <MkErrorState message={apiErrorMessage(activity.error)} onRetry={() => void activity.refetch()} />
        ) : (activity.data ?? []).length === 0 ? (
          <p className="text-[14px] text-mk-text-secondary">New bookings, payments, and reviews show here.</p>
        ) : (
          <ul className="divide-y divide-mk-divider rounded-2xl border border-mk-border">
            {(activity.data ?? []).map((a, i) => {
              const inner = (
                <>
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-mk-text-tertiary" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-mk-display text-[14px] font-semibold">{a.title}</span>
                    {a.description && <span className="block text-[13px] text-mk-text-secondary">{a.description}</span>}
                    <span className="block text-[12px] text-mk-text-tertiary">{formatDateTime(a.timestamp)}</span>
                  </span>
                </>
              );
              const to = a.actionUrl?.startsWith('/bookings/') ? a.actionUrl : a.actionUrl === '/earnings' ? '/work/earnings' : null;
              return (
                <li key={`${a.timestamp}-${i}`}>
                  {to ? (
                    <Link to={to} className="flex gap-3 p-4 hover:bg-mk-muted">
                      {inner}
                    </Link>
                  ) : (
                    <div className="flex gap-3 p-4">{inner}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <MkSectionTitle>Manage your work</MkSectionTitle>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((t) => (
            <li key={t.to}>
              <Link to={t.to} className="flex min-h-14 items-center gap-3 rounded-2xl border border-mk-border px-4 transition-colors duration-150 hover:bg-mk-muted">
                <t.icon className="h-5 w-5 text-mk-text-secondary" aria-hidden="true" />
                <span className="flex-1 font-mk-display text-[14px] font-semibold">{t.label}</span>
                <ChevronRight className="h-4 w-4 text-mk-text-tertiary" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
