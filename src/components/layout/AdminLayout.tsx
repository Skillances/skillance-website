import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  ShieldCheck, 
  LogOut, 
  Menu, 
  X,
  BarChart3,
  UserCheck,
  Shield,
  FolderOpen,
  Wrench,
  Sun,
  Moon,
  MessageSquare,
  Bell,
  Star,
  ClipboardList,
  MessagesSquare,
} from 'lucide-react';
import { useAdminTheme } from '@/context/AdminThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { toggleTheme, isDark } = useAdminTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Material+Icons';
    link.id = 'admin-material-icons';
    document.head.appendChild(link);
    return () => {
      const el = document.getElementById('admin-material-icons');
      if (el) el.remove();
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminMenuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Freelancers', path: '/admin/freelancers', icon: Briefcase },
    { name: 'Customers', path: '/admin/customers', icon: UserCheck },
    { name: 'Verifications', path: '/admin/verifications', icon: ShieldCheck },
    { name: 'Categories', path: '/admin/categories', icon: FolderOpen },
    { name: 'Messages', path: '/admin/contact-messages', icon: MessageSquare },
    { name: 'Chat logs', path: '/admin/chat-logs', icon: MessagesSquare },
    { name: 'Subscribers', path: '/admin/notify-subscribers', icon: Bell },
    { name: 'Reviews', path: '/admin/website-reviews', icon: Star },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Security', path: '/admin/security', icon: Shield },
    { name: 'Audit Logs', path: '/admin/audit-logs', icon: ClipboardList },
    { name: 'System', path: '/admin/system', icon: Wrench },
  ];

  const isActive = (path: string) => {
    if (location.pathname === path) return true;
    if (path !== '/admin/dashboard' && location.pathname.startsWith(path + '/')) return true;
    return false;
  };

  const SidebarContent = () => (
    <>
      {/* Logo - same height as header (h-14) so they align */}
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

      {/* Navigation - takes remaining space, no scroll */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {adminMenuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-200 group text-[13px]",
                active
                  ? "bg-black dark:bg-white text-white dark:text-black font-medium"
                  : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-black dark:hover:text-white"
              )}
            >
              <item.icon size={16} className={cn("shrink-0", active ? "text-white dark:text-black" : "text-neutral-400 dark:text-neutral-500 group-hover:text-black dark:group-hover:text-white")} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer - shrink-0 keeps it pinned at bottom */}
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
    <div className={cn("min-h-screen flex", isDark ? "dark bg-neutral-950 text-white" : "bg-white text-black")}>
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

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-[240px] shrink-0 h-screen sticky top-0 flex-col bg-white dark:bg-neutral-950 dark:border-r dark:border-neutral-800/80 border-r border-neutral-100">
        <SidebarContent />
      </aside>

      {/* Sidebar - Mobile */}
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
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-1.5 text-neutral-400 dark:text-neutral-500 hover:text-black dark:hover:text-white" aria-label="Close menu">
                <X size={18} />
              </button>
            </div>
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-14 shrink-0 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between px-6 bg-white dark:bg-neutral-900 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-1.5 text-neutral-400 dark:text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <span className="text-sm text-neutral-400 dark:text-neutral-500">
              {adminMenuItems.find(item => isActive(item.path))?.name || 'Admin'}
            </span>
          </div>
          <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-black dark:hover:text-white transition-colors"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-10 bg-neutral-50/50 dark:bg-neutral-900">
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
