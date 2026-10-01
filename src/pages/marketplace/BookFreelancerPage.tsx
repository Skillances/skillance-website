import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarX, ChevronLeft, ChevronRight, Repeat } from 'lucide-react';
import { get, post } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import {
  MkAvatar,
  MkButton,
  MkConfirmDialog,
  MkEmpty,
  MkErrorState,
  MkFormError,
  MkPageHeader,
  MkRating,
  MkSectionTitle,
  MkSkeleton,
  MkSwap,
} from '@/components/marketplace/ui';
import { apiErrorMessage, unwrap } from '@/lib/marketplace/apiHelpers';
import { categoryLabel, useCategories } from '@/lib/marketplace/categories';
import { money, rateLabel } from '@/lib/marketplace/pricing';
import { isIdVerified } from '@/lib/marketplace/search';
import { formatZar, mkMotion } from '@/lib/marketplace/theme';
import { useAblyChannel } from '@/lib/marketplace/realtime';
import { addMinutes, formatDate, formatDuration, isPastSlot, monthBounds, sastNow, ymd } from '@/lib/marketplace/time';
import { cn } from '@/lib/utils';

type Slot = { startTime: string; durationMinutes: number };
type DayAvailability = { date: string; availableSlots: Slot[]; bookedSlots?: Slot[] };
type Freelancer = {
  id: string;
  fullName?: string;
  profilePhotoUrl?: string | null;
  rating?: number | null;
  totalReviews?: number | null;
  isVerified?: boolean;
  idVerificationStatus?: string;
  categoryIds?: string[];
  categoryRates?: { categoryId: string; hourlyRate: number | string; bookingPricingMode?: string }[];
  acceptsRecurringBookings?: boolean;
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
/** The availability API accepts at most 90 days per request; booking looks up to three months ahead. */
const MAX_MONTHS_AHEAD = 2;

const slotKey = (s: Slot) => `${s.startTime}-${s.durationMinutes}`;
/** The API stores the leaf category id: the last segment of the colon path (app bookingLeafCategoryId). */
const leafId = (path: string) => path.split(':').pop() ?? path;

function MonthCalendar({
  year,
  month0,
  selected,
  onSelect,
  daysWithSlots,
  loading,
  onPrev,
  onNext,
  canPrev,
  canNext,
}: {
  year: number;
  month0: number;
  selected: string | null;
  onSelect: (d: string) => void;
  daysWithSlots: Set<string>;
  loading: boolean;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
}) {
  const { days, firstWeekday } = monthBounds(year, month0);
  const today = sastNow().date;
  const label = new Intl.DateTimeFormat('en-ZA', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(Date.UTC(year, month0, 1)),
  );
  return (
    <div className="rounded-2xl border border-mk-border p-3 sm:p-4">
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={onPrev}
          disabled={!canPrev}
          aria-label="Previous month"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-mk-muted disabled:opacity-30"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <p className="font-mk-display text-[15px] font-semibold" aria-live="polite">
          {label}
        </p>
        <button
          type="button"
          onClick={onNext}
          disabled={!canNext}
          aria-label="Next month"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-mk-muted disabled:opacity-30"
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center" role="grid" aria-label={label}>
        {WEEKDAYS.map((w) => (
          <div key={w} className="pb-1 font-mk-display text-[11px] font-semibold uppercase text-mk-text-tertiary" role="columnheader">
            {w}
          </div>
        ))}
        {Array.from({ length: firstWeekday }, (_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {Array.from({ length: days }, (_, i) => {
          const d = ymd(year, month0, i + 1);
          const past = d < today;
          const has = daysWithSlots.has(d);
          const on = selected === d;
          return (
            <button
              key={d}
              type="button"
              role="gridcell"
              aria-selected={on}
              aria-label={`${formatDate(d)}${has ? ', times available' : ', no times'}`}
              disabled={past || !has || loading}
              onClick={() => onSelect(d)}
              className={cn(
                'relative mx-auto flex h-11 w-11 flex-col items-center justify-center rounded-full font-mk-display text-[14px] transition-[background-color,color,transform] duration-150 active:scale-[0.94] motion-reduce:active:scale-100',
                on ? 'bg-mk-primary text-mk-on-primary' : has && !past ? 'hover:bg-mk-muted' : 'text-mk-text-tertiary opacity-50',
                loading && 'mk-skeleton text-transparent',
              )}
            >
              {i + 1}
              {has && !past && !on && <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-mk-accent" aria-hidden="true" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function BookFreelancerPage() {
  const { freelancerId = '' } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const categories = useCategories();

  const todayStr = sastNow().date;
  const [ty, tm] = [Number(todayStr.slice(0, 4)), Number(todayStr.slice(5, 7)) - 1];
  const [view, setView] = useState({ y: ty, m: tm });
  const [categoryPath, setCategoryPath] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<{ message: string; profileMissing?: boolean } | null>(null);
  const [confirmUnverified, setConfirmUnverified] = useState(false);

  const freelancer = useQuery({
    queryKey: ['marketplace', 'freelancer', freelancerId],
    queryFn: async () => unwrap<Freelancer>(await get(ApiPaths.marketplace.freelancer(freelancerId))),
  });

  const bounds = monthBounds(view.y, view.m);
  const rangeStart = bounds.start < todayStr ? todayStr : bounds.start;
  const availabilityKey = ['marketplace', 'availability', freelancerId, rangeStart, bounds.end];
  const availability = useQuery({
    queryKey: availabilityKey,
    queryFn: async () => {
      const res = await get(`${ApiPaths.marketplace.freelancerAvailability(freelancerId)}?startDate=${rangeStart}&endDate=${bounds.end}`);
      return (unwrap<{ availability?: DayAvailability[] }>(res).availability ?? []) as DayAvailability[];
    },
  });

  // Same channel the app listens to; any change refetches the visible month.
  useAblyChannel(`public:availability:${freelancerId}`, () => {
    void qc.invalidateQueries({ queryKey: ['marketplace', 'availability', freelancerId] });
  });

  const byDate = useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const d of availability.data ?? []) {
      const open = (d.availableSlots ?? []).filter((s) => !isPastSlot(d.date.slice(0, 10), s.startTime));
      if (open.length > 0) map.set(d.date.slice(0, 10), open.sort((a, b) => a.startTime.localeCompare(b.startTime)));
    }
    return map;
  }, [availability.data]);
  const daysWithSlots = useMemo(() => new Set(byDate.keys()), [byDate]);
  const daySlots = date ? (byDate.get(date) ?? []) : [];

  // Drop selections that a realtime refresh removed.
  const liveSlots = slots.filter((s) => daySlots.some((d) => slotKey(d) === slotKey(s)));

  const f = freelancer.data;
  const cats = f?.categoryIds ?? [];
  const activeCategory = categoryPath ?? (cats.length === 1 ? cats[0] : null);
  const rate = f?.categoryRates?.find((r) => r.categoryId === activeCategory) ?? null;
  const isInvoice = rate?.bookingPricingMode === 'invoice';
  const hourly = money(rate?.hourlyRate);
  const totalMinutes = liveSlots.reduce((sum, s) => sum + s.durationMinutes, 0);
  const estimate = !isInvoice && hourly != null ? (totalMinutes / 60) * hourly : null;

  const canSubmit = !!activeCategory && !!date && liveSlots.length > 0 && !submitting;
  const maxMonth = tm + MAX_MONTHS_AHEAD;

  const submit = async () => {
    if (!activeCategory || !date || liveSlots.length === 0) return;
    setSubmitting(true);
    setError(null);
    const sorted = [...liveSlots].sort((a, b) => a.startTime.localeCompare(b.startTime));
    const bookingGroupId = sorted.length > 1 ? crypto.randomUUID() : undefined;
    const created: string[] = [];
    try {
      for (const s of sorted) {
        const res = await post(ApiPaths.marketplace.bookings, {
          freelancerId,
          category: leafId(activeCategory),
          pricingMode: 'hourly',
          scheduledDate: date,
          scheduledTime: s.startTime,
          durationMinutes: s.durationMinutes,
          ...(bookingGroupId ? { bookingGroupId } : {}),
        });
        const id = unwrap<{ id?: string }>(res)?.id;
        if (id) created.push(id);
      }
      void qc.invalidateQueries({ queryKey: ['marketplace', 'bookings'] });
      navigate(created[0] ? `/bookings/${created[0]}` : '/bookings', { replace: true });
    } catch (err) {
      const message = apiErrorMessage(err, 'Could not create the booking.');
      const partial = created.length > 0 ? ` ${created.length} of ${sorted.length} requests were sent; see your bookings.` : '';
      setError({ message: `${message}${partial}`, profileMissing: /customer profile not found/i.test(message) });
      void qc.invalidateQueries({ queryKey: ['marketplace', 'availability', freelancerId] });
      if (created.length > 0) void qc.invalidateQueries({ queryKey: ['marketplace', 'bookings'] });
    } finally {
      setSubmitting(false);
    }
  };

  const onPrimary = () => {
    if (f && !isIdVerified(f)) setConfirmUnverified(true);
    else void submit();
  };

  if (freelancer.isPending) {
    return (
      <div className="space-y-4" role="status" aria-label="Loading">
        <MkSkeleton className="h-8 w-40" />
        <MkSkeleton className="h-16 w-full rounded-2xl" />
        <MkSkeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }
  if (freelancer.isError || !f) {
    return (
      <MkErrorState
        message={apiErrorMessage(freelancer.error, 'This freelancer could not be loaded.')}
        onRetry={() => void freelancer.refetch()}
        retrying={freelancer.isRefetching}
      />
    );
  }

  return (
    <div className="pb-40 lg:pb-0">
      <MkPageHeader back title="Book a service" />

      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-mk-border p-3.5">
        <MkAvatar src={f.profilePhotoUrl} name={f.fullName} size={48} />
        <div className="min-w-0">
          <p className="truncate font-mk-display text-[15px] font-semibold">{f.fullName}</p>
          <MkRating value={f.rating} count={f.totalReviews} />
        </div>
      </div>

      <section className="mb-7">
        <MkSectionTitle>Service</MkSectionTitle>
        {cats.length === 0 ? (
          <p className="text-[14px] text-mk-text-secondary">This freelancer has not listed any services yet.</p>
        ) : (
          <div className="space-y-2" role="radiogroup" aria-label="Service">
            {cats.map((path) => {
              const r = f.categoryRates?.find((x) => x.categoryId === path);
              const on = activeCategory === path;
              return (
                <button
                  key={path}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setCategoryPath(path)}
                  className={cn(
                    'flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border px-4 text-left transition-[border-color,background-color] duration-150',
                    on ? 'border-mk-primary bg-mk-muted' : 'border-mk-border hover:bg-mk-muted',
                  )}
                >
                  <span className="text-[14px]">{categoryLabel(categories.data, path)}</span>
                  <span className="shrink-0 font-mk-display text-[14px] font-semibold">{r ? rateLabel(r) : ''}</span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className="mb-7">
        <MkSectionTitle>Date</MkSectionTitle>
        {availability.isError ? (
          <MkErrorState
            message={apiErrorMessage(availability.error, 'Availability could not be loaded.')}
            onRetry={() => void availability.refetch()}
            retrying={availability.isRefetching}
          />
        ) : (
          <MonthCalendar
            year={view.y}
            month0={view.m}
            selected={date}
            onSelect={(d) => {
              setDate(d);
              setSlots([]);
            }}
            daysWithSlots={daysWithSlots}
            loading={availability.isPending}
            canPrev={view.y * 12 + view.m > ty * 12 + tm}
            canNext={view.y * 12 + view.m < ty * 12 + maxMonth}
            onPrev={() => setView((v) => (v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 }))}
            onNext={() => setView((v) => (v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 }))}
          />
        )}
        {!availability.isPending && !availability.isError && daysWithSlots.size === 0 && (
          <p className="mt-3 text-[14px] text-mk-text-secondary">No open times this month. Try the next month.</p>
        )}
      </section>

      <section className="mb-7">
        <MkSectionTitle>Time</MkSectionTitle>
        <MkSwap id={date ?? 'none'}>
          {!date ? (
            <p className="text-[14px] text-mk-text-secondary">Choose a date to see open times.</p>
          ) : daySlots.length === 0 ? (
            <MkEmpty icon={<CalendarX className="h-6 w-6" aria-hidden="true" />} title="No open times" body="These times were just booked. Pick another date." />
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" role="group" aria-label={`Times on ${formatDate(date)}`}>
              {daySlots.map((s) => {
                const on = liveSlots.some((x) => slotKey(x) === slotKey(s));
                return (
                  <button
                    key={slotKey(s)}
                    type="button"
                    aria-pressed={on}
                    onClick={() =>
                      setSlots((cur) => (on ? cur.filter((x) => slotKey(x) !== slotKey(s)) : [...cur.filter((x) => daySlots.some((d) => slotKey(d) === slotKey(x))), s]))
                    }
                    className={cn(
                      'flex min-h-12 flex-col items-center justify-center rounded-xl border px-2 py-1.5 font-mk-display transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.97] motion-reduce:active:scale-100',
                      on ? 'border-mk-primary bg-mk-primary text-mk-on-primary' : 'border-mk-border hover:bg-mk-muted',
                    )}
                  >
                    <span className="text-[14px] font-semibold">
                      {s.startTime} to {addMinutes(s.startTime, s.durationMinutes)}
                    </span>
                    <span className={cn('text-[12px]', on ? 'opacity-80' : 'text-mk-text-tertiary')}>{formatDuration(s.durationMinutes)}</span>
                  </button>
                );
              })}
            </div>
          )}
        </MkSwap>
      </section>

      {f.acceptsRecurringBookings && activeCategory && (
        <section className="mb-7 rounded-2xl border border-mk-border p-4">
          <p className="font-mk-display text-[15px] font-semibold">Recurring booking</p>
          <p className="mt-1 text-[14px] text-mk-text-secondary">Book the same time every week with this freelancer.</p>
          <Link
            to={`/recurring?new=1&freelancerId=${encodeURIComponent(f.id)}&categoryId=${encodeURIComponent(leafId(activeCategory))}${
              date && liveSlots[0]
                ? `&startDate=${date}&scheduledTime=${encodeURIComponent(liveSlots[0].startTime)}&durationMinutes=${liveSlots[0].durationMinutes}`
                : ''
            }`}
            className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl border border-mk-border px-4 font-mk-display text-[14px] font-semibold hover:bg-mk-muted"
          >
            <Repeat className="h-4 w-4" aria-hidden="true" />
            Set up as recurring booking
          </Link>
        </section>
      )}

      {/* Summary and primary action stay visible */}
      <div className="mk-no-print fixed inset-x-0 bottom-[calc(60px+env(safe-area-inset-bottom))] z-20 border-t border-mk-divider bg-mk-surface px-4 py-3 lg:static lg:mt-2 lg:border-0 lg:p-0">
        <div className="mx-auto max-w-[960px] space-y-2.5">
          <AnimatePresence initial={false}>
            {liveSlots.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: mkMotion.control }}
                className="flex items-baseline justify-between gap-3 text-[14px]"
              >
                <span className="text-mk-text-secondary">
                  {liveSlots.length} {liveSlots.length === 1 ? 'session' : 'sessions'}, {formatDuration(totalMinutes)}
                </span>
                <span className="font-mk-display font-semibold">
                  {isInvoice ? 'On invoice' : estimate != null ? `Estimate ${formatZar(estimate)}` : ''}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          {isInvoice && liveSlots.length > 0 && (
            <p className="text-[12px] text-mk-text-tertiary">The freelancer sends an invoice for this service after you book.</p>
          )}
          <MkFormError message={error?.message} />
          {error?.profileMissing && (
            <Link to="/account" className="inline-flex min-h-11 items-center text-[14px] font-semibold underline underline-offset-2">
              Go to account settings
            </Link>
          )}
          <MkButton block className="h-12" disabled={!canSubmit} loading={submitting} onClick={onPrimary}>
            {liveSlots.length === 0
              ? 'Select time slots'
              : liveSlots.length === 1
                ? 'Send booking request'
                : `Send ${liveSlots.length} booking requests`}
          </MkButton>
        </div>
      </div>

      <MkConfirmDialog
        open={confirmUnverified}
        onOpenChange={setConfirmUnverified}
        title="Unverified freelancer"
        description="This freelancer has not completed ID verification. Do you still want to proceed with this booking?"
        confirmLabel="Proceed"
        cancelLabel="Cancel"
        onConfirm={() => {
          setConfirmUnverified(false);
          void submit();
        }}
      />
    </div>
  );
}
