import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronRight, Repeat } from 'lucide-react';
import { toast } from 'sonner';
import { get, post } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { useAuth } from '@/context/AuthContext';
import {
  MkAvatar,
  MkButton,
  MkCard,
  MkConfirmDialog,
  MkDialog,
  MkEmpty,
  MkErrorState,
  MkFormError,
  MkInput,
  MkListSkeleton,
  MkPageHeader,
  MkPill,
  MkSectionTitle,
  MkSelect,
  MkSkeleton,
  MkTextarea,
} from '@/components/marketplace/ui';
import { apiErrorMessage, listFrom, unwrap } from '@/lib/marketplace/apiHelpers';
import { categoryLabel, useCategories } from '@/lib/marketplace/categories';
import { statusLabel, statusTone } from '@/lib/marketplace/bookingStatus';
import { addMinutes, formatDate, formatDuration, sastNow } from '@/lib/marketplace/time';
import { cn } from '@/lib/utils';

type Party = { id?: string; userId?: string; user?: { id?: string; fullName?: string; profilePhotoUrl?: string | null } };
type RecurringRequest = {
  id: string;
  status: 'pending_customer' | 'pending_freelancer' | 'accepted' | 'rejected' | string;
  categoryId: string;
  daysOfWeek: number[];
  scheduledTime: string;
  durationMinutes: number;
  startDate: string;
  endDate?: string | null;
  totalSessions?: number | null;
  message?: string | null;
  customer?: Party;
  freelancer?: Party;
};
type Series = Omit<RecurringRequest, 'status' | 'message'> & {
  status: 'active' | 'paused' | 'cancelled' | string;
  bookings?: { id: string; scheduledDate: string; scheduledTime: string; durationMinutes: number; status: string }[];
};

/** API weekday numbers: 0 is Sunday. */
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const ORDER = [1, 2, 3, 4, 5, 6, 0];
const DURATIONS = [30, 45, 60, 90, 120, 180, 240];
const KEYS = { pending: ['marketplace', 'recurring', 'pending'], series: ['marketplace', 'recurring', 'series'] };

const daysLabel = (d: number[]) => ORDER.filter((x) => d.includes(x)).map((x) => WEEKDAYS[x]).join(', ');

function scheduleText(r: Pick<RecurringRequest, 'daysOfWeek' | 'scheduledTime' | 'durationMinutes' | 'startDate' | 'endDate' | 'totalSessions'>) {
  const end = r.totalSessions ? `, ${r.totalSessions} sessions` : r.endDate ? `, until ${formatDate(r.endDate)}` : '';
  return `${daysLabel(r.daysOfWeek)} at ${r.scheduledTime} for ${formatDuration(r.durationMinutes)}, from ${formatDate(r.startDate)}${end}`;
}

/* ---------------------------------------------------------------- Request */

