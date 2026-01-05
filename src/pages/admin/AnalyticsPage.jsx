import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { get } from '@/utils/api'
import FilterDropdown from '@/components/admin/shared/FilterDropdown'
import LoadingSpinner from '@/components/admin/shared/LoadingSpinner'
import UserGrowthChart from '@/components/admin/analytics/UserGrowthChart'
import FreelancerGrowthChart from '@/components/admin/analytics/FreelancerGrowthChart'
import UserTypeDistributionChart from '@/components/admin/analytics/UserTypeDistributionChart'
import VerificationTrendsChart from '@/components/admin/analytics/VerificationTrendsChart'
import CategoryPopularityChart from '@/components/admin/analytics/CategoryPopularityChart'
import { Users, Briefcase, TrendingUp, BarChart3, Calendar } from 'lucide-react'

const AnalyticsPage = () => {
  const [dateRange, setDateRange] = useState('30')
  const [interval, setInterval] = useState('daily')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Data states
  const [userGrowth, setUserGrowth] = useState(null)
  const [freelancerGrowth, setFreelancerGrowth] = useState(null)
  const [userDistribution, setUserDistribution] = useState(null)
  const [verificationTrends, setVerificationTrends] = useState(null)
  const [categoryTrends, setCategoryTrends] = useState(null)

  // Calculate date range
  const getDateRange = () => {
    const endDate = new Date()
    const startDate = new Date()
    
    if (dateRange === '7') {
      startDate.setDate(endDate.getDate() - 7)
    } else if (dateRange === '30') {
      startDate.setDate(endDate.getDate() - 30)
    } else if (dateRange === '90') {
      startDate.setDate(endDate.getDate() - 90)
    } else {
      // All time - use a very early date
      startDate.setFullYear(2020, 0, 1)
    }

    return { startDate, endDate }
  }

  // Determine interval based on date range or use selected interval
  const getCalculatedInterval = () => {
    // If interval is manually set, use it
    if (interval) {
      return interval
    }
    // Otherwise auto-determine based on date range
    if (dateRange === '7' || dateRange === '30') {
      return 'daily'
    } else if (dateRange === '90') {
      return 'weekly'
    } else {
      return 'monthly'
    }
  }

  // Fetch all analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const { startDate, endDate } = getDateRange()
        const calculatedInterval = getCalculatedInterval()

        const startDateStr = startDate.toISOString().split('T')[0]
        const endDateStr = endDate.toISOString().split('T')[0]

        // Fetch all data in parallel
        const [
          userGrowthRes,
          freelancerGrowthRes,
          userDistributionRes,
          verificationTrendsRes,
          categoryTrendsRes,
        ] = await Promise.all([
          get(`/admin/analytics/user-growth?startDate=${startDateStr}&endDate=${endDateStr}&interval=${calculatedInterval}`),
          get(`/admin/analytics/freelancer-growth?startDate=${startDateStr}&endDate=${endDateStr}&interval=${calculatedInterval}`),
          get('/admin/analytics/user-distribution'),
          get(`/admin/analytics/verification-trends?startDate=${startDateStr}&endDate=${endDateStr}`),
          get(`/admin/analytics/category-trends?startDate=${startDateStr}&endDate=${endDateStr}`),
        ])

        if (userGrowthRes.success) setUserGrowth(userGrowthRes.data)
        if (freelancerGrowthRes.success) setFreelancerGrowth(freelancerGrowthRes.data)
        if (userDistributionRes.success) setUserDistribution(userDistributionRes.data)
        if (verificationTrendsRes.success) setVerificationTrends(verificationTrendsRes.data)
        if (categoryTrendsRes.success) setCategoryTrends(categoryTrendsRes.data)
      } catch (err) {
        console.error('Error fetching analytics:', err)
        setError(err.message || 'Failed to load analytics data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [dateRange, interval])

  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0'
    return num.toLocaleString('en-US')
  }

  const formatGrowth = (growth) => {
    if (growth === null || growth === undefined) return '+0%'
    const sign = growth >= 0 ? '+' : ''
    return `${sign}${growth.toFixed(1)}%`
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 
          style={{ fontFamily: 'var(--font-family-poppins)' }} 
          className="text-3xl font-bold mb-2"
        >
          Analytics
        </h1>
        <p className="text-lg text-text-secondary">
          Platform metrics and growth trends
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle style={{ fontFamily: 'var(--font-family-poppins)' }}>
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FilterDropdown
              label="Date Range"
              value={dateRange}
              onChange={setDateRange}
              options={[
                { value: '7', label: 'Last 7 days' },
                { value: '30', label: 'Last 30 days' },
                { value: '90', label: 'Last 90 days' },
                { value: 'all', label: 'All Time' },
              ]}
            />
            <FilterDropdown
              label="Interval"
              value={interval}
              onChange={setInterval}
              options={[
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <LoadingSpinner message="Loading analytics data..." />
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      ) : (
        <>
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-100">
                    <Users size={24} className="text-blue-600" />
                  </div>
                </div>
                <CardTitle className="text-lg text-text-secondary mb-1" style={{ fontFamily: 'var(--font-family-poppins)' }}>
                  Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold" style={{ fontFamily: 'var(--font-family-poppins)' }}>
                  {formatNumber(userGrowth?.total || userDistribution?.total || 0)}
                </p>
                {userGrowth?.growth !== undefined && (
                  <p className="text-sm text-green-600 mt-1">
                    {formatGrowth(userGrowth.growth)} growth
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#14B8A615' }}>
                    <Briefcase size={24} style={{ color: '#14B8A6' }} />
                  </div>
                </div>
                <CardTitle className="text-lg text-text-secondary mb-1" style={{ fontFamily: 'var(--font-family-poppins)' }}>
                  Total Freelancers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold" style={{ fontFamily: 'var(--font-family-poppins)' }}>
                  {formatNumber(freelancerGrowth?.total || userDistribution?.freelancers || 0)}
                </p>
                {freelancerGrowth?.growth !== undefined && (
                  <p className="text-sm text-green-600 mt-1">
                    {formatGrowth(freelancerGrowth.growth)} growth
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-100">
                    <Users size={24} className="text-blue-600" />
                  </div>
                </div>
                <CardTitle className="text-lg text-text-secondary mb-1" style={{ fontFamily: 'var(--font-family-poppins)' }}>
                  Customers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold" style={{ fontFamily: 'var(--font-family-poppins)' }}>
                  {formatNumber(userDistribution?.customers || 0)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-purple-100">
                    <TrendingUp size={24} className="text-purple-600" />
                  </div>
                </div>
                <CardTitle className="text-lg text-text-secondary mb-1" style={{ fontFamily: 'var(--font-family-poppins)' }}>
                  User Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold" style={{ fontFamily: 'var(--font-family-poppins)' }}>
                  {formatGrowth(userGrowth?.growth || 0)}
                </p>
                <p className="text-sm text-text-tertiary mt-1">
                  Over selected period
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* User Growth Chart */}
            <Card>
              <CardHeader>
                <CardTitle style={{ fontFamily: 'var(--font-family-poppins)' }}>
                  User Growth Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UserGrowthChart data={userGrowth} />
              </CardContent>
            </Card>

            {/* Freelancer Growth Chart */}
            <Card>
              <CardHeader>
                <CardTitle style={{ fontFamily: 'var(--font-family-poppins)' }}>
                  Freelancer Growth Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FreelancerGrowthChart data={freelancerGrowth} />
              </CardContent>
            </Card>

            {/* User Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle style={{ fontFamily: 'var(--font-family-poppins)' }}>
                  User Type Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UserTypeDistributionChart data={userDistribution} />
              </CardContent>
            </Card>

            {/* Verification Trends */}
            <Card>
              <CardHeader>
                <CardTitle style={{ fontFamily: 'var(--font-family-poppins)' }}>
                  Verification Status Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <VerificationTrendsChart data={verificationTrends} />
              </CardContent>
            </Card>
          </div>

          {/* Category Popularity - Full Width */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle style={{ fontFamily: 'var(--font-family-poppins)' }}>
                Category Popularity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryPopularityChart data={categoryTrends} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

export default AnalyticsPage

