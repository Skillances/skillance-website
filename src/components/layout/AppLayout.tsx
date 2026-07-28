import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Search,
  Calendar,
  MessageCircle,
  User,
  LayoutDashboard,
  Briefcase,
  Wallet,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

function customerNav(): NavItem[] {
  return [
    { label: 'Home', path: '/app', icon: Home },
    { label: 'Search', path: '/app/search', icon: Search },
    { label: 'Bookings', path: '/app/bookings', icon: Calendar },
    { label: 'Chat', path: '/app/chat', icon: MessageCircle },
    { label: 'Profile', path: '/app/profile', icon: User },
  ];
}

function freelancerNav(): NavItem[] {
  return [
    { label: 'Dashboard', path: '/app/freelancer/dashboard', icon: LayoutDashboard },
    { label: 'Jobs', path: '/app/freelancer/jobs', icon: Briefcase },
    { label: 'Earnings', path: '/app/freelancer/earnings', icon: Wallet },
    { label: 'Chat', path: '/app/chat', icon: MessageCircle },
    { label: 'Profile', path: '/app/profile', icon: User },
  ];
}

function NavLink({ item, compact }: { item: NavItem; compact?: boolean }) {
  const location = useLocation();
  const isActive =
    item.path === '/app'
      ? location.pathname === '/app'
      : location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

  const Icon = item.icon;

  return (
    <Link
      to={item.path}
      className={cn(
        'flex items-center gap-3 rounded-xl transition-colors',
        compact ? 'flex-col gap-1 px-2 py-2 text-[10px]' : 'px-3 py-2.5 text-sm',
        isActive
          ? 'bg-neutral-900 text-white'
          : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
      )}
    >
      <Icon className={compact ? 'h-5 w-5' : 'h-4 w-4 shrink-0'} />
      <span className={compact ? 'font-medium' : 'font-medium'}>{item.label}</span>
    </Link>
  );
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated, isFreelancerView, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const navItems = isFreelancerView ? freelancerNav() : customerNav();
  const hideShell = location.pathname.startsWith('/app/login') ||
    location.pathname.startsWith('/app/register') ||
    location.pathname.startsWith('/app/forgot-password');

  if (hideShell) {
    return <div className="min-h-screen bg-neutral-50">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col md:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-neutral-200 bg-white">
        <div className="p-5 border-b border-neutral-100">
          <Link to="/app" className="font-serif text-xl text-neutral-900">
            Skillance
          </Link>
          {isAuthenticated && user && (
            <p className="text-xs text-neutral-500 mt-1 truncate">{user.fullName || user.email}</p>
          )}
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink key={item.path} item={item} />
          ))}
        </nav>
        <div className="p-3 border-t border-neutral-100 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-neutral-600 hover:bg-neutral-100 rounded-xl"
          >
            <ExternalLink className="h-4 w-4" />
            Back to website
          </Link>
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => logout({ redirectTo: '/app/login' })}
              className="w-full text-left px-3 py-2.5 text-sm text-neutral-600 hover:bg-neutral-100 rounded-xl"
            >
              Sign out
            </button>
          )}
          {!isAuthenticated && (
            <button
              type="button"
              onClick={() => navigate('/app/login')}
              className="w-full text-left px-3 py-2.5 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl"
            >
              Sign in
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b border-neutral-200 bg-white/95 backdrop-blur">
          <Link to="/app" className="font-serif text-lg text-neutral-900">
            Skillance
          </Link>
          {!isAuthenticated ? (
            <button
              type="button"
              onClick={() => navigate('/app/login')}
              className="text-sm font-medium text-neutral-900"
            >
              Sign in
            </button>
          ) : (
            <Link to="/app/profile" className="text-sm text-neutral-600">
              Account
            </Link>
          )}
        </header>

        <main className="flex-1 pb-20 md:pb-6 px-4 md:px-8 py-4 md:py-6 max-w-5xl w-full mx-auto">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-neutral-200 bg-white safe-area-pb">
          <div className="flex justify-around px-1 py-1">
            {navItems.map((item) => (
              <NavLink key={item.path} item={item} compact />
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
