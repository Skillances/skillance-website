import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const CategoryPopularityChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-text-tertiary">
        No data available
      </div>
    )
  }

  // Aggregate by category
  const categoryMap = new Map()
  for (const item of data) {
    const existing = categoryMap.get(item.categoryName) || 0
    categoryMap.set(item.categoryName, existing + item.count)
  }

  // Convert to array and sort by count
  const chartData = Array.from(categoryMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10) // Top 10 categories

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
        <XAxis
          dataKey="name"
          stroke="#5E5E5E"
          style={{ fontFamily: 'var(--font-family-inter)' }}
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={100}
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
        <Bar dataKey="count" fill="#14B8A6" name="Freelancers" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default CategoryPopularityChart

