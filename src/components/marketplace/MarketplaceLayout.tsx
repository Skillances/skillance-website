import { Suspense, useState, type ComponentType } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Briefcase,
  CalendarCheck,
  FileText,
  Heart,
  Home,
  LayoutDashboard,
  LogIn,
  LogOut,
  MessageCircle,
  Repeat,
  Search,
  User,
  Wallet,
} from 'lucide-react';
import { toast } from 'sonner';
import { put } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { useAuth } from '@/context/AuthContext';
import { activeView, landingPath } from '@/lib/marketplace/session';
import { apiErrorMessage } from '@/lib/marketplace/apiHelpers';
import { mkMotion } from '@/lib/marketplace/theme';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/lib/utils';
import MarketplaceThemeScope from '@/components/marketplace/MarketplaceThemeScope';
import { MkSkeleton } from '@/components/marketplace/ui';

type NavItem = { to: string; label: string; icon: ComponentType<{ className?: string }>; end?: boolean };

const CUSTOMER_NAV: NavItem[] = [
  { to: '/home', label: 'Home', icon: Home },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/bookings', label: 'Bookings', icon: CalendarCheck },
  { to: '/chats', label: 'Chat', icon: MessageCircle },
  { to: '/favorites', label: 'Favorites', icon: Heart },
  { to: '/documents', label: 'Documents', icon: FileText },
  { to: '/recurring', label: 'Recurring', icon: Repeat },
  { to: '/account', label: 'Account', icon: User },
];

const FREELANCER_NAV: NavItem[] = [
  { to: '/work', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/work/jobs', label: 'Jobs', icon: Briefcase },
  { to: '/work/earnings', label: 'Earnings', icon: Wallet },
  { to: '/chats', label: 'Chat', icon: MessageCircle },
  { to: '/bookings', label: 'Bookings', icon: CalendarCheck },
  { to: '/recurring', label: 'Recurring', icon: Repeat },
  { to: '/account', label: 'Account', icon: User },
];

const GUEST_NAV: NavItem[] = [
  { to: '/home', label: 'Home', icon: Home },
  { to: '/search', label: 'Search', icon: Search },
];

/** The five items that fit the phone tab bar; the rest stay reachable from Account. */
const CUSTOMER_TABS = ['/home', '/search', '/bookings', '/chats', '/account'];
const FREELANCER_TABS = ['/work', '/work/jobs', '/work/earnings', '/chats', '/account'];

function ViewSwitch({ compact }: { compact?: boolean }) {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  if (!user?.canSwitchView) return null;
  const current = activeView(user);
  const target = current === 'freelancer' ? 'customer' : 'freelancer';

  const onSwitch = async () => {
    setPending(true);
    try {
      await put(ApiPaths.marketplace.preferredView, { view: target });
      const fresh = await refreshUser();
      navigate(fresh ? landingPath(fresh) : target === 'freelancer' ? '/work' : '/home', { replace: true });
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Could not switch view.'));
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onSwitch}
      disabled={pending}
      aria-busy={pending || undefined}
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-mk-border bg-mk-surface font-mk-display text-[13px] font-semibold text-mk-text-primary',
        'transition-[background-color,transform,opacity] duration-150 ease-out hover:bg-mk-muted active:scale-[0.97] motion-reduce:active:scale-100 disabled:opacity-60',
        compact ? 'px-3' : 'w-full px-4',
      )}
    >
      <Repeat className="h-4 w-4" aria-hidden="true" />
      {target === 'freelancer' ? 'Switch to freelancer' : 'Switch to customer'}
    </button>
  );
}

function OutletFallback() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading">
      <MkSkeleton className="h-8 w-48" />
      <MkSkeleton className="h-24 w-full rounded-2xl" />
      <MkSkeleton className="h-24 w-full rounded-2xl" />
    </div>
  );
}

/**
 * Logged-in marketplace chrome: sidebar from `lg`, top bar plus bottom tab bar on phones.
 * Scrolling is native (Lenis is not started for these routes in App.tsx).
 */
