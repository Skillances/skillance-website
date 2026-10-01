/**
 * Freelancer trust pages: certifications, ID verification, police clearance.
 * Review and approval happen in the admin console; these pages only upload and show status.
 */
import { useRef, useState, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Award, BadgeCheck, Camera, FileUp, ShieldCheck, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { del, get, post, put } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { useAuth } from '@/context/AuthContext';
import WorkGate from '@/components/marketplace/WorkGate';
import {
  MkAnimatedList,
  MkButton,
  MkCard,
  MkConfirmDialog,
  MkEmpty,
  MkErrorState,
  MkFormError,
  MkIconButton,
  MkInput,
  MkPageHeader,
  MkPill,
  MkSkeleton,
  type MkTone,
} from '@/components/marketplace/ui';
import { apiErrorMessage, apiFieldErrors, fileToDataUrl, unwrap } from '@/lib/marketplace/apiHelpers';
import { compressImage } from '@/lib/marketplace/image';
import { myFreelancerKey, useMyFreelancerProfile } from '@/lib/marketplace/freelancerSelf';
import { formatDate } from '@/lib/marketplace/time';
import { cn } from '@/lib/utils';

const STATUS: Record<string, { label: string; tone: MkTone }> = {
  none: { label: 'Not uploaded', tone: 'neutral' },
  unverified: { label: 'Not submitted', tone: 'neutral' },
  pending: { label: 'In review', tone: 'warning' },
  verified: { label: 'Verified', tone: 'success' },
  rejected: { label: 'Not approved', tone: 'error' },
};
const statusOf = (s?: string | null) => STATUS[s ?? 'none'] ?? { label: s ?? 'Unknown', tone: 'neutral' as MkTone };

/** File button that hands back the chosen File. */
function FilePick({
  label,
  accept,
  onFile,
  done,
  capture,
  busy,
}: {
  label: string;
  accept: string;
  onFile: (f: File) => void;
  done?: boolean;
  capture?: 'user' | 'environment';
  busy?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.click()}
        disabled={busy}
        className={cn(
          'flex min-h-14 w-full items-center gap-3 rounded-xl border px-4 text-left transition-colors duration-150',
          done ? 'border-mk-accent' : 'border-dashed border-mk-border hover:bg-mk-muted',
        )}
      >
        {done ? <BadgeCheck className="h-5 w-5 text-mk-accent" aria-hidden="true" /> : <Camera className="h-5 w-5 text-mk-text-secondary" aria-hidden="true" />}
        <span className="flex-1 font-mk-display text-[14px] font-semibold">{label}</span>
        <span className="text-[13px] text-mk-text-tertiary">{busy ? 'Preparing' : done ? 'Change' : 'Choose'}</span>
      </button>
      <input
        ref={ref}
        type="file"
        accept={accept}
        capture={capture}
        className="sr-only"
        tabIndex={-1}
        aria-label={label}
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = '';
          if (f) onFile(f);
        }}
      />
    </>
  );
}

function StatusHeader({ icon, title, status, children }: { icon: ReactNode; title: string; status?: string | null; children?: ReactNode }) {
  const s = statusOf(status);
  return (
    <MkCard className="flex items-start gap-3">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mk-muted">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-mk-display text-[15px] font-semibold">{title}</p>
          <MkPill tone={s.tone}>{s.label}</MkPill>
        </div>
        {children}
      </div>
    </MkCard>
  );
}

/* --------------------------------------------------------- Certifications */

type Proof = { id: string; name: string; status: string; documentUrl?: string | null; originalFileName?: string | null; rejectionReason?: string | null; createdAt?: string };

const MAX_ACTIVE_CERTS = 3;

