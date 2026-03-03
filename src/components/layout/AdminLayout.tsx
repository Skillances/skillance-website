import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  ShieldCheck, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  BarChart3,
  FileText,
  UserCheck,
  Shield,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Security Logs', path: '/admin/security', icon: Shield },
    { name: 'Reports', path: '/admin/reports', icon: FileText },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        animate={{ width: isSidebarCollapsed ? '80px' : '280px' }}
        className={cn(
          "fixed inset-y-0 left-0 z-50 lg:relative bg-neutral-900/50 border-r border-neutral-800 backdrop-blur-xl flex flex-col transition-all duration-300",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0">
              <span className="text-black font-bold text-xl">S</span>
            </div>
            {!isSidebarCollapsed && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-serif text-xl tracking-tight"
              >
                Skillance
              </motion.span>
            )}
          </Link>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-2 text-neutral-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {adminMenuItems.map((item) => {
            const Active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                title={isSidebarCollapsed ? item.name : ''}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-sm font-medium",
                  Active 
                    ? "bg-white text-black shadow-[0_10px_20px_-5px_rgba(255,255,255,0.1)]" 
                    : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                )}
              >
                <item.icon size={20} className={cn("shrink-0 transition-colors", Active ? "text-black" : "group-hover:text-white")} />
                {!isSidebarCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer / User */}
        <div className="p-4 border-t border-neutral-800">
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-800/50 mb-4">
              <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center font-bold text-white">
                {user?.fullName?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{user?.fullName || 'Admin'}</p>
                <p className="text-xs text-neutral-500 truncate">{user?.email || 'admin@skillance.co.za'}</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={cn(
              "w-full justify-start text-neutral-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl",
              isSidebarCollapsed && "justify-center px-0"
            )}
          >
            <LogOut size={20} className="shrink-0" />
            {!isSidebarCollapsed && <span className="ml-3">Logout</span>}
          </Button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-20 border-b border-neutral-800 flex items-center justify-between px-6 bg-neutral-950/50 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-neutral-400 hover:text-white"
            >
              <Menu size={24} />
            </button>
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden lg:flex p-2 text-neutral-400 hover:text-white"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-lg font-medium text-white ml-2">
              {adminMenuItems.find(item => isActive(item.path))?.name || 'Overview'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-neutral-400 hover:text-white relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-neutral-950" />
            </button>
            <div className="h-8 w-[1px] bg-neutral-800 mx-2" />
            <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-bold text-white">
              {user?.fullName?.charAt(0) || 'A'}
            </div>
          </div>
        </header>

        {/* Page Area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 bg-neutral-950">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
