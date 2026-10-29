import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Ban, Flag } from 'lucide-react';
import { toast } from 'sonner';
import { post } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { useAuth } from '@/context/AuthContext';
import { MkButton, MkIconButton, MkConfirmDialog, MkDialog, MkFormError, MkSelect, MkTextarea } from '@/components/marketplace/ui';
import { blocksKey } from '@/lib/marketplace/safety';
import { apiErrorMessage } from '@/lib/marketplace/apiHelpers';

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'fraud', label: 'Fraud or scam' },
  { value: 'unsafe', label: 'Unsafe behaviour' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'other', label: 'Other' },
] as const;

type Props = {
  userId: string | null | undefined;
  name: string;
  bookingId?: string | null;
  /** `onBlocked` runs after a successful block (for example, leave the page). */
  onBlocked?: () => void;
  size?: 'md' | 'sm';
  /** Icon-only buttons (for tight headers). */
  iconOnly?: boolean;
};

/** Report and Block buttons with their dialogs. Renders nothing for your own account or an unknown user. */
export default function UserSafetyActions({ userId, name, bookingId, onBlocked, size = 'sm', iconOnly }: Props) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [reportOpen, setReportOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');

  const report = useMutation({
    mutationFn: async () =>
      post(ApiPaths.marketplace.reportUser, {
        reportedUserId: userId,
        reason,
        ...(details.trim() ? { details: details.trim() } : {}),
        ...(bookingId ? { bookingId } : {}),
      }),
    onSuccess: () => {
      setReportOpen(false);
      setReason('');
      setDetails('');
      toast.success('Report sent. Our team will review it.');
    },
  });

  const block = useMutation({
    mutationFn: async () => post(ApiPaths.marketplace.userBlock(userId!), {}),
    onSuccess: () => {
      setBlockOpen(false);
      toast.success(`${name} is blocked`);
      void qc.invalidateQueries({ queryKey: blocksKey });
      onBlocked?.();
    },
  });

  if (!userId || userId === user?.id) return null;

  return (
    <>
      {iconOnly ? (
        <>
          <MkIconButton label={`Report ${name}`} title="Report" onClick={() => setReportOpen(true)}>
            <Flag className="h-5 w-5" aria-hidden="true" />
          </MkIconButton>
          <MkIconButton label={`Block ${name}`} title="Block" className="text-mk-error" onClick={() => setBlockOpen(true)}>
            <Ban className="h-5 w-5" aria-hidden="true" />
          </MkIconButton>
        </>
      ) : (
        <>
          <MkButton variant="secondary" size={size} onClick={() => setReportOpen(true)}>
            <Flag className="h-4 w-4" aria-hidden="true" /> Report
          </MkButton>
          <MkButton variant="danger-outline" size={size} onClick={() => setBlockOpen(true)}>
            <Ban className="h-4 w-4" aria-hidden="true" /> Block
          </MkButton>
        </>
      )}

      <MkDialog
        open={reportOpen}
        onOpenChange={(v) => {
          setReportOpen(v);
          report.reset();
        }}
        title={`Report ${name}`}
        description="Tell us what happened. Reports are reviewed by Skillance staff and the other person is not told who reported them."
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (reason) report.mutate();
          }}
        >
          <MkSelect label="Reason" value={reason} onChange={(e) => setReason(e.target.value)}>
            <option value="" disabled>
              Choose a reason
            </option>
            {REPORT_REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </MkSelect>
          <MkTextarea label="Details" optional rows={4} maxLength={2000} value={details} onChange={(e) => setDetails(e.target.value)} />
          <MkFormError message={report.isError ? apiErrorMessage(report.error, 'Could not send your report.') : null} />
          <MkButton type="submit" block loading={report.isPending} disabled={!reason}>
            Send report
          </MkButton>
        </form>
      </MkDialog>

      <MkConfirmDialog
        open={blockOpen}
        onOpenChange={(v) => {
          setBlockOpen(v);
          block.reset();
        }}
        title={`Block ${name}?`}
        description="You will not be able to message or book each other. You can unblock them any time in Settings."
        confirmLabel="Block"
        cancelLabel="Cancel"
        destructive
        loading={block.isPending}
        error={block.isError ? apiErrorMessage(block.error, 'Could not block this user.') : null}
        onConfirm={() => block.mutate()}
      />
    </>
  );
}
