import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Briefcase, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { post } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { useAuth } from '@/context/AuthContext';
import ApplicationStatusCard from '@/components/marketplace/ApplicationStatusCard';
import {
  MkAnimatedList,
  MkAvatar,
  MkButton,
  MkConfirmDialog,
  MkEmpty,
  MkErrorState,
  MkListSkeleton,
  MkPageHeader,
  MkPill,
  MkSegmented,
  MkSwap,
  MkTextarea,
} from '@/components/marketplace/ui';
import { apiErrorMessage } from '@/lib/marketplace/apiHelpers';
import { bookingKeys, fetchFreelancerBookings, otherParty, type Booking } from '@/lib/marketplace/bookings';
import { statusLabel, statusTone } from '@/lib/marketplace/bookingStatus';
import { categoryLabel, useCategories } from '@/lib/marketplace/categories';
import { money } from '@/lib/marketplace/pricing';
import { formatZar } from '@/lib/marketplace/theme';
import { addMinutes, formatDate } from '@/lib/marketplace/time';

type Tab = 'pending' | 'upcoming' | 'inProgress' | 'past';

/** Same grouping as jobs_screen.dart. */
function tabOf(status: string): Tab {
  const v = status.toLowerCase();
  if (v === 'pending') return 'pending';
  if (v === 'confirmed') return 'upcoming';
  if (v === 'inprogress' || v === 'in_progress') return 'inProgress';
  return 'past';
}

type Group = { key: string; items: Booking[] };

function groupJobs(list: Booking[]): Group[] {
  const map = new Map<string, Booking[]>();
  for (const b of list) {
    const k = b.bookingGroupId || b.id;
    map.set(k, [...(map.get(k) ?? []), b]);
  }
  return [...map.entries()].map(([key, items]) => ({ key, items: items.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime)) }));
}

/** "On invoice" when every booking in the group is invoice-priced (app label), otherwise the API totals. */
function groupTotal(items: Booking[]): string {
  if (items.every((b) => b.pricingMode === 'invoice')) return 'On invoice';
  const sum = items.reduce((acc, b) => acc + (money(b.totalPrice) ?? 0), 0);
  return formatZar(sum);
}

function JobCard({ group, onDecline }: { group: Group; onDecline: (g: Group) => void }) {
  const qc = useQueryClient();
  const categories = useCategories();
  const { user } = useAuth();
  const first = group.items[0];
  const who = otherParty(first, 'freelancer');
  const pending = tabOf(first.status) === 'pending';
  const accept = useMutation({
    mutationFn: async () => {
      for (const b of group.items) await post(ApiPaths.marketplace.bookingAccept(b.id), {});
    },
    onSuccess: () => toast.success(group.items.length > 1 ? 'Bookings accepted' : 'Booking accepted'),
    onError: (err) => toast.error(apiErrorMessage(err, 'Could not accept.')),
    onSettled: () => void qc.invalidateQueries({ queryKey: bookingKeys.freelancer(user?.freelancerId ?? '') }),
  });

  return (
    <div className="rounded-2xl border border-mk-border bg-mk-surface">
      <Link to={`/bookings/${first.id}`} className="flex items-center gap-3.5 p-4">
        <MkAvatar src={who.photo} name={who.name} size={48} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate font-mk-display text-[15px] font-semibold">{who.name}</p>
            <span className="shrink-0 font-mk-display text-[14px] font-semibold">{groupTotal(group.items)}</span>
          </div>
          {first.category && <p className="truncate text-[13px] text-mk-text-secondary">{categoryLabel(categories.data, first.category)}</p>}
          <p className="mt-1 text-[13px] text-mk-text-secondary">
            {formatDate(first.scheduledDate)},{' '}
            {group.items.map((b) => `${b.scheduledTime} to ${addMinutes(b.scheduledTime, b.durationMinutes)}`).join('; ')}
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <MkPill tone={statusTone(first.status)}>{statusLabel(first.status)}</MkPill>
            {group.items.length > 1 && <span className="text-[12px] text-mk-text-tertiary">{group.items.length} sessions</span>}
          </div>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-mk-text-tertiary" aria-hidden="true" />
      </Link>
      {pending && (
        <div className="flex gap-2 border-t border-mk-divider p-3">
          <MkButton variant="secondary" className="flex-1" disabled={accept.isPending} onClick={() => onDecline(group)}>
            Decline
          </MkButton>
          <MkButton className="flex-1" loading={accept.isPending} onClick={() => accept.mutate()}>
            {group.items.length > 1 ? `Accept ${group.items.length}` : 'Accept'}
          </MkButton>
        </div>
      )}
    </div>
  );
}

