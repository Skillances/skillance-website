import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Trash2, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { get, put } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { useAuth } from '@/context/AuthContext';
import WorkGate from '@/components/marketplace/WorkGate';
import {
  MkButton,
  MkCard,
  MkDialog,
  MkErrorState,
  MkFormError,
  MkIconButton,
  MkInput,
  MkPageHeader,
  MkSelect,
  MkSkeleton,
  MkSwitch,
} from '@/components/marketplace/ui';
import { apiErrorMessage, unwrap } from '@/lib/marketplace/apiHelpers';
import { mkMotion } from '@/lib/marketplace/theme';
import { addMinutes, formatDuration, timeToMinutes } from '@/lib/marketplace/time';
import { cn } from '@/lib/utils';

type Slot = { startTime: string; durationMinutes: number };
type Weekly = Record<string, Slot[]>;
type Context = {
  availabilityData?: { recurring?: Weekly | null } | null;
  defaultSessionDurationMinutes?: number;
  acceptsRecurringBookings?: boolean;
  autoAcceptBookings?: boolean;
};

/** API weekday keys: '0' is Sunday. Shown Monday first. */
const DAYS = [
  { key: '1', label: 'Monday' },
  { key: '2', label: 'Tuesday' },
  { key: '3', label: 'Wednesday' },
  { key: '4', label: 'Thursday' },
  { key: '5', label: 'Friday' },
  { key: '6', label: 'Saturday' },
  { key: '0', label: 'Sunday' },
];
const DURATIONS = [30, 45, 60, 90, 120, 180, 240, 300, 360, 420, 480];

function sortSlots(s: Slot[]) {
  return [...s].sort((a, b) => a.startTime.localeCompare(b.startTime));
}

function overlaps(s: Slot[]): boolean {
  const sorted = sortSlots(s);
  for (let i = 1; i < sorted.length; i++) {
    const prevEnd = timeToMinutes(sorted[i - 1].startTime) + sorted[i - 1].durationMinutes;
    if (timeToMinutes(sorted[i].startTime) < prevEnd) return true;
  }
  return false;
}

function QuickSetup({ defaultDuration, onApply }: { defaultDuration: number; onApply: (days: string[], slots: Slot[]) => void }) {
  const [days, setDays] = useState<string[]>(['1', '2', '3', '4', '5']);
  const [start, setStart] = useState('08:00');
  const [end, setEnd] = useState('17:00');
  const [duration, setDuration] = useState(String(defaultDuration || 60));
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const d = Number(duration);
        const s = timeToMinutes(start);
        const en = timeToMinutes(end);
        if (days.length === 0) return setError('Pick at least one day.');
        if (en - s < d) return setError('The day must be at least one session long.');
        const slots: Slot[] = [];
        for (let t = s; t + d <= en; t += d) slots.push({ startTime: addMinutes('00:00', t), durationMinutes: d });
        onApply(days, slots);
      }}
    >
      <fieldset>
        <legend className="mb-2 font-mk-display text-[13px] font-semibold">Working days</legend>
        <div className="flex flex-wrap gap-2">
          {DAYS.map((d) => {
            const on = days.includes(d.key);
            return (
              <button
                key={d.key}
                type="button"
                aria-pressed={on}
                onClick={() => setDays(on ? days.filter((x) => x !== d.key) : [...days, d.key])}
                className={cn(
                  'min-h-11 rounded-full border px-3.5 font-mk-display text-[13px] font-semibold transition-colors duration-150',
                  on ? 'border-mk-primary bg-mk-primary text-mk-on-primary' : 'border-mk-border hover:bg-mk-muted',
                )}
              >
                {d.label.slice(0, 3)}
              </button>
            );
          })}
        </div>
      </fieldset>
      <div className="grid grid-cols-2 gap-3">
        <MkInput label="Start" type="time" step={900} value={start} onChange={(e) => setStart(e.target.value)} />
        <MkInput label="End" type="time" step={900} value={end} onChange={(e) => setEnd(e.target.value)} />
      </div>
      <MkSelect label="Session length" value={duration} onChange={(e) => setDuration(e.target.value)}>
        {DURATIONS.map((d) => (
          <option key={d} value={d}>
            {formatDuration(d)}
          </option>
        ))}
      </MkSelect>
      <p className="text-[13px] text-mk-text-tertiary">This replaces the times on the days you pick. Save to publish.</p>
      <MkFormError message={error} />
      <MkButton type="submit" block>
        Fill these days
      </MkButton>
    </form>
  );
}

