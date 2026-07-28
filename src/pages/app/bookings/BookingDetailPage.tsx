import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { queryKeys } from '@/lib/queryKeys';
import { useAuth } from '@/context/AuthContext';
import type { BookingSummary } from '@/types/product';
import { formatBookingStatus } from '@/lib/bookingStatus';
import { formatCurrency } from '@/lib/categoryDisplay';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function BookingDetailPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const id = bookingId ?? '';
  const { isFreelancerView, user } = useAuth();
  const queryClient = useQueryClient();

  const { data: booking, isPending } = useQuery({
    queryKey: queryKeys.bookings.detail(id),
    queryFn: async () => {
      const res = await get(ApiPaths.bookings.byId(id));
      return (res?.data?.booking ?? res?.data) as BookingSummary;
    },
    enabled: Boolean(id),
  });

  const cancelMutation = useMutation({
    mutationFn: () => post(ApiPaths.bookings.cancel(id), {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.my() });
      toast.success('Booking cancelled');
    },
    onError: () => toast.error('Could not cancel booking'),
  });

  const acceptMutation = useMutation({
    mutationFn: () => post(ApiPaths.bookings.accept(id), {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.my() });
      toast.success('Booking accepted');
    },
    onError: () => toast.error('Could not accept booking'),
  });

  const declineMutation = useMutation({
    mutationFn: () => post(ApiPaths.bookings.decline(id), {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.my() });
      toast.success('Booking declined');
    },
    onError: () => toast.error('Could not decline booking'),
  });

  const payConnectionFee = useMutation({
    mutationFn: async () => {
      const res = await post(ApiPaths.bookings.connectionFee(id), {});
      const fee = res?.data ?? res;
      const connectionFeeId = fee?.id ?? fee?.connectionFeeId;
      if (!connectionFeeId) {
        throw new Error('Connection fee could not be created');
      }
      await post(ApiPaths.bookings.connectionFeeConfirm(id), { connectionFeeId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.detail(id) });
      toast.success('Connection fee paid — chat unlocked');
    },
    onError: (err: unknown) => {
      const e = err as { message?: string };
      toast.error(e.message ?? 'Payment failed');
    },
  });

  if (isPending) return <Skeleton className="h-64 rounded-2xl" />;
  if (!booking) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-600">Booking not found.</p>
        <Link to="/app/bookings" className="text-sm underline mt-2 inline-block">
          Back to bookings
        </Link>
      </div>
    );
  }

  const isFreelancerOwner =
    isFreelancerView && user?.freelancerId && booking.freelancerId === user.freelancerId;

  const connectionFeePaid =
    booking.connectionFeePaid ||
    booking.connectionFeeStatus === 'paid';

  const showConnectionFee =
    !isFreelancerOwner &&
    booking.pricingMode === 'invoice' &&
    !connectionFeePaid &&
    ['pending', 'confirmed'].includes(booking.status.toLowerCase());

  const canCancelCustomer =
    !isFreelancerOwner &&
    ['pending', 'confirmed'].includes(booking.status.toLowerCase());

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <Link to={isFreelancerView ? '/app/freelancer/jobs' : '/app/bookings'} className="text-sm text-neutral-500">
          Back
        </Link>
        <div className="flex items-center gap-2 mt-2">
          <h1 className="text-xl font-semibold">Booking details</h1>
          <Badge>{formatBookingStatus(booking.status)}</Badge>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 space-y-3 text-sm">
        {booking.categoryName || booking.category ? (
          <div className="flex justify-between gap-4">
            <span className="text-neutral-500">Service</span>
            <span className="font-medium text-right">{booking.categoryName ?? booking.category}</span>
          </div>
        ) : null}
        <div className="flex justify-between">
          <span className="text-neutral-500">Date</span>
          <span className="font-medium">{booking.scheduledDate}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-500">Time</span>
          <span className="font-medium">{booking.scheduledTime?.slice(0, 5)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-500">Duration</span>
          <span className="font-medium">{booking.durationMinutes} min</span>
        </div>
        {booking.pricingMode ? (
          <div className="flex justify-between">
            <span className="text-neutral-500">Pricing</span>
            <span className="font-medium">
              {booking.pricingMode === 'invoice' ? 'Custom quote' : 'Hourly'}
            </span>
          </div>
        ) : null}
        {booking.pricingMode !== 'invoice' && booking.totalPrice != null ? (
          <div className="flex justify-between">
            <span className="text-neutral-500">Total</span>
            <span className="font-medium">{formatCurrency(booking.totalPrice)}</span>
          </div>
        ) : null}
        {booking.freelancerName ? (
          <div className="flex justify-between gap-4">
            <span className="text-neutral-500">Freelancer</span>
            <Link
              to={`/app/freelancer/${booking.freelancerId}`}
              className="font-medium text-neutral-900 underline underline-offset-2 text-right"
            >
              {booking.freelancerName}
            </Link>
          </div>
        ) : null}
        {booking.customerName ? (
          <div className="flex justify-between">
            <span className="text-neutral-500">Customer</span>
            <span className="font-medium">{booking.customerName}</span>
          </div>
        ) : null}
        {booking.address ? (
          <div>
            <span className="text-neutral-500 block mb-1">Address</span>
            <span>{booking.address}</span>
          </div>
        ) : null}
        {booking.notes ? (
          <div>
            <span className="text-neutral-500 block mb-1">Notes</span>
            <span className="text-neutral-700 whitespace-pre-wrap">{booking.notes}</span>
          </div>
        ) : null}
        {booking.pricingMode === 'invoice' ? (
          <div className="flex justify-between">
            <span className="text-neutral-500">Connection fee</span>
            <span className="font-medium">
              {connectionFeePaid ? 'Paid' : 'Required to unlock chat'}
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <Link to={`/app/chat?bookingId=${id}`}>
          <Button variant="outline" className="rounded-full">
            Open chat
          </Button>
        </Link>

        {showConnectionFee ? (
          <Button
            className="rounded-full"
            disabled={payConnectionFee.isPending}
            onClick={() => payConnectionFee.mutate()}
          >
            Pay connection fee
            {booking.connectionFeeAmount != null
              ? ` (${formatCurrency(booking.connectionFeeAmount)})`
              : ''}
          </Button>
        ) : null}

        {isFreelancerOwner && booking.status.toLowerCase() === 'pending' ? (
          <>
            <Button className="rounded-full" onClick={() => acceptMutation.mutate()} disabled={acceptMutation.isPending}>
              Accept
            </Button>
            <Button variant="outline" className="rounded-full" onClick={() => declineMutation.mutate()} disabled={declineMutation.isPending}>
              Decline
            </Button>
          </>
        ) : null}

        {canCancelCustomer ? (
          <Button
            variant="destructive"
            className="rounded-full"
            onClick={() => cancelMutation.mutate()}
            disabled={cancelMutation.isPending}
          >
            Cancel booking
          </Button>
        ) : null}
      </div>
    </div>
  );
}
