import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { ModeToggle } from '@/components/common/ModeToggle'
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  ShieldCheck, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  FileText,
  UserCheck,
  Shield
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Close mobile menu on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const adminMenuItems = [
    {
      name: 'Dashboard',
      path: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Users',
      path: '/admin/users',
      icon: Users,
    },
    {
      name: 'Freelancers',
      path: '/admin/freelancers',
      icon: Briefcase,
    },
    {
      name: 'Customers',
      path: '/admin/customers',
      icon: UserCheck,
    },
    {
      name: 'Verifications',
      path: '/admin/verifications',
      icon: ShieldCheck,
    },
    {
      name: 'Analytics',
      path: '/admin/analytics',
      icon: BarChart3,
    },
    {
      name: 'Security Logs',
      path: '/admin/security',
      icon: Shield,
    },
    {
      name: 'Reports',
      path: '/admin/reports',
      icon: FileText,
    },
    {
      name: 'Settings',
      path: '/admin/settings',
      icon: Settings,
    },
  ]

  const isActive = (path) => location.pathname === path

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: isSidebarCollapsed ? '80px' : '256px' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden lg:flex bg-card border-r border-border overflow-hidden flex-shrink-0"
      >
        <div className="flex flex-col h-full w-full">
          {/* Logo/Brand */}
          <div className={`p-6 border-b border-border ${isSidebarCollapsed ? 'px-4' : ''}`}>
            <div className="flex items-center gap-3">
              <img 
                src="/app_icon.png" 
                alt="Skillance" 
                className="w-8 h-8 object-contain flex-shrink-0"
              />
              {!isSidebarCollapsed && (
                <div className="min-w-0">
                  <h1 
                    style={{ 
                      fontFamily: 'var(--font-family-poppins)',
                      color: 'var(--primary)'
                    }}
                    className="text-lg font-bold truncate text-primary"
                  >
                    Skillance
                  </h1>
                  <p className="text-xs text-muted-foreground">Admin Panel</p>
                </div>
              )}
            </div>
          </div>

          {/* User Info */}
          {!isSidebarCollapsed && (
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold flex-shrink-0">
                  {user?.fullName?.charAt(0) || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-foreground">{user?.fullName || 'Admin'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email || ''}</p>
                </div>
              </div>
            </div>
          )}

          {/* Collapse Toggle Button */}
          <div className="p-4 border-b border-border">
            <button
              onClick={toggleSidebar}
              className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isSidebarCollapsed ? (
                <ChevronRight size={20} className="text-muted-foreground" />
              ) : (
                <ChevronLeft size={20} className="text-muted-foreground" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {adminMenuItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={isSidebarCollapsed ? item.name : ''}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isSidebarCollapsed ? 'justify-center' : ''
                  } ${
                    active
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {!isSidebarCollapsed && (
                    <span className="text-sm font-medium whitespace-nowrap" style={{ fontFamily: 'var(--font-family-inter)' }}>
                      {item.name}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-border">
            <button
              onClick={handleLogout}
              title={isSidebarCollapsed ? 'Logout' : ''}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200 w-full ${
                isSidebarCollapsed ? 'justify-center' : ''
              }`}
            >
              <LogOut size={20} className="flex-shrink-0" />
              {!isSidebarCollapsed && (
                <span className="text-sm font-medium whitespace-nowrap" style={{ fontFamily: 'var(--font-family-inter)' }}>
                  Logout
                </span>
              )}
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.3 }}
            className="w-64 bg-background border-r border-border fixed left-0 top-0 bottom-0 z-50 lg:hidden overflow-y-auto"
          >
            <div className="flex flex-col h-full">
              {/* Logo/Brand */}
              <div className="p-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <img 
                    src="/app_icon.png" 
                    alt="Skillance" 
                    className="w-8 h-8 object-contain"
                  />
                  <div>
                    <h1 
                      style={{ 
                        fontFamily: 'var(--font-family-poppins)',
                        color: 'var(--primary)'
                      }}
                      className="text-lg font-bold text-primary"
                    >
                      Skillance
                    </h1>
                    <p className="text-xs text-muted-foreground">Admin Panel</p>
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {user?.fullName?.charAt(0) || 'A'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-foreground">{user?.fullName || 'Admin'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email || ''}</p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-1">
                {adminMenuItems.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.path)
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        active
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="text-sm font-medium" style={{ fontFamily: 'var(--font-family-inter)' }}>
                        {item.name}
                      </span>
                    </Link>
                  )
                })}
              </nav>

              {/* Logout */}
              <div className="p-4 border-t border-border">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200 w-full"
                >
                  <LogOut size={20} />
                  <span className="text-sm font-medium" style={{ fontFamily: 'var(--font-family-inter)' }}>
                    Logout
                  </span>
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-background border-b border-border px-4 lg:px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg hover:bg-muted transition-colors lg:hidden"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            <button
              onClick={toggleSidebar}
              className="hidden lg:flex p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <Menu size={24} />
            </button>
            
            <div className="flex-1 lg:ml-0 ml-4">
              <h2 
                style={{ fontFamily: 'var(--font-family-poppins)' }}
                className="text-xl font-semibold text-foreground"
              >
                {adminMenuItems.find(item => isActive(item.path))?.name || 'Admin Panel'}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-muted/20">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout

