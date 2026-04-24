import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { get, post, put } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { AlertTriangle, ArrowLeft, Edit, ExternalLink, ImageIcon, Loader2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import PageHeader from '@/components/admin/PageHeader';
import { resolveCategoryLabel } from '@/lib/utils';
import DetailCard, { type DetailField } from '@/components/admin/DetailCard';
import StatusBadge from '@/components/admin/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAdminBackNavigation } from '@/hooks/useAdminBackNavigation';

interface CalendarLink {
  id: string;
  provider: 'google' | 'apple' | string;
  providerAccountId: string;
  status: string;
  syncDirection: string;
  defaultCalendarId: string | null;
  lastSyncedAt: string | null;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ProfileMedia {
  profilePhotoUrl: string | null;
  idFrontPhotoUrl: string | null;
  idBackPhotoUrl: string | null;
  selfiePhotoUrl: string | null;
  idVerificationStatus?: string;
  policeClearanceStatus?: string;
  policeClearanceDocumentUrl: string | null;
}

interface PortfolioProject {
  id: string;
  title: string;
  description?: string | null;
  imageUrls: string[];
  displayOrder?: number;
}

interface PolicyIncident {
  id: string;
  source: string;
  resourceId: string | null;
  matchedWords: string[];
  snippet: string | null;
  contactEmail: string | null;
  detectedTypes: string[];
  createdAt: string;
}

interface WrittenWarning {
  id: string;
  body: string;
  createdAt: string;
  acknowledgedAt: string | null;
  createdBy: { id: string; fullName: string; email: string };
}

interface UserPolicy {
  isBanned: boolean;
  bannedAt: string | null;
  banReason: string | null;
  bannedBalanceSnapshotCents: string | null;
  profanityStrikeCount: number;
  incidents: PolicyIncident[];
  writtenWarnings: WrittenWarning[];
}

interface UserData {
  id: string;
  firebaseUid: string;
  email: string;
  fullName: string;
  tag: string;
  phoneNumber: string | null;
  profilePhotoUrl: string | null;
  primaryRole: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  customerProfileId?: string | null;
  customerBookingsCount?: number;
  calendarSyncEnabled?: boolean;
  calendarLinks?: CalendarLink[];
  profileMedia?: ProfileMedia | null;
  policy?: UserPolicy;
  freelancer: {
    id: string;
    kycStatus?: string;
    isVerified?: boolean;
    rating?: number;
    categoryIds?: string[];
    coverPhotoUrl?: string | null;
    portfolioPhotos?: string[];
    portfolioProjects?: PortfolioProject[];
    categoryRates?: Array<{
      id: string;
      categoryId: string;
      hourlyRate: number | string;
      bookingPricingMode?: string;
      deletedAt?: string | null;
    }>;
  } | null;
}

function getUserRoles(u: UserData): { freelancer: boolean; customer: boolean } {
  return {
    freelancer: u.freelancer !== null,
    customer: u.customerProfileId != null,
  };
}

const GoogleGlyph: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 48 48"
    aria-hidden
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.4 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59A14.5 14.5 0 0 1 9.5 24c0-1.6.27-3.14.74-4.59l-7.98-6.19A23.94 23.94 0 0 0 0 24c0 3.84.92 7.47 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

const AppleGlyph: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill="currentColor"
      d="M16.365 1.43c0 1.14-.43 2.24-1.23 3.05-.87.9-2.08 1.55-3.18 1.45-.12-1.11.43-2.26 1.22-3.05.86-.9 2.12-1.57 3.19-1.45zM21 17.13c-.48 1.12-.71 1.63-1.33 2.62-.87 1.39-2.11 3.12-3.64 3.14-1.36.02-1.71-.88-3.55-.87-1.84.01-2.23.89-3.58.87-1.53-.02-2.7-1.58-3.57-2.97C2.35 16.12 2.07 11.06 3.98 8.26c1.04-1.5 2.66-2.38 4.19-2.38 1.55 0 2.53.85 3.83.85 1.26 0 2.02-.85 3.82-.85 1.37 0 2.83.74 3.88 2.03-3.41 1.87-2.85 6.74.3 9.22z"
    />
  </svg>
);

const ConnectedAccountCard: React.FC<{ link: CalendarLink }> = ({ link }) => {
  const provider = link.provider?.toLowerCase();
  const isGoogle = provider === 'google';
  const isApple = provider === 'apple';
  const displayName = isGoogle ? 'Google' : isApple ? 'Apple' : link.provider;

  const statusStyles =
    link.status === 'active'
      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
      : link.status === 'error'
        ? 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300'
        : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400';

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900">
      <div className="shrink-0 h-9 w-9 rounded-full bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200">
        {isGoogle ? (
          <GoogleGlyph className="h-4 w-4" />
        ) : isApple ? (
          <AppleGlyph className="h-4 w-4" />
        ) : (
          <span className="text-[10px] font-semibold uppercase">{displayName.slice(0, 2)}</span>
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-black dark:text-white">
            {displayName}
          </p>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${statusStyles}`}>
            {link.status}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
            {link.syncDirection === 'two_way' ? 'Two-way sync' : 'Outbound only'}
          </span>
        </div>
        <p className="text-xs text-neutral-500 truncate">{link.providerAccountId}</p>
        <div className="text-[11px] text-neutral-400 flex flex-wrap gap-x-3 gap-y-0.5">
          <span>
            Linked {new Date(link.createdAt).toLocaleDateString('en-ZA', {
              year: 'numeric', month: 'short', day: 'numeric',
            })}
          </span>
          {link.lastSyncedAt && (
            <span>
              Last sync {new Date(link.lastSyncedAt).toLocaleString('en-ZA')}
            </span>
          )}
        </div>
        {link.lastError && (
          <p className="text-[11px] text-red-500 dark:text-red-400 line-clamp-2">
            {link.lastError}
          </p>
        )}
      </div>
    </div>
  );
};

function isLikelyImageUrl(url: string): boolean {
  return /\.(jpe?g|png|gif|webp|bmp|svg|heic|heif)(\?|#|$)/i.test(url) || /\/image\//i.test(url);
}

function collectProfileMediaItems(user: UserData): { key: string; label: string; url: string }[] {
  const items: { key: string; label: string; url: string }[] = [];
  const pm = user.profileMedia;
  if (pm) {
    if (pm.profilePhotoUrl?.trim()) items.push({ key: 'm-pp', label: 'Profile photo', url: pm.profilePhotoUrl.trim() });
    if (pm.idFrontPhotoUrl?.trim()) items.push({ key: 'm-idf', label: 'ID (front)', url: pm.idFrontPhotoUrl.trim() });
    if (pm.idBackPhotoUrl?.trim()) items.push({ key: 'm-idb', label: 'ID (back)', url: pm.idBackPhotoUrl.trim() });
    if (pm.selfiePhotoUrl?.trim()) items.push({ key: 'm-sf', label: 'Selfie (verification)', url: pm.selfiePhotoUrl.trim() });
    if (pm.policeClearanceDocumentUrl?.trim()) {
      items.push({
        key: 'm-pc',
        label: 'Police clearance document',
        url: pm.policeClearanceDocumentUrl.trim(),
      });
    }
  } else if (user.profilePhotoUrl?.trim()) {
    items.push({ key: 'm-pp', label: 'Profile photo', url: user.profilePhotoUrl.trim() });
  }
  const f = user.freelancer;
  if (f) {
    if (f.coverPhotoUrl?.trim()) items.push({ key: 'm-cov', label: 'Cover photo', url: f.coverPhotoUrl.trim() });
    (f.portfolioPhotos || []).forEach((url, i) => {
      if (url?.trim()) items.push({ key: `m-pfol-${i}`, label: `Portfolio image ${i + 1}`, url: url.trim() });
    });
  }
  return items;
}

const MediaTile: React.FC<{ label: string; url: string }> = ({ label, url }) => {
  const [loadError, setLoadError] = useState(false);
  const u = String(url || '').trim();
  if (!u) return null;
  const showAsImage = isLikelyImageUrl(u) && !loadError;
  return (
    <div className="rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/50 overflow-hidden flex flex-col">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 px-2.5 py-1.5 border-b border-neutral-100/80 dark:border-neutral-800 truncate">
        {label}
      </p>
      <div className="p-2 flex-1 min-h-[88px] flex items-center justify-center">
        {showAsImage ? (
          <a href={u} target="_blank" rel="noopener noreferrer" className="block w-full max-h-40">
            <img
              src={u}
              alt=""
              className="w-full max-h-40 object-contain object-center rounded-lg bg-black/5 dark:bg-white/5"
              onError={() => setLoadError(true)}
            />
          </a>
        ) : (
          <a
            href={u}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-violet-600 dark:text-violet-400 font-medium break-all text-center px-1 hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            Open file
          </a>
        )}
      </div>
    </div>
  );
};

const UserTypeValue: React.FC<{ user: UserData }> = ({ user }) => {
  const roles = getUserRoles(user);
  if (!roles.freelancer && !roles.customer) {
    return <span className="text-xs text-neutral-400">No role profiles</span>;
  }
  if (roles.freelancer && roles.customer) {
    return (
      <div className="flex flex-wrap items-center gap-1">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300">
          Freelancer
        </span>
        <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium">
          &amp;
        </span>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
          Customer
        </span>
      </div>
    );
  }
  const status = roles.freelancer ? 'freelancer' : 'customer';
  return <StatusBadge status={status as any} />;
};

const AdminUserDetail: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const goBack = useAdminBackNavigation();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({ primaryRole: '', isAdmin: false });
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});
  const [warnOpen, setWarnOpen] = useState(false);
  const [banOpen, setBanOpen] = useState(false);
  const [policyBusy, setPolicyBusy] = useState(false);
  const [warnText, setWarnText] = useState('');
  const [banReason, setBanReason] = useState('');

  useEffect(() => {
    get(`${ApiPaths.admin.categories}?includeInactive=true&limit=500`)
      .then((res) => {
        if (res.success && Array.isArray(res.data?.categories)) {
          const map: Record<string, string> = {};
          for (const c of res.data.categories) map[c.id] = c.name;
          setCategoryMap(map);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const fetch = async () => {
      if (!userId) return;
      try {
        setIsLoading(true);
        const res = await get(ApiPaths.admin.user(userId));
        if (res.success) {
          setUser(res.data);
          setEditForm({ primaryRole: res.data.primaryRole, isAdmin: res.data.isAdmin });
        }
      } catch { toast.error('Failed to load user'); }
      finally { setIsLoading(false); }
    };
    if (userId) fetch();
  }, [userId]);

  const openAccountSettings = () => {
    if (!user) return;
    setEditForm({ primaryRole: user.primaryRole, isAdmin: user.isAdmin });
    setEditOpen(true);
  };

  const refreshUser = async () => {
    if (!userId) return;
    const refreshed = await get(ApiPaths.admin.user(userId));
    if (refreshed.success) setUser(refreshed.data);
  };

  const submitWarning = async () => {
    if (!userId || warnText.trim().length < 3) return;
    setPolicyBusy(true);
    try {
      const res = await post(`${ApiPaths.admin.user(userId)}/policy-warning`, { body: warnText.trim() });
      if (res.success) {
        toast.success('Warning sent to the user in-app');
        setWarnOpen(false);
        setWarnText('');
        await refreshUser();
      } else {
        toast.error((res as { message?: string }).message || 'Failed to send warning');
      }
    } catch (e: any) { toast.error(e?.message || 'Failed to send warning'); } finally { setPolicyBusy(false); }
  };

  const submitBan = async () => {
    if (!userId || banReason.trim().length < 3) return;
    setPolicyBusy(true);
    try {
      const res = await post(`${ApiPaths.admin.user(userId)}/ban`, { reason: banReason.trim() });
      if (res.success) {
        toast.success('User banned');
        setBanOpen(false);
        setBanReason('');
        await refreshUser();
      } else {
        toast.error((res as { message?: string }).message || 'Failed to ban');
      }
    } catch (e: any) { toast.error(e?.message || 'Failed to ban'); } finally { setPolicyBusy(false); }
  };

  const submitUnban = async () => {
    if (!userId) return;
    setPolicyBusy(true);
    try {
      const res = await post(`${ApiPaths.admin.user(userId)}/unban`, {});
      if (res.success) {
        toast.success('Ban removed');
        await refreshUser();
      } else {
        toast.error((res as { message?: string }).message || 'Failed to unban');
      }
    } catch (e: any) { toast.error(e?.message || 'Failed to unban'); } finally { setPolicyBusy(false); }
  };

  const handleSave = async () => {
    if (!userId) return;
    try {
      setSaving(true);
      const payload: Record<string, unknown> = {};
      if (
        editForm.primaryRole !== user?.primaryRole &&
        (editForm.primaryRole === 'customer' || editForm.primaryRole === 'freelancer')
      ) {
        payload.userType = editForm.primaryRole;
      }
      if (editForm.isAdmin !== user?.isAdmin) payload.isAdmin = editForm.isAdmin;
      if (Object.keys(payload).length === 0) { setEditOpen(false); return; }
      const res = await put(ApiPaths.admin.user(userId), payload);
      if (res.success) {
        const refreshed = await get(ApiPaths.admin.user(userId));
        if (refreshed.success) setUser(refreshed.data);
        setEditOpen(false);
        toast.success('User updated successfully');
      }
    } catch (err: any) { toast.error(err?.message || 'Failed to update user'); }
    finally { setSaving(false); }
  };

  if (isLoading) return (
    <div className="space-y-8">
      <Skeleton className="h-10 w-64 bg-neutral-100 rounded" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-64 bg-neutral-100 rounded-2xl" />
        <Skeleton className="h-64 bg-neutral-100 rounded-2xl" />
      </div>
    </div>
  );

  if (!user) return (
    <div className="text-center py-20">
      <p className="text-neutral-500">User not found</p>
      <Button variant="outline" className="mt-4 rounded-full" onClick={() => goBack('/admin/users')}>Back</Button>
    </div>
  );

  const profileFields: DetailField[] = [
    { label: 'Full Name', value: user.fullName }, { label: 'Tag', value: `@${user.tag}` },
    { label: 'Email', value: user.email }, { label: 'Phone', value: user.phoneNumber || '--' },
    { label: 'Default landing', value: <span className="capitalize">{user.primaryRole}</span> },
    { label: 'Roles', value: <UserTypeValue user={user} /> },
    { label: 'Admin', value: user.isAdmin ? <StatusBadge status="admin" /> : 'No' },
  ];
  const systemFields: DetailField[] = [
    { label: 'User ID', value: <span className="font-mono text-xs">{user.id}</span> },
    { label: 'Firebase UID', value: <span className="font-mono text-xs truncate block max-w-[200px]">{user.firebaseUid}</span> },
    { label: 'Created', value: new Date(user.createdAt).toLocaleString() },
    { label: 'Updated', value: new Date(user.updatedAt).toLocaleString() },
  ];
  const activeCategoryRates = user.freelancer?.categoryRates?.filter((cr) => !cr.deletedAt) ?? [];

  const freelancerFields: DetailField[] = user.freelancer ? [
    { label: 'Freelancer ID', value: <span className="font-mono text-xs">{user.freelancer.id}</span> },
    { label: 'KYC (freelancer)', value: <StatusBadge status={user.freelancer.kycStatus || 'not_submitted'} /> },
    { label: 'Verified', value: user.freelancer.isVerified ? <StatusBadge status="verified" /> : <StatusBadge status="pending" label="Unverified" /> },
    { label: 'Rating', value: user.freelancer.rating ? `${user.freelancer.rating.toFixed(1)} / 5` : 'No ratings' },
  ] : [];

  return (
    <div className="space-y-10">
      <PageHeader title={user.fullName} description={user.email}>
        <Button variant="outline" size="sm" onClick={() => goBack('/admin/users')} className="border-neutral-200 text-neutral-500 hover:text-black hover:border-neutral-300 rounded-full">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button size="sm" onClick={openAccountSettings} className="bg-black text-white hover:bg-neutral-800 rounded-full">
          <Edit className="mr-2 h-4 w-4" /> Account settings
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DetailCard title="Profile Information" fields={profileFields} />
        <DetailCard title="System Information" fields={systemFields} />
        {user.freelancer && <DetailCard title="Freelancer Profile" fields={freelancerFields} className="lg:col-span-2" />}

        {user.freelancer && (
          <Card className="lg:col-span-2 border-neutral-100 dark:border-neutral-700 bg-white dark:bg-neutral-800/80 rounded-2xl shadow-sm dark:shadow-[0_1px_0_0_rgba(255,255,255,0.06)] overflow-hidden">
            <CardHeader className="border-b border-neutral-100 dark:border-neutral-700/80 py-5 px-6">
              <CardTitle className="text-lg font-semibold text-black dark:text-white tracking-tight flex items-center gap-3">
                <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-neutral-100 dark:bg-neutral-700">
                  <Tag className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
                </span>
                Services offered
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {activeCategoryRates.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {activeCategoryRates.map((cr) => (
                    <div
                      key={cr.id}
                      className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-neutral-100 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-black dark:text-white truncate">
                          {resolveCategoryLabel(cr.categoryId, categoryMap)}
                        </p>
                        {cr.bookingPricingMode && cr.bookingPricingMode !== 'hourly' && (
                          <p className="text-[11px] text-neutral-400 mt-0.5 capitalize">{cr.bookingPricingMode} pricing</p>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-neutral-600 dark:text-neutral-300 tabular-nums shrink-0">
                        R{Number(cr.hourlyRate).toFixed(0)}/hr
                      </span>
                    </div>
                  ))}
                </div>
              ) : user.freelancer.categoryIds && user.freelancer.categoryIds.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.freelancer.categoryIds.map((id) => (
                    <span
                      key={id}
                      className="px-3 py-1.5 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-700 text-black dark:text-white"
                    >
                      {resolveCategoryLabel(id, categoryMap)}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neutral-400 dark:text-neutral-500 text-center py-4">No services or categories registered</p>
              )}
            </CardContent>
          </Card>
        )}

        {(() => {
          const mediaItems = collectProfileMediaItems(user);
          const projects = user.freelancer?.portfolioProjects ?? [];
          if (mediaItems.length === 0 && projects.length === 0) return null;
          return (
            <Card className="lg:col-span-2 border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-800/80 rounded-2xl shadow-sm overflow-hidden">
              <CardHeader className="border-b border-neutral-100 dark:border-neutral-700/80 py-5 px-6">
                <CardTitle className="text-lg font-semibold text-black dark:text-white tracking-tight flex items-center gap-3">
                  <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-violet-100 dark:bg-violet-950/50">
                    <ImageIcon className="h-5 w-5 text-violet-700 dark:text-violet-300" />
                  </span>
                  Profile media
                </CardTitle>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-normal pt-1">
                  Images and documents currently stored for this user (KYC, portfolio, cover). Open in a new tab to review full size.
                </p>
                {user.profileMedia && (
                  <p className="text-[10px] text-neutral-400 mt-1">
                    ID verification:{' '}
                    <span className="font-medium text-neutral-600 dark:text-neutral-300">
                      {user.profileMedia.idVerificationStatus || '—'}
                    </span>
                    {user.profileMedia.policeClearanceStatus != null && (
                      <>
                        {' '}
                        · Police clearance:{' '}
                        <span className="font-medium text-neutral-600 dark:text-neutral-300">
                          {user.profileMedia.policeClearanceStatus}
                        </span>
                      </>
                    )}
                  </p>
                )}
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                {mediaItems.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">All uploads</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {mediaItems.map((m) => (
                        <MediaTile key={m.key} label={m.label} url={m.url} />
                      ))}
                    </div>
                  </div>
                )}
                {projects.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Portfolio projects</h4>
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        className="rounded-2xl border border-neutral-100 dark:border-neutral-700/80 p-4 bg-neutral-50/50 dark:bg-neutral-900/40"
                      >
                        <p className="text-sm font-medium text-black dark:text-white mb-1">{project.title}</p>
                        {project.description && (
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3 line-clamp-3">{project.description}</p>
                        )}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {(project.imageUrls || []).map((u, i) => (
                            u?.trim() ? <MediaTile key={`${project.id}-img-${i}`} label={`${project.title} · ${i + 1}`} url={u.trim()} /> : null
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })()}

        {user.policy && (
          <Card className="lg:col-span-2 border-amber-200/80 dark:border-amber-900/50 bg-gradient-to-br from-amber-50/90 via-white to-white dark:from-amber-950/20 dark:via-neutral-900 dark:to-neutral-900 rounded-2xl shadow-sm overflow-hidden">
            <CardHeader className="border-b border-amber-100/80 dark:border-amber-900/30 py-5 px-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200">
                    <AlertTriangle className="h-5 w-5" />
                  </span>
                  <div>
                    <CardTitle className="text-lg font-semibold text-black dark:text-white tracking-tight">
                      Trust &amp; safety
                    </CardTitle>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 font-normal pt-1 max-w-2xl">
                      Moderation trail (exact matched tokens where detected), official warnings shown in the app, and account suspension.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  {user.isAdmin ? null : (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-full border-amber-200 text-amber-900 dark:text-amber-100 dark:border-amber-800"
                        onClick={() => { setWarnText(''); setWarnOpen(true); }}
                        disabled={user.policy.isBanned}
                      >
                        Issue written warning
                      </Button>
                      {user.policy.isBanned ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          className="rounded-full"
                          onClick={() => { void submitUnban(); }}
                          disabled={policyBusy}
                        >
                          Unban
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          className="rounded-full bg-red-600 hover:bg-red-700 text-white"
                          onClick={() => { setBanReason(''); setBanOpen(true); }}
                        >
                          Ban user
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-wrap gap-3 text-sm">
                {user.policy.isBanned ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-200">
                    Banned
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
                    Active
                  </span>
                )}
                <span className="text-neutral-500 dark:text-neutral-400">
                  Strikes (profanity):{' '}
                  <span className="font-semibold text-black dark:text-white tabular-nums">
                    {user.policy.profanityStrikeCount}
                  </span>
                </span>
                {user.policy.isBanned && user.policy.bannedAt && (
                  <span className="text-xs text-neutral-500">
                    Banned {new Date(user.policy.bannedAt).toLocaleString('en-ZA')}
                  </span>
                )}
              </div>
              {user.policy.isBanned && user.policy.banReason && (
                <div className="rounded-xl border border-red-200/60 bg-red-50/50 dark:bg-red-950/20 dark:border-red-900/40 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-red-800 dark:text-red-200 mb-1">Ban reason on file</p>
                  <p className="text-sm text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap">{user.policy.banReason}</p>
                  {user.policy.bannedBalanceSnapshotCents && Number(user.policy.bannedBalanceSnapshotCents) > 0 && (
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2">
                      Balance snapshot at ban (ZAR, estimate): R
                      {(Number(user.policy.bannedBalanceSnapshotCents) / 100).toFixed(2)}
                    </p>
                  )}
                </div>
              )}

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">Moderation log</h4>
                {user.policy.incidents.length === 0 ? (
                  <p className="text-sm text-neutral-400">No recorded incidents for this user.</p>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-neutral-100 dark:border-neutral-800">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-[10px] uppercase tracking-widest text-neutral-500">
                        <tr>
                          <th className="px-3 py-2">When</th>
                          <th className="px-3 py-2">Source</th>
                          <th className="px-3 py-2">Matched</th>
                          <th className="px-3 py-2">Types</th>
                          <th className="px-3 py-2 min-w-[180px]">Snippet</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                        {user.policy.incidents.map((row) => (
                          <tr key={row.id} className="align-top">
                            <td className="px-3 py-2 whitespace-nowrap text-xs text-neutral-500">
                              {new Date(row.createdAt).toLocaleString('en-ZA')}
                            </td>
                            <td className="px-3 py-2 text-xs font-mono text-neutral-600 dark:text-neutral-300">{row.source}</td>
                            <td className="px-3 py-2">
                              <div className="flex flex-wrap gap-1 max-w-[220px]">
                                {row.matchedWords.length === 0 ? (
                                  <span className="text-xs text-neutral-400">--</span>
                                ) : (
                                  row.matchedWords.map((w) => (
                                    <span
                                      key={`${row.id}-${w}`}
                                      className="px-1.5 py-0.5 rounded-md bg-amber-100/80 dark:bg-amber-950/50 text-amber-950 dark:text-amber-100 text-xs font-medium"
                                    >
                                      {w}
                                    </span>
                                  ))
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-xs text-neutral-500">{(row.detectedTypes || []).join(', ')}</td>
                            <td className="px-3 py-2 text-xs text-neutral-500 line-clamp-2">{row.snippet || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">Written warnings (in-app)</h4>
                {user.policy.writtenWarnings.length === 0 ? (
                  <p className="text-sm text-neutral-400">No official warnings on file.</p>
                ) : (
                  <ul className="space-y-3">
                    {user.policy.writtenWarnings.map((w) => (
                      <li
                        key={w.id}
                        className="rounded-xl border border-violet-100 dark:border-violet-900/40 bg-violet-50/40 dark:bg-violet-950/10 p-4"
                      >
                        <p className="text-xs text-neutral-400">
                          {new Date(w.createdAt).toLocaleString('en-ZA')}
                          {w.acknowledgedAt ? (
                            <span className="ml-2 text-emerald-600 dark:text-emerald-400">· Acknowledged</span>
                          ) : (
                            <span className="ml-2 text-amber-600 dark:text-amber-300">· Not yet acknowledged in app</span>
                          )}
                        </p>
                        <p className="text-sm text-black dark:text-white mt-2 whitespace-pre-wrap">{w.body}</p>
                        <p className="text-[11px] text-neutral-500 mt-2">By {w.createdBy?.fullName || 'Admin'}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-black dark:text-white tracking-tight">
              Connected accounts
            </h3>
            <span className="text-[10px] uppercase tracking-widest text-neutral-400">
              Google &amp; Apple
            </span>
          </div>
          {user.calendarLinks && user.calendarLinks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {user.calendarLinks.map((link) => (
                <ConnectedAccountCard key={link.id} link={link} />
              ))}
            </div>
          ) : (
            <p className="text-xs text-neutral-400">
              No Google or Apple accounts are linked to this user.
            </p>
          )}
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-white border-neutral-200 text-black sm:max-w-md rounded-2xl shadow-soft-lg">
          <DialogHeader>
            <DialogTitle className="text-black font-serif text-xl">Account settings</DialogTitle>
            <DialogDescription className="text-xs text-neutral-500 pt-1">
              Name, email, and phone can only be changed by the user (POPIA). Admins may adjust role flags only.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div>
              <label className="text-xs text-neutral-400 uppercase tracking-widest font-medium mb-2 block">Default landing role</label>
              {editForm.isAdmin ? (
                <p className="text-sm text-neutral-600 rounded-xl border border-neutral-100 bg-neutral-50 dark:bg-neutral-800/50 dark:border-neutral-800 dark:text-neutral-300 px-3 py-2 leading-relaxed">
                  Staff accounts use the Admin primary role and are excluded from marketplace user statistics. Turn off Admin access to choose Customer or Freelancer.
                </p>
              ) : (
                <Select
                  value={editForm.primaryRole === 'admin' ? 'customer' : editForm.primaryRole}
                  onValueChange={(v) => setEditForm((f) => ({ ...f, primaryRole: v }))}
                >
                  <SelectTrigger className="bg-white border-neutral-200 text-black w-full rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-white border-neutral-200 rounded-xl shadow-soft">
                    <SelectItem value="customer" className="text-neutral-600 focus:bg-neutral-50 focus:text-black rounded-lg">Customer</SelectItem>
                    <SelectItem value="freelancer" className="text-neutral-600 focus:bg-neutral-50 focus:text-black rounded-lg">Freelancer</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs text-neutral-400 uppercase tracking-widest font-medium">Admin Access</label>
              <button
                type="button"
                onClick={() =>
                  setEditForm((f) => {
                    const nextAdmin = !f.isAdmin;
                    return {
                      ...f,
                      isAdmin: nextAdmin,
                      primaryRole: nextAdmin
                        ? 'admin'
                        : f.primaryRole === 'admin'
                          ? 'customer'
                          : f.primaryRole,
                    };
                  })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${editForm.isAdmin ? 'bg-black' : 'bg-neutral-200'}`}
                aria-label={editForm.isAdmin ? 'Admin (on)' : 'Admin (off)'}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full transition-transform duration-200 ${editForm.isAdmin ? 'translate-x-6 bg-white' : 'translate-x-1 bg-neutral-400'}`} />
              </button>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-2 pt-2">
            <Button variant="outline" onClick={() => setEditOpen(false)} className="border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-black rounded-full">Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-black text-white hover:bg-neutral-800 rounded-full">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={warnOpen} onOpenChange={setWarnOpen}>
        <DialogContent className="bg-white border-neutral-200 text-black sm:max-w-lg rounded-2xl shadow-soft-lg">
          <DialogHeader>
            <DialogTitle className="text-black font-serif text-xl">Written warning</DialogTitle>
            <DialogDescription className="text-xs text-neutral-500 pt-1">
              Shown on the user&apos;s dashboard (customer or freelancer) until they tap &quot;I&apos;ve read this&quot;. Use clear, professional language.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={warnText}
            onChange={(e) => setWarnText(e.target.value)}
            placeholder="e.g. Your recent messages contained language that breaches our community standards…"
            className="min-h-[140px] rounded-xl border-neutral-200"
          />
          <DialogFooter className="gap-2 sm:gap-2 pt-2">
            <Button variant="outline" onClick={() => setWarnOpen(false)} className="border-neutral-200 rounded-full" type="button">
              Cancel
            </Button>
            <Button
              onClick={() => { void submitWarning(); }}
              disabled={policyBusy || warnText.trim().length < 3}
              className="bg-black text-white rounded-full"
              type="button"
            >
              {policyBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send to app
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={banOpen} onOpenChange={setBanOpen}>
        <DialogContent className="bg-white border-neutral-200 text-black sm:max-w-lg rounded-2xl shadow-soft-lg">
          <DialogHeader>
            <DialogTitle className="text-black font-serif text-xl">Ban this user</DialogTitle>
            <DialogDescription className="text-xs text-neutral-500 pt-1">
              They will be signed out and blocked from the API. We record an estimated balance for communications only.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
            placeholder="Reason shown to the user and kept on file…"
            className="min-h-[120px] rounded-xl border-neutral-200"
          />
          <DialogFooter className="gap-2 sm:gap-2 pt-2">
            <Button variant="outline" onClick={() => setBanOpen(false)} className="border-neutral-200 rounded-full" type="button">
              Cancel
            </Button>
            <Button
              onClick={() => { void submitBan(); }}
              disabled={policyBusy || banReason.trim().length < 3}
              className="bg-red-600 hover:bg-red-700 text-white rounded-full"
              type="button"
            >
              {policyBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm ban
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUserDetail;