function NewRequest({ params, onDone }: { params: URLSearchParams; onDone: () => void }) {
  const categories = useCategories();
  const freelancerId = params.get('freelancerId') ?? '';
  const categoryId = params.get('categoryId') ?? '';
  const freelancer = useQuery({
    queryKey: ['marketplace', 'freelancer', freelancerId],
    enabled: !!freelancerId,
    queryFn: async () => unwrap<{ fullName?: string; profilePhotoUrl?: string | null }>(await get(ApiPaths.marketplace.freelancer(freelancerId))),
  });
  const start = params.get('startDate') ?? sastNow().date;
  const [days, setDays] = useState<number[]>(() => {
    const d = new Date(`${start}T12:00:00Z`).getUTCDay();
    return Number.isNaN(d) ? [] : [d];
  });
  const [time, setTime] = useState(params.get('scheduledTime') ?? '09:00');
  const [duration, setDuration] = useState(params.get('durationMinutes') ?? '60');
  const [startDate, setStartDate] = useState(start);
  const [ends, setEnds] = useState<'sessions' | 'date' | 'never'>('sessions');
  const [sessions, setSessions] = useState('8');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const send = useMutation({
    mutationFn: async () =>
      post(ApiPaths.marketplace.recurringRequests, {
        freelancerId,
        categoryId,
        initiatedBy: 'customer',
        daysOfWeek: [...days].sort(),
        scheduledTime: time,
        durationMinutes: Number(duration),
        startDate,
        ...(ends === 'sessions' ? { totalSessions: Number(sessions) } : {}),
        ...(ends === 'date' ? { endDate } : {}),
        ...(message.trim() ? { message: message.trim() } : {}),
      }),
    onSuccess: () => {
      toast.success('Recurring request sent. The freelancer will accept or decline it.');
      onDone();
    },
    onError: (err) => setFormError(apiErrorMessage(err, 'Could not send the request.')),
  });

  if (!freelancerId || !categoryId) return null;

  return (
    <MkCard>
      <MkSectionTitle>New recurring request</MkSectionTitle>
      <div className="mb-4 flex items-center gap-3">
        {freelancer.isPending ? <MkSkeleton className="h-10 w-10 rounded-full" /> : <MkAvatar src={freelancer.data?.profilePhotoUrl} name={freelancer.data?.fullName} size={40} />}
        <div>
          <p className="font-mk-display text-[15px] font-semibold">{freelancer.data?.fullName ?? 'Freelancer'}</p>
          <p className="text-[13px] text-mk-text-secondary">{categoryLabel(categories.data, categoryId)}</p>
        </div>
      </div>
      <form
        noValidate
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setFormError(null);
          const next: Record<string, string | undefined> = {};
          if (days.length === 0) next.days = 'Pick at least one day';
          if (!/^\d{2}:\d{2}$/.test(time)) next.time = 'Pick a start time';
          if (!startDate) next.startDate = 'Pick a start date';
          if (ends === 'sessions' && !(Number(sessions) >= 1)) next.sessions = 'Enter how many sessions';
          if (ends === 'date' && (!endDate || endDate < startDate)) next.endDate = 'The end date must be after the start date';
          setErrors(next);
          if (!Object.values(next).some(Boolean)) send.mutate();
        }}
      >
        <fieldset>
          <legend className="mb-2 font-mk-display text-[13px] font-semibold">Repeat on</legend>
          <div className="flex flex-wrap gap-2">
            {ORDER.map((d) => {
              const on = days.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setDays(on ? days.filter((x) => x !== d) : [...days, d])}
                  className={cn(
                    'min-h-11 min-w-12 rounded-full border px-3 font-mk-display text-[13px] font-semibold transition-colors duration-150',
                    on ? 'border-mk-primary bg-mk-primary text-mk-on-primary' : 'border-mk-border hover:bg-mk-muted',
                  )}
                >
                  {WEEKDAYS[d]}
                </button>
              );
            })}
          </div>
          {errors.days && <p role="alert" className="mt-1.5 text-[13px] text-mk-error">{errors.days}</p>}
        </fieldset>
        <div className="grid grid-cols-2 gap-3">
          <MkInput label="Start time" type="time" step={900} value={time} onChange={(e) => setTime(e.target.value)} error={errors.time} />
          <MkSelect label="Length" value={duration} onChange={(e) => setDuration(e.target.value)}>
            {DURATIONS.map((d) => (
              <option key={d} value={d}>
                {formatDuration(d)}
              </option>
            ))}
          </MkSelect>
        </div>
        <MkInput label="First session from" type="date" min={sastNow().date} value={startDate} onChange={(e) => setStartDate(e.target.value)} error={errors.startDate} />
        <MkSelect label="Ends" value={ends} onChange={(e) => setEnds(e.target.value as typeof ends)}>
          <option value="sessions">After a number of sessions</option>
          <option value="date">On a date</option>
          <option value="never">No end date</option>
        </MkSelect>
        {ends === 'sessions' && (
          <MkInput label="Number of sessions" inputMode="numeric" value={sessions} onChange={(e) => setSessions(e.target.value.replace(/\D/g, ''))} error={errors.sessions} />
        )}
        {ends === 'date' && <MkInput label="Last date" type="date" min={startDate} value={endDate} onChange={(e) => setEndDate(e.target.value)} error={errors.endDate} />}
        <MkTextarea label="Message" optional value={message} onChange={(e) => setMessage(e.target.value)} />
        <MkFormError message={formError} />
        <MkButton type="submit" block loading={send.isPending}>
          Send recurring request
        </MkButton>
      </form>
    </MkCard>
  );
}

/* ---------------------------------------------------------------- Lists */

function useMyRole() {
  const { user } = useAuth();
  return (p: { customer?: Party; freelancer?: Party }): 'customer' | 'freelancer' | null => {
    if (!user) return null;
    if (p.freelancer?.id && p.freelancer.id === user.freelancerId) return 'freelancer';
    if (p.customer?.user?.id === user.id || p.customer?.userId === user.id || (p.customer?.id && p.customer.id === user.customerId)) return 'customer';
    return null;
  };
}