function Editor({ freelancerId, ctx }: { freelancerId: string; ctx: Context }) {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [weekly, setWeekly] = useState<Weekly>(() => {
    const src = ctx.availabilityData?.recurring ?? {};
    const out: Weekly = {};
    for (const d of DAYS) out[d.key] = sortSlots(src[d.key] ?? []);
    return out;
  });
  const [adding, setAdding] = useState<string | null>(null);
  const [newStart, setNewStart] = useState('09:00');
  const [newDuration, setNewDuration] = useState(String(ctx.defaultSessionDurationMinutes || 60));
  const [quick, setQuick] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ctxKey = ['marketplace', 'availability-context', user?.id];

  const save = useMutation({
    mutationFn: async () => put(ApiPaths.marketplace.freelancerAvailability(freelancerId), { recurring: weekly }),
    onSuccess: () => {
      toast.success('Availability saved');
      setDirty(false);
      void qc.invalidateQueries({ queryKey: ctxKey });
      void qc.invalidateQueries({ queryKey: ['marketplace', 'availability', freelancerId] });
    },
    onError: (err) => setError(apiErrorMessage(err, 'Could not save your availability.')),
  });

  const toggle = useMutation({
    mutationFn: async (body: { autoAcceptBookings?: boolean; acceptsRecurringBookings?: boolean }) => put(ApiPaths.marketplace.freelancer(freelancerId), body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ctxKey }),
    onError: (err) => toast.error(apiErrorMessage(err, 'Could not update the setting.')),
  });

  const update = (day: string, slots: Slot[]) => {
    setWeekly((w) => ({ ...w, [day]: sortSlots(slots) }));
    setDirty(true);
    setError(null);
  };

  const anyOverlap = DAYS.some((d) => overlaps(weekly[d.key]));

  return (
    <div className="space-y-5 pb-20">
      <MkCard className="space-y-3">
        <MkSwitch
          checked={ctx.autoAcceptBookings === true}
          disabled={toggle.isPending}
          onCheckedChange={(v) => toggle.mutate({ autoAcceptBookings: v })}
          label="Auto-accept bookings"
          description="Requests in your available hours are accepted for you."
        />
        <MkSwitch
          checked={ctx.acceptsRecurringBookings === true}
          disabled={toggle.isPending}
          onCheckedChange={(v) => toggle.mutate({ acceptsRecurringBookings: v })}
          label="Accept recurring bookings"
          description="Customers can ask for the same time every week."
        />
      </MkCard>

      <div className="flex items-center justify-between">
        <h2 className="text-[17px]">Weekly hours</h2>
        <MkButton variant="secondary" size="sm" onClick={() => setQuick(true)}>
          <Wand2 className="h-4 w-4" aria-hidden="true" /> Quick setup
        </MkButton>
      </div>

      <ul className="space-y-3">
        {DAYS.map((d) => {
          const slots = weekly[d.key];
          const bad = overlaps(slots);
          return (
            <li key={d.key}>
              <MkCard className={cn(bad && 'border-mk-error')}>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mk-display text-[15px] font-semibold">{d.label}</p>
                  <MkButton variant="ghost" size="sm" onClick={() => setAdding(adding === d.key ? null : d.key)} aria-expanded={adding === d.key}>
                    <Plus className="h-4 w-4" aria-hidden="true" /> Add time
                  </MkButton>
                </div>
                {slots.length === 0 && adding !== d.key && <p className="text-[14px] text-mk-text-tertiary">Unavailable</p>}
                <ul className="mt-1 space-y-1.5">
                  <AnimatePresence initial={false}>
                    {slots.map((s, i) => (
                      <motion.li
                        key={`${s.startTime}-${s.durationMinutes}-${i}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: mkMotion.control }}
                        className="flex items-center justify-between rounded-xl bg-mk-muted px-3.5"
                      >
                        <span className="text-[14px]">
                          {s.startTime} to {addMinutes(s.startTime, s.durationMinutes)}
                          <span className="ml-2 text-mk-text-tertiary">{formatDuration(s.durationMinutes)}</span>
                        </span>
                        <MkIconButton label={`Remove ${s.startTime} on ${d.label}`} onClick={() => update(d.key, slots.filter((_, j) => j !== i))}>
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </MkIconButton>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
                {bad && <p className="mt-2 text-[13px] text-mk-error">Some times on {d.label} overlap.</p>}
                <AnimatePresence initial={false}>
                  {adding === d.key && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: mkMotion.control }}
                      className="mt-3 flex flex-wrap items-end gap-2"
                    >
                      <div className="w-32">
                        <MkInput label="Start" type="time" step={900} value={newStart} onChange={(e) => setNewStart(e.target.value)} />
                      </div>
                      <div className="w-36">
                        <MkSelect label="Length" value={newDuration} onChange={(e) => setNewDuration(e.target.value)}>
                          {DURATIONS.map((m) => (
                            <option key={m} value={m}>
                              {formatDuration(m)}
                            </option>
                          ))}
                        </MkSelect>
                      </div>
                      <MkButton
                        onClick={() => {
                          if (!/^\d{2}:\d{2}$/.test(newStart)) return;
                          update(d.key, [...slots, { startTime: newStart, durationMinutes: Number(newDuration) }]);
                          setAdding(null);
                        }}
                      >
                        Add
                      </MkButton>
                    </motion.div>
                  )}
                </AnimatePresence>
              </MkCard>
            </li>
          );
        })}
      </ul>

      <div className="sticky bottom-[calc(68px+env(safe-area-inset-bottom))] z-10 space-y-2 lg:bottom-4">
        <MkFormError message={error} />
        <MkButton block className="h-12 shadow-mk-card" disabled={!dirty || anyOverlap} loading={save.isPending} onClick={() => save.mutate()}>
          {dirty ? 'Save availability' : 'Saved'}
        </MkButton>
      </div>

      <MkDialog open={quick} onOpenChange={setQuick} title="Quick setup" description="Fill your working days with back-to-back sessions.">
        <QuickSetup
          defaultDuration={ctx.defaultSessionDurationMinutes ?? 60}
          onApply={(days, slots) => {
            setWeekly((w) => {
              const next = { ...w };
              for (const d of days) next[d] = slots;
              return next;
            });
            setDirty(true);
            setQuick(false);
          }}
        />
      </MkDialog>
    </div>
  );
}

export default function WorkAvailabilityPage() {
  const { user } = useAuth();
  const ctx = useQuery({
    queryKey: ['marketplace', 'availability-context', user?.id],
    enabled: !!user?.freelancerId,
    queryFn: async () => unwrap<Context>(await get(ApiPaths.marketplace.freelancerAvailabilityContext(user!.id))),
  });
  return (
    <WorkGate title="Availability">
      {(fid) => (
        <>
          <MkPageHeader back="/work" title="Availability" subtitle="The weekly times customers can book. Times are South African time." />
          {ctx.isPending ? (
            <div className="space-y-3">
              <MkSkeleton className="h-28 w-full rounded-2xl" />
              <MkSkeleton className="h-20 w-full rounded-2xl" />
              <MkSkeleton className="h-20 w-full rounded-2xl" />
            </div>
          ) : ctx.isError || !ctx.data ? (
            <MkErrorState message={apiErrorMessage(ctx.error, 'Your availability could not be loaded.')} onRetry={() => void ctx.refetch()} retrying={ctx.isRefetching} />
          ) : (
            <Editor key={fid} freelancerId={fid} ctx={ctx.data} />
          )}
        </>
      )}
    </WorkGate>
  );
}
