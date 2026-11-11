import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { KeyRound, ShieldAlert, Star } from 'lucide-react';
import { toast } from 'sonner';
import { get, post } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { useAuth } from '@/context/AuthContext';
import { MkButton, MkCard, MkConfirmDialog, MkFormError, MkPill, MkSectionTitle, MkSkeleton, MkTextarea } from '@/components/marketplace/ui';
import { apiErrorCode, apiErrorMessage, unwrap } from '@/lib/marketplace/apiHelpers';
import { isNotAParty, paymentsPausedMessage } from '@/lib/paymentsPaused';
import { bookingKeys, roleInBooking, type Booking } from '@/lib/marketplace/bookings';
import { canCustomerCancel, canFreelancerAccept, isInProgress } from '@/lib/marketplace/bookingStatus';
import { cancellationMessage } from '@/lib/marketplace/cancellationCopy';
import { isStaff } from '@/lib/marketplace/session';
import { formatDateTime } from '@/lib/marketplace/time';
import {
  PRIVATE_CUSTOMER_RATING_ACK,
  RATING_PENDING_ACK,
  REVIEW_APPEAL_NOTE,
  REVIEW_PENDING_ACK,
  customerRatingBody,
  customerReviewTextBody,
  evaluateBookingReviewEligibility,
  ineligibleCopy,
  mergeFeedbackEligibility,
  normalizeToken,
} from '@/lib/reviewLock';
import { cn } from '@/lib/utils';

function useRefreshBooking(id: string) {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: bookingKeys.detail(id) });
    void qc.invalidateQueries({ queryKey: bookingKeys.all });
  };
}

/* ------------------------------------------------------------------- PIN */

type PinInfo = {
  pin?: string | null;
  pinWindowStartAt?: string | null;
  pinWindowEndAt?: string | null;
  pinVerificationStatus?: string | null;
  pinWindowOpen?: boolean;
};

/**
 * Session PIN. The session starts at the scheduled time without a Start button (app rule):
 * the customer shows the PIN, the freelancer types it.
 */
export function PinPanel({ booking, role }: { booking: Booking; role: 'customer' | 'freelancer' }) {
  const refresh = useRefreshBooking(booking.id);
  const inProgress = isInProgress(booking.status);
  const verified = booking.pinVerificationStatus === 'verified';

  const pin = useQuery({
    queryKey: ['marketplace', 'pin', booking.id],
    enabled: role === 'customer' && inProgress && !verified,
    refetchInterval: (q) => ((q.state.data as PinInfo | undefined)?.pinWindowOpen ? false : 30_000),
    queryFn: async () => unwrap<PinInfo>(await get(ApiPaths.marketplace.bookingPin(booking.id))),
  });

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const verify = useMutation({
    mutationFn: async () => post(ApiPaths.marketplace.bookingVerifyPin(booking.id), { pin: code }),
    onSuccess: () => {
      toast.success('PIN verified. The session is confirmed.');
      setCode('');
      refresh();
    },
    onError: (err) => setError(apiErrorMessage(err, 'Could not verify the PIN.')),
  });

  if (verified) {
    return (
      <MkCard>
        <MkSectionTitle>Session PIN</MkSectionTitle>
        <p className="text-[14px] text-mk-success">PIN verified{booking.pinVerifiedAt ? ` at ${formatDateTime(booking.pinVerifiedAt)}` : ''}.</p>
      </MkCard>
    );
  }
  if (!inProgress) {
    if (String(booking.status).toLowerCase() !== 'confirmed') return null;
    return (
      <MkCard>
        <MkSectionTitle>Session PIN</MkSectionTitle>
        <p className="text-[14px] text-mk-text-secondary">
          {role === 'customer'
            ? 'Your PIN appears here when the session starts at the scheduled time. Share it with the freelancer when you meet.'
            : 'When the session starts at the scheduled time, ask the customer for their PIN and enter it here.'}
        </p>
      </MkCard>
    );
  }

  if (role === 'customer') {
    return (
      <MkCard>
        <MkSectionTitle>Session PIN</MkSectionTitle>
        {pin.isPending ? (
          <MkSkeleton className="h-16 w-48" />
        ) : pin.isError ? (
          <div className="space-y-2">
            <p className="text-[14px] text-mk-text-secondary">{apiErrorMessage(pin.error, 'The PIN is not available yet.')}</p>
            <MkButton variant="secondary" size="sm" onClick={() => void pin.refetch()} loading={pin.isRefetching}>
              Try again
            </MkButton>
          </div>
        ) : pin.data?.pin ? (
          <div>
            <p className="font-mk-display text-[40px] font-bold tracking-[0.3em]" aria-label={`PIN ${pin.data.pin.split('').join(' ')}`}>
              {pin.data.pin}
            </p>
            <p className="mt-1 text-[14px] text-mk-text-secondary">
              Read this PIN to the freelancer so they can confirm the session.
              {pin.data.pinWindowEndAt ? ` Valid until ${formatDateTime(pin.data.pinWindowEndAt)}.` : ''}
            </p>
          </div>
        ) : (
          <p className="text-[14px] text-mk-text-secondary">
            {pin.data?.pinWindowOpen === false && pin.data?.pinWindowStartAt
              ? `The PIN appears at ${formatDateTime(pin.data.pinWindowStartAt)}.`
              : 'The PIN is not available yet.'}
          </p>
        )}
      </MkCard>
    );
  }

  return (
    <MkCard>
      <MkSectionTitle>Enter the customer's PIN</MkSectionTitle>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          if (!/^\d{6}$/.test(code)) {
            setError('Enter the 6-digit PIN.');
            return;
          }
          verify.mutate();
        }}
      >
        <div className="relative">
          <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-mk-text-tertiary" aria-hidden="true" />
          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            aria-label="6-digit PIN"
            aria-invalid={error ? true : undefined}
            onChange={(e) => {
              setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
              setError(null);
            }}
            className="h-14 w-full rounded-xl border border-transparent bg-mk-muted pl-12 font-mk-display text-[22px] font-bold tracking-[0.4em] focus:border-mk-primary focus:bg-mk-surface focus:outline-none"
          />
        </div>
        <MkFormError message={error} />
        <MkButton type="submit" block loading={verify.isPending}>
          Verify PIN
        </MkButton>
      </form>
    </MkCard>
  );
}

