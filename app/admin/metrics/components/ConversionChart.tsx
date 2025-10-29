'use client';

import {
  BarChart,
  Bar,
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

interface ConversionChartProps {
  data: GA4Data | null;
}

export default function ConversionChart({ data }: ConversionChartProps) {
  // Generate mock conversion funnel data
  const generateFunnelData = (sessions: number, conversionRate: number) => {
    const conversions = Math.round(sessions * (conversionRate / 100));
    const addToCart = Math.round(sessions * 0.15); // 15% add to cart
    const checkout = Math.round(sessions * 0.08); // 8% reach checkout

    return [
      { stage: 'Sessions', count: sessions, percentage: 100 },
      {
        stage: 'Add to Cart',
        count: addToCart,
        percentage: ((addToCart / sessions) * 100).toFixed(1),
      },
      {
        stage: 'Checkout',
        count: checkout,
        percentage: ((checkout / sessions) * 100).toFixed(1),
      },
      {
        stage: 'Conversions',
        count: conversions,
        percentage: conversionRate.toFixed(1),
      },
    ];
  };

  const chartData = data
    ? generateFunnelData(data.sessions, data.conversionRate)
    : [];

  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🎯 Conversion Funnel
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
            🎯 Conversion Funnel
          </h3>
          <p className="text-sm text-gray-600 mt-1">User journey breakdown</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-600">Conversion Rate</p>
          <p className="text-2xl font-bold text-green-600">
            {data.conversionRate.toFixed(1)}%
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis type="number" stroke="#6b7280" style={{ fontSize: '12px' }} />
          <YAxis
            dataKey="stage"
            type="category"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            width={90}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '8px 12px',
            }}
            formatter={(value: any, _name: string, props: any) => [
              `${value.toLocaleString()} (${props.payload.percentage}%)`,
              'Users',
            ]}
          />
          <Bar dataKey="count" fill="#10b981" radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-600 mb-1">Bounce Rate</p>
            <p className="text-lg font-bold text-orange-600">
              {data.bounceRate.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Avg Session Duration</p>
            <p className="text-lg font-bold text-blue-600">
              {Math.floor(data.avgSessionDuration / 60)}m{' '}
              {Math.floor(data.avgSessionDuration % 60)}s
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Pages/Session</p>
            <p className="text-lg font-bold text-purple-600">
              {(data.pageViews / data.sessions).toFixed(1)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
