// Lazy-loaded so recharts only ships when the Insights tab opens.
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell as C,
} from 'recharts'

const SEV = { high: '#f4708a', medium: '#f5b74e', low: '#57d99a' }
const PALETTE = ['#8b7cf6', '#38d9d4', '#6d8bf5', '#f5b74e', '#f4708a', '#57d99a']

const tooltipStyle = {
  background: '#161a2b', border: '1px solid #2a3050', borderRadius: 9, color: '#eef1fa', fontSize: 12,
}

export default function Charts({ type, data }) {
  if (type === 'severity') {
    return (
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <XAxis dataKey="name" stroke="#7e85a8" fontSize={12} />
          <YAxis stroke="#7e85a8" fontSize={12} allowDecimals={false} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(139,124,246,.08)' }} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {data.map((d, i) => <Cell key={i} fill={SEV[d.name] || '#8b7cf6'} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    )
  }
  if (type === 'evidence') {
    return (
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={72} innerRadius={42} paddingAngle={3}>
            {data.map((d, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
        </PieChart>
      </ResponsiveContainer>
    )
  }
  // rice
  return (
    <ResponsiveContainer width="100%" height={Math.max(160, data.length * 44)}>
      <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
        <XAxis type="number" stroke="#7e85a8" fontSize={12} />
        <YAxis type="category" dataKey="name" stroke="#7e85a8" fontSize={12} width={120} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(139,124,246,.08)' }} />
        <Bar dataKey="RICE" radius={[0, 6, 6, 0]}>
          {data.map((d, i) => <C key={i} fill={PALETTE[i % PALETTE.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
