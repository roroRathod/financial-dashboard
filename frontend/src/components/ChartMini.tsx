import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type ChartMiniProps = { data: { date: string; close: number }[] }

export function ChartMini({ data }: ChartMiniProps) {
  if (!data || data.length === 0) return <div className="h-32 flex items-center justify-center text-slate-500 text-sm">No data</div>
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
          <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
          <Tooltip />
          <Line type="monotone" dataKey="close" stroke="#3b82f6" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
