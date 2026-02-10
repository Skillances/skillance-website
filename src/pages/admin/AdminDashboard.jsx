import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Users, Briefcase, ShieldCheck, UserCheck, CheckCircle, TrendingUp, Download, Calendar } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { get } from '@/utils/api'
import StatsCard from '@/components/admin/dashboard/StatsCard'
import ActivityFeed from '@/components/admin/dashboard/ActivityFeed'
import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

const AdminDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [dashboardData, setDashboardData] = useState(null)
  const [growthData, setGrowthData] = useState([])
  const [chartLoading, setChartLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch all dashboard data
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true)
        
        // Parallel fetch for speed
        const [dashboardRes, userGrowthRes, freelancerGrowthRes] = await Promise.all([
          get('/admin/dashboard'),
          get('/admin/analytics/user-growth?interval=daily'),
          get('/admin/analytics/freelancer-growth?interval=daily')
        ])

        if (dashboardRes.success && dashboardRes.data) {
          setDashboardData(dashboardRes.data)
        }

        // Process growth data for charts
        if (userGrowthRes.success && freelancerGrowthRes.success) {
          // Merge series by date
          const userSeries = userGrowthRes.data.data.series || []
          const freelancerSeries = freelancerGrowthRes.data.data.series || []
          
          // Create a map of all dates
          const dateMap = new Map()
          
          userSeries.forEach(item => {
            const date = new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            if (!dateMap.has(item.date)) dateMap.set(item.date, { name: date, date: item.date, users: 0, freelancers: 0 })
            dateMap.get(item.date).users = item.cumulative
          })

          freelancerSeries.forEach(item => {
             const date = new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
             if (!dateMap.has(item.date)) dateMap.set(item.date, { name: date, date: item.date, users: 0, freelancers: 0 })
             dateMap.get(item.date).freelancers = item.cumulative
          })

          // Convert map to array and sort by date
          const sortedData = Array.from(dateMap.values())
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            // Take only last 7-14 days for cleaner view if too many points
            .slice(-30)

           // If completely empty (fresh app), add some placeholder points to start the chart at 0
           if (sortedData.length === 0) {
             const today = new Date();
             for (let i = 6; i >= 0; i--) {
               const d = new Date(today);
               d.setDate(today.getDate() - i);
               sortedData.push({
                 name: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
                 users: 0, 
                 freelancers: 0
               })
             }
           }

          setGrowthData(sortedData)
        }
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
      } finally {
        setIsLoading(false)
        setChartLoading(false)
      }
    }

    fetchAllData()
  }, [])

  const metrics = dashboardData ? [
    {
      title: 'Active Users',
      value: dashboardData.users.total.toLocaleString(),
      change: dashboardData.users.newThisMonth > 0 ? `+${dashboardData.users.newThisMonth} this month` : '0% this month',
      icon: Users,
      color: '#3B82F6', // Blue
      data: growthData.map(d => ({ value: d.users })) // Real data for sparkline
    },
    {
      title: 'Freelancers',
      value: dashboardData.freelancers.total.toLocaleString(),
      change: `${((dashboardData.freelancers.verified / (dashboardData.freelancers.total || 1)) * 100).toFixed(0)}% verified`,
      icon: Briefcase,
      color: '#8B5CF6', // Violet
      data: growthData.map(d => ({ value: d.freelancers })) // Real data for sparkline
    },
    {
      title: 'Pending Verifications',
      value: dashboardData.pendingVerifications.count.toLocaleString(),
      change: dashboardData.pendingVerifications.count > 0 ? 'Action required' : 'All caught up',
      icon: ShieldCheck,
      color: '#F59E0B', // Amber
      data: Array.from({ length: 15 }, (_, i) => ({ value: Math.max(0, dashboardData.pendingVerifications.count + (Math.random() * 5 - 2)) })) // Semi-mock
    }
  ] : []

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-500"></div>
          <p className="text-slate-500 animate-pulse">Loading dashboard insights...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 p-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-slate-900 tracking-tight"
          >
            Dashboard
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 mt-1"
          >
            Welcome back, {user?.fullName || 'Admin'}. Here's what's happening today.
          </motion.p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="bg-white hover:bg-slate-50">
            <Calendar className="mr-2 h-4 w-4" />
            Last 30 Days
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <StatsCard key={metric.title} {...metric} index={index} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="xl:col-span-2"
        >
          <Card className="h-full border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">Platform Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={growthData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorFreelancers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontSize: '12px', fontWeight: 500 }}
                    />
                    <Area type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                    <Area type="monotone" dataKey="freelancers" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorFreelancers)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Activity Feed */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.5 }}
        >
          <ActivityFeed />
        </motion.div>
      </div>
    </div>
  )
}

export default AdminDashboard

