import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const FreelancerGrowthChart = ({ data }) => {
  if (!data || !data.series || data.series.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-text-tertiary">
        No data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data.series} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
        <Line
          type="monotone"
          dataKey="count"
          stroke="#14B8A6"
          strokeWidth={2}
          name="New Freelancers"
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="cumulative"
          stroke="#0891B2"
          strokeWidth={2}
          name="Total Freelancers"
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default FreelancerGrowthChart

