import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AlertTriangle, Info } from 'lucide-react';
import { get, post } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { queryKeys } from '@/lib/queryKeys';
import type { CategoryNode, FreelancerDetail } from '@/types/product';
import {
  bookingLeafCategoryId,
  buildServiceCategoryOptions,
  formatCurrency,
} from '@/lib/categoryDisplay';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface AvailabilitySlot {
  startTime: string;
  durationMinutes: number;
}

interface DayAvailability {
  date: string;
  availableSlots: AvailabilitySlot[];
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDaysIso(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function BookingFlowPage() {
  const { freelancerId } = useParams<{ freelancerId: string }>();
  const id = freelancerId ?? '';
  const navigate = useNavigate();

  const [category, setCategory] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('60');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [ackUnverified, setAckUnverified] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: queryKeys.categories.tree(),
    queryFn: async () => {
      const res = await get(ApiPaths.categories.list);
      const data = Array.isArray(res) ? res : (res?.data ?? []);
      return Array.isArray(data) ? (data as CategoryNode[]) : [];
    },
  });

  const { data: freelancer, isPending } = useQuery({
    queryKey: queryKeys.freelancers.detail(id),
    queryFn: async () => {
      const res = await get(ApiPaths.freelancers.byId(id));
      return (res?.data?.freelancer ?? res?.data ?? res) as FreelancerDetail;
    },
    enabled: Boolean(id),
  });

  const serviceOptions = useMemo(
    () => buildServiceCategoryOptions(categories, freelancer?.categoryIds, freelancer?.categoryRates),
    [categories, freelancer?.categoryIds, freelancer?.categoryRates],
  );

  const selectedService = serviceOptions.find((s) => s.id === category);

  useEffect(() => {
    if (serviceOptions.length === 1 && !category) {
      setCategory(serviceOptions[0]!.id);
    }
  }, [serviceOptions, category]);

  useEffect(() => {
    const defaultDuration = (freelancer as { defaultSessionDurationMinutes?: number | null })
      ?.defaultSessionDurationMinutes;
    if (defaultDuration && defaultDuration >= 30) {
      setDurationMinutes(String(defaultDuration));
    }
  }, [freelancer]);

  const availabilityRange = useMemo(() => {
    const start = scheduledDate || todayIsoDate();
    return { startDate: start, endDate: addDaysIso(start, 13) };
  }, [scheduledDate]);

