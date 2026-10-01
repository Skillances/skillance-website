import { useQuery } from '@tanstack/react-query';
import { ClipboardCheck } from 'lucide-react';
import { get } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { MkCard, MkErrorState, MkLinkButton, MkPill, MkSkeleton, type MkTone } from '@/components/marketplace/ui';
import { apiErrorMessage, unwrap } from '@/lib/marketplace/apiHelpers';
import { formatDateTime } from '@/lib/marketplace/time';

export type ApplicationStatus = {
  hasApplication?: boolean;
  status?: 'pending_staff' | 'pending' | 'verified' | 'rejected' | 'unverified' | null;
  submittedAt?: string | null;
  message?: string;
};

const LABEL: Record<string, { text: string; tone: MkTone }> = {
  pending_staff: { text: 'In review', tone: 'warning' },
  pending: { text: 'In review', tone: 'warning' },
  verified: { text: 'Approved', tone: 'success' },
  rejected: { text: 'Not approved', tone: 'error' },
  unverified: { text: 'Not verified', tone: 'neutral' },
};

/** Freelancer application state from `GET /freelancers/application-status` (shown instead of empty dashboards). */
export default function ApplicationStatusCard() {
  const q = useQuery({
    queryKey: ['marketplace', 'application-status'],
    queryFn: async () => unwrap<ApplicationStatus>(await get(ApiPaths.marketplace.freelancerApplicationStatus)),
  });
  if (q.isPending) return <MkSkeleton className="h-36 w-full rounded-2xl" />;
  if (q.isError) return <MkErrorState message={apiErrorMessage(q.error)} onRetry={() => void q.refetch()} retrying={q.isRefetching} />;
  const d = q.data ?? {};
  const st = d.status ? LABEL[d.status] : null;
  return (
    <MkCard className="p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mk-muted">
          <ClipboardCheck className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[17px]">Freelancer application</h2>
            {st && <MkPill tone={st.tone}>{st.text}</MkPill>}
          </div>
          <p className="mt-1 text-[14px] text-mk-text-secondary">
            {d.message || (d.hasApplication ? 'Your application is being reviewed.' : 'Apply to offer your services on Skillance.')}
          </p>
          {d.submittedAt && <p className="mt-1 text-[12px] text-mk-text-tertiary">Submitted {formatDateTime(d.submittedAt)}</p>}
          {(!d.hasApplication || d.status === 'rejected') && (
            <MkLinkButton to="/account/apply-freelancer" className="mt-4">
              {d.status === 'rejected' ? 'Apply again' : 'Apply to be a freelancer'}
            </MkLinkButton>
          )}
        </div>
      </div>
    </MkCard>
  );
}
