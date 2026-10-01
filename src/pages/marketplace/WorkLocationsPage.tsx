import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { del, get, post, put } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import WorkGate from '@/components/marketplace/WorkGate';
import PlaceAddressField, { type PlacePick } from '@/components/marketplace/PlaceAddressField';
import {
  MkAnimatedList,
  MkButton,
  MkConfirmDialog,
  MkDialog,
  MkEmpty,
  MkErrorState,
  MkFormError,
  MkIconButton,
  MkInput,
  MkListSkeleton,
  MkPageHeader,
  MkPill,
  MkSelect,
  MkSwap,
  MkSwitch,
} from '@/components/marketplace/ui';
import { apiErrorMessage, apiFieldErrors, listFrom } from '@/lib/marketplace/apiHelpers';

type Mode = 'in_person_only' | 'online_only' | 'both';
type Location = {
  id: string;
  label: string;
  address: string;
  city?: string | null;
  latitude: number;
  longitude: number;
  serviceRadius: number;
  serviceDeliveryMode?: Mode;
  isPrimary?: boolean;
  isActive?: boolean;
};

const MODES: { value: Mode; label: string }[] = [
  { value: 'in_person_only', label: 'In person' },
  { value: 'online_only', label: 'Online only' },
  { value: 'both', label: 'In person and online' },
];

/** App preset for nationwide coverage (add_service_location_screen.dart). */
const WHOLE_SA = { address: 'South Africa (entire country)', city: 'South Africa', latitude: -28.5596, longitude: 23.9375, radius: 1990 };

function LocationForm({
  freelancerId,
  existing,
  onDone,
}: {
  freelancerId: string;
  existing: Location | null;
  onDone: () => void;
}) {
  const [label, setLabel] = useState(existing?.label ?? '');
  const [place, setPlace] = useState<PlacePick | null>(
    existing ? { address: existing.address, city: existing.city ?? undefined, latitude: existing.latitude, longitude: existing.longitude } : null,
  );
  const [wholeSa, setWholeSa] = useState(existing?.address === WHOLE_SA.address);
  const [radius, setRadius] = useState(String(existing?.serviceRadius ?? 10));
  const [mode, setMode] = useState<Mode>(existing?.serviceDeliveryMode ?? 'in_person_only');
  const [primary, setPrimary] = useState(existing?.isPrimary ?? false);
  const [active, setActive] = useState(existing?.isActive ?? true);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: async (body: Record<string, unknown>) =>
      existing
        ? put(ApiPaths.marketplace.freelancerServiceLocation(freelancerId, existing.id), body)
        : post(ApiPaths.marketplace.freelancerServiceLocations(freelancerId), body),
    onSuccess: () => {
      toast.success(existing ? 'Location updated' : 'Location added');
      onDone();
    },
    onError: (err) => {
      const f = apiFieldErrors(err);
      setErrors(f);
      setFormError(Object.keys(f).length ? null : apiErrorMessage(err, 'Could not save the location.'));
    },
  });

  const submit = () => {
    setFormError(null);
    const r = mode === 'online_only' ? 1 : wholeSa ? WHOLE_SA.radius : Number(radius);
    const next: Record<string, string | undefined> = {};
    if (!label.trim()) next.label = 'Give this location a name, like Home or Office';
    if (!wholeSa && mode !== 'online_only' && (!place || place.latitude == null || place.longitude == null))
      next.address = 'Choose an address from the suggestions so we can place it on the map';
    if (!wholeSa && mode === 'online_only' && !place) next.address = 'Choose an address';
    if (!(r >= 1 && r <= 2000)) next.serviceRadius = 'Radius must be between 1 and 2000 km';
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    const loc = wholeSa
      ? { address: WHOLE_SA.address, city: WHOLE_SA.city, latitude: WHOLE_SA.latitude, longitude: WHOLE_SA.longitude }
      : { address: place!.address, city: place!.city, latitude: place!.latitude, longitude: place!.longitude };
    save.mutate({
      label: label.trim(),
      ...loc,
      serviceRadius: r,
      serviceDeliveryMode: mode,
      isPrimary: primary,
      ...(existing ? { isActive: active } : {}),
    });
  };

  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <MkInput label="Name" placeholder="Home, Office, Northern suburbs" value={label} onChange={(e) => setLabel(e.target.value)} error={errors.label} />
      <MkSelect label="How you work here" value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
        {MODES.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </MkSelect>
      <MkSwitch checked={wholeSa} onCheckedChange={setWholeSa} label="All of South Africa" description="Customers anywhere in the country can find you." />
      {!wholeSa && (
        <PlaceAddressField label="Address" value={place} onChange={setPlace} error={errors.address ?? errors.latitude} />
      )}
      {!wholeSa && mode !== 'online_only' && (
        <MkInput
          label="Travel radius (km)"
          inputMode="numeric"
          value={radius}
          onChange={(e) => setRadius(e.target.value.replace(/\D/g, ''))}
          error={errors.serviceRadius}
        />
      )}
      <MkSwitch checked={primary} onCheckedChange={setPrimary} label="Primary location" />
      {existing && <MkSwitch checked={active} onCheckedChange={setActive} label="Active" description="Inactive locations are hidden from search." />}
      <MkFormError message={formError} />
      <MkButton type="submit" block loading={save.isPending}>
        {existing ? 'Save changes' : 'Add location'}
      </MkButton>
    </form>
  );
}

