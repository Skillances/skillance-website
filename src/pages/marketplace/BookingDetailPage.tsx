import { useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { get, post } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { useAuth } from '@/context/AuthContext';
import {
  MkAvatar,
  MkButton,
  MkCard,
  MkConfirmDialog,
  MkErrorState,
  MkLinkButton,
  MkPageHeader,
  MkPill,
  MkSkeleton,
  MkSwap,
} from '@/components/marketplace/ui';
import {
  CancelBookingAction,
  DisputePanel,
  FeedbackPanel,
  FreelancerResponseActions,
  PinPanel,
} from '@/components/marketplace/BookingPanels';
import InvoicePanel from '@/components/marketplace/InvoicePanel';
import { apiErrorMessage, unwrap } from '@/lib/marketplace/apiHelpers';
import { bookingKeys, bookingTotalLabel, fetchBooking, otherParty, roleInBooking, type Booking } from '@/lib/marketplace/bookings';
import { isActiveSession, statusLabel, statusTone } from '@/lib/marketplace/bookingStatus';
import { cancellationCodeFromReason, cancellationMessage, cancellationReasonForDisplay } from '@/lib/marketplace/cancellationCopy';
import { categoryLabel, useCategories } from '@/lib/marketplace/categories';
import { useAblyChannel } from '@/lib/marketplace/realtime';
import { addMinutes, formatDate, formatDateTime, formatDuration } from '@/lib/marketplace/time';

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="text-[14px] text-mk-text-secondary">{label}</dt>
      <dd className="text-right text-[14px] font-medium">{children}</dd>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading booking">
      <MkSkeleton className="h-8 w-48" />
      <MkSkeleton className="h-20 w-full rounded-2xl" />
      <MkSkeleton className="h-48 w-full rounded-2xl" />
    </div>
  );
}

export default function BookingDetailPage() {
  const { bookingId = '' } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const categories = useCategories();
  const [dismissOpen, setDismissOpen] = useState(false);

  const q = useQuery({ queryKey: bookingKeys.detail(bookingId), queryFn: () => fetchBooking(bookingId) });
  const b = q.data;
  const role = b ? roleInBooking(b, user) : null;

  // Booking events (pin_verified, status changes) arrive on the user's booking channel.
  const channel = !b || !user ? null : role === 'freelancer' && user.freelancerId ? `private-freelancer-bookings-${user.freelancerId}` : `private-bookings-${user.id}`;
  useAblyChannel(channel, () => {
    void qc.invalidateQueries({ queryKey: bookingKeys.detail(bookingId) });
  });

  const openChat = useMutation({
    mutationFn: async () => unwrap<{ id?: string }>(await get(ApiPaths.marketplace.chatByBooking(bookingId))),
    onSuccess: (chat) => {
      if (chat?.id) navigate(`/chats/${chat.id}`);
      else toast.error('Chat is not available for this booking yet.');
    },
    onError: (err) => toast.error(apiErrorMessage(err, 'Could not open the chat.')),
  });

  const dismiss = useMutation({
    mutationFn: async () => post(ApiPaths.marketplace.bookingDismiss(bookingId), {}),
    onSuccess: () => {
      setDismissOpen(false);
      void qc.invalidateQueries({ queryKey: bookingKeys.all });
      navigate('/bookings', { replace: true });
    },
  });

  const state = q.isPending ? 'loading' : q.isError || !b ? 'error' : 'ready';

  return (
    <MkSwap id={state}>
      {state === 'loading' && <DetailSkeleton />}
      {state === 'error' && (
        <>
          <MkPageHeader back="/bookings" title="Booking" />
          <MkErrorState message={apiErrorMessage(q.error, 'This booking could not be loaded.')} onRetry={() => void q.refetch()} retrying={q.isRefetching} />
        </>
      )}
      {state === 'ready' && b && (
        <Detail
          b={b}
          role={role ?? 'customer'}
          categoryName={b.category ? categoryLabel(categories.data, b.category) : 'Service'}
          onMessage={() => openChat.mutate()}
          messaging={openChat.isPending}
          onDismiss={() => setDismissOpen(true)}
        />
      )}
      <MkConfirmDialog
        open={dismissOpen}
        onOpenChange={setDismissOpen}
        title="Remove from your list?"
        description="This hides the booking from your bookings list. It does not change the booking."
        confirmLabel="Remove"
        cancelLabel="Keep it"
        loading={dismiss.isPending}
        error={dismiss.isError ? apiErrorMessage(dismiss.error) : null}
        onConfirm={() => dismiss.mutate()}
      />
    </MkSwap>
  );
}

