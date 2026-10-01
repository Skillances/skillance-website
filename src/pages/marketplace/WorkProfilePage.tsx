import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { post, put } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { useAuth } from '@/context/AuthContext';
import WorkGate from '@/components/marketplace/WorkGate';
import { MkPhotoPicker } from '@/components/marketplace/forms';
import {
  MkButton,
  MkCard,
  MkDialog,
  MkErrorState,
  MkFormError,
  MkInput,
  MkPageHeader,
  MkPill,
  MkSectionTitle,
  MkSelect,
  MkSkeleton,
  MkTextarea,
} from '@/components/marketplace/ui';
import { apiErrorMessage, apiFieldErrors } from '@/lib/marketplace/apiHelpers';
import { categoryLabel, findCategory, useCategories } from '@/lib/marketplace/categories';
import { myFreelancerKey, useMyFreelancerProfile, type MyFreelancerProfile } from '@/lib/marketplace/freelancerSelf';
import { validateHourlyRate, validateName } from '@/lib/marketplace/validation';
import { formatDateTime } from '@/lib/marketplace/time';

type RateDraft = { mode: 'hourly' | 'invoice'; rate: string };

function LimitRequest({ p, freelancerId }: { p: MyFreelancerProfile; freelancerId: string }) {
  const qc = useQueryClient();
  const { user } = useAuth();
  const lim = p.categoryLimits;
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [roots, setRoots] = useState(String((lim?.maxRootCategories ?? 5) + 1));
  const [offers, setOffers] = useState(String((lim?.maxServiceOffers ?? 20) + 5));
  const [error, setError] = useState<string | null>(null);
  const send = useMutation({
    mutationFn: async () =>
      post(ApiPaths.marketplace.freelancerCategoryLimitRequests(freelancerId), {
        reason: reason.trim(),
        requestedMaxRootCategories: Number(roots),
        requestedMaxServiceOffers: Number(offers),
      }),
    onSuccess: () => {
      setOpen(false);
      toast.success('Request sent. Our team will review it.');
      void qc.invalidateQueries({ queryKey: myFreelancerKey(user?.id ?? '') });
    },
    onError: (err) => setError(apiErrorMessage(err, 'Could not send the request.')),
  });
  if (!lim) return null;
  return (
    <div className="mt-4 rounded-xl bg-mk-muted p-3.5 text-[14px]">
      <p>
        Using {lim.currentServiceOffers ?? 0} of {lim.maxServiceOffers ?? 0} services in {lim.currentRootCategories ?? 0} of{' '}
        {lim.maxRootCategories ?? 0} categories.
      </p>
      {lim.pendingRequest ? (
        <p className="mt-1 text-mk-text-secondary">
          Limit increase requested {formatDateTime(lim.pendingRequest.createdAt)}. <MkPill tone="warning">{lim.pendingRequest.status}</MkPill>
        </p>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className="mt-1 inline-flex min-h-11 items-center font-semibold underline underline-offset-2">
          Request a higher limit
        </button>
      )}
      <MkDialog open={open} onOpenChange={setOpen} title="Request a higher limit" description="Tell us why you need more services. An admin reviews every request.">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            if (reason.trim().length < 20) {
              setError('Give a reason of at least 20 characters.');
              return;
            }
            send.mutate();
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <MkInput label="Top-level categories" inputMode="numeric" value={roots} onChange={(e) => setRoots(e.target.value.replace(/\D/g, ''))} hint={`Now ${lim.maxRootCategories}`} />
            <MkInput label="Services" inputMode="numeric" value={offers} onChange={(e) => setOffers(e.target.value.replace(/\D/g, ''))} hint={`Now ${lim.maxServiceOffers}`} />
          </div>
          <MkTextarea label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} hint="At least 20 characters" />
          <MkFormError message={error} />
          <MkButton type="submit" block loading={send.isPending}>
            Send request
          </MkButton>
        </form>
      </MkDialog>
    </div>
  );
}