export default function MarketplaceLayout() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const location = useLocation();
  const reduced = usePrefersReducedMotion();

  const signedIn = isAuthenticated && !!user;
  const view = activeView(user);
  const nav = !signedIn ? GUEST_NAV : view === 'freelancer' ? FREELANCER_NAV : CUSTOMER_NAV;
  const tabPaths = view === 'freelancer' ? FREELANCER_TABS : CUSTOMER_TABS;
  const tabs = signedIn ? nav.filter((n) => tabPaths.includes(n.to)) : GUEST_NAV;

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex min-h-11 items-center gap-3 rounded-xl px-3 font-mk-display text-[14px] font-semibold transition-colors duration-150',
      isActive ? 'bg-mk-muted text-mk-text-primary' : 'text-mk-text-secondary hover:bg-mk-muted hover:text-mk-text-primary',
    );

  return (
    <MarketplaceThemeScope className="bg-mk-background">
      <a
        href="#mk-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[90] focus:rounded-lg focus:bg-mk-primary focus:px-4 focus:py-2 focus:text-mk-on-primary"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside className="mk-no-print fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col border-r border-mk-border bg-mk-surface px-4 py-5 lg:flex">
        <Link to={signedIn ? landingPath(user) : '/home'} className="mb-6 inline-flex min-h-11 items-center px-3 font-mk-display text-[20px] font-bold tracking-tight">
          Skillance
        </Link>
        <nav aria-label="Main" className="flex-1 space-y-1 overflow-y-auto">
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={navLinkClass}>
              <item.icon className="h-5 w-5" aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="space-y-2 border-t border-mk-divider pt-4">
          {signedIn ? (
            <>
              <ViewSwitch />
              <div className="flex items-center gap-3 px-1 py-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mk-display text-[14px] font-semibold">{user.fullName || 'Your account'}</p>
                  <p className="truncate text-[12px] text-mk-text-tertiary">{user.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => void logout()}
                className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 font-mk-display text-[14px] font-semibold text-mk-text-secondary transition-colors duration-150 hover:bg-mk-muted hover:text-mk-text-primary"
              >
                <LogOut className="h-5 w-5" aria-hidden="true" />
                Sign out
              </button>
            </>
          ) : (
            !isLoading && (
              <Link
                to="/login"
                state={{ from: location }}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-mk-primary px-4 font-mk-display text-[14px] font-semibold text-mk-on-primary transition-colors duration-150 hover:bg-mk-secondary"
              >
                <LogIn className="h-4 w-4" aria-hidden="true" />
                Sign in
              </Link>
            )
          )}
        </div>
      </aside>

      {/* Phone top bar */}
      <header className="mk-no-print sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-mk-divider bg-mk-surface px-4 lg:hidden">
        <Link to={signedIn ? landingPath(user) : '/home'} className="inline-flex min-h-11 items-center font-mk-display text-[18px] font-bold tracking-tight">
          Skillance
        </Link>
        {signedIn ? (
          <ViewSwitch compact />
        ) : (
          !isLoading && (
            <Link
              to="/login"
              state={{ from: location }}
              className="inline-flex min-h-11 items-center rounded-xl bg-mk-primary px-4 font-mk-display text-[13px] font-semibold text-mk-on-primary"
            >
              Sign in
            </Link>
          )
        )}
      </header>

      <main id="mk-main" className="lg:pl-[248px] print:pl-0">
        <div className="mx-auto w-full max-w-[960px] px-4 pb-[calc(88px+env(safe-area-inset-bottom))] pt-5 sm:px-6 lg:pb-12 lg:pt-8">
          <motion.div
            key={location.pathname}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: mkMotion.pageTravel }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ duration: mkMotion.page, ease: mkMotion.ease }}
          >
            <Suspense fallback={<OutletFallback />}>
              <Outlet />
            </Suspense>
          </motion.div>
        </div>
      </main>

      {/* Phone tab bar */}
      <nav
        aria-label="Main"
        className="mk-no-print fixed inset-x-0 bottom-0 z-30 border-t border-mk-divider bg-mk-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <ul className="mx-auto flex max-w-md">
          {tabs.map((item) => (
            <li key={item.to} className="flex-1">
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-[60px] flex-col items-center justify-center gap-1 font-mk-display text-[11px] font-semibold transition-colors duration-150',
                    isActive ? 'text-mk-text-primary' : 'text-mk-text-tertiary',
                  )
                }
              >
                <item.icon className="h-[22px] w-[22px]" aria-hidden="true" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </MarketplaceThemeScope>
  );
}
