import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BadgeCheck, Star } from 'lucide-react';
import { toast } from 'sonner';
import { get, post } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { useAuth } from '@/context/AuthContext';
import { MkAvatar, MkButton, MkErrorState, MkSectionTitle, MkSkeleton, MkTextarea } from '@/components/marketplace/ui';
import { apiErrorMessage, unwrap } from '@/lib/marketplace/apiHelpers';
import {
  REPLY_PENDING_ACK,
  REVIEW_APPEAL_NOTE,
  SUPPORT_EMAIL,
  VERIFIED_BOOKING_LABEL,
  providerReplyBody,
  providerReplyState,
  publicReviewerName,
  selectPublicBookingReviews,
  type PublicReviewCustomer,
} from '@/lib/reviewLock';
import { cn } from '@/lib/utils';

export type FreelancerReviewRecord = {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  publishedAt?: string | null;
  moderationStatus?: string | null;
  status?: string | null;
  isAnonymous?: boolean | null;
  location?: string | null;
  source?: string | null;
  customer?: PublicReviewCustomer | null;
  reply?: { comment?: string | null; status?: string | null; createdAt?: string | null } | null;
};

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn('h-3.5 w-3.5', i < rating ? 'text-mk-rating' : 'text-mk-border')}
          fill="currentColor"
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