function ProfileForm({ p, freelancerId }: { p: MyFreelancerProfile; freelancerId: string }) {
  const qc = useQueryClient();
  const { user, refreshUser } = useAuth();
  const categories = useCategories();
  const [firstName, setFirstName] = useState(p.firstName ?? '');
  const [lastName, setLastName] = useState(p.lastName ?? '');
  const [bio, setBio] = useState(p.bio ?? '');
  const [photo, setPhoto] = useState<string | null>(null);
  const [cover, setCover] = useState<string | null>(null);
  const [rates, setRates] = useState<Record<string, RateDraft>>(() => {
    const out: Record<string, RateDraft> = {};
    for (const id of p.categoryIds ?? []) {
      const r = p.categoryRates?.find((x) => x.categoryId === id);
      out[id] = { mode: r?.bookingPricingMode === 'invoice' ? 'invoice' : 'hourly', rate: r ? String(Number(r.hourlyRate) || '') : '' };
    }
    return out;
  });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: async (body: Record<string, unknown>) => put(ApiPaths.marketplace.freelancer(freelancerId), body),
    onSuccess: () => {
      toast.success('Profile saved');
      setPhoto(null);
      setCover(null);
      void qc.invalidateQueries({ queryKey: myFreelancerKey(user?.id ?? '') });
      void qc.invalidateQueries({ queryKey: ['marketplace', 'freelancer', freelancerId] });
      void refreshUser().catch(() => {});
    },
    onError: (err) => {
      const f = apiFieldErrors(err);
      setErrors(f);
      setFormError(Object.keys(f).length ? null : apiErrorMessage(err, 'Could not save your profile.'));
    },
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const next: Record<string, string | undefined> = {
      firstName: validateName(firstName, 'First') ?? undefined,
      lastName: validateName(lastName, 'Last') ?? undefined,
    };
    for (const [id, r] of Object.entries(rates)) {
      if (r.mode === 'hourly') next[`rate:${id}`] = validateHourlyRate(r.rate) ?? undefined;
      else if (!(Number(r.rate) >= 1)) next[`rate:${id}`] = 'Enter a reference rate of at least R1';
    }
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    const body: Record<string, unknown> = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      bio: bio.trim(),
      categoryRates: Object.entries(rates).map(([categoryId, r]) => ({ categoryId, hourlyRate: Number(r.rate), bookingPricingMode: r.mode })),
    };
    if (photo) body.profilePhoto = photo;
    if (cover) body.coverPhoto = cover;
    save.mutate(body);
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <MkCard className="space-y-4">
        <MkSectionTitle>Photos</MkSectionTitle>
        <MkPhotoPicker value={photo ?? p.profilePhotoUrl ?? null} onChange={setPhoto} name={p.fullName} label="Profile photo" error={errors.profilePhoto} />
        <MkPhotoPicker value={cover ?? p.coverPhotoUrl ?? null} onChange={setCover} label="Cover photo" error={errors.coverPhoto} />
      </MkCard>

      <MkCard className="space-y-4">
        <MkSectionTitle>About you</MkSectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <MkInput label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} error={errors.firstName} autoComplete="given-name" />
          <MkInput label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} error={errors.lastName} autoComplete="family-name" />
        </div>
        <MkTextarea
          label="Bio"
          value={bio}
          maxLength={5000}
          onChange={(e) => setBio(e.target.value)}
          error={errors.bio}
          hint="Tell customers about your experience and how you work."
        />
      </MkCard>

      <MkCard>
        <MkSectionTitle>Services and rates</MkSectionTitle>
        {Object.keys(rates).length === 0 ? (
          <p className="text-[14px] text-mk-text-secondary">No services listed yet.</p>
        ) : (
          <ul className="space-y-4">
            {Object.entries(rates).map(([id, r]) => {
              const node = findCategory(categories.data, id);
              const allowsInvoice = (node?.allowedPricingModes ?? ['hourly']).includes('invoice');
              return (
                <li key={id} className="space-y-2 rounded-xl border border-mk-border p-3">
                  <p className="font-mk-display text-[14px] font-semibold">{categoryLabel(categories.data, id)}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <MkSelect
                      label="Pricing"
                      value={r.mode}
                      disabled={!allowsInvoice && r.mode === 'hourly'}
                      onChange={(e) => setRates({ ...rates, [id]: { ...r, mode: e.target.value as RateDraft['mode'] } })}
                    >
                      <option value="hourly">Hourly</option>
                      {(allowsInvoice || r.mode === 'invoice') && <option value="invoice">On invoice</option>}
                    </MkSelect>
                    <MkInput
                      label={r.mode === 'invoice' ? 'Reference rate (R)' : 'Rate (R/hour)'}
                      inputMode="decimal"
                      value={r.rate}
                      onChange={(e) => setRates({ ...rates, [id]: { ...r, rate: e.target.value.replace(/[^0-9.]/g, '') } })}
                      error={errors[`rate:${id}`]}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <p className="mt-3 text-[13px] text-mk-text-tertiary">To add or remove services, use the Skillance mobile app for now.</p>
        <LimitRequest p={p} freelancerId={freelancerId} />
      </MkCard>

      <MkFormError message={formError} />
      <div className="sticky bottom-[calc(68px+env(safe-area-inset-bottom))] z-10 lg:bottom-4">
        <MkButton type="submit" block loading={save.isPending} className="h-12 shadow-mk-card">
          Save profile
        </MkButton>
      </div>
    </form>
  );
}

export default function WorkProfilePage() {
  const profile = useMyFreelancerProfile();
  return (
    <WorkGate title="Profile">
      {(fid) => (
        <>
          <MkPageHeader back="/work" title="Profile and services" subtitle="What customers see on your public profile." />
          {profile.isPending ? (
            <div className="space-y-4">
              <MkSkeleton className="h-40 w-full rounded-2xl" />
              <MkSkeleton className="h-56 w-full rounded-2xl" />
            </div>
          ) : profile.isError || !profile.data ? (
            <MkErrorState message={apiErrorMessage(profile.error, 'Your profile could not be loaded.')} onRetry={() => void profile.refetch()} retrying={profile.isRefetching} />
          ) : (
            <ProfileForm key={profile.dataUpdatedAt} p={profile.data} freelancerId={fid} />
          )}
        </>
      )}
    </WorkGate>
  );
}
