import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { get, post } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { CONSENT_API_ENABLED } from '@/lib/featureFlags';
import { idBiometricConsentBody } from '@/lib/idBiometricConsent';
import { policeClearanceConsentBody } from '@/lib/policeClearanceConsent';
import { useAuth } from '@/context/AuthContext';
import { myFreelancerKey } from '@/lib/marketplace/freelancerSelf';
import { isFeaturePaused } from '@/lib/featurePaused';
import { apiErrorMessage, listFrom } from '@/lib/marketplace/apiHelpers';
import { MkButton, MkCard, MkConfirmDialog, MkErrorState, MkSectionTitle, MkSkeleton } from '@/components/marketplace/ui';

type ConsentRow = {
  consent_type?: string;
  consentType?: string;
  action?: string;
  status?: string;
  createdAt?: string;
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

type ConsentKind = 'id_biometric' | 'police_clearance';

const CONSENT_ITEMS: {
  type: ConsentKind;
  label: string;
  blurb: string;
  dialogTitle: string;
  dialogBody: string;
  toast: string;
  body: typeof idBiometricConsentBody | typeof policeClearanceConsentBody;
}[] = [
  {
    type: 'id_biometric',
    label: 'ID and selfie check',
    blurb: 'A Skillance staff member compares your face with your ID photo.',
    dialogTitle: 'Withdraw ID check consent?',
    dialogBody: 'We will delete your ID images and ID number now and remove your verified status. You will not be able to take bookings.',
    toast: 'ID check consent withdrawn',
    body: idBiometricConsentBody,
  },
  {
    type: 'police_clearance',
    label: 'Police clearance',
    blurb: 'Criminal behaviour information. Used only for your "police cleared" badge.',
    dialogTitle: 'Withdraw police clearance consent?',
    dialogBody: 'We will delete your police clearance document now and remove your badge. You can upload a certificate again later.',
    toast: 'Police clearance consent withdrawn',
    body: policeClearanceConsentBody,
  },
];

function MyConsentsPanel() {
  const qc = useQueryClient();
  const { user, refreshUser } = useAuth();
  const [openType, setOpenType] = useState<ConsentKind | null>(null);
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
  const active = CONSENT_ITEMS.find((i) => i.type === openType);
  const withdraw = useMutation({
    mutationFn: async (item: (typeof CONSENT_ITEMS)[number]) => post(ApiPaths.users.consents, await item.body('withdrawn')),
    onSuccess: (_d, item) => {
      setOpenType(null);
      toast.success(item.toast);
      void qc.invalidateQueries({ queryKey: key });
      void qc.invalidateQueries({ queryKey: myFreelancerKey(user?.id ?? '') });
      void qc.invalidateQueries({ queryKey: ['marketplace', 'id-verification'] });
      void qc.invalidateQueries({ queryKey: ['marketplace', 'police'] });
      void refreshUser();
    },
  });

  const rows = consents.data ?? [];
  // The API returns an event log; the newest event per type is the current state.
  const stateOf = (type: ConsentKind) => {
    const latest = rows
      .filter((row) => rowType(row) === type)
      .sort((a, b) => Date.parse(b.createdAt ?? '') - Date.parse(a.createdAt ?? '') || 0)[0];
    return latest ? rowState(latest) : null;
  };

  return (
    <MkCard className="space-y-4">
      <MkSectionTitle>My consents</MkSectionTitle>
      {consents.isPending ? (
        <MkSkeleton className="h-10 w-full" />
      ) : consents.isError ? (
        <MkErrorState message={apiErrorMessage(consents.error)} onRetry={() => void consents.refetch()} retrying={consents.isRefetching} />
      ) : (
        CONSENT_ITEMS.map((item) => {
          const state = stateOf(item.type);
          return (
            <div key={item.type} className="space-y-1">
              <p className="text-[14px] font-medium text-mk-text-primary">{item.label}</p>
              <p className="text-[14px] text-mk-text-secondary">{item.blurb}</p>
              <p className="text-[13px] text-mk-text-tertiary">
                {state === 'granted' ? 'Status: granted.' : state === 'withdrawn' ? 'Status: withdrawn.' : 'Status: not recorded on this account yet.'}
              </p>
              {state === 'granted' && (
                <MkButton variant="danger-outline" onClick={() => setOpenType(item.type)}>
                  Withdraw
                </MkButton>
              )}
            </div>
          );
        })
      )}
      <MkConfirmDialog
        open={!!active}
        onOpenChange={(v) => {
          if (!v) setOpenType(null);
          withdraw.reset();
        }}
        title={active?.dialogTitle ?? ''}
        description={active?.dialogBody}
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
        onConfirm={() => active && withdraw.mutate(active)}
      />
    </MkCard>
  );
}