/* ---------------------------------------------------------- Feedback */

type FeedbackStatus = {
  customerStarRatingSubmitted?: boolean;
  customerTextReviewSubmitted?: boolean;
  freelancerRatedCustomer?: boolean;
  eligible?: boolean;
  eligibleReason?: string;
  eligibleCode?: string | null;
  reviewEligibleAt?: string | null;
  reviewWindowEndsAt?: string | null;
};

type BookingDispute = { id?: string; status?: string; resolvedAt?: string | null; resolution?: string | null; reason?: string; createdAt?: string };

function feedbackError(err: unknown, fallback: string): string {
  return ineligibleCopy(apiErrorCode(err)) ?? apiErrorMessage(err, fallback);
}

function StarPicker({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          onClick={() => onChange(n)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full transition-transform duration-150 hover:bg-mk-muted active:scale-90 motion-reduce:active:scale-100"
        >
          <Star className={cn('h-7 w-7', n <= value ? 'text-mk-rating' : 'text-mk-border')} fill="currentColor" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}

/** Customer: stars, then a written review. Freelancer: private stars only. Gated by the booking party, dispute window, and review window. */
export function FeedbackPanel({ booking, role }: { booking: Booking; role: 'customer' | 'freelancer' }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const statusKey = normalizeToken(booking.status);
  const completed = statusKey === 'completed';
  const cancelledOrNoShow = statusKey === 'cancelled' || statusKey === 'canceled' || statusKey === 'no_show' || statusKey === 'noshow';
  const key = ['marketplace', 'feedback', booking.id];
  const status = useQuery({
    queryKey: key,
    enabled: completed,
    queryFn: async () => unwrap<FeedbackStatus>(await get(ApiPaths.marketplace.bookingFeedbackStatus(booking.id))),
  });
  const dispute = useQuery({
    queryKey: ['marketplace', 'dispute', booking.id],
    enabled: completed,
    queryFn: async () => unwrap<BookingDispute | null>(await get(ApiPaths.marketplace.disputeByBooking(booking.id))),
  });
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  const partyRole = roleInBooking(booking, user);
  const isParty = partyRole === role;

  const submitStars = useMutation({
    mutationFn: async () =>
      post(
        role === 'customer' ? ApiPaths.marketplace.bookingRateFreelancer(booking.id) : ApiPaths.marketplace.bookingRateCustomer(booking.id),
        customerRatingBody(stars),
      ),
    onSuccess: () => {
      toast.success(role === 'customer' ? RATING_PENDING_ACK : PRIVATE_CUSTOMER_RATING_ACK);
      setError(null);
      void qc.invalidateQueries({ queryKey: key });
    },
    onError: (err) => setError(feedbackError(err, 'Could not send your rating.')),
  });
  const submitText = useMutation({
    mutationFn: async () => post(ApiPaths.marketplace.bookingReviewText(booking.id), customerReviewTextBody(comment)),
    onSuccess: () => {
      toast.success(REVIEW_PENDING_ACK);
      setError(null);
      setComment('');
      void qc.invalidateQueries({ queryKey: key });
    },
    onError: (err) => setError(feedbackError(err, 'Could not send your review.')),
  });

  if (!completed && !cancelledOrNoShow) return null;

  const blocked = evaluateBookingReviewEligibility({
    booking,
    dispute: dispute.data ?? null,
    isParty,
    isStaffAccount: isStaff(user),
    alreadyReviewed: false,
  });

  if (!completed) {
    return (
      <MkCard>
        <MkSectionTitle>Feedback</MkSectionTitle>
        <p className="text-[14px] text-mk-text-secondary">{blocked.message}</p>
      </MkCard>
    );
  }

  if (status.isPending || dispute.isPending) return <MkSkeleton className="h-28 w-full rounded-2xl" />;
  if (status.isError) {
    return (
      <MkCard>
        <MkSectionTitle>Feedback</MkSectionTitle>
        <p className="text-[14px] text-mk-text-secondary">{apiErrorMessage(status.error)}</p>
        <MkButton variant="secondary" size="sm" className="mt-2" onClick={() => void status.refetch()}>
          Try again
        </MkButton>
      </MkCard>
    );
  }
  if (dispute.isError && !isNotAParty(dispute.error)) {
    const statusCode = (dispute.error as { statusCode?: number } | null)?.statusCode;
    if (statusCode !== 404) {
      return (
        <MkCard>
          <MkSectionTitle>Feedback</MkSectionTitle>
          <p className="text-[14px] text-mk-text-secondary">
            A review stays closed until the dispute status for this booking can be confirmed.
          </p>
          <MkButton variant="secondary" size="sm" className="mt-2" onClick={() => void dispute.refetch()}>
            Try again
          </MkButton>
        </MkCard>
      );
    }
  }

  const s = status.data ?? {};
  const starsDone = role === 'customer' ? Boolean(s.customerStarRatingSubmitted) : Boolean(s.freelancerRatedCustomer);
  const textDone = role === 'customer' ? Boolean(s.customerTextReviewSubmitted) : true;
  const local = evaluateBookingReviewEligibility({
    booking,
    dispute: dispute.isError ? null : (dispute.data ?? null),
    isParty,
    isStaffAccount: isStaff(user),
    alreadyReviewed: false,
    reviewEligibleAt: s.reviewEligibleAt,
  });
  const merged = mergeFeedbackEligibility(local, s);
  const textStillOpen =
    role === 'customer' &&
    starsDone &&
    !textDone &&
    local.eligible &&
    (s.eligible === true || !s.eligibleCode || s.eligibleCode === 'already_reviewed');
  const showForm = merged.eligible && !starsDone;
  const showText = textStillOpen;

  return (
    <MkCard>
      <MkSectionTitle>{role === 'customer' ? 'Rate your freelancer' : 'Rate this customer'}</MkSectionTitle>
      {role === 'freelancer' && (
        <p className="mb-3 text-[14px] text-mk-text-secondary">This rating is private. It is not published as a written review.</p>
      )}
      {starsDone && textDone ? (
        <div className="space-y-2">
          <p className="text-[14px] text-mk-success">{role === 'customer' ? REVIEW_PENDING_ACK : PRIVATE_CUSTOMER_RATING_ACK}</p>
          {role === 'customer' && <p className="text-[13px] text-mk-text-tertiary">{REVIEW_APPEAL_NOTE}</p>}
        </div>
      ) : showForm ? (
        <div className="space-y-3">
          <StarPicker value={stars} onChange={setStars} label="Rating" />
          <MkFormError message={error} />
          <MkButton disabled={stars === 0} loading={submitStars.isPending} onClick={() => submitStars.mutate()}>
            Submit rating
          </MkButton>
          {role === 'customer' && (
            <p className="text-[13px] text-mk-text-tertiary">Your rating is checked before it appears on the provider profile.</p>
          )}
        </div>
      ) : showText ? (
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!comment.trim()) {
              setError('Write a few words about the session.');
              return;
            }
            submitText.mutate();
          }}
        >
          <p className="text-[14px] text-mk-text-secondary">Rating received. It will appear once checked.</p>
          <MkTextarea
            label="Write a review"
            optional
            maxLength={2000}
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
              setError(null);
            }}
            hint={`${comment.length}/2000. Your name and suburb are not collected.`}
            error={error}
          />
          <MkButton type="submit" loading={submitText.isPending}>
            Submit review
          </MkButton>
        </form>
      ) : (
        <p className="text-[14px] text-mk-text-secondary">{merged.message || 'Feedback is not open for this booking yet.'}</p>
      )}
    </MkCard>
  );
}

