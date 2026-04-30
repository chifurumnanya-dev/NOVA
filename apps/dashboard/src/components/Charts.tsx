'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';

const STATE_DATA = [
  { state: 'Lagos', count: 1420 },
  { state: 'Kano', count: 980 },
  { state: 'Rivers', count: 850 },
  { state: 'Oyo', count: 730 },
  { state: 'FCT', count: 620 },
  { state: 'Kaduna', count: 590 },
  { state: 'Enugu', count: 480 },
  { state: 'Delta', count: 460 },
  { state: 'Imo', count: 430 },
  { state: 'Anambra', count: 410 },
].slice(0, 8);

const TYPE_DATA = [
  { name: 'Primary Health Centre', value: 4200 },
  { name: 'General Hospital', value: 2100 },
  { name: 'Private Hospital', value: 1800 },
  { name: 'Pharmacy', value: 1200 },
  { name: 'Specialist Hospital', value: 450 },
  { name: 'Other', value: 250 },
];

const COLORS = ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0', '#dcfce7'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-lg text-sm">
        <p className="font-semibold text-slate-800">{label}</p>
        <p className="text-green-600 font-medium">{payload[0].value.toLocaleString()} facilities</p>
      </div>
    );
  }
  return null;
};

export function FacilitiesByStateChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={STATE_DATA} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="state"
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${(v / 1000).toFixed(v >= 1000 ? 1 : 0)}${v >= 1000 ? 'k' : ''}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
          {STATE_DATA.map((_, i) => (
            <Cell
              key={i}
              fill={i === 0 ? '#16a34a' : i < 3 ? '#22c55e' : '#86efac'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

const PieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-lg text-sm">
        <p className="font-semibold text-slate-800">{payload[0].name}</p>
        <p className="text-green-600 font-medium">{payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export function FacilitiesByTypeChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={TYPE_DATA}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
        >
          {TYPE_DATA.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<PieTooltip />} />
        <Legend
          formatter={(value) => (
            <span style={{ fontSize: 11, color: '#64748b' }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
