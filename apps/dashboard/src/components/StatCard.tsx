import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  color?: 'green' | 'blue' | 'purple' | 'amber';
  description?: string;
}

const COLOR_MAP = {
  green: {
    bg: 'bg-green-50',
    icon: 'bg-green-100 text-green-600',
    text: 'text-green-600',
    badge: 'bg-green-100 text-green-700',
  },
  blue: {
    bg: 'bg-blue-50',
    icon: 'bg-blue-100 text-blue-600',
    text: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-700',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'bg-purple-100 text-purple-600',
    text: 'text-purple-600',
    badge: 'bg-purple-100 text-purple-700',
  },
  amber: {
    bg: 'bg-amber-50',
    icon: 'bg-amber-100 text-amber-600',
    text: 'text-amber-600',
    badge: 'bg-amber-100 text-amber-700',
  },
};

export default function StatCard({ label, value, icon: Icon, trend, color = 'green', description }: StatCardProps) {
  const colors = COLOR_MAP[color];

  return (
    <div className="card p-6 flex flex-col gap-4 animate-slide-up">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 ${colors.icon} rounded-xl flex items-center justify-center flex-shrink-0`}>
          <Icon size={18} />
        </div>
        {trend && (
          <span className={`${colors.badge} text-xs font-semibold px-2 py-1 rounded-full`}>
            +{trend.value}% {trend.label}
          </span>
        )}
      </div>
      <div>
        <p className="text-3xl font-bold text-slate-900 tracking-tight">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="text-sm font-medium text-slate-500 mt-1">{label}</p>
        {description && (
          <p className="text-xs text-slate-400 mt-1">{description}</p>
        )}
      </div>
    </div>
  );
}
