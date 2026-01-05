import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const VerificationTrendsChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-text-tertiary">
        No data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <defs>
          <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="colorRejected" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
        <XAxis
          dataKey="date"
          stroke="#5E5E5E"
          style={{ fontFamily: 'var(--font-family-inter)' }}
          tick={{ fontSize: 12 }}
        />
        <YAxis
          stroke="#5E5E5E"
          style={{ fontFamily: 'var(--font-family-inter)' }}
          tick={{ fontSize: 12 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #E5E5E5',
            borderRadius: '8px',
            fontFamily: 'var(--font-family-inter)',
          }}
          labelStyle={{ fontWeight: 600, marginBottom: '4px' }}
        />
        <Legend
          wrapperStyle={{ fontFamily: 'var(--font-family-inter)', fontSize: '14px' }}
        />
        <Area
          type="monotone"
          dataKey="pending"
          stackId="1"
          stroke="#F59E0B"
          fill="url(#colorPending)"
          name="Pending"
        />
        <Area
          type="monotone"
          dataKey="verified"
          stackId="1"
          stroke="#10B981"
          fill="url(#colorVerified)"
          name="Verified"
        />
        <Area
          type="monotone"
          dataKey="rejected"
          stackId="1"
          stroke="#EF4444"
          fill="url(#colorRejected)"
          name="Rejected"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default VerificationTrendsChart