function Certifications({ freelancerId }: { freelancerId: string }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const key = ['marketplace', 'certifications', user?.id];
  const hub = useQuery({
    queryKey: key,
    queryFn: async () => unwrap<{ certificationProofs?: Proof[] }>(await get(ApiPaths.marketplace.freelancerCertificationsHub(user!.id))),
  });
  const [name, setName] = useState('');
  const [file, setFile] = useState<{ dataUrl: string; kind: 'pdf' | 'docx' | 'image'; fileName: string } | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Proof | null>(null);

  const upload = useMutation({
    mutationFn: async () =>
      post(ApiPaths.marketplace.freelancerCertifications(freelancerId), {
        name: name.trim(),
        file: file!.dataUrl,
        fileKind: file!.kind,
        originalFileName: file!.fileName,
      }),
    onSuccess: () => {
      toast.success('Certification uploaded for review');
      setName('');
      setFile(null);
      void qc.invalidateQueries({ queryKey: key });
      void qc.invalidateQueries({ queryKey: myFreelancerKey(user?.id ?? '') });
    },
    onError: (err) => {
      const f = apiFieldErrors(err);
      setErrors(f);
      setFormError(Object.keys(f).length ? null : apiErrorMessage(err, 'Could not upload the certification.'));
    },
  });
  const remove = useMutation({
    mutationFn: async (p: Proof) => del(ApiPaths.marketplace.freelancerCertification(freelancerId, p.id)),
    onSuccess: () => {
      setDeleting(null);
      void qc.invalidateQueries({ queryKey: key });
    },
  });

  const onFile = async (f: File) => {
    setErrors((e) => ({ ...e, file: undefined }));
    setPreparing(true);
    try {
      const isPdf = f.type === 'application/pdf' || /\.pdf$/i.test(f.name);
      const isDocx = /\.docx$/i.test(f.name) || f.type.includes('wordprocessingml');
      if (f.type.startsWith('image/')) {
        setFile({ dataUrl: await compressImage(f, { maxDim: 2400, maxBytes: 4_000_000 }), kind: 'image', fileName: f.name });
      } else if (isPdf || isDocx) {
        if (f.size > 10 * 1024 * 1024) throw new Error('Documents must be smaller than 10 MB.');
        setFile({ dataUrl: await fileToDataUrl(f), kind: isPdf ? 'pdf' : 'docx', fileName: f.name });
      } else {
        throw new Error('Upload a PDF, Word document, or photo.');
      }
    } catch (err) {
      setErrors((e) => ({ ...e, file: err instanceof Error ? err.message : 'Could not read that file.' }));
    } finally {
      setPreparing(false);
    }
  };

  const proofs = hub.data?.certificationProofs ?? [];
  const active = proofs.filter((p) => p.status === 'pending' || p.status === 'verified').length;

  return (
    <>
      <MkPageHeader back="/work" title="Certifications" subtitle="Upload proof of qualifications. An admin reviews each one before it shows as verified on your profile." />
      <div className="space-y-5">
        {hub.isPending ? (
          <MkSkeleton className="h-32 w-full rounded-2xl" />
        ) : hub.isError ? (
          <MkErrorState message={apiErrorMessage(hub.error)} onRetry={() => void hub.refetch()} retrying={hub.isRefetching} />
        ) : proofs.length === 0 ? (
          <MkEmpty icon={<Award className="h-6 w-6" aria-hidden="true" />} title="No certifications yet" body="Add a certificate, licence, or diploma below." />
        ) : (
          <MkAnimatedList
            items={proofs}
            getKey={(p) => p.id}
            className="space-y-2"
            render={(p) => {
              const s = statusOf(p.status);
              return (
                <div className="flex items-start gap-3 rounded-2xl border border-mk-border p-4">
                  <Award className="mt-0.5 h-5 w-5 shrink-0 text-mk-text-secondary" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-mk-display text-[15px] font-semibold">{p.name}</p>
                      <MkPill tone={s.tone}>{s.label}</MkPill>
                    </div>
                    {p.originalFileName && <p className="truncate text-[13px] text-mk-text-tertiary">{p.originalFileName}</p>}
                    {p.status === 'rejected' && p.rejectionReason && <p className="mt-1 text-[13px] text-mk-error">{p.rejectionReason}</p>}
                  </div>
                  <MkIconButton label={`Remove ${p.name}`} onClick={() => setDeleting(p)}>
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </MkIconButton>
                </div>
              );
            }}
          />
        )}

        <MkCard>
          <p className="mb-3 font-mk-display text-[15px] font-semibold">Add a certification</p>
          {active >= MAX_ACTIVE_CERTS ? (
            <p className="text-[14px] text-mk-text-secondary">You can have up to {MAX_ACTIVE_CERTS} certifications in review or verified. Remove one to add another.</p>
          ) : (
            <form
              noValidate
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                setFormError(null);
                const next: Record<string, string | undefined> = {};
                if (name.trim().length < 2) next.name = 'Enter the certification name';
                if (!file) next.file = 'Choose the document';
                setErrors(next);
                if (!Object.values(next).some(Boolean)) upload.mutate();
              }}
            >
              <MkInput label="Name" placeholder="e.g. Wireman's Licence" maxLength={200} value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
              <FilePick
                label={file ? file.fileName : 'Document (PDF, Word, or photo)'}
                accept="application/pdf,.pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
                onFile={(f) => void onFile(f)}
                done={!!file}
                busy={preparing}
              />
              {errors.file && (
                <p role="alert" className="text-[13px] text-mk-error">
                  {errors.file}
                </p>
              )}
              <MkFormError message={formError} />
              <MkButton type="submit" block loading={upload.isPending} disabled={preparing}>
                <FileUp className="h-4 w-4" aria-hidden="true" /> Upload for review
              </MkButton>
            </form>
          )}
        </MkCard>
      </div>
      <MkConfirmDialog
        open={deleting != null}
        onOpenChange={(v) => {
          if (!v) setDeleting(null);
          remove.reset();
        }}
        title="Remove this certification?"
        description={deleting?.status === 'verified' ? 'It will also be removed from your public profile.' : undefined}
        confirmLabel="Remove"
        destructive
        loading={remove.isPending}
        error={remove.isError ? apiErrorMessage(remove.error) : null}
        onConfirm={() => deleting && remove.mutate(deleting)}
      />
    </>
  );
}

