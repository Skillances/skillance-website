export type MarketplaceRole = 'customer' | 'freelancer' | 'admin';

export type PolicyWarning = {
  id: string;
  body: string;
  createdAt: string;
};

export type MarketplaceUser = {
  id: string;
  fullName: string;
  email: string;
  isAdmin: boolean;
  primaryRole?: string;
  preferredView?: 'customer' | 'freelancer';
  customerId?: string | null;
  freelancerId?: string | null;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profilePhotoUrl?: string | null;
  idVerificationStatus?: string;
  /** API `roleInfo.showToggle`: the account may switch between customer and freelancer views. */
  canSwitchView?: boolean;
  /** Unacknowledged platform warnings from `GET /users/me` `policy.activeWarnings`. */
  policyWarnings?: PolicyWarning[];
};

export function isStaff(user: MarketplaceUser | null): boolean {
  if (!user) return false;
  return user.isAdmin === true || String(user.primaryRole).toLowerCase() === 'admin';
}

export function landingPath(user: MarketplaceUser): string {
  if (isStaff(user)) return '/admin/dashboard';
  const view = user.preferredView ?? user.primaryRole;
  if (String(view).toLowerCase() === 'freelancer') return '/work';
  return '/home';
}

/** Active view for nav and guards, with the same fallback as {@link landingPath}. */
export function activeView(user: MarketplaceUser | null): 'customer' | 'freelancer' {
  if (!user) return 'customer';
  const view = user.preferredView ?? user.primaryRole;
  return String(view).toLowerCase() === 'freelancer' ? 'freelancer' : 'customer';
}

type Obj = Record<string, unknown>;

function asObj(v: unknown): Obj | null {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Obj) : null;
}

function str(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}

function idOf(v: unknown): string | null {
  const o = asObj(v);
  return o && typeof o.id === 'string' ? o.id : null;
}

function viewOf(v: unknown): 'customer' | 'freelancer' | undefined {
  return v === 'customer' || v === 'freelancer' ? v : undefined;
}

/**
 * Builds a session user from the `data` envelope of `POST /auth/login`, `POST /auth/register/*`,
 * `POST /auth/google`, or `GET /users/me`.
 *
 * Observed shapes: login and register put ids at `data.customer.id` / `data.freelancer.id`;
 * `/users/me` also sets `data.user.customerId` / `data.user.freelancerId`. Both return
 * `data.currentView` (the API-corrected view) and `data.roleInfo.showToggle`.
 */
export function toMarketplaceUser(data: unknown): MarketplaceUser | null {
  const root = asObj(data);
  const u = asObj(root?.user);
  if (!root || !u || typeof u.id !== 'string') return null;

  const isAdmin = u.isAdmin === true || String(u.primaryRole).toLowerCase() === 'admin';
  const customerId = str(u.customerId) ?? idOf(root.customer);
  const freelancerId = str(u.freelancerId) ?? idOf(root.freelancer);
  const roleInfo = asObj(root.roleInfo);
  const policy = asObj(root.policy);
  const warnings = Array.isArray(policy?.activeWarnings)
    ? (policy.activeWarnings as unknown[])
        .map(asObj)
        .filter((w): w is Obj => w !== null && typeof w.id === 'string')
        .map((w) => ({ id: w.id as string, body: str(w.body) ?? '', createdAt: str(w.createdAt) ?? '' }))
    : undefined;

  return {
    id: u.id,
    fullName: str(u.fullName) ?? '',
    email: str(u.email) ?? '',
    isAdmin,
    primaryRole: str(u.primaryRole),
    preferredView: viewOf(root.currentView) ?? viewOf(u.preferredView),
    customerId,
    freelancerId,
    firstName: str(u.firstName),
    lastName: str(u.lastName),
    phoneNumber: str(u.phoneNumber),
    profilePhotoUrl: str(u.profilePhotoUrl) ?? null,
    idVerificationStatus: str(u.idVerificationStatus),
    canSwitchView: roleInfo?.showToggle === true || Boolean(customerId && freelancerId),
    policyWarnings: warnings,
  };
}