function PendingRequests() {
  const qc = useQueryClient();
  const categories = useCategories();
  const roleOf = useMyRole();
  const q = useQuery({ queryKey: KEYS.pending, queryFn: async () => listFrom<RecurringRequest>(await get(ApiPaths.marketplace.recurringPending)) });
  const [rejecting, setRejecting] = useState<RecurringRequest | null>(null);
  const [reason, setReason] = useState('');
  const refresh = () => {
    void qc.invalidateQueries({ queryKey: KEYS.pending });
    void qc.invalidateQueries({ queryKey: KEYS.series });
    void qc.invalidateQueries({ queryKey: ['marketplace', 'bookings'] });
  };
  const accept = useMutation({
    mutationFn: async (r: RecurringRequest) => post(ApiPaths.marketplace.recurringRequestAccept(r.id), {}),
    onSuccess: (res) => {
      const n = (res as { bookingsCreated?: number })?.bookingsCreated;
      toast.success(n ? `Accepted. ${n} bookings were created.` : 'Accepted');
      refresh();
    },
    onError: (err) => toast.error(apiErrorMessage(err, 'Could not accept the request.')),
  });
  const reject = useMutation({
    mutationFn: async (r: RecurringRequest) => post(ApiPaths.marketplace.recurringRequestReject(r.id), reason.trim() ? { rejectionReason: reason.trim() } : {}),
    onSuccess: () => {
      setRejecting(null);
      setReason('');
      refresh();
    },
  });

  const items = q.data ?? [];
  return (
    <section>
      <MkSectionTitle>Requests</MkSectionTitle>
      {q.isPending ? (
        <MkListSkeleton rows={2} />
      ) : q.isError ? (
        <MkErrorState message={apiErrorMessage(q.error)} onRetry={() => void q.refetch()} retrying={q.isRefetching} />
      ) : items.length === 0 ? (
        <p className="rounded-2xl border border-mk-border p-4 text-[14px] text-mk-text-secondary">No requests waiting. Ask for a recurring booking from a freelancer's booking page.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((r) => {
            const role = roleOf(r);
            const other = role === 'freelancer' ? r.customer?.user : r.freelancer?.user;
            const myTurn = (r.status === 'pending_freelancer' && role === 'freelancer') || (r.status === 'pending_customer' && role === 'customer');
            return (
              <li key={r.id}>
                <MkCard>
                  <div className="flex items-start gap-3">
                    <MkAvatar src={other?.profilePhotoUrl} name={other?.fullName} size={44} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-mk-display text-[15px] font-semibold">{other?.fullName ?? 'Skillance user'}</p>
                        <MkPill tone="warning">{myTurn ? 'Waiting for you' : 'Waiting for them'}</MkPill>
                      </div>
                      <p className="text-[13px] text-mk-text-secondary">{categoryLabel(categories.data, r.categoryId)}</p>
                      <p className="mt-1 text-[14px]">{scheduleText(r)}</p>
                      {r.message && <p className="mt-1 text-[13px] text-mk-text-secondary">"{r.message}"</p>}
                    </div>
                  </div>
                  {myTurn && (
                    <div className="mt-3 flex gap-2">
                      <MkButton variant="secondary" className="flex-1" onClick={() => setRejecting(r)} disabled={accept.isPending}>
                        Decline
                      </MkButton>
                      <MkButton className="flex-1" loading={accept.isPending && accept.variables?.id === r.id} onClick={() => accept.mutate(r)}>
                        Accept
                      </MkButton>
                    </div>
                  )}
                </MkCard>
              </li>
            );
          })}
        </ul>
      )}
      <MkConfirmDialog
        open={rejecting != null}
        onOpenChange={(v) => {
          if (!v) setRejecting(null);
          reject.reset();
        }}
        title="Decline this request?"
        confirmLabel="Decline"
        cancelLabel="Cancel"
        destructive
        loading={reject.isPending}
        error={reject.isError ? apiErrorMessage(reject.error) : null}
        onConfirm={() => rejecting && reject.mutate(rejecting)}
      >
        <MkTextarea label="Reason" optional value={reason} onChange={(e) => setReason(e.target.value)} />
      </MkConfirmDialog>
    </section>
  );
}

