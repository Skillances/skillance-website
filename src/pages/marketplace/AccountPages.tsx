/** Account area: menu, edit profile, settings (export, delete), become a freelancer, bug report. */
import { useMemo, useState, type ComponentType, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  Bug,
  CalendarArrowDown,
  CalendarCheck,
  ChevronRight,
  FileText,
  Heart,
  LayoutDashboard,
  LogOut,
  Repeat,
  Settings,
  UserPen,
  UserPlus,
} from 'lucide-react';
import { toast } from 'sonner';
import { get, post, put } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { useAuth } from '@/context/AuthContext';
import ApplicationStatusCard, { type ApplicationStatus } from '@/components/marketplace/ApplicationStatusCard';
import PlaceAddressField, { type PlacePick } from '@/components/marketplace/PlaceAddressField';
import { MkCategoryRatePicker, MkPhotoPicker } from '@/components/marketplace/forms';
import {
  MkAvatar,
  MkButton,
  MkCard,
  MkConfirmDialog,
  MkErrorState,
  MkFormError,
  MkInput,
  MkPageHeader,
  MkPill,
  MkSectionTitle,
  MkSelect,
  MkSkeleton,
  MkSwitch,
  MkTextarea,
} from '@/components/marketplace/ui';
import { apiErrorMessage, apiFieldErrors, downloadBlob, unwrap } from '@/lib/marketplace/apiHelpers';
import { flattenLeaves, useCategories } from '@/lib/marketplace/categories';
import { activeView } from '@/lib/marketplace/session';
import { ageFromDob, validateHourlyRate, validateName, validatePhone } from '@/lib/marketplace/validation';
import { formatDateTime } from '@/lib/marketplace/time';

/* ------------------------------------------------------------------- Menu */

type MenuItem = { to?: string; onClick?: () => void; label: string; icon: ComponentType<{ className?: string }>; hint?: string; loading?: boolean };