  const { data: availabilityDays = [], isFetching: slotsLoading } = useQuery({
    queryKey: queryKeys.freelancers.availability(id, availabilityRange.startDate),
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate: availabilityRange.startDate,
        endDate: availabilityRange.endDate,
      });
      const res = await get(`${ApiPaths.freelancers.availability(id)}?${params}`);
      const data = res?.data ?? res;
      return (data?.availability ?? []) as DayAvailability[];
    },
    enabled: Boolean(id) && Boolean(scheduledDate),
  });

  const slotsForDate = useMemo(() => {
    if (!scheduledDate) return [];
    const day = availabilityDays.find((d) => d.date.startsWith(scheduledDate));
    return day?.availableSlots ?? [];
  }, [availabilityDays, scheduledDate]);

  const isIdVerified =
    freelancer?.isVerified || freelancer?.idVerificationStatus === 'verified';
  const needsUnverifiedAck = !isIdVerified;

  const estimatedTotal = useMemo(() => {
    if (!selectedService || selectedService.pricingMode === 'invoice') return null;
    if (selectedService.hourlyRate == null) return null;
    const duration = parseInt(durationMinutes, 10);
    if (!Number.isFinite(duration) || duration <= 0) return null;
    return (selectedService.hourlyRate * duration) / 60;
  }, [selectedService, durationMinutes]);

  const createBooking = useMutation({
    mutationFn: async () => {
      const leafCategory = bookingLeafCategoryId(
        freelancer?.categoryIds,
        freelancer?.categoryRates,
        category,
      );
      const res = await post(ApiPaths.bookings.create, {
        freelancerId: id,
        category: leafCategory,
        scheduledDate,
        scheduledTime,
        durationMinutes: parseInt(durationMinutes, 10),
        address: address.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      return res?.data?.booking ?? res?.data;
    },
    onSuccess: (booking) => {
      toast.success('Booking request sent');
      navigate(`/app/bookings/${booking?.id ?? ''}`);
    },
    onError: (err: unknown) => {
      const e = err as { message?: string };
      toast.error(e.message ?? 'Could not create booking');
    },
  });

  if (isPending) return <Skeleton className="h-64 rounded-2xl" />;
  if (!freelancer) {
    return <p className="text-neutral-600">Freelancer not found.</p>;
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <Link to={`/app/freelancer/${id}`} className="text-sm text-neutral-500 hover:text-neutral-900">
          Back to profile
        </Link>
        <h1 className="text-xl font-semibold mt-2">Book {freelancer.fullName}</h1>
        <p className="text-sm text-neutral-500 mt-1">Choose a service, date, and available time slot</p>
      </div>

      {needsUnverifiedAck ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
          <div className="flex gap-2 items-start">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-neutral-800">
              This freelancer has not completed ID verification. You can still request a booking, but
              proceed with caution.
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={ackUnverified}
              onChange={(e) => setAckUnverified(e.target.checked)}
              className="rounded border-neutral-300"
            />
            I understand and want to continue
          </label>
        </div>
      ) : null}

      <form
        className="space-y-5 bg-white border border-neutral-200 rounded-2xl p-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (!category || !scheduledDate || !scheduledTime) {
            toast.error('Select service, date, and time');
            return;
          }
          if (needsUnverifiedAck && !ackUnverified) {
            toast.error('Please acknowledge the verification notice');
            return;
          }
          createBooking.mutate();
        }}
      >
        <div className="space-y-2">
          <Label>Service</Label>
          {serviceOptions.length === 0 ? (
            <p className="text-sm text-neutral-500">This freelancer has no bookable services listed.</p>
          ) : (
            <select
              className="w-full h-10 rounded-md border border-neutral-200 px-3 text-sm"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setScheduledTime('');
              }}
              required
            >
              <option value="">Select a service</option>
              {serviceOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.displayName}
                  {c.pricingMode === 'invoice'
                    ? ' — custom quote'
                    : c.hourlyRate != null
                      ? ` — ${formatCurrency(c.hourlyRate)}/hr`
                      : ''}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="space-y-2">
          <Label>Date</Label>
          <Input
            type="date"
            min={todayIsoDate()}
            value={scheduledDate}
            onChange={(e) => {
              setScheduledDate(e.target.value);
              setScheduledTime('');
            }}
            required
          />
        </div>

        {scheduledDate ? (
          <div className="space-y-2">
            <Label>Available times</Label>
            {slotsLoading ? (
              <Skeleton className="h-10 rounded-lg" />
            ) : slotsForDate.length === 0 ? (
              <p className="text-sm text-neutral-500 flex items-start gap-2">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                No open slots on this date. Try another day or enter a time manually below.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {slotsForDate.map((slot) => (
                  <button
                    key={`${slot.startTime}-${slot.durationMinutes}`}
                    type="button"
                    onClick={() => {
                      setScheduledTime(slot.startTime.slice(0, 5));
                      setDurationMinutes(String(slot.durationMinutes));
                    }}
                    className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                      scheduledTime === slot.startTime.slice(0, 5)
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : 'border-neutral-200 bg-white hover:border-neutral-400'
                    }`}
                  >
                    {slot.startTime.slice(0, 5)}
                  </button>
                ))}
              </div>
            )}
            <Input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              required
            />
          </div>
        ) : null}

        <div className="space-y-2">
          <Label>Duration (minutes)</Label>
          <Input
            type="number"
            min={30}
            step={30}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            required
          />
        </div>

        {selectedService?.pricingMode === 'invoice' ? (
          <div className="rounded-lg bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
            This service is priced on invoice. The freelancer will quote after accepting your request.
          </div>
        ) : estimatedTotal != null ? (
          <div className="rounded-lg bg-neutral-50 px-3 py-2 text-sm">
            <span className="text-neutral-500">Estimated total: </span>
            <span className="font-medium text-neutral-900">{formatCurrency(estimatedTotal)}</span>
          </div>
        ) : null}

        <div className="space-y-2">
          <Label>Address (optional)</Label>
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Where should the service take place?"
          />
        </div>

        <div className="space-y-2">
          <Label>Notes (optional)</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
        </div>

        <Button
          type="submit"
          className="w-full rounded-full"
          disabled={createBooking.isPending || serviceOptions.length === 0}
        >
          {createBooking.isPending ? 'Sending request...' : 'Request booking'}
        </Button>
      </form>
    </div>
  );
}
