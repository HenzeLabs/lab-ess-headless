'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface GA4Data {
  pageViews: number;
  sessions: number;
  users: number;
  bounceRate: number;
  avgSessionDuration: number;
  conversionRate: number;
  realtimeUsers: number;
}

interface SessionsChartProps {
  data: GA4Data | null;
}

export default function SessionsChart({ data }: SessionsChartProps) {
  // Generate mock trend data for the chart
  const generateTrendData = (baseValue: number) => {
    const days = 7;
    return Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      const variation = (Math.random() - 0.5) * 0.3; // ±15% variation
      return {
        date: date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        sessions: Math.round(baseValue * (1 + variation)),
        users: Math.round(baseValue * 0.7 * (1 + variation)),
      };
    });
  };

  const chartData = data
    ? generateTrendData(data.sessions / 7) // Distribute sessions across 7 days
    : [];

  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📊 Sessions & Users Trend
        </h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          <p className="text-sm">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            📊 Sessions & Users Trend
          </h3>
          <p className="text-sm text-gray-600 mt-1">Last 7 days</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-gray-600">Sessions</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span className="text-gray-600">Users</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
          <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '8px 12px',
            }}
          />
          <Area
            type="monotone"
            dataKey="sessions"
            stroke="#3b82f6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorSessions)"
          />
          <Area
            type="monotone"
            dataKey="users"
            stroke="#a855f7"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorUsers)"
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-600">Total Sessions</p>
          <p className="text-2xl font-bold text-blue-600">
            {data.sessions.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Unique Users</p>
          <p className="text-2xl font-bold text-purple-600">
            {data.users.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