const EMPTY: Record<Tab, { title: string; body: string }> = {
  pending: { title: 'No new requests', body: 'New booking requests show here for you to accept or decline.' },
  upcoming: { title: 'No upcoming jobs', body: 'Accepted jobs show here. Keep your availability current to get booked.' },
  inProgress: { title: 'Nothing in progress', body: 'A job moves here at its start time. Ask the customer for their PIN.' },
  past: { title: 'No past jobs', body: 'Completed, declined, and cancelled jobs show here.' },
};

export default function FreelancerJobsPage() {
  const { user } = useAuth();
  const fid = user?.freelancerId ?? null;
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>('pending');
  const [declining, setDeclining] = useState<Group | null>(null);
  const [reason, setReason] = useState('');
  const [declineError, setDeclineError] = useState<string | null>(null);

  const q = useQuery({ queryKey: bookingKeys.freelancer(fid ?? ''), enabled: !!fid, queryFn: () => fetchFreelancerBookings(fid!) });

  const byTab = useMemo(() => {
    const out: Record<Tab, Booking[]> = { pending: [], upcoming: [], inProgress: [], past: [] };
    for (const b of q.data?.items ?? []) out[tabOf(String(b.status))].push(b);
    out.past.reverse();
    return out;
  }, [q.data]);
  const groups = useMemo(() => groupJobs(byTab[tab]), [byTab, tab]);

  const decline = useMutation({
    mutationFn: async (g: Group) => {
      for (const b of g.items) await post(ApiPaths.marketplace.bookingDecline(b.id), { reason: reason.trim() });
    },
    onSuccess: () => {
      toast.success('Declined');
      setDeclining(null);
      setReason('');
    },
    onError: (err) => setDeclineError(apiErrorMessage(err, 'Could not decline.')),
    onSettled: () => void qc.invalidateQueries({ queryKey: bookingKeys.freelancer(fid ?? '') }),
  });

  if (!fid) {
    return (
      <>
        <MkPageHeader title="Jobs" />
        <ApplicationStatusCard />
      </>
    );
  }

  const state = q.isPending ? 'loading' : q.isError ? 'error' : groups.length === 0 ? 'empty' : 'list';

  return (
    <>
      <MkPageHeader title="Jobs" subtitle="Accept requests and run your sessions." />
      <div className="mb-5">
        <MkSegmented<Tab>
          label="Job status"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'pending', label: 'Pending', count: byTab.pending.length, countTone: 'neutral' },
            { value: 'upcoming', label: 'Upcoming', count: byTab.upcoming.length, countTone: 'upcoming' },
            { value: 'inProgress', label: 'In progress', count: byTab.inProgress.length, countTone: 'progress' },
            { value: 'past', label: 'Past' },
          ]}
        />
      </div>
      <MkSwap id={`${state}-${tab}`}>
        {state === 'loading' && <MkListSkeleton rows={4} />}
        {state === 'error' && <MkErrorState message={apiErrorMessage(q.error, 'Jobs could not be loaded.')} onRetry={() => void q.refetch()} retrying={q.isRefetching} />}
        {state === 'empty' && <MkEmpty icon={<Briefcase className="h-6 w-6" aria-hidden="true" />} title={EMPTY[tab].title} body={EMPTY[tab].body} />}
        {state === 'list' && (
          <MkAnimatedList items={groups} getKey={(g) => g.key} className="space-y-3" render={(g) => <JobCard group={g} onDecline={setDeclining} />} />
        )}
      </MkSwap>

      <MkConfirmDialog
        open={declining != null}
        onOpenChange={(v) => {
          if (!v) setDeclining(null);
          setDeclineError(null);
        }}
        title="Decline booking"
        confirmLabel="Decline"
        cancelLabel="Cancel"
        destructive
        loading={decline.isPending}
        error={declineError}
        confirmDisabled={!reason.trim()}
        onConfirm={() => declining && decline.mutate(declining)}
      >
        <MkTextarea label="Reason" placeholder="Give the customer a reason" value={reason} onChange={(e) => setReason(e.target.value)} />
      </MkConfirmDialog>
    </>
  );
}
