import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  BadgeCheck,
  LogOut,
  Menu,
  X,
  TrendingUp,
  UserRound,
  ShieldAlert,
  Tag,
  Settings2,
  Sun,
  Moon,
  Mail,
  BellRing,
  StarHalf,
  ScrollText,
  MessageCircle,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useAdminTheme } from '@/context/AdminThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const adminMenuGroups = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Analytics', path: '/admin/analytics', icon: TrendingUp },
    ],
  },
  {
    label: 'People',
    items: [
      { name: 'Users', path: '/admin/users', icon: Users },
      { name: 'Freelancers', path: '/admin/freelancers', icon: Briefcase },
      { name: 'Customers', path: '/admin/customers', icon: UserRound },
      { name: 'Verifications', path: '/admin/verifications', icon: BadgeCheck },
    ],
  },
  {
    label: 'Content',
    items: [
      { name: 'Categories', path: '/admin/categories', icon: Tag },
      { name: 'Messages', path: '/admin/contact-messages', icon: Mail },
      { name: 'Chat Logs', path: '/admin/chat-logs', icon: MessageCircle },
      { name: 'Subscribers', path: '/admin/notify-subscribers', icon: BellRing },
      { name: 'Reviews', path: '/admin/website-reviews', icon: StarHalf },
    ],
  },
  {
    label: 'System',
    items: [
      { name: 'Security', path: '/admin/security', icon: ShieldAlert },
      { name: 'Audit Logs', path: '/admin/audit-logs', icon: ScrollText },
      { name: 'System', path: '/admin/system', icon: Settings2 },
    ],
  },
];

// Flat list for active-check lookup
const allMenuItems = adminMenuGroups.flatMap((g) => g.items);

interface CollapsedNavItemProps {
  item: (typeof allMenuItems)[number];
  active: boolean;
}

const CollapsedNavItem: React.FC<CollapsedNavItemProps> = ({ item, active }) => {
  const tooltipId = `admin-collapsed-tooltip-${item.path.replaceAll('/', '-').replaceAll(':', '-')}`;

  return (
    <div className="relative group/item flex items-center justify-center w-full">
      <Link
        to={item.path}
        aria-label={item.name}
        aria-describedby={tooltipId}
        className={cn(
          'flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/70 dark:focus-visible:ring-neutral-500/70',
          active
            ? 'bg-black dark:bg-white text-white dark:text-black'
            : 'text-neutral-400 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-black dark:hover:text-white',
        )}
      >
        <item.icon size={16} />
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
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {adminMenuGroups.map((group) => {
          const isCollapsed = !!collapsedGroups[group.label];
          const hasActiveItem = group.items.some((item) => isActive(item.path));

          return (
            <div key={group.label}>
              {/* Group header — clickable to collapse */}
              <button
                type="button"
                onClick={() => toggleGroup(group.label)}
                className="w-full flex items-center justify-between px-3 py-1.5 mb-0.5 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors group"
              >
                <span className={cn(
                  'text-[10px] font-semibold uppercase tracking-widest select-none transition-colors',
                  hasActiveItem
                    ? 'text-neutral-700 dark:text-neutral-300'
                    : 'text-neutral-400 dark:text-neutral-600 group-hover:text-neutral-600 dark:group-hover:text-neutral-400',
                )}>
                  {group.label}
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
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                              'flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-200 group text-[13px]',
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
                            <span>{item.name}</span>
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
              {adminMenuGroups.map((group, groupIndex) => (
                <div key={group.label} className="w-full flex flex-col items-center">
                  {groupIndex > 0 && (
                    <span
                      aria-hidden="true"
                      className="my-2 h-px w-6 rounded-full bg-neutral-200 dark:bg-neutral-800"
                    />
                  )}
                  <div className="w-full flex flex-col items-center gap-1">
                    {group.items.map((item) => (
                      <CollapsedNavItem key={item.path} item={item} active={isActive(item.path)} />
                    ))}
                  </div>
                </div>
              ))}
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
        <div className="lg:hidden shrink-0 h-12 flex items-center justify-between px-4 border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-950 sticky top-0 z-30">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1.5 -ml-1 text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <span className="text-sm font-medium text-black dark:text-white">
            {allMenuItems.find((item) => isActive(item.path))?.name || 'Admin'}
          </span>
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-black dark:hover:text-white transition-colors"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>

        {/* Desktop theme toggle — top-right corner */}
        <div className="hidden lg:flex absolute top-3 right-4 z-20">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl text-neutral-400 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-black dark:hover:text-white transition-colors"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10 bg-neutral-50/50 dark:bg-neutral-900 min-h-screen">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