function SeriesDetail({ id, onClose }: { id: string; onClose: () => void }) {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ['marketplace', 'recurring', 'series', id], queryFn: async () => unwrap<Series>(await get(ApiPaths.marketplace.recurringSeriesById(id))) });
  const [confirmCancel, setConfirmCancel] = useState(false);
  const act = useMutation({
    mutationFn: async (a: 'pause' | 'resume' | 'cancel') =>
      post(a === 'pause' ? ApiPaths.marketplace.recurringSeriesPause(id) : a === 'resume' ? ApiPaths.marketplace.recurringSeriesResume(id) : ApiPaths.marketplace.recurringSeriesCancel(id), {}),
    onSuccess: (_d, a) => {
      toast.success(a === 'pause' ? 'Series paused' : a === 'resume' ? 'Series resumed' : 'Series cancelled');
      setConfirmCancel(false);
      void qc.invalidateQueries({ queryKey: KEYS.series });
      void qc.invalidateQueries({ queryKey: ['marketplace', 'bookings'] });
      if (a === 'cancel') onClose();
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  });
  if (q.isPending) return <MkListSkeleton rows={3} />;
  if (q.isError || !q.data) return <MkErrorState message={apiErrorMessage(q.error)} onRetry={() => void q.refetch()} retrying={q.isRefetching} />;
  const s = q.data;
  return (
    <div className="space-y-4">
      <p className="text-[14px]">{scheduleText(s)}</p>
      <div className="flex gap-2">
        {s.status === 'active' && (
          <MkButton variant="secondary" className="flex-1" loading={act.isPending && act.variables === 'pause'} onClick={() => act.mutate('pause')}>
            Pause
          </MkButton>
        )}
        {s.status === 'paused' && (
          <MkButton variant="secondary" className="flex-1" loading={act.isPending && act.variables === 'resume'} onClick={() => act.mutate('resume')}>
            Resume
          </MkButton>
        )}
        {s.status !== 'cancelled' && (
          <MkButton variant="danger-outline" className="flex-1" onClick={() => setConfirmCancel(true)}>
            Cancel series
          </MkButton>
        )}
      </div>
      <div>
        <p className="mb-2 font-mk-display text-[14px] font-semibold">Bookings in this series</p>
        {(s.bookings ?? []).length === 0 ? (
          <p className="text-[14px] text-mk-text-secondary">No bookings yet.</p>
        ) : (
          <ul className="divide-y divide-mk-divider rounded-2xl border border-mk-border">
            {(s.bookings ?? []).map((b) => (
              <li key={b.id}>
                <Link to={`/bookings/${b.id}`} className="flex min-h-12 items-center gap-3 px-4 py-2.5 hover:bg-mk-muted">
                  <span className="flex-1 text-[14px]">{formatDate(b.scheduledDate)}</span>
                  <MkPill tone={statusTone(b.status)}>{statusLabel(b.status)}</MkPill>
                  <ChevronRight className="h-4 w-4 text-mk-text-tertiary" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      <MkConfirmDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title="Cancel this recurring series?"
        description="No new sessions will be booked. Existing bookings follow the normal cancellation rules."
        confirmLabel="Cancel series"
        destructive
        loading={act.isPending && act.variables === 'cancel'}
        onConfirm={() => act.mutate('cancel')}
      />
    </div>
  );
}

function SeriesList() {
  const categories = useCategories();
  const roleOf = useMyRole();
  const q = useQuery({ queryKey: KEYS.series, queryFn: async () => listFrom<Series>(await get(ApiPaths.marketplace.recurringSeries)) });
  const [open, setOpen] = useState<string | null>(null);
  const items = q.data ?? [];
  return (
    <section>
      <MkSectionTitle>Active series</MkSectionTitle>
      {q.isPending ? (
        <MkListSkeleton rows={2} />
      ) : q.isError ? (
        <MkErrorState message={apiErrorMessage(q.error)} onRetry={() => void q.refetch()} retrying={q.isRefetching} />
      ) : items.length === 0 ? (
        <MkEmpty icon={<Repeat className="h-6 w-6" aria-hidden="true" />} title="No recurring bookings" body="Accepted recurring requests become a series here, with each session listed." />
      ) : (
        <ul className="space-y-3">
          {items.map((s) => {
            const role = roleOf(s);
            const other = role === 'freelancer' ? s.customer?.user : s.freelancer?.user;
            return (
              <li key={s.id}>
                <button type="button" onClick={() => setOpen(s.id)} className="flex w-full items-center gap-3 rounded-2xl border border-mk-border p-4 text-left hover:bg-mk-muted">
                  <MkAvatar src={other?.profilePhotoUrl} name={other?.fullName} size={44} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-mk-display text-[15px] font-semibold">{other?.fullName ?? 'Skillance user'}</p>
                      <MkPill tone={s.status === 'active' ? 'success' : 'neutral'}>{s.status === 'active' ? 'Active' : s.status === 'paused' ? 'Paused' : s.status}</MkPill>
                    </div>
                    <p className="text-[13px] text-mk-text-secondary">{categoryLabel(categories.data, s.categoryId)}</p>
                    <p className="text-[13px]">
                      {daysLabel(s.daysOfWeek)} at {s.scheduledTime} to {addMinutes(s.scheduledTime, s.durationMinutes)}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-mk-text-tertiary" aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <MkDialog open={open != null} onOpenChange={(v) => !v && setOpen(null)} title="Recurring series" wide>
        {open && <SeriesDetail id={open} onClose={() => setOpen(null)} />}
      </MkDialog>
    </section>
  );
}

export default function RecurringPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const creating = params.get('new') === '1';
  return (
    <div className="space-y-8">
      <MkPageHeader title="Recurring bookings" subtitle="The same time every week, booked for you." />
      {creating && (
        <NewRequest
          params={params}
          onDone={() => {
            void qc.invalidateQueries({ queryKey: KEYS.pending });
            navigate('/recurring', { replace: true });
          }}
        />
      )}
      <PendingRequests />
      <SeriesList />
    </div>
  );
}
