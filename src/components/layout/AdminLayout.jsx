import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
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
  UserCheck
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
    <div className="min-h-screen bg-gray-50 flex">
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
        className="hidden lg:flex bg-white border-r border-border overflow-hidden flex-shrink-0"
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
                      color: 'var(--color-section-primary)'
                    }}
                    className="text-lg font-bold truncate"
                  >
                    Skillance
                  </h1>
                  <p className="text-xs text-text-tertiary">Admin Panel</p>
                </div>
              )}
            </div>
          </div>

          {/* User Info */}
          {!isSidebarCollapsed && (
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary-teal flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {user?.fullName?.charAt(0) || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.fullName || 'Admin'}</p>
                  <p className="text-xs text-text-tertiary truncate">{user?.email || ''}</p>
                </div>
              </div>
            </div>
          )}

          {/* Collapse Toggle Button */}
          <div className="p-4 border-b border-border">
            <button
              onClick={toggleSidebar}
              className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isSidebarCollapsed ? (
                <ChevronRight size={20} className="text-text-secondary" />
              ) : (
                <ChevronLeft size={20} className="text-text-secondary" />
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
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-text-secondary hover:bg-gray-100 hover:text-text-primary'
                  }`}
                  style={active ? {
                    backgroundColor: 'var(--color-section-primary)',
                  } : {}}
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
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-text-secondary hover:bg-red-50 hover:text-red-600 transition-all duration-200 w-full ${
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
            className="w-64 bg-white border-r border-border fixed left-0 top-0 bottom-0 z-50 lg:hidden overflow-y-auto"
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
                        color: 'var(--color-section-primary)'
                      }}
                      className="text-lg font-bold"
                    >
                      Skillance
                    </h1>
                    <p className="text-xs text-text-tertiary">Admin Panel</p>
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary-teal flex items-center justify-center text-white font-semibold">
                    {user?.fullName?.charAt(0) || 'A'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user?.fullName || 'Admin'}</p>
                    <p className="text-xs text-text-tertiary truncate">{user?.email || ''}</p>
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
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-text-secondary hover:bg-gray-100 hover:text-text-primary'
                      }`}
                      style={active ? {
                        backgroundColor: 'var(--color-section-primary)',
                      } : {}}
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
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-text-secondary hover:bg-red-50 hover:text-red-600 transition-all duration-200 w-full"
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
        <header className="bg-white border-b border-border px-4 lg:px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            <button
              onClick={toggleSidebar}
              className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <Menu size={24} />
            </button>
            
            <div className="flex-1 lg:ml-0 ml-4">
              <h2 
                style={{ fontFamily: 'var(--font-family-poppins)' }}
                className="text-xl font-semibold"
              >
                {adminMenuItems.find(item => isActive(item.path))?.name || 'Admin Panel'}
              </h2>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout

