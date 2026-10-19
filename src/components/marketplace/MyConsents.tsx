import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { get, post } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { CONSENT_API_ENABLED } from '@/lib/featureFlags';
import { idBiometricConsentBody } from '@/lib/idBiometricConsent';
import { isFeaturePaused } from '@/lib/featurePaused';
import { apiErrorMessage, listFrom } from '@/lib/marketplace/apiHelpers';
import { MkButton, MkCard, MkConfirmDialog, MkErrorState, MkSectionTitle, MkSkeleton } from '@/components/marketplace/ui';

type ConsentRow = {
  consent_type?: string;
  consentType?: string;
  action?: string;
  status?: string;
};

function rowType(row: ConsentRow) {
  return row.consent_type ?? row.consentType ?? '';
}

function rowState(row: ConsentRow) {
  return (row.action ?? row.status ?? '').toLowerCase();
}

function isMissingRoute(err: unknown) {
  if (!err || typeof err !== 'object') return false;
  const body = err as { statusCode?: unknown; status?: unknown; message?: unknown };
  const status = body.statusCode ?? body.status;
  return status === 404;
}

export default function MyConsents() {
  if (!CONSENT_API_ENABLED) return null;
  return <MyConsentsPanel />;
}

function MyConsentsPanel() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const key = ['marketplace', 'consents'];
  const consents = useQuery({
    queryKey: key,
    queryFn: async () => {
      try {
        return listFrom<ConsentRow>(await get(ApiPaths.users.consents), 'consents');
      } catch (err) {
        if (isMissingRoute(err)) return [] as ConsentRow[];
        throw err;
      }
    },
  });
  const withdraw = useMutation({
    mutationFn: async () => post(ApiPaths.users.consents, await idBiometricConsentBody('withdrawn')),
    onSuccess: () => {
      setOpen(false);
      toast.success('ID check consent withdrawn');
      void qc.invalidateQueries({ queryKey: key });
    },
  });

  const rows = consents.data ?? [];
  const biometric = rows.find((row) => rowType(row) === 'id_biometric');
  const state = biometric ? rowState(biometric) : null;

  return (
    <MkCard className="space-y-3">
      <MkSectionTitle>My consents</MkSectionTitle>
      <p className="text-[14px] text-mk-text-secondary">
        ID and selfie check. A Skillance staff member compares your face with your ID photo.
      </p>
      {consents.isPending ? (
        <MkSkeleton className="h-10 w-full" />
      ) : consents.isError ? (
        <MkErrorState message={apiErrorMessage(consents.error)} onRetry={() => void consents.refetch()} retrying={consents.isRefetching} />
      ) : (
        <p className="text-[13px] text-mk-text-tertiary">
          {state === 'granted' ? 'Status: granted.' : state === 'withdrawn' ? 'Status: withdrawn.' : 'Status: not recorded on this account yet.'}
        </p>
      )}
      <MkButton variant="danger-outline" onClick={() => setOpen(true)}>
        Withdraw
      </MkButton>
      <MkConfirmDialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          withdraw.reset();
        }}
        title="Withdraw ID check consent?"
        description="We will delete ID images we still have and remove your verified status. You will not be able to take bookings."
        confirmLabel="Withdraw"
        destructive
        loading={withdraw.isPending}
        error={
          withdraw.isError
            ? isFeaturePaused(withdraw.error)
              ? 'That action is paused for now.'
              : apiErrorMessage(withdraw.error, 'Could not withdraw this consent.')
            : null
        }
        onConfirm={() => withdraw.mutate()}
      />
    </MkCard>
  );
}
