import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Briefcase, ShieldCheck, DollarSign, Calendar, ArrowRight, Loader2, UserCheck, CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { get } from '@/utils/api'

const AdminDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [dashboardData, setDashboardData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await get('/admin/dashboard')
        
        if (response.success && response.data) {
          setDashboardData(response.data)
        } else {
          setError('Failed to load dashboard data')
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError(err.message || 'Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Format number with commas
  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0'
    return num.toLocaleString('en-US')
  }

  // Calculate percentage change (mock for now, can be enhanced with historical data)
  const getChange = (current, previous = null) => {
    // For now, return a placeholder. Can be enhanced with historical data later
    return '+0%'
  }

  const metrics = dashboardData ? [
    {
      title: 'Total Users',
      value: formatNumber(dashboardData.users.total),
      change: getChange(dashboardData.users.newThisMonth),
      icon: Users,
      color: 'var(--color-section-primary)',
    },
    {
      title: 'Customers',
      value: formatNumber(dashboardData.users.customers),
      change: '',
      icon: UserCheck,
      color: '#3B82F6',
    },
    {
      title: 'Total Freelancers',
      value: formatNumber(dashboardData.freelancers.total),
      change: getChange(dashboardData.freelancers.verified),
      icon: Briefcase,
      color: 'var(--color-accent-teal)',
    },
    {
      title: 'Pending Verifications',
      value: formatNumber(dashboardData.pendingVerifications.count),
      change: '',
      icon: ShieldCheck,
      color: '#F59E0B',
    },
    {
      title: 'Verified Freelancers',
      value: formatNumber(dashboardData.freelancers.verified),
      change: '',
      icon: CheckCircle,
      color: '#8B5CF6',
    },
    {
      title: 'New This Month',
      value: formatNumber(dashboardData.users.newThisMonth),
      change: '',
      icon: Users,
      color: '#10B981',
    },
  ] : []

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" style={{ color: 'var(--color-section-primary)' }} />
            <p className="text-text-secondary">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="sm"
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 
          style={{ fontFamily: 'var(--font-family-poppins)' }} 
          className="text-3xl md:text-4xl font-bold mb-2"
        >
          Welcome back, {user?.fullName || 'Admin'}
        </h1>
        <p className="text-lg text-text-secondary">
          Monitor key metrics and manage your platform
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-8">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <Card key={metric.title} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${metric.color}15` }}
                  >
                    <Icon size={24} style={{ color: metric.color }} />
                  </div>
                  {metric.change && (
                    <span
                      className={`text-sm font-medium ${
                        metric.change.startsWith('+') ? 'text-green-600' : metric.change.startsWith('-') ? 'text-red-600' : 'text-text-tertiary'
                      }`}
                    >
                      {metric.change}
                    </span>
                  )}
                </div>
                <CardTitle
                  style={{ fontFamily: 'var(--font-family-poppins)' }}
                  className="text-lg text-text-secondary mb-1"
                >
                  {metric.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p
                  className="text-3xl font-bold"
                  style={{ fontFamily: 'var(--font-family-poppins)' }}
                >
                  {metric.value}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Additional Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle
              style={{ fontFamily: 'var(--font-family-poppins)' }}
              className="text-xl mb-4"
            >
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-text-tertiary text-center py-8">
                No recent activity
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle
              style={{ fontFamily: 'var(--font-family-poppins)' }}
              className="text-xl mb-4"
            >
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start group"
                style={{ fontFamily: 'var(--font-family-inter)' }}
                onClick={() => navigate('/admin/verifications')}
              >
                <ShieldCheck size={18} className="mr-2" />
                Review Pending Verifications
                <ArrowRight size={16} className="ml-auto group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start group"
                style={{ fontFamily: 'var(--font-family-inter)' }}
                onClick={() => navigate('/admin/users')}
              >
                <Users size={18} className="mr-2" />
                Manage Users
                <ArrowRight size={16} className="ml-auto group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start group"
                style={{ fontFamily: 'var(--font-family-inter)' }}
                onClick={() => navigate('/admin/freelancers')}
              >
                <Briefcase size={18} className="mr-2" />
                View All Freelancers
                <ArrowRight size={16} className="ml-auto group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AdminDashboard

