import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

const UserTypeDistributionChart = ({ data }) => {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-text-tertiary">
        No data available
      </div>
    )
  }

  const chartData = [
    { name: 'Customers', value: data.customers, color: '#3B82F6' },
    { name: 'Freelancers', value: data.freelancers, color: '#14B8A6' },
  ]

  const total = data.total || 0

  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #E5E5E5',
            borderRadius: '8px',
            fontFamily: 'var(--font-family-inter)',
          }}
          formatter={(value) => [`${value} users`, 'Count']}
        />
        <Legend
          wrapperStyle={{ fontFamily: 'var(--font-family-inter)', fontSize: '14px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

export default UserTypeDistributionChart