function Locations({ freelancerId }: { freelancerId: string }) {
  const qc = useQueryClient();
  const key = ['marketplace', 'locations', freelancerId];
  const q = useQuery({
    queryKey: key,
    queryFn: async () => listFrom<Location>(await get(ApiPaths.marketplace.freelancerServiceLocations(freelancerId)), 'locations'),
  });
  const [editing, setEditing] = useState<Location | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Location | null>(null);
  const remove = useMutation({
    mutationFn: async (l: Location) => del(ApiPaths.marketplace.freelancerServiceLocation(freelancerId, l.id)),
    onSuccess: () => {
      setDeleting(null);
      toast.success('Location removed');
      void qc.invalidateQueries({ queryKey: key });
    },
  });
  const done = () => {
    setEditing(null);
    void qc.invalidateQueries({ queryKey: key });
  };

  const items = q.data ?? [];
  const state = q.isPending ? 'loading' : q.isError ? 'error' : items.length === 0 ? 'empty' : 'list';

  return (
    <>
      <MkPageHeader
        back="/work"
        title="Service locations"
        subtitle="Where customers can book you."
        action={
          items.length > 0 ? (
            <MkButton size="sm" onClick={() => setEditing('new')}>
              <Plus className="h-4 w-4" aria-hidden="true" /> Add
            </MkButton>
          ) : undefined
        }
      />
      <MkSwap id={state}>
        {state === 'loading' && <MkListSkeleton rows={3} />}
        {state === 'error' && <MkErrorState message={apiErrorMessage(q.error)} onRetry={() => void q.refetch()} retrying={q.isRefetching} />}
        {state === 'empty' && (
          <MkEmpty
            icon={<MapPin className="h-6 w-6" aria-hidden="true" />}
            title="No locations yet"
            body="Add where you work so customers nearby can find you."
            action={<MkButton onClick={() => setEditing('new')}>Add a location</MkButton>}
          />
        )}
        {state === 'list' && (
          <MkAnimatedList
            items={items}
            getKey={(l) => l.id}
            className="space-y-3"
            render={(l) => (
              <div className="flex items-start gap-3 rounded-2xl border border-mk-border p-4">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-mk-text-secondary" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-mk-display text-[15px] font-semibold">{l.label}</p>
                    {l.isPrimary && <MkPill tone="success">Primary</MkPill>}
                    {l.isActive === false && <MkPill>Inactive</MkPill>}
                  </div>
                  <p className="text-[14px] text-mk-text-secondary">{l.address}</p>
                  <p className="text-[13px] text-mk-text-tertiary">Within {l.serviceRadius} km</p>
                </div>
                <MkIconButton label={`Edit ${l.label}`} onClick={() => setEditing(l)}>
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </MkIconButton>
                <MkIconButton label={`Remove ${l.label}`} onClick={() => setDeleting(l)}>
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </MkIconButton>
              </div>
            )}
          />
        )}
      </MkSwap>

      <MkDialog open={editing != null} onOpenChange={(v) => !v && setEditing(null)} title={editing === 'new' ? 'Add a location' : 'Edit location'}>
        {editing != null && <LocationForm freelancerId={freelancerId} existing={editing === 'new' ? null : editing} onDone={done} />}
      </MkDialog>
      <MkConfirmDialog
        open={deleting != null}
        onOpenChange={(v) => {
          if (!v) setDeleting(null);
          remove.reset();
        }}
        title="Remove this location?"
        description={deleting ? `${deleting.label} will no longer appear to customers.` : undefined}
        confirmLabel="Remove"
        destructive
        loading={remove.isPending}
        error={remove.isError ? apiErrorMessage(remove.error) : null}
        onConfirm={() => deleting && remove.mutate(deleting)}
      />
    </>
  );
}

export default function WorkLocationsPage() {
  return <WorkGate title="Service locations">{(fid) => <Locations freelancerId={fid} />}</WorkGate>;
}