function Menu({ items }: { items: MenuItem[] }) {
  return (
    <ul className="divide-y divide-mk-divider overflow-hidden rounded-2xl border border-mk-border">
      {items.map((i) => {
        const inner = (
          <>
            <i.icon className="h-5 w-5 shrink-0 text-mk-text-secondary" />
            <span className="min-w-0 flex-1">
              <span className="block font-mk-display text-[15px] font-semibold">{i.label}</span>
              {i.hint && <span className="block text-[13px] text-mk-text-secondary">{i.hint}</span>}
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-mk-text-tertiary" aria-hidden="true" />
          </>
        );
        const cls = 'flex min-h-14 w-full items-center gap-3.5 px-4 py-3 text-left transition-colors duration-150 hover:bg-mk-muted disabled:opacity-60';
        return (
          <li key={i.label}>
            {i.to ? (
              <Link to={i.to} className={cls}>
                {inner}
              </Link>
            ) : (
              <button type="button" onClick={i.onClick} disabled={i.loading} className={cls}>
                {inner}
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function PolicyWarnings() {
  const { user, refreshUser } = useAuth();
  const ack = useMutation({
    mutationFn: async (id: string) => post(ApiPaths.marketplace.acknowledgePolicyWarning(id), {}),
    onSuccess: () => void refreshUser().catch(() => {}),
    onError: (err) => toast.error(apiErrorMessage(err)),
  });
  const warnings = user?.policyWarnings ?? [];
  if (warnings.length === 0) return null;
  return (
    <section aria-label="Account notices" className="space-y-3">
      {warnings.map((w) => (
        <MkCard key={w.id} className="border-mk-warning">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-mk-warning" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="font-mk-display text-[15px] font-semibold">Notice from Skillance</p>
              <p className="mt-1 whitespace-pre-line text-[14px] text-mk-text-secondary">{w.body}</p>
              {w.createdAt && <p className="mt-1 text-[12px] text-mk-text-tertiary">{formatDateTime(w.createdAt)}</p>}
              <MkButton variant="secondary" size="sm" className="mt-3" loading={ack.isPending && ack.variables === w.id} onClick={() => ack.mutate(w.id)}>
                I understand
              </MkButton>
            </div>
          </div>
        </MkCard>
      ))}
    </section>
  );
}

/** JSON from GET /calendar-sync/export, turned into an .ics file in the browser. */
type CalendarExport = { bookings?: { syncKey?: string; bookingId?: string; title?: string; startUtc: string; endUtc: string; status?: string }[] };

function icsDate(isoValue: string) {
  return new Date(isoValue).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}
function icsEscape(s: string) {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}
function toIcs(data: CalendarExport): string {
  const now = icsDate(new Date().toISOString());
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Skillance//Bookings//EN', 'CALSCALE:GREGORIAN', 'X-WR-CALNAME:Skillance bookings'];
  for (const b of data.bookings ?? []) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${icsEscape(b.syncKey ?? b.bookingId ?? b.startUtc)}@skillance.co.za`,
      `DTSTAMP:${now}`,
      `DTSTART:${icsDate(b.startUtc)}`,
      `DTEND:${icsDate(b.endUtc)}`,
      `SUMMARY:${icsEscape(b.title ?? 'Skillance booking')}`,
      ...(b.bookingId ? [`URL:https://skillance.co.za/bookings/${b.bookingId}`] : []),
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

function CustomerRoleApply() {
  const qc = useQueryClient();
  const apps = useQuery({
    queryKey: ['marketplace', 'role-applications'],
    queryFn: async () => (unwrap<{ targetRole?: string; status?: string; createdAt?: string }[]>(await get(ApiPaths.marketplace.roleApplications)) ?? []),
  });
  const apply = useMutation({
    mutationFn: async () => post(ApiPaths.marketplace.roleApplications, { targetRole: 'customer' }),
    onSuccess: () => {
      toast.success('Request sent. You can book once it is approved.');
      void qc.invalidateQueries({ queryKey: ['marketplace', 'role-applications'] });
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  });
  const pending = (Array.isArray(apps.data) ? apps.data : []).find((a) => a.targetRole === 'customer' && String(a.status).startsWith('pending'));
  return (
    <MkCard>
      <p className="font-mk-display text-[15px] font-semibold">Book services as a customer</p>
      <p className="mt-1 text-[14px] text-mk-text-secondary">Your account does not have a customer profile yet. Request one to book other freelancers.</p>
      {pending ? (
        <div className="mt-3">
          <MkPill tone="warning">Request in review</MkPill>
        </div>
      ) : (
        <MkButton variant="secondary" className="mt-3" loading={apply.isPending} onClick={() => apply.mutate()}>
          Request a customer profile
        </MkButton>
      )}
    </MkCard>
  );
}

export function AccountPage() {
  const { user, logout } = useAuth();
  const isFreelancerView = activeView(user) === 'freelancer';
  const [exporting, setExporting] = useState(false);

  const downloadCalendar = async () => {
    setExporting(true);
    try {
      const data = unwrap<CalendarExport>(await get(ApiPaths.marketplace.calendarSyncExport));
      downloadBlob(new Blob([toIcs(data)], { type: 'text/calendar;charset=utf-8' }), 'skillance-bookings.ics');
      toast.success(`${data.bookings?.length ?? 0} bookings exported`);
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not download your calendar.'));
    } finally {
      setExporting(false);
    }
  };

  const items: MenuItem[] = [
    { to: '/account/edit', label: 'Edit profile', icon: UserPen, hint: 'Name, phone number, and photo' },
    { to: '/account/settings', label: 'Settings', icon: Settings, hint: 'Notifications, your data, and account deletion' },
    { to: '/bookings', label: 'Bookings', icon: CalendarCheck },
    { to: '/recurring', label: 'Recurring bookings', icon: Repeat },
    ...(isFreelancerView
      ? [{ to: '/work', label: 'Freelancer dashboard', icon: LayoutDashboard }]
      : [
          { to: '/favorites', label: 'Favorites', icon: Heart },
          { to: '/documents', label: 'Documents', icon: FileText },
        ]),
    ...(user?.freelancerId
      ? [{ onClick: () => void downloadCalendar(), label: 'Download bookings calendar', icon: CalendarArrowDown, hint: 'An .ics file for your calendar app', loading: exporting }]
      : [{ to: '/account/apply-freelancer', label: 'Become a freelancer', icon: UserPlus, hint: 'Offer your skills on Skillance' }]),
    { to: '/account/bug-report', label: 'Report a bug', icon: Bug },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <MkAvatar src={user?.profilePhotoUrl} name={user?.fullName} size={64} />
        <div className="min-w-0">
          <h1 className="truncate text-[22px] font-bold">{user?.fullName || 'Your account'}</h1>
          <p className="truncate text-[14px] text-mk-text-secondary">{user?.email}</p>
        </div>
      </div>
      <PolicyWarnings />
      {!user?.customerId && <CustomerRoleApply />}
      <Menu items={items} />
      <MkButton variant="secondary" block onClick={() => void logout()}>
        <LogOut className="h-4 w-4" aria-hidden="true" /> Sign out
      </MkButton>
    </div>
  );
}

/* ----------------------------------------------------------------- Edit */

export function EditAccountPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState(user?.firstName ?? user?.fullName?.split(' ')[0] ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? user?.fullName?.split(' ').slice(1).join(' ') ?? '');
  const [phone, setPhone] = useState(user?.phoneNumber ?? '');
  const [photo, setPhoto] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: async () =>
      put(ApiPaths.marketplace.user(user!.id), {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phone.replace(/\s+/g, ''),
        ...(photo ? { profilePhoto: photo } : {}),
      }),
    onSuccess: async () => {
      await refreshUser().catch(() => null);
      toast.success('Profile updated');
      navigate('/account');
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
    const next = {
      firstName: validateName(firstName, 'First') ?? undefined,
      lastName: validateName(lastName, 'Last') ?? undefined,
      phoneNumber: validatePhone(phone) ?? undefined,
    };
    setErrors(next);
    if (!Object.values(next).some(Boolean)) save.mutate();
  };

  return (
    <>
      <MkPageHeader back="/account" title="Edit profile" />
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <MkPhotoPicker value={photo ?? user?.profilePhotoUrl ?? null} onChange={setPhoto} name={user?.fullName} error={errors.profilePhoto} />
        <div className="grid gap-4 sm:grid-cols-2">
          <MkInput label="First name" autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} error={errors.firstName} />
          <MkInput label="Last name" autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} error={errors.lastName} />
        </div>
        <MkInput label="Phone number" type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} error={errors.phoneNumber} />
        <MkInput label="Email address" value={user?.email ?? ''} disabled hint="Contact support to change your email address." />
        <MkFormError message={formError} />
        <MkButton type="submit" block loading={save.isPending} className="h-12">
          Save changes
        </MkButton>
      </form>
    </>
  );
}

/* ------------------------------------------------------------- Settings */

type UserSettings = { emailNotificationsEnabled?: boolean; pushNotificationsEnabled?: boolean };

export function SettingsPage() {
  const { user, logout } = useAuth();
  const qc = useQueryClient();
  const key = ['marketplace', 'settings', user?.id];
  const settings = useQuery({ queryKey: key, enabled: !!user, queryFn: async () => unwrap<UserSettings>(await get(ApiPaths.marketplace.userSettings(user!.id))) });
  const update = useMutation({
    mutationFn: async (v: boolean) => put(ApiPaths.marketplace.userSettings(user!.id), { emailNotificationsEnabled: v }),
    onMutate: (v) => {
      const prev = qc.getQueryData<UserSettings>(key);
      qc.setQueryData<UserSettings>(key, { ...prev, emailNotificationsEnabled: v });
      return { prev };
    },
    onError: (err, _v, ctx) => {
      qc.setQueryData(key, ctx?.prev);
      toast.error(apiErrorMessage(err, 'Could not update the setting.'));
    },
  });
  const [exporting, setExporting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const remove = useMutation({
    mutationFn: async () => post(ApiPaths.marketplace.deleteAccount, {}),
    onSuccess: () => void logout(),
  });

  const exportData = async () => {
    setExporting(true);
    try {
      const data = unwrap<unknown>(await get(ApiPaths.marketplace.exportAccount));
      downloadBlob(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), 'skillance-account.json');
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not export your data.'));
    } finally {
      setExporting(false);
    }
  };

  const emailMatches = typed.trim().toLowerCase() === (user?.email ?? '').toLowerCase() && typed.trim() !== '';

  return (
    <div className="space-y-6">
      <MkPageHeader back="/account" title="Settings" />
      <MkCard className="space-y-3">
        <MkSectionTitle>Notifications</MkSectionTitle>
        {settings.isPending ? (
          <MkSkeleton className="h-12 w-full" />
        ) : settings.isError ? (
          <MkErrorState message={apiErrorMessage(settings.error)} onRetry={() => void settings.refetch()} retrying={settings.isRefetching} />
        ) : (
          <>
            <MkSwitch
              checked={settings.data?.emailNotificationsEnabled === true}
              onCheckedChange={(v) => update.mutate(v)}
              label="Email notifications"
              description="Booking updates and messages by email."
            />
            <MkSwitch checked={false} disabled label="Push notifications" description="Push notifications are available in the mobile app." />
          </>
        )}
      </MkCard>

      <MkCard>
        <MkSectionTitle>Legal and help</MkSectionTitle>
        <ul className="divide-y divide-mk-divider">
          {[
            ['/privacy-policy', 'Privacy policy'],
            ['/terms', 'Terms of service'],
            ['/refund-policy', 'Refund policy'],
            ['/help-center', 'Help centre'],
          ].map(([to, label]) => (
            <li key={to}>
              <Link to={to} className="flex min-h-12 items-center justify-between text-[15px]">
                {label}
                <ChevronRight className="h-4 w-4 text-mk-text-tertiary" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </MkCard>

      <MkCard className="space-y-3">
        <MkSectionTitle>Your data</MkSectionTitle>
        <p className="text-[14px] text-mk-text-secondary">Download a copy of the personal information Skillance holds about you.</p>
        <MkButton variant="secondary" loading={exporting} onClick={() => void exportData()}>
          Download my data
        </MkButton>
      </MkCard>

      <MkCard className="space-y-3">
        <MkSectionTitle>Delete account</MkSectionTitle>
        <p className="text-[14px] text-mk-text-secondary">Your account will be deleted and you will be signed out. This cannot be undone.</p>
        <MkButton variant="danger-outline" onClick={() => setDeleteOpen(true)}>
          Delete my account
        </MkButton>
      </MkCard>

      <MkConfirmDialog
        open={deleteOpen}
        onOpenChange={(v) => {
          setDeleteOpen(v);
          setTyped('');
          remove.reset();
        }}
        title="Delete your account?"
        description="Type your email address to confirm."
        confirmLabel="Delete account"
        destructive
        loading={remove.isPending}
        error={remove.isError ? apiErrorMessage(remove.error, 'Could not delete your account.') : null}
        confirmDisabled={!emailMatches}
        onConfirm={() => remove.mutate()}
      >
        <MkInput label="Email address" type="email" autoComplete="off" value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={user?.email} />
      </MkConfirmDialog>
    </div>
  );
}

/* ---------------------------------------------------- Become a freelancer */

const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export function ApplyFreelancerPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const categories = useCategories();
  const leaves = useMemo(() => flattenLeaves(categories.data ?? []), [categories.data]);
  const status = useQuery({
    queryKey: ['marketplace', 'application-status'],
    queryFn: async () => unwrap<ApplicationStatus>(await get(ApiPaths.marketplace.freelancerApplicationStatus)),
  });
  const [selected, setSelected] = useState<string[]>([]);
  const [rates, setRates] = useState<Record<string, string>>({});
  const [rateErrors, setRateErrors] = useState<Record<string, string | undefined>>({});
  const [place, setPlace] = useState<PlacePick | null>(null);
  const [radius, setRadius] = useState('10');
  const [bio, setBio] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const submit = useMutation({
    mutationFn: async () => {
      const age = dob ? ageFromDob(dob) : null;
      return post(ApiPaths.marketplace.applyFreelancer, {
        categoryIds: selected,
        categoryRates: selected.map((p) => ({ categoryId: p, hourlyRate: Number(rates[p]) })),
        serviceLocations: [
          {
            address: place!.address,
            ...(place!.city ? { city: place!.city } : {}),
            latitude: place!.latitude,
            longitude: place!.longitude,
            serviceRadius: Number(radius),
            isPrimary: true,
            label: 'Primary',
          },
        ],
        ...(bio.trim() ? { bio: bio.trim() } : {}),
        ...(gender ? { gender } : {}),
        ...(age != null ? { age } : {}),
      });
    },
    onSuccess: () => {
      toast.success('Application sent. We will let you know once it is reviewed.');
      void qc.invalidateQueries({ queryKey: ['marketplace', 'application-status'] });
    },
    onError: (err) => {
      const f = apiFieldErrors(err);
      const mapped: Record<string, string | undefined> = {};
      for (const [k, v] of Object.entries(f)) mapped[k.split('.')[0]] = mapped[k.split('.')[0]] ?? v;
      setErrors(mapped);
      setFormError(Object.keys(mapped).length ? null : apiErrorMessage(err, 'Could not send your application.'));
    },
  });

  if (user?.freelancerId) {
    return (
      <>
        <MkPageHeader back="/account" title="Freelancer account" />
        <MkCard>
          <p className="text-[15px]">You already have a freelancer profile.</p>
          <Link to="/work" className="mt-2 inline-flex min-h-11 items-center font-semibold underline underline-offset-2">
            Go to your dashboard
          </Link>
        </MkCard>
      </>
    );
  }
  if (status.isPending) return <MkSkeleton className="h-40 w-full rounded-2xl" />;
  const s = status.data;
  if (s?.hasApplication && s.status !== 'rejected') {
    return (
      <>
        <MkPageHeader back="/account" title="Become a freelancer" />
        <ApplicationStatusCard />
      </>
    );
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const next: Record<string, string | undefined> = {};
    const nextRates: Record<string, string | undefined> = {};
    if (selected.length === 0) next.categoryIds = 'Choose at least one service';
    for (const p of selected) {
      const m = validateHourlyRate(rates[p] ?? '');
      if (m) nextRates[p] = m;
    }
    if (!place || place.latitude == null || place.longitude == null) next.serviceLocations = 'Choose your service address from the suggestions';
    const r = Number(radius);
    if (!(r >= 1 && r <= 2000)) next.radius = 'Radius must be between 1 and 2000 km';
    if (dob) {
      const age = ageFromDob(dob);
      if (age == null || age < 18 || age > 100) next.age = 'You must be between 18 and 100';
    }
    setErrors(next);
    setRateErrors(nextRates);
    if (!Object.values(next).some(Boolean) && Object.keys(nextRates).length === 0) submit.mutate();
  };

  return (
    <>
      <MkPageHeader back="/account" title="Become a freelancer" subtitle="Tell us what you offer. Our team reviews every application." />
      {s?.status === 'rejected' && (
        <div className="mb-5">
          <ApplicationStatusCard />
        </div>
      )}
      <form onSubmit={onSubmit} noValidate className="space-y-8">
        <section className="space-y-4">
          <h2 className="text-[16px]">Services you offer</h2>
          <MkCategoryRatePicker
            leaves={leaves}
            loading={categories.isPending}
            selected={selected}
            onSelectedChange={setSelected}
            rates={rates}
            onRatesChange={(v) => {
              setRates(v);
              setRateErrors({});
            }}
            rateErrors={rateErrors}
            error={errors.categoryIds ?? errors.categoryRates}
          />
        </section>
        <section className="space-y-4">
          <h2 className="text-[16px]">Where you work</h2>
          <PlaceAddressField label="Service address" value={place} onChange={setPlace} error={errors.serviceLocations} />
          <MkInput label="Travel radius (km)" inputMode="numeric" value={radius} onChange={(e) => setRadius(e.target.value.replace(/\D/g, ''))} error={errors.radius} />
        </section>
        <section className="space-y-4">
          <h2 className="text-[16px]">About you</h2>
          <MkTextarea label="Bio" optional maxLength={5000} value={bio} onChange={(e) => setBio(e.target.value)} error={errors.bio} />
          <div className="grid gap-4 sm:grid-cols-2">
            <MkInput label="Date of birth" optional type="date" value={dob} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setDob(e.target.value)} error={errors.age} />
            <MkSelect label="Gender" optional value={gender} onChange={(e) => setGender(e.target.value)} error={errors.gender}>
              <option value="">Prefer not to choose</option>
              {GENDERS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </MkSelect>
          </div>
          <p className="text-[13px] text-mk-text-tertiary">After approval, verify your ID from your freelancer dashboard to appear in search.</p>
        </section>
        <MkFormError message={formError} />
        <MkButton type="submit" block loading={submit.isPending} className="h-12">
          Send application
        </MkButton>
      </form>
    </>
  );
}

/* ------------------------------------------------------------ Bug report */

export function BugReportPage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.fullName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const send = useMutation({
    // Same fields as the app's bug_report_screen.dart; the client sends the session token, so the API can link the report.
    mutationFn: async () =>
      post(ApiPaths.public.bugReport, {
        name: name.trim(),
        email: email.trim(),
        subject: 'Bug report (website)',
        message: message.trim(),
        platform: 'web',
      }),
    onSuccess: () => setSent(true),
    onError: (err) => setFormError(apiErrorMessage(err, 'Could not send your report.')),
  });

  return (
    <>
      <MkPageHeader back="/account" title="Report a bug" subtitle="Tell us what went wrong and what you expected to happen." />
      {sent ? (
        <div role="status" className="rounded-2xl border border-mk-border bg-mk-surface p-4">
          <p className="font-mk-display text-[16px] font-semibold">Thanks for the report</p>
          <p className="mt-1 text-[14px] text-mk-text-secondary">Our team will look into it. We may email you if we need more detail.</p>
          <MkButton
            variant="secondary"
            className="mt-4"
            onClick={() => {
              setMessage('');
              setSent(false);
            }}
          >
            Report something else
          </MkButton>
        </div>
      ) : (
        <form
          noValidate
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setFormError(null);
            const next: Record<string, string | undefined> = {};
            if (!name.trim()) next.name = 'Enter your name';
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = 'Enter a valid email address';
            if (message.trim().length < 12) next.message = 'Describe the problem in at least 12 characters';
            setErrors(next);
            if (!Object.values(next).some(Boolean)) send.mutate();
          }}
        >
          <MkInput label="Name" value={name} maxLength={200} onChange={(e) => setName(e.target.value)} error={errors.name} />
          <MkInput label="Email" type="email" value={email} maxLength={320} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
          <MkTextarea
            label="What happened?"
            value={message}
            maxLength={5000}
            onChange={(e) => setMessage(e.target.value)}
            error={errors.message}
            hint="Include the page you were on and the steps that led to the problem."
            className="min-h-[160px]"
          />
          <MkFormError message={formError} />
          <MkButton type="submit" block loading={send.isPending}>
            Send report
          </MkButton>
        </form>
      )}
    </>
  );
}