/* ----------------------------------------------------------- Dispute */

type Dispute = { id: string; status: string; reason?: string; resolution?: string | null; createdAt?: string };

const DISPUTE_STATUS: Record<string, string> = {
  open: 'Open',
  under_review: 'Under review',
  resolved_payout: 'Resolved: paid to freelancer',
  resolved_refund: 'Resolved: refunded',
  closed: 'Closed',
};

export function DisputePanel({ booking }: { booking: Booking }) {
  const qc = useQueryClient();
  const key = ['marketplace', 'dispute', booking.id];
  const dispute = useQuery({
    queryKey: key,
    queryFn: async () => unwrap<Dispute | null>(await get(ApiPaths.marketplace.disputeByBooking(booking.id))),
  });
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [evidence, setEvidence] = useState('');
  const [error, setError] = useState<string | null>(null);
  // Read once per mount; the API enforces the real window.
  const [now] = useState(() => Date.now());
  const create = useMutation({
    mutationFn: async () =>
      post(ApiPaths.marketplace.disputes, {
        bookingId: booking.id,
        reason: reason.trim(),
        ...(evidence.trim() ? { evidence: evidence.trim() } : {}),
      }),
    onSuccess: () => {
      setOpen(false);
      setReason('');
      setEvidence('');
      toast.success('Problem reported. Our team will review it.');
      void qc.invalidateQueries({ queryKey: key });
      void qc.invalidateQueries({ queryKey: bookingKeys.detail(booking.id) });
    },
    onError: (err) =>
      setError(
        isNotAParty(err)
          ? 'Only people on this booking can report a problem.'
          : (paymentsPausedMessage(err) ?? apiErrorMessage(err, 'Could not report the problem.')),
      ),
  });

  const windowOpen = booking.disputeWindowEndsAt ? new Date(booking.disputeWindowEndsAt).getTime() > now : false;
  const canOpen = (windowOpen || booking.disputeRequired === true) && !dispute.data;

  if (dispute.isPending) return null;
  if (dispute.isError && isNotAParty(dispute.error)) return null;
  if (!dispute.data && !canOpen) return null;

  return (
    <MkCard>
      <MkSectionTitle>Problem with this booking</MkSectionTitle>
      {dispute.data ? (
        <div className="space-y-2 text-[14px]">
          <MkPill tone={dispute.data.status === 'open' || dispute.data.status === 'under_review' ? 'warning' : 'neutral'}>
            {DISPUTE_STATUS[dispute.data.status] ?? dispute.data.status}
          </MkPill>
          {dispute.data.reason && <p className="text-mk-text-secondary">{dispute.data.reason}</p>}
          {dispute.data.resolution && <p>{dispute.data.resolution}</p>}
        </div>
      ) : (
        <>
          <p className="text-[14px] text-mk-text-secondary">
            Something went wrong with the session? Report it
            {booking.disputeWindowEndsAt ? ` before ${formatDateTime(booking.disputeWindowEndsAt)}` : ''} and our team will review it.
          </p>
          <MkButton variant="danger-outline" className="mt-3" onClick={() => setOpen(true)}>
            <ShieldAlert className="h-4 w-4" aria-hidden="true" />
            Report a problem
          </MkButton>
        </>
      )}
      <MkConfirmDialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          setError(null);
        }}
        title="Report a problem"
        description="Describe what happened. Payout is held while our team reviews it."
        confirmLabel="Submit report"
        cancelLabel="Cancel"
        loading={create.isPending}
        error={error}
        confirmDisabled={reason.trim().length < 10}
        onConfirm={() => create.mutate()}
      >
        <MkTextarea
          label="What happened?"
          value={reason}
          maxLength={5000}
          onChange={(e) => setReason(e.target.value)}
          hint="At least 10 characters"
        />
        <MkTextarea label="Supporting details" optional value={evidence} onChange={(e) => setEvidence(e.target.value)} />
      </MkConfirmDialog>
    </MkCard>
  );
}

