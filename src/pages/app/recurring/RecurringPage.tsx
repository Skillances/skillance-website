import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { queryKeys } from '@/lib/queryKeys';
import type { RecurringRequest, RecurringSeries } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatDays(days?: number[]): string {
  if (!days?.length) return 'Recurring';
  return days.map((d) => DAY_LABELS[d] ?? d).join(', ');
}

export default function RecurringListPage() {
  const { data: series = [], isPending } = useQuery({
    queryKey: queryKeys.recurring.series(),
    queryFn: async () => {
      const res = await get(ApiPaths.recurring.series);
      const data = res?.data?.series ?? res?.data ?? [];
      return Array.isArray(data) ? (data as RecurringSeries[]) : [];
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link to="/app/profile" className="text-sm text-neutral-500">
            Profile
          </Link>
          <h1 className="text-2xl font-semibold mt-1">Recurring bookings</h1>
        </div>
        <Link
          to="/app/recurring/requests"
          className="text-sm font-medium text-neutral-900 underline underline-offset-2"
        >
          Pending requests
        </Link>
      </div>

      {isPending ? (
        <Skeleton className="h-24 rounded-2xl" />
      ) : series.length === 0 ? (
        <div className="text-center py-10 rounded-2xl border border-dashed border-neutral-200">
          <p className="text-neutral-500 text-sm">No recurring series yet.</p>
          <Link to="/app/search" className="text-sm underline mt-2 inline-block">
            Find a freelancer
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {series.map((s) => (
            <Link
              key={s.id}
              to={`/app/recurring/${s.id}`}
              className="block rounded-2xl border border-neutral-200 bg-white p-4 hover:border-neutral-300"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{s.freelancerName ?? s.category ?? 'Recurring series'}</p>
                  <p className="text-sm text-neutral-500">
                    {s.pattern ?? formatDays(s.daysOfWeek)}
                    {s.scheduledTime ? ` at ${s.scheduledTime.slice(0, 5)}` : ''}
                  </p>
                </div>
                <Badge>{s.status}</Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function RecurringRequestsPage() {
  const queryClient = useQueryClient();

  const { data: requests = [], isPending } = useQuery({
    queryKey: queryKeys.recurring.pending(),
    queryFn: async () => {
      const res = await get(ApiPaths.recurring.pendingRequests);
      const data = res?.data?.requests ?? res?.data ?? res;
      return Array.isArray(data) ? (data as RecurringRequest[]) : [];
    },
  });

  const acceptMutation = useMutation({
    mutationFn: (requestId: string) => post(ApiPaths.recurring.requestAccept(requestId), {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recurring.pending() });
      queryClient.invalidateQueries({ queryKey: queryKeys.recurring.series() });
      toast.success('Request accepted');
    },
    onError: () => toast.error('Could not accept request'),
  });

  const rejectMutation = useMutation({
    mutationFn: (requestId: string) =>
      post(ApiPaths.recurring.requestReject(requestId), { rejectionReason: 'Declined on web' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recurring.pending() });
      toast.success('Request declined');
    },
    onError: () => toast.error('Could not decline request'),
  });

  return (
    <div className="space-y-6">
      <div>
        <Link to="/app/recurring" className="text-sm text-neutral-500">
          Recurring
        </Link>
        <h1 className="text-2xl font-semibold mt-1">Pending requests</h1>
      </div>

      {isPending ? (
        <Skeleton className="h-24 rounded-2xl" />
      ) : requests.length === 0 ? (
        <p className="text-neutral-500 text-sm">No pending recurring requests.</p>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div key={req.id} className="rounded-2xl border border-neutral-200 bg-white p-4 space-y-3">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <p className="font-medium">
                    {req.categoryName ?? req.categoryId}
                  </p>
                  <p className="text-sm text-neutral-500">
                    {req.initiatedBy === 'customer' ? 'You requested' : 'Offer from freelancer'}
                    {req.freelancerName ? ` — ${req.freelancerName}` : ''}
                    {req.customerName ? ` — ${req.customerName}` : ''}
                  </p>
                  <p className="text-sm text-neutral-500 mt-1">
                    {formatDays(req.daysOfWeek)} at {req.scheduledTime?.slice(0, 5)} ({req.durationMinutes} min)
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">Starts {req.startDate}</p>
                  {req.message ? <p className="text-sm text-neutral-600 mt-2">{req.message}</p> : null}
                </div>
                <Badge>{req.status}</Badge>
              </div>
              {req.status === 'pending' ? (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="rounded-full"
                    disabled={acceptMutation.isPending}
                    onClick={() => acceptMutation.mutate(req.id)}
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    disabled={rejectMutation.isPending}
                    onClick={() => rejectMutation.mutate(req.id)}
                  >
                    Decline
                  </Button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function RecurringDetailPage() {
  const { seriesId } = useParams<{ seriesId: string }>();
  const id = seriesId ?? '';
  const queryClient = useQueryClient();

  const { data: series, isPending } = useQuery({
    queryKey: queryKeys.recurring.seriesDetail(id),
    queryFn: async () => {
      const res = await get(ApiPaths.recurring.seriesById(id));
      return (res?.data?.series ?? res?.data) as RecurringSeries;
    },
    enabled: Boolean(id),
  });

  const pauseMutation = useMutation({
    mutationFn: () => post(ApiPaths.recurring.seriesPause(id), {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recurring.seriesDetail(id) });
      toast.success('Series paused');
    },
  });

  const resumeMutation = useMutation({
    mutationFn: () => post(ApiPaths.recurring.seriesResume(id), {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recurring.seriesDetail(id) });
      toast.success('Series resumed');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => post(ApiPaths.recurring.seriesCancel(id), {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recurring.series() });
      toast.success('Series cancelled');
    },
  });

  if (isPending) return <Skeleton className="h-48 rounded-2xl" />;
  if (!series) return <p className="text-neutral-600">Series not found.</p>;

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <Link to="/app/recurring" className="text-sm text-neutral-500">
          Recurring
        </Link>
        <div className="flex items-center gap-2 mt-2">
          <h1 className="text-xl font-semibold">Series details</h1>
          <Badge>{series.status}</Badge>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 space-y-2 text-sm">
        {series.freelancerName ? (
          <p>
            <span className="text-neutral-500">Freelancer: </span>
            {series.freelancerName}
          </p>
        ) : null}
        {series.pattern ? (
          <p>
            <span className="text-neutral-500">Pattern: </span>
            {series.pattern}
          </p>
        ) : null}
        {series.daysOfWeek?.length ? (
          <p>
            <span className="text-neutral-500">Days: </span>
            {formatDays(series.daysOfWeek)}
          </p>
        ) : null}
        {series.scheduledTime ? (
          <p>
            <span className="text-neutral-500">Time: </span>
            {series.scheduledTime.slice(0, 5)}
          </p>
        ) : null}
        {series.durationMinutes ? (
          <p>
            <span className="text-neutral-500">Duration: </span>
            {series.durationMinutes} min
          </p>
        ) : null}
        {series.nextOccurrence ? (
          <p>
            <span className="text-neutral-500">Next: </span>
            {series.nextOccurrence}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" className="rounded-full" onClick={() => pauseMutation.mutate()} disabled={pauseMutation.isPending}>
          Pause
        </Button>
        <Button variant="outline" className="rounded-full" onClick={() => resumeMutation.mutate()} disabled={resumeMutation.isPending}>
          Resume
        </Button>
        <Button variant="destructive" className="rounded-full" onClick={() => cancelMutation.mutate()} disabled={cancelMutation.isPending}>
          Cancel series
        </Button>
      </div>
    </div>
  );
}
