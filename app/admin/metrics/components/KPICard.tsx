'use client';

interface KPICardProps {
  title: string;
  value: string;
  change: number;
  icon: string;
  trend: 'up' | 'down';
}

export default function KPICard({
  title,
  value,
  change,
  icon,
  trend,
}: KPICardProps) {
  const isPositive =
    (trend === 'up' && change > 0) || (trend === 'down' && change < 0);
  const changeColor = isPositive ? 'text-green-600' : 'text-red-600';
  const changeBgColor = isPositive ? 'bg-green-50' : 'bg-red-50';

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          <div className="flex items-center gap-1 mt-2">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${changeBgColor} ${changeColor}`}
            >
              {change > 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
            </span>
            <span className="text-xs text-gray-500">vs last period</span>
          </div>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );
}