/* --------------------------------------------- Accept, decline, cancel */

export function FreelancerResponseActions({ booking }: { booking: Booking }) {
  const refresh = useRefreshBooking(booking.id);
  const [declineOpen, setDeclineOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const accept = useMutation({
    mutationFn: async () => post(ApiPaths.marketplace.bookingAccept(booking.id), {}),
    onSuccess: () => {
      toast.success('Booking accepted');
      refresh();
    },
    onError: (err) => toast.error(apiErrorMessage(err, 'Could not accept the booking.')),
  });
  const decline = useMutation({
    mutationFn: async () => post(ApiPaths.marketplace.bookingDecline(booking.id), { reason: reason.trim() }),
    onSuccess: () => {
      setDeclineOpen(false);
      toast.success('Booking declined');
      refresh();
    },
    onError: (err) => setError(apiErrorMessage(err, 'Could not decline the booking.')),
  });
  if (!canFreelancerAccept(booking.status)) return null;
  return (
    <div className="flex gap-2">
      <MkButton variant="secondary" className="flex-1" onClick={() => setDeclineOpen(true)} disabled={accept.isPending}>
        Decline
      </MkButton>
      <MkButton className="flex-1" loading={accept.isPending} onClick={() => accept.mutate()}>
        Accept
      </MkButton>
      <MkConfirmDialog
        open={declineOpen}
        onOpenChange={(v) => {
          setDeclineOpen(v);
          setError(null);
        }}
        title="Decline booking"
        confirmLabel="Decline"
        cancelLabel="Cancel"
        destructive
        loading={decline.isPending}
        error={error}
        confirmDisabled={!reason.trim()}
        onConfirm={() => decline.mutate()}
      >
        <MkTextarea label="Reason" placeholder="Give the customer a reason" value={reason} onChange={(e) => setReason(e.target.value)} />
      </MkConfirmDialog>
    </div>
  );
}

export function CancelBookingAction({ booking }: { booking: Booking }) {
  const refresh = useRefreshBooking(booking.id);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const cancel = useMutation({
    mutationFn: async () => unwrap<Booking>(await post(ApiPaths.marketplace.bookingCancel(booking.id), reason.trim() ? { reason: reason.trim() } : {})),
    onSuccess: (data) => {
      setOpen(false);
      setResult(cancellationMessage(data?.cancellationMatrix?.code));
      refresh();
    },
    onError: (err) => setError(apiErrorMessage(err, 'Could not cancel the booking.')),
  });

  if (result) {
    return (
      <div role="status" className="whitespace-pre-line rounded-2xl border border-mk-border p-4 text-[14px] text-mk-text-secondary">
        {result}
      </div>
    );
  }
  if (!canCustomerCancel(booking.status)) return null;
  return (
    <>
      <MkButton variant="danger-outline" block onClick={() => setOpen(true)}>
        Cancel booking
      </MkButton>
      <MkConfirmDialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          setError(null);
        }}
        title="Cancel this booking?"
        description="Refunds and fees follow the Skillance cancellation rules for this booking. You will see the outcome after cancelling."
        confirmLabel="Cancel booking"
        destructive
        loading={cancel.isPending}
        error={error}
        onConfirm={() => cancel.mutate()}
      >
        <MkTextarea label="Reason" optional value={reason} onChange={(e) => setReason(e.target.value)} />
      </MkConfirmDialog>
    </>
  );
}