function Detail({
  b,
  role,
  categoryName,
  onMessage,
  messaging,
  onDismiss,
}: {
  b: Booking;
  role: 'customer' | 'freelancer';
  categoryName: string;
  onMessage: () => void;
  messaging: boolean;
  onDismiss: () => void;
}) {
  const who = otherParty(b, role);
  const status = String(b.status).toLowerCase();
  const closed = status === 'cancelled' || status === 'rejected';
  const cancelCode = cancellationCodeFromReason(b.cancellationReason);
  const cancelText = cancellationReasonForDisplay(b.cancellationReason);
  const canMessage = isActiveSession(b.status) || status === 'completed';

  return (
    <div className="space-y-4">
      <MkPageHeader back="/bookings" title={categoryName} subtitle={`${formatDate(b.scheduledDate)}, ${b.scheduledTime}`} action={<MkPill tone={statusTone(b.status)}>{statusLabel(b.status)}</MkPill>} />

      <MkCard className="flex items-center gap-3.5">
        <MkAvatar src={who.photo} name={who.name} size={52} />
        <div className="min-w-0 flex-1">
          <p className="text-[12px] text-mk-text-tertiary">{role === 'customer' ? 'Freelancer' : 'Customer'}</p>
          <p className="truncate font-mk-display text-[16px] font-semibold">{who.name}</p>
        </div>
        {canMessage && (
          <MkButton variant="secondary" size="sm" onClick={onMessage} loading={messaging}>
            {!messaging && <MessageCircle className="h-4 w-4" aria-hidden="true" />}
            Message
          </MkButton>
        )}
      </MkCard>

      {role === 'freelancer' && <FreelancerResponseActions booking={b} />}

      <PinPanel booking={b} role={role} />

      <MkCard>
        <dl className="divide-y divide-mk-divider">
          <Row label="Service">{categoryName}</Row>
          <Row label="Date">{formatDate(b.scheduledDate)}</Row>
          <Row label="Time">
            {b.scheduledTime} to {addMinutes(b.scheduledTime, b.durationMinutes)}
          </Row>
          <Row label="Duration">{formatDuration(b.durationMinutes)}</Row>
          {b.address && <Row label="Address">{b.address}</Row>}
          {b.notes && <Row label="Notes">{b.notes}</Row>}
          <Row label="Total">{bookingTotalLabel(b) || '-'}</Row>
          {b.createdAt && <Row label="Requested">{formatDateTime(b.createdAt)}</Row>}
        </dl>
      </MkCard>

      <InvoicePanel booking={b} role={role} />

      {closed && (
        <MkCard>
          <p className="font-mk-display text-[15px] font-semibold">{status === 'rejected' ? 'Declined by the freelancer' : 'Cancelled'}</p>
          {cancelText && <p className="mt-1 text-[14px] text-mk-text-secondary">Reason: {cancelText}</p>}
          {status === 'cancelled' && <p className="mt-2 whitespace-pre-line text-[14px] text-mk-text-secondary">{cancellationMessage(cancelCode)}</p>}
        </MkCard>
      )}

      <FeedbackPanel booking={b} role={role} />
      <DisputePanel booking={b} />

      <div className="space-y-2 pt-2">
        <CancelBookingAction booking={b} />
        {closed && (
          <MkButton variant="ghost" block onClick={onDismiss}>
            Remove from list
          </MkButton>
        )}
        {role === 'customer' && b.freelancerId && (status === 'completed' || closed) && (
          <MkLinkButton to={`/freelancers/${b.freelancerId}/book`} variant="secondary" block>
            Book again
          </MkLinkButton>
        )}
      </div>
    </div>
  );
}
