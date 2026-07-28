import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { get, post } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { queryKeys } from '@/lib/queryKeys';
import type { CategoryNode, FreelancerDetail } from '@/types/product';
import { buildServiceCategoryOptions, getCategoryDisplayName } from '@/lib/categoryDisplay';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function RecurringRequestPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const freelancerId = searchParams.get('freelancerId') ?? '';
  const initialCategory = searchParams.get('categoryId') ?? '';

  const [categoryId, setCategoryId] = useState(initialCategory);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [durationMinutes, setDurationMinutes] = useState('60');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState('');

  const { data: categories = [] } = useQuery({
    queryKey: queryKeys.categories.tree(),
    queryFn: async () => {
      const res = await get(ApiPaths.categories.list);
      const data = Array.isArray(res) ? res : (res?.data ?? []);
      return Array.isArray(data) ? (data as CategoryNode[]) : [];
    },
  });

  const { data: freelancer, isPending } = useQuery({
    queryKey: queryKeys.freelancers.detail(freelancerId),
    queryFn: async () => {
      const res = await get(ApiPaths.freelancers.byId(freelancerId));
      return (res?.data?.freelancer ?? res?.data ?? res) as FreelancerDetail;
    },
    enabled: Boolean(freelancerId),
  });

  const serviceOptions = useMemo(
    () => buildServiceCategoryOptions(categories, freelancer?.categoryIds, freelancer?.categoryRates),
    [categories, freelancer?.categoryIds, freelancer?.categoryRates],
  );

  const submitMutation = useMutation({
    mutationFn: async () => {
      await post(ApiPaths.recurring.requests, {
        freelancerId,
        categoryId,
        initiatedBy: 'customer',
        daysOfWeek,
        scheduledTime,
        durationMinutes: parseInt(durationMinutes, 10),
        startDate,
        endDate: endDate || undefined,
        message: message.trim() || undefined,
      });
    },
    onSuccess: () => {
      toast.success('Recurring request sent');
      navigate('/app/recurring/requests');
    },
    onError: (err: unknown) => {
      const e = err as { message?: string };
      toast.error(e.message ?? 'Could not send request');
    },
  });

  const toggleDay = (day: number) => {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort(),
    );
  };

  if (!freelancerId) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-600">Missing freelancer.</p>
        <Link to="/app/search" className="text-sm underline mt-2 inline-block">
          Back to search
        </Link>
      </div>
    );
  }

  if (isPending) return <Skeleton className="h-64 rounded-2xl" />;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <Link
          to={`/app/freelancer/${freelancerId}`}
          className="text-sm text-neutral-500 hover:text-neutral-900"
        >
          Back to profile
        </Link>
        <h1 className="text-xl font-semibold mt-2">Request recurring booking</h1>
        {freelancer ? (
          <p className="text-sm text-neutral-500 mt-1">With {freelancer.fullName}</p>
        ) : null}
      </div>

      <form
        className="space-y-4 bg-white border border-neutral-200 rounded-2xl p-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (!categoryId || daysOfWeek.length === 0 || !startDate) {
            toast.error('Select service, days, and start date');
            return;
          }
          submitMutation.mutate();
        }}
      >
        <div className="space-y-2">
          <Label>Service</Label>
          <select
            className="w-full h-10 rounded-md border border-neutral-200 px-3 text-sm"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
          >
            <option value="">Select</option>
            {serviceOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.displayName}
              </option>
            ))}
          </select>
          {categoryId && !serviceOptions.some((c) => c.id === categoryId) ? (
            <p className="text-xs text-neutral-500">
              {getCategoryDisplayName(categories, categoryId)}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label>Days of the week</Label>
          <div className="flex flex-wrap gap-2">
            {DAY_LABELS.map((label, index) => (
              <button
                key={label}
                type="button"
                onClick={() => toggleDay(index)}
                className={`text-sm px-3 py-1.5 rounded-full border ${
                  daysOfWeek.includes(index)
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'border-neutral-200 hover:border-neutral-400'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Time</Label>
            <Input type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Duration (min)</Label>
            <Input
              type="number"
              min={30}
              step={30}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Start date</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>End date (optional)</Label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Message (optional)</Label>
          <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} />
        </div>

        <Button type="submit" className="w-full rounded-full" disabled={submitMutation.isPending}>
          {submitMutation.isPending ? 'Sending...' : 'Send request'}
        </Button>
      </form>
    </div>
  );
}
