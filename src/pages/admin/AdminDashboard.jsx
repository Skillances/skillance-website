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
  const [isLoading, setIsLoading] = useState(true)
  
  // Mock data for the main chart
  const growthData = [
    { name: 'Jan', users: 400, freelancers: 240 },
    { name: 'Feb', users: 300, freelancers: 139 },
    { name: 'Mar', users: 200, freelancers: 980 },
    { name: 'Apr', users: 278, freelancers: 390 },
    { name: 'May', users: 189, freelancers: 480 },
    { name: 'Jun', users: 239, freelancers: 380 },
    { name: 'Jul', users: 349, freelancers: 430 },
  ]

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        const response = await get('/admin/dashboard')
        
        if (response.success && response.data) {
          setDashboardData(response.data)
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        // We'll fall back to loading state or handle visually in components
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const metrics = dashboardData ? [
    {
      title: 'Total Revenue',
      value: 'R 45,231.89',
      change: '+20.1%',
      icon: TrendingUp,
      color: '#10B981', // Emerald
      data: Array.from({ length: 20 }, (_, i) => ({ value: 10 + i + Math.random() * 5 }))
    },
    {
      title: 'Active Users',
      value: dashboardData.users.total.toLocaleString(),
      change: '+12.5%',
      icon: Users,
      color: '#3B82F6', // Blue
      data: Array.from({ length: 20 }, (_, i) => ({ value: 20 + i + Math.random() * 10 }))
    },
    {
      title: 'Freelancers',
      value: dashboardData.freelancers.total.toLocaleString(),
      change: '+15.2%',
      icon: Briefcase,
      color: '#8B5CF6', // Violet
      data: Array.from({ length: 20 }, (_, i) => ({ value: 5 + i + Math.random() * 2 }))
    },
    {
      title: 'Pending Verifications',
      value: dashboardData.pendingVerifications.count.toLocaleString(),
      change: dashboardData.pendingVerifications.count > 0 ? '+4.3%' : '0%',
      icon: ShieldCheck,
      color: '#F59E0B', // Amber
      data: Array.from({ length: 20 }, (_, i) => ({ value: 30 - i + Math.random() * 5 }))
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

