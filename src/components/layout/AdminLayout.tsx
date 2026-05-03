import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Activity,
  Users,
  Briefcase,
  CalendarDays,
  BadgeCheck,
  LogOut,
  Menu,
  X,
  TrendingUp,
  CircleDollarSign,
  UserRound,
  UserPlus,
  ShieldAlert,
  Tag,
  Settings2,
  Sun,
  Moon,
  Mail,
  BellRing,
  Star,
  ListChecks,
  Layers,
  Award,
  ScrollText,
  MessageCircle,
  Cookie,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { useAdminTheme } from '@/context/AdminThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import AdminAiChat from '@/components/admin/AdminAiChat';
import { useAdminNavPendingBadges } from '@/hooks/useAdminNavPendingBadges';
import { useAdminAblyQueue } from '@/hooks/useAdminAblyQueue';
import { ADMIN_QUEUE_HINT_EVENT } from '@/lib/adminQueueEvents';

interface AdminLayoutProps {
  children: React.ReactNode;
}

type Platform = 'both' | 'app' | 'web';

const adminMenuGroups: {
  label: string;
  platform: Platform;
  subtitle: string;
  items: { name: string; path: string; icon: typeof LayoutDashboard }[];
}[] = [
  {
    label: 'Both',
    platform: 'both',
    subtitle: 'Shared / infrastructure',
    items: [
      { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Analytics', path: '/admin/analytics', icon: TrendingUp },
      { name: 'Finance', path: '/admin/finance', icon: CircleDollarSign },
      { name: 'Users', path: '/admin/users', icon: Users },
      { name: 'Observability', path: '/admin/observability', icon: Activity },
      { name: 'Security', path: '/admin/security', icon: ShieldAlert },
      { name: 'Audit Logs', path: '/admin/audit-logs', icon: ScrollText },
      { name: 'Compliance', path: '/admin/compliance', icon: Cookie },
      { name: 'AI assistant', path: '/admin/ai', icon: Sparkles },
      { name: 'System', path: '/admin/system', icon: Settings2 },
    ],
  },
  {
    label: 'App',
    platform: 'app',
    subtitle: 'Mobile (iOS / Android)',
    items: [
      { name: 'Freelancers', path: '/admin/freelancers', icon: Briefcase },
      { name: 'Customers', path: '/admin/customers', icon: UserRound },
      { name: 'Bookings', path: '/admin/bookings', icon: CalendarDays },
      { name: 'Verifications', path: '/admin/verifications', icon: BadgeCheck },
      { name: 'Category limits', path: '/admin/category-limit-requests', icon: Layers },
      { name: 'Certifications', path: '/admin/certification-reviews', icon: Award },
      { name: 'Role applications', path: '/admin/role-applications', icon: UserPlus },
      { name: 'Categories', path: '/admin/categories', icon: Tag },
      { name: 'Chat Logs', path: '/admin/chat-logs', icon: MessageCircle },
      { name: 'Booking reviews', path: '/admin/booking-reviews', icon: ListChecks },
    ],
  },
  {
    label: 'Web',
    platform: 'web',
    subtitle: 'skillance.co.za',
    items: [
      { name: 'Contact messages', path: '/admin/contact-messages', icon: Mail },
      { name: 'Subscribers', path: '/admin/notify-subscribers', icon: BellRing },
      { name: 'Website reviews', path: '/admin/website-reviews', icon: Star },
    ],
  },
];

const PLATFORM_STYLES: Record<Platform, { dot: string; chip: string }> = {
  both: {
    dot: 'bg-neutral-400 dark:bg-neutral-500',
    chip: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
  },
  app: {
    dot: 'bg-emerald-500',
    chip: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200',
  },
  web: {
    dot: 'bg-sky-500',
    chip: 'bg-sky-50 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200',
  },
};

// Flat list for active-check lookup
const allMenuItems = adminMenuGroups.flatMap((g) => g.items);

function formatNavBadgeText(n: number): string {
  if (n <= 0) return '';
  return n > 99 ? '99+' : String(n);
}

function AdminNavBadgePill({ count, active }: { count: number; active: boolean }) {
  if (count <= 0) return null;
  const text = formatNavBadgeText(count);
  return (
    <span
      className={cn(
        'ml-auto shrink-0 min-h-5 min-w-5 px-1.5 inline-flex items-center justify-center rounded-full text-[10px] font-bold tabular-nums leading-none',
        active
          ? 'bg-amber-400 text-black dark:bg-amber-300 dark:text-black'
          : 'bg-amber-500 text-white dark:bg-amber-600',
      )}
      aria-hidden
    >
      {text}
    </span>
  );
}

function AdminNavBadgeIconDot({ count, active }: { count: number; active: boolean }) {
  if (count <= 0) return null;
  const text = count > 9 ? '9+' : String(count);
  return (
    <span
      className={cn(
        'absolute -top-0.5 -right-0.5 z-10 min-w-3.5 h-3.5 px-0.5 flex items-center justify-center rounded-full text-[8px] font-bold leading-none',
        active
          ? 'bg-amber-400 text-black dark:bg-amber-300'
          : 'bg-amber-500 text-white dark:text-amber-950',
      )}
      aria-hidden
    >
      {text}
    </span>
  );
}

interface CollapsedNavItemProps {
  item: (typeof allMenuItems)[number];
  active: boolean;
  pendingCount: number;
}

const CollapsedNavItem: React.FC<CollapsedNavItemProps> = ({ item, active, pendingCount }) => {
  const tooltipId = `admin-collapsed-tooltip-${item.path.replaceAll('/', '-').replaceAll(':', '-')}`;

  return (
    <div className="relative group/item flex items-center justify-center w-full">
      <Link
        to={item.path}
        aria-label={pendingCount > 0 ? `${item.name}, ${pendingCount} pending` : item.name}
        aria-describedby={tooltipId}
        className={cn(
          'relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/70 dark:focus-visible:ring-neutral-500/70',
          active
            ? 'bg-black dark:bg-white text-white dark:text-black'
            : 'text-neutral-400 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-black dark:hover:text-white',
        )}
      >
        <item.icon size={16} className="relative z-0" />
        <AdminNavBadgeIconDot count={pendingCount} active={active} />
      </Link>
      <span
        id={tooltipId}
        role="tooltip"
        className="pointer-events-none absolute left-full top-1/2 z-30 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-medium text-neutral-700 opacity-0 shadow-lg transition-all duration-150 group-hover/item:opacity-100 group-focus-within/item:opacity-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
      >
        {item.name}
      </span>
    </div>
  );
};

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { toggleTheme, isDark } = useAdminTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  /** Bumping this remounts the current admin route so data hooks run again (same as a soft refresh). */
  const [refreshNonce, setRefreshNonce] = useState(0);
  const { getCount: getNavPendingCount, refresh: refreshNavBadges } = useAdminNavPendingBadges({
    refreshKey: refreshNonce,
  });

  useAdminAblyQueue(() => {
    void refreshNavBadges();
    window.dispatchEvent(new CustomEvent(ADMIN_QUEUE_HINT_EVENT));
  }, Boolean(user));

  // Track which groups are collapsed — all open by default
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (location.pathname === path) return true;
    if (path !== '/admin/dashboard' && location.pathname.startsWith(path + '/')) return true;
    return false;
  };

  const toggleGroup = (label: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const bumpPageRefresh = () => {
    setRefreshNonce((n) => n + 1);
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="shrink-0 h-14 flex items-center px-5 border-b border-neutral-100 dark:border-neutral-800">
        <Link to="/" className="flex items-center gap-2.5">
          {isDark ? (
            <picture>
              <source type="image/webp" srcSet="/skillance-tiny-logo-white.webp" />
              <img
                src="/skillance-tiny-logo-white.png"
                alt="Skillance"
                width={120}
                height={24}
                className="h-7 w-auto shrink-0"
              />
            </picture>
          ) : (
            <img
              src="/skillance-tiny-logo-black.png"
              alt="Skillance"
              width={120}
              height={24}
              className="h-7 w-auto shrink-0"
            />
          )}
          <span className="font-serif text-lg tracking-tight text-black dark:text-white">Skillance</span>
        </Link>
      </div>

      {/* Navigation groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
        {adminMenuGroups.map((group) => {
          const isCollapsed = !!collapsedGroups[group.label];
          const hasActiveItem = group.items.some((item) => isActive(item.path));
          const styles = PLATFORM_STYLES[group.platform];

          return (
            <div key={group.label}>
              {/* Group header - platform marker + collapsible */}
              <button
                type="button"
                onClick={() => toggleGroup(group.label)}
                className="w-full flex items-center justify-between px-2 py-2 mb-1 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors group"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span
                    aria-hidden="true"
                    className={cn('h-1.5 w-1.5 rounded-full shrink-0', styles.dot)}
                  />
                  <span
                    className={cn(
                      'text-[10px] font-bold uppercase tracking-[0.12em] px-1.5 py-0.5 rounded-md',
                      styles.chip,
                    )}
                  >
                    {group.label}
                  </span>
                  <span
                    className={cn(
                      'text-[10px] font-medium truncate transition-colors',
                      hasActiveItem
                        ? 'text-neutral-600 dark:text-neutral-300'
                        : 'text-neutral-400 dark:text-neutral-500',
                    )}
                  >
                    {group.subtitle}
                  </span>
                </span>
                <ChevronDown
                  size={12}
                  className={cn(
                    'text-neutral-300 dark:text-neutral-600 group-hover:text-neutral-400 dark:group-hover:text-neutral-500 transition-transform duration-200 shrink-0',
                    isCollapsed ? '-rotate-90' : 'rotate-0',
                  )}
                />
              </button>

              {/* Group items */}
              <AnimatePresence initial={false}>
                {!isCollapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-0.5 pb-2">
                      {group.items.map((item) => {
                        const active = isActive(item.path);
                        const pending = getNavPendingCount(item.path);
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            title={pending > 0 ? `${item.name} (${pending} pending)` : item.name}
                            className={cn(
                              'flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-200 group text-[13px] min-w-0',
                              active
                                ? 'bg-black dark:bg-white text-white dark:text-black font-medium'
                                : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-black dark:hover:text-white',
                            )}
                          >
                            <item.icon
                              size={16}
                              className={cn(
                                'shrink-0',
                                active
                                  ? 'text-white dark:text-black'
                                  : 'text-neutral-400 dark:text-neutral-500 group-hover:text-black dark:group-hover:text-white',
                              )}
                            />
                            <span className="flex-1 min-w-0 truncate text-left">{item.name}</span>
                            <AdminNavBadgePill count={pending} active={active} />
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="shrink-0 px-3 pb-4 pt-2 border-t border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center text-xs font-semibold text-black dark:text-white shrink-0">
            {user?.fullName?.charAt(0) || 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-black dark:text-white truncate">{user?.fullName || 'Admin'}</p>
            <p className="text-[10px] text-neutral-400 dark:text-neutral-500 truncate">{user?.email || ''}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-neutral-400 dark:text-neutral-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200 w-full text-[13px]"
        >
          <LogOut size={15} className="shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className={cn('min-h-screen flex', isDark ? 'dark bg-neutral-950 text-white' : 'bg-white text-black')}>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar — Desktop */}
      <motion.aside
        className={cn(
          'hidden lg:flex shrink-0 h-screen sticky top-0 flex-col bg-white dark:bg-neutral-950 border-r border-neutral-100 dark:border-neutral-800/80',
          isSidebarCollapsed ? 'overflow-visible' : 'overflow-hidden',
        )}
        animate={{ width: isSidebarCollapsed ? 56 : 220 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      >
        {isSidebarCollapsed ? (
          /* Collapsed — icon-only strip */
          <div className="flex flex-col h-full">
            {/* Collapse toggle at top */}
            <div className="shrink-0 h-14 flex items-center justify-center border-b border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(false)}
                className="p-2 rounded-lg text-neutral-400 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-black dark:hover:text-white transition-colors"
                aria-label="Expand sidebar"
              >
                <PanelLeftOpen size={18} />
              </button>
            </div>
            {/* Icon-only nav */}
            <nav className="flex-1 overflow-y-auto overflow-x-visible flex flex-col items-center py-3 px-1.5">
              {adminMenuGroups.map((group, groupIndex) => {
                const styles = PLATFORM_STYLES[group.platform];
                return (
                  <div key={group.label} className="w-full flex flex-col items-center">
                    <div
                      className="relative group/platform mt-2 mb-1.5 flex items-center justify-center w-full"
                      aria-label={`${group.label} section`}
                    >
                      {groupIndex > 0 && (
                        <span
                          aria-hidden="true"
                          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-px w-6 rounded-full bg-neutral-200 dark:bg-neutral-800"
                        />
                      )}
                      <span
                        aria-hidden="true"
                        className={cn(
                          'relative h-2 w-2 rounded-full ring-2 ring-white dark:ring-neutral-950',
                          styles.dot,
                        )}
                      />
                      <span
                        role="tooltip"
                        className="pointer-events-none absolute left-full top-1/2 z-30 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-neutral-700 opacity-0 shadow-lg transition-all duration-150 group-hover/platform:opacity-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                      >
                        {group.label} — {group.subtitle}
                      </span>
                    </div>
                    <div className="w-full flex flex-col items-center gap-1">
                      {group.items.map((item) => (
                        <CollapsedNavItem
                          key={item.path}
                          item={item}
                          active={isActive(item.path)}
                          pendingCount={getNavPendingCount(item.path)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </nav>
            {/* Footer icons */}
            <div className="shrink-0 flex flex-col items-center gap-1 px-2 pb-4 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-neutral-400 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-black dark:hover:text-white transition-colors"
              >
                {isDark ? <Sun size={15} /> : <Moon size={15} />}
              </button>
              <button
                onClick={handleLogout}
                aria-label="Logout"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-neutral-400 dark:text-neutral-500 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        ) : (
          /* Expanded — full sidebar */
          <div className="flex flex-col h-full">
            <SidebarContent />
            {/* Collapse button pinned to top-right of sidebar */}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(true)}
              className="absolute top-3.5 right-3 p-1.5 rounded-lg text-neutral-300 dark:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose size={15} />
            </button>
          </div>
        )}
      </motion.aside>

      {/* Sidebar — Mobile drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 left-0 z-50 w-[260px] bg-white dark:bg-neutral-950 border-r border-neutral-100 dark:border-neutral-800 flex flex-col lg:hidden shadow-2xl"
          >
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 text-neutral-400 dark:text-neutral-500 hover:text-black dark:hover:text-white"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar — only visible on small screens */}
        <div className="lg:hidden shrink-0 min-h-12 flex items-center justify-between gap-2 px-3 sm:px-4 border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-950 sticky top-0 z-30">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1.5 -ml-1 text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors shrink-0"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div className="flex-1 min-w-0 flex flex-col items-center justify-center text-center leading-tight px-1">
            <span className="text-xs sm:text-sm font-bold font-serif text-black dark:text-white tracking-tight">
              Romans 8:18
            </span>
            <span className="text-[10px] sm:text-[11px] font-medium text-neutral-500 dark:text-neutral-400 truncate max-w-full">
              {allMenuItems.find((item) => isActive(item.path))?.name || 'Admin'}
            </span>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              onClick={bumpPageRefresh}
              className="p-1.5 rounded-lg text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-black dark:hover:text-white transition-colors"
              aria-label="Refresh page"
              title="Refresh"
            >
              <RefreshCw size={17} />
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-black dark:hover:text-white transition-colors"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>
        </div>

        {/* Desktop top bar — verse centered, actions right (visible on all admin pages) */}
        <div className="hidden lg:grid lg:grid-cols-[1fr_auto_1fr] shrink-0 h-12 items-center px-4 xl:px-6 border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-950 sticky top-0 z-30">
          <span className="text-sm font-medium font-serif text-black dark:text-white truncate min-w-0 justify-self-start pr-2">
            {allMenuItems.find((item) => isActive(item.path))?.name || 'Admin'}
          </span>
          <span className="justify-self-center text-sm font-bold font-serif text-black dark:text-white tracking-tight whitespace-nowrap px-2">
            Romans 8:18
          </span>
          <div className="flex items-center gap-1 justify-self-end">
            <button
              type="button"
              onClick={bumpPageRefresh}
              className="p-2 rounded-xl text-neutral-400 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-black dark:hover:text-white transition-colors"
              aria-label="Refresh page"
              title="Refresh"
            >
              <RefreshCw size={17} />
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-neutral-400 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-black dark:hover:text-white transition-colors"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10 bg-neutral-50/50 dark:bg-neutral-900 min-h-screen">
          <motion.div
            key={`${location.pathname}-${refreshNonce}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </main>
      </div>
      {/* Floating Claude-powered admin assistant (only rendered when enabled) */}
      <AdminAiChat />
    </div>
  );
};

export default AdminLayout;