export function BookingReviewItems({
  reviews,
  isProvider,
  now,
  onSubmitReply,
  onSubmitReport,
  replyPending,
  reportPending,
}: {
  reviews: FreelancerReviewRecord[];
  isProvider: boolean;
  now?: Date;
  onSubmitReply: (reviewId: string, comment: string) => Promise<void>;
  onSubmitReport: (reviewId: string, reason: string, evidence: string) => Promise<void>;
  replyPending?: boolean;
  reportPending?: boolean;
}) {
  const [replyFor, setReplyFor] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [reportFor, setReportFor] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [evidence, setEvidence] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const visible = selectPublicBookingReviews(reviews);
  if (visible.length === 0) {
    return <p className="text-[14px] text-mk-text-secondary">No verified booking reviews yet.</p>;
  }

  return (
    <ul className="space-y-4">
      {visible.map((review) => {
        const name = publicReviewerName(review.customer);
        const replyState = providerReplyState({
          isProvider,
          moderationStatus: review.moderationStatus,
          status: review.status,
          publishedAt: review.publishedAt,
          reply: review.reply,
          now,
        });
        return (
          <li key={review.id} className="flex gap-3">
            <MkAvatar src={review.customer?.profilePhotoUrl} name={name} size={40} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <p className="font-mk-display text-[14px] font-semibold">{name}</p>
                <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-mk-success">
                  <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" /> {VERIFIED_BOOKING_LABEL}
                </span>
                <Stars rating={review.rating} />
                <span className="text-[12px] text-mk-text-tertiary">{new Date(review.createdAt).toLocaleDateString('en-ZA')}</span>
              </div>
              {review.comment && <p className="mt-1 text-[14px] leading-relaxed text-mk-text-secondary">{review.comment}</p>}
              {replyState.publicReply && (
                <p className="mt-2 rounded-xl bg-mk-muted px-3 py-2 text-[14px] text-mk-text-secondary">
                  <span className="font-semibold text-mk-text-primary">Provider reply. </span>
                  {replyState.publicReply}
                </p>
              )}
              {replyState.providerPendingReply && (
                <p className="mt-2 text-[13px] text-mk-text-tertiary">
                  Your reply will appear once checked. {REVIEW_APPEAL_NOTE}
                </p>
              )}
              {isProvider && replyState.showForm && replyFor !== review.id && (
                <MkButton variant="secondary" size="sm" className="mt-2" onClick={() => setReplyFor(review.id)}>
                  Reply
                </MkButton>
              )}
              {isProvider && replyState.closedMessage && !replyState.providerPendingReply && (
                <p className="mt-2 text-[13px] text-mk-text-tertiary">{replyState.closedMessage}</p>
              )}
              {replyFor === review.id && (
                <form
                  className="mt-2 space-y-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (!reply.trim()) {
                      setFormError('Write a short reply.');
                      return;
                    }
                    void onSubmitReply(review.id, reply.trim()).then(() => {
                      setReply('');
                      setReplyFor(null);
                      setFormError(null);
                    }).catch((err: unknown) => setFormError(apiErrorMessage(err, 'Could not send your reply.')));
                  }}
                >
                  <MkTextarea
                    label="Public reply"
                    maxLength={2000}
                    value={reply}
                    onChange={(event) => {
                      setReply(event.target.value);
                      setFormError(null);
                    }}
                    hint="One reply. No personal details, private booking information, threats, or retaliation."
                    error={replyFor === review.id ? formError : null}
                  />
                  <MkButton type="submit" size="sm" loading={replyPending}>
                    Submit reply
                  </MkButton>
                </form>
              )}
              {isProvider && (
                <div className="mt-2">
                  {reportFor === review.id ? (
                    <form
                      className="space-y-2"
                      onSubmit={(event) => {
                        event.preventDefault();
                        if (reason.trim().length < 10) {
                          setFormError('Describe the problem in at least 10 characters.');
                          return;
                        }
                        void onSubmitReport(review.id, reason.trim(), evidence.trim()).then(() => {
                          setReportFor(null);
                          setReason('');
                          setEvidence('');
                          setFormError(null);
                        }).catch(() => {
                          setFormError(
                            `We could not file that in the app yet. Email ${SUPPORT_EMAIL} and include review ${review.id}. This is not an appeal form, and nothing is emailed from here.`,
                          );
                        });
                      }}
                    >
                      <MkTextarea
                        label="Report this review"
                        value={reason}
                        maxLength={2000}
                        onChange={(event) => setReason(event.target.value)}
                        hint="The review stays visible unless it has to be hidden while it is checked. No silent deletion."
                      />
                      <MkTextarea label="Evidence" optional value={evidence} onChange={(event) => setEvidence(event.target.value)} />
                      <MkFormError message={formError} />
                      <div className="flex gap-2">
                        <MkButton type="submit" size="sm" variant="secondary" loading={reportPending}>
                          Submit report
                        </MkButton>
                        <MkButton type="button" size="sm" variant="ghost" onClick={() => setReportFor(null)}>
                          Cancel
                        </MkButton>
                      </div>
                    </form>
                  ) : (
                    <button
                      type="button"
                      className="text-[13px] font-semibold text-mk-text-tertiary underline-offset-2 hover:underline"
                      onClick={() => {
                        setReportFor(review.id);
                        setFormError(null);
                      }}
                    >
                      Report this review
                    </button>
                  )}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function MkFormError({ message }: { message: string | null }) {
  if (!message) return null;
  return <p className="text-[13px] text-mk-error">{message}</p>;
}

export default function FreelancerReviews({
  freelancerId,
  providerUserId,
}: {
  freelancerId: string;
  providerUserId?: string | null;
}) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const qc = useQueryClient();
  const reviews = useQuery({
    queryKey: ['marketplace', 'reviews', freelancerId],
    enabled: isAuthenticated,
    queryFn: async () => {
      const res = await get(`${ApiPaths.marketplace.freelancerReviews(freelancerId)}?page=1&limit=20`);
      const rows = unwrap<{ reviews?: FreelancerReviewRecord[] }>(res).reviews ?? [];
      return selectPublicBookingReviews(rows);
    },
  });
  const isProvider = Boolean(user && (user.id === providerUserId || (user.freelancerId && user.freelancerId === freelancerId)));

  const reply = useMutation({
    mutationFn: async ({ reviewId, comment }: { reviewId: string; comment: string }) =>
      post(ApiPaths.marketplace.freelancerReviewReply(freelancerId, reviewId), providerReplyBody(comment)),
    onSuccess: async () => {
      toast.success(REPLY_PENDING_ACK);
      await qc.invalidateQueries({ queryKey: ['marketplace', 'reviews', freelancerId] });
    },
  });
  const report = useMutation({
    mutationFn: async ({ reviewId, reason, evidence }: { reviewId: string; reason: string; evidence: string }) =>
      post(ApiPaths.marketplace.freelancerReviewReport(freelancerId, reviewId), {
        reason,
        ...(evidence ? { evidence } : {}),
      }),
    onSuccess: () => {
      toast.success('Report received. The review stays visible unless it has to be hidden while it is checked. Nothing was emailed.');
    },
  });

  return (
    <section className="border-t border-mk-divider pt-6">
      <MkSectionTitle>Reviews</MkSectionTitle>
      {!isAuthenticated ? (
        <p className="text-[14px] text-mk-text-secondary">
          <Link to="/login" state={{ from: location }} className="font-semibold text-mk-text-primary underline underline-offset-2">
            Sign in
          </Link>{' '}
          to read verified booking reviews.
        </p>
      ) : reviews.isPending ? (
        <div className="space-y-3">
          <MkSkeleton className="h-16 w-full" />
          <MkSkeleton className="h-16 w-full" />
        </div>
      ) : reviews.isError ? (
        <MkErrorState
          message={apiErrorMessage(reviews.error, 'Reviews are unavailable.')}
          onRetry={() => void reviews.refetch()}
          retrying={reviews.isRefetching}
        />
      ) : (
        <BookingReviewItems
          reviews={reviews.data ?? []}
          isProvider={isProvider}
          onSubmitReply={async (reviewId, comment) => {
            await reply.mutateAsync({ reviewId, comment });
          }}
          onSubmitReport={async (reviewId, reason, evidence) => {
            await report.mutateAsync({ reviewId, reason, evidence });
          }}
          replyPending={reply.isPending}
          reportPending={report.isPending}
        />
      )}
    </section>
  );
}