export function WorkCertificationsPage() {
  return <WorkGate title="Certifications">{(fid) => <Certifications freelancerId={fid} />}</WorkGate>;
}

/* --------------------------------------------------------- ID verification */

type IdState = { idNumber?: string | null; idVerificationStatus?: string; idVerificationRejectionReason?: string | null };

function IdVerification({ freelancerId }: { freelancerId: string }) {
  const { user, refreshUser } = useAuth();
  const qc = useQueryClient();
  const key = ['marketplace', 'id-verification', user?.id];
  const q = useQuery({ queryKey: key, queryFn: async () => unwrap<IdState>(await get(ApiPaths.marketplace.freelancerIdVerification(user!.id))) });
  const [idNumber, setIdNumber] = useState('');
  const [photos, setPhotos] = useState<{ front?: string; back?: string; selfie?: string }>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const submit = useMutation({
    mutationFn: async () =>
      put(ApiPaths.marketplace.freelancer(freelancerId), {
        idNumber: idNumber.trim(),
        idFrontPhoto: photos.front,
        idBackPhoto: photos.back,
        selfiePhoto: photos.selfie,
      }),
    onSuccess: () => {
      toast.success('ID documents sent for review');
      setPhotos({});
      void qc.invalidateQueries({ queryKey: key });
      void qc.invalidateQueries({ queryKey: myFreelancerKey(user?.id ?? '') });
      void refreshUser().catch(() => {});
    },
    onError: (err) => {
      const f = apiFieldErrors(err);
      setErrors(f);
      setFormError(Object.keys(f).length ? null : apiErrorMessage(err, 'Could not submit your documents.'));
    },
  });

  const pick = async (slot: 'front' | 'back' | 'selfie', f: File) => {
    setBusy(slot);
    setErrors((e) => ({ ...e, [slot]: undefined }));
    try {
      const url = await compressImage(f, { maxDim: 2560, quality: 0.8, maxBytes: 4_000_000 });
      setPhotos((p) => ({ ...p, [slot]: url }));
    } catch (err) {
      setErrors((e) => ({ ...e, [slot]: err instanceof Error ? err.message : 'Could not use that photo.' }));
    } finally {
      setBusy(null);
    }
  };

  if (q.isPending) return <MkSkeleton className="h-40 w-full rounded-2xl" />;
  if (q.isError) return <MkErrorState message={apiErrorMessage(q.error)} onRetry={() => void q.refetch()} retrying={q.isRefetching} />;
  const status = q.data?.idVerificationStatus ?? 'unverified';
  const canUpload = status !== 'verified' && status !== 'pending';

  return (
    <div className="space-y-5">
      <StatusHeader icon={<BadgeCheck className="h-5 w-5" aria-hidden="true" />} title="ID verification" status={status}>
        <p className="mt-1 text-[14px] text-mk-text-secondary">
          {status === 'verified'
            ? 'Your identity is verified. Customers see the ID verified badge on your profile.'
            : status === 'pending'
              ? 'Thanks. Our team is checking your documents. This usually takes one to two working days.'
              : status === 'rejected'
                ? q.data?.idVerificationRejectionReason || 'Your documents could not be approved. Please upload them again.'
                : 'Verify your identity to appear in search and build trust with customers.'}
        </p>
      </StatusHeader>

      {canUpload && (
        <MkCard>
          <form
            noValidate
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              setFormError(null);
              const next: Record<string, string | undefined> = {};
              if (idNumber.trim().length < 6) next.idNumber = 'Enter your ID or passport number';
              if (!photos.front) next.front = 'Add a photo of the front of your ID';
              if (!photos.back) next.back = 'Add a photo of the back of your ID';
              if (!photos.selfie) next.selfie = 'Add a selfie';
              setErrors(next);
              if (!Object.values(next).some(Boolean)) submit.mutate();
            }}
          >
            <MkInput label="ID or passport number" maxLength={20} value={idNumber} onChange={(e) => setIdNumber(e.target.value.replace(/\s+/g, ''))} error={errors.idNumber} />
            {(['front', 'back', 'selfie'] as const).map((slot) => (
              <div key={slot}>
                <FilePick
                  label={slot === 'front' ? 'Front of ID' : slot === 'back' ? 'Back of ID' : 'Selfie holding your ID'}
                  accept="image/*"
                  capture={slot === 'selfie' ? 'user' : 'environment'}
                  done={!!photos[slot]}
                  busy={busy === slot}
                  onFile={(f) => void pick(slot, f)}
                />
                {errors[slot] && (
                  <p role="alert" className="mt-1 text-[13px] text-mk-error">
                    {errors[slot]}
                  </p>
                )}
              </div>
            ))}
            <p className="text-[13px] text-mk-text-tertiary">Use clear, well-lit photos. Your documents are only seen by the Skillance review team.</p>
            <MkFormError message={formError} />
            <MkButton type="submit" block loading={submit.isPending} disabled={busy != null}>
              Submit for review
            </MkButton>
          </form>
        </MkCard>
      )}
    </div>
  );
}

