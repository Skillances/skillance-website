import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Heart,
  FileText,
  Settings,
  Repeat,
  Briefcase,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, isAuthenticated, isFreelancerView, setPreferredView, logout } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <div className="text-center py-16">
        <p className="text-neutral-600 mb-4">Sign in to manage your account</p>
        <Link to="/app/login">
          <Button className="rounded-full">Sign in</Button>
        </Link>
      </div>
    );
  }

  const initials = user.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const menuItems = [
    { label: 'Favorites', path: '/app/favorites', icon: Heart },
    { label: 'My documents', path: '/app/documents', icon: FileText },
    { label: 'Recurring bookings', path: '/app/recurring', icon: Repeat },
    { label: 'Settings', path: '/app/settings', icon: Settings },
  ];

  if (user.freelancerId && !isFreelancerView) {
    menuItems.unshift({ label: 'Freelancer dashboard', path: '/app/freelancer/dashboard', icon: Briefcase });
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user.profilePhotoUrl ?? undefined} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-lg font-semibold text-neutral-900">{user.fullName}</h1>
          <p className="text-sm text-neutral-500">{user.email}</p>
          <p className="text-xs text-neutral-400 mt-1 capitalize">
            Viewing as {isFreelancerView ? 'freelancer' : 'customer'}
          </p>
        </div>
      </div>

      {user.freelancerId && user.customerId && (
        <Button
          variant="outline"
          className="w-full rounded-full"
          onClick={() =>
            setPreferredView(isFreelancerView ? 'customer' : 'freelancer')
          }
        >
          Switch to {isFreelancerView ? 'customer' : 'freelancer'} view
        </Button>
      )}

      <nav className="rounded-2xl border border-neutral-200 bg-white divide-y divide-neutral-100">
        {menuItems.map(({ label, path, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            className="flex items-center justify-between px-4 py-3.5 hover:bg-neutral-50 transition-colors"
          >
            <span className="flex items-center gap-3 text-neutral-900">
              <Icon className="h-4 w-4 text-neutral-500" />
              {label}
            </span>
            <ChevronRight className="h-4 w-4 text-neutral-400" />
          </Link>
        ))}
        <Link
          to="/"
          className="flex items-center justify-between px-4 py-3.5 hover:bg-neutral-50 transition-colors"
        >
          <span className="flex items-center gap-3 text-neutral-900">
            <ExternalLink className="h-4 w-4 text-neutral-500" />
            Back to website
          </span>
          <ChevronRight className="h-4 w-4 text-neutral-400" />
        </Link>
      </nav>

      <Button
        variant="outline"
        className="w-full rounded-full text-red-600 border-red-200 hover:bg-red-50"
        onClick={() => logout()}
      >
        Sign out
      </Button>
    </div>
  );
}