export function WorkVerificationPage() {
  return (
    <WorkGate title="ID verification">
      {(fid) => (
        <>
          <MkPageHeader back="/work" title="ID verification" />
          <IdVerification freelancerId={fid} />
        </>
      )}
    </WorkGate>
  );
}

/* --------------------------------------------------------- Police clearance */

function PoliceClearance({ freelancerId }: { freelancerId: string }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const profile = useMyFreelancerProfile();
  const key = ['marketplace', 'police', user?.id];
  const q = useQuery({
    queryKey: key,
    queryFn: async () => unwrap<{ policeClearanceStatus?: string }>(await get(ApiPaths.marketplace.freelancerPoliceClearance(user!.id))),
  });
  const [photo, setPhoto] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: key });
    void qc.invalidateQueries({ queryKey: myFreelancerKey(user?.id ?? '') });
  };
  const upload = useMutation({
    mutationFn: async () => post(ApiPaths.marketplace.freelancerPoliceClearanceUpload(freelancerId), { photo }),
    onSuccess: () => {
      toast.success('Police clearance sent for review');
      setPhoto(null);
      refresh();
    },
    onError: (err) => setError(apiErrorMessage(err, 'Could not upload the document.')),
  });
  const remove = useMutation({
    mutationFn: async () => del(ApiPaths.marketplace.freelancerPoliceClearanceUpload(freelancerId)),
    onSuccess: () => {
      setConfirmRemove(false);
      refresh();
    },
  });

  if (q.isPending) return <MkSkeleton className="h-40 w-full rounded-2xl" />;
  if (q.isError) return <MkErrorState message={apiErrorMessage(q.error)} onRetry={() => void q.refetch()} retrying={q.isRefetching} />;
  const status = q.data?.policeClearanceStatus ?? 'none';
  const canUpload = status === 'none' || status === 'rejected';
  const p = profile.data;

  return (
    <div className="space-y-5">
      <StatusHeader icon={<ShieldCheck className="h-5 w-5" aria-hidden="true" />} title="Police clearance" status={status}>
        <p className="mt-1 text-[14px] text-mk-text-secondary">
          Optional. A verified police clearance certificate adds an extra trust badge to your profile. It is never required to register or to take bookings.
        </p>
        {status === 'rejected' && p?.policeClearanceRejectionReason && <p className="mt-1 text-[13px] text-mk-error">{p.policeClearanceRejectionReason}</p>}
        {status === 'verified' && p?.policeClearanceExpiresAt && <p className="mt-1 text-[13px] text-mk-text-tertiary">Valid until {formatDate(p.policeClearanceExpiresAt)}</p>}
      </StatusHeader>

      {canUpload ? (
        <MkCard className="space-y-3">
          <FilePick
            label={photo ? 'Certificate photo ready' : 'Photo of your certificate'}
            accept="image/*"
            capture="environment"
            done={!!photo}
            busy={busy}
            onFile={async (f) => {
              setBusy(true);
              setError(null);
              try {
                // This route has a 2 MB body cap.
                setPhoto(await compressImage(f, { maxDim: 2560, quality: 0.85, maxBytes: 1_400_000 }));
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Could not use that photo.');
              } finally {
                setBusy(false);
              }
            }}
          />
          <MkFormError message={error} />
          <MkButton block disabled={!photo || busy} loading={upload.isPending} onClick={() => upload.mutate()}>
            Upload for review
          </MkButton>
        </MkCard>
      ) : (
        <MkButton variant="danger-outline" block onClick={() => setConfirmRemove(true)}>
          Remove police clearance
        </MkButton>
      )}
      <MkConfirmDialog
        open={confirmRemove}
        onOpenChange={(v) => {
          setConfirmRemove(v);
          remove.reset();
        }}
        title="Remove police clearance?"
        description="The badge will be removed from your profile. You can upload a certificate again later."
        confirmLabel="Remove"
        destructive
        loading={remove.isPending}
        error={remove.isError ? apiErrorMessage(remove.error) : null}
        onConfirm={() => remove.mutate()}
      />
    </div>
  );
}

export function WorkPoliceClearancePage() {
  return (
    <WorkGate title="Police clearance">
      {(fid) => (
        <>
          <MkPageHeader back="/work" title="Police clearance" />
          <PoliceClearance freelancerId={fid} />
        </>
      )}
    </WorkGate>
  );
}
