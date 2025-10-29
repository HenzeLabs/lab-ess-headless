'use client';

interface ClarityData {
  totalSessions: number;
  deadClicks: number;
  rageClicks: number;
  quickBacks: number;
  avgScrollDepth: number;
}

interface BehaviorHighlightsProps {
  data: ClarityData | null;
}

export default function BehaviorHighlights({ data }: BehaviorHighlightsProps) {
  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          👥 User Behavior Highlights
        </h3>
        <p className="text-sm text-gray-600">
          Clarity data unavailable. Configure CLARITY_PROJECT_ID to view user
          behavior metrics.
        </p>
      </div>
    );
  }

  const { totalSessions, deadClicks, rageClicks, quickBacks, avgScrollDepth } =
    data;

  // Calculate rates
  const deadClickRate = ((deadClicks / totalSessions) * 100).toFixed(2);
  const rageClickRate = ((rageClicks / totalSessions) * 100).toFixed(2);
  const quickBackRate = ((quickBacks / totalSessions) * 100).toFixed(2);

  // Determine health status
  const getHealthStatus = (
    rate: number,
    thresholds: { good: number; warning: number },
  ) => {
    if (rate < thresholds.good)
      return { status: 'Excellent', color: 'green', icon: '✅' };
    if (rate < thresholds.warning)
      return { status: 'Good', color: 'yellow', icon: '⚠️' };
    return { status: 'Needs Attention', color: 'red', icon: '🔴' };
  };

  const deadClickHealth = getHealthStatus(parseFloat(deadClickRate), {
    good: 2,
    warning: 5,
  });
  const rageClickHealth = getHealthStatus(parseFloat(rageClickRate), {
    good: 0.5,
    warning: 2,
  });
  const quickBackHealth = getHealthStatus(parseFloat(quickBackRate), {
    good: 5,
    warning: 10,
  });

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            👥 User Behavior Highlights
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Powered by Microsoft Clarity • {totalSessions.toLocaleString()}{' '}
            sessions analyzed
          </p>
        </div>
        <a
          href={`https://clarity.microsoft.com/projects/view/${process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || 'your-project'}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          View in Clarity
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Dead Clicks */}
        <BehaviorCard
          title="Dead Clicks"
          description="Clicks on non-interactive elements"
          count={deadClicks}
          rate={deadClickRate}
          health={deadClickHealth}
          helpText="Users clicked expecting interaction but nothing happened. Consider adding hover states or making elements interactive."
        />

        {/* Rage Clicks */}
        <BehaviorCard
          title="Rage Clicks"
          description="Rapid repeated clicks indicating frustration"
          count={rageClicks}
          rate={rageClickRate}
          health={rageClickHealth}
          helpText="Users are frustrated, clicking multiple times rapidly. This often indicates broken functionality or slow response times."
        />

        {/* Quick Backs */}
        <BehaviorCard
          title="Quick Backs"
          description="Users who left within 5 seconds"
          count={quickBacks}
          rate={quickBackRate}
          health={quickBackHealth}
          helpText="Users left almost immediately. Check if landing pages match user expectations and load quickly."
        />
      </div>

      {/* Scroll Depth Visualization */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-sm font-semibold text-gray-900">
              Average Scroll Depth
            </h4>
            <p className="text-xs text-gray-600 mt-1">
              How far users scroll down the page
            </p>
          </div>
          <span className="text-2xl font-bold text-blue-600">
            {avgScrollDepth.toFixed(0)}%
          </span>
        </div>
        <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${avgScrollDepth}%` }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium text-white drop-shadow">
              Users scroll {avgScrollDepth.toFixed(0)}% of page content
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {avgScrollDepth > 75
            ? '✅ Excellent engagement - users are reading most of your content'
            : avgScrollDepth > 50
              ? '👍 Good engagement - users are exploring your pages'
              : '⚠️ Low engagement - consider moving important content higher up'}
        </p>
      </div>
    </div>
  );
}

interface BehaviorCardProps {
  title: string;
  description: string;
  count: number;
  rate: string;
  health: { status: string; color: string; icon: string };
  helpText: string;
}

function BehaviorCard({
  title,
  description,
  count,
  rate,
  health,
  helpText,
}: BehaviorCardProps) {
  const colorClasses = {
    green: 'border-green-200 bg-green-50',
    yellow: 'border-yellow-200 bg-yellow-50',
    red: 'border-red-200 bg-red-50',
  };

  const textColorClasses = {
    green: 'text-green-900',
    yellow: 'text-yellow-900',
    red: 'text-red-900',
  };

  return (
    <div
      className={`border-2 rounded-lg p-4 ${colorClasses[health.color as keyof typeof colorClasses]}`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
        <span className="text-lg">{health.icon}</span>
      </div>
      <p className="text-xs text-gray-600 mb-3">{description}</p>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-2xl font-bold text-gray-900">
          {count.toLocaleString()}
        </span>
        <span
          className={`text-sm font-medium ${textColorClasses[health.color as keyof typeof textColorClasses]}`}
        >
          {rate}%
        </span>
      </div>
      <div
        className={`px-2 py-1 rounded text-xs font-medium ${textColorClasses[health.color as keyof typeof textColorClasses]} mb-3`}
      >
        {health.status}
      </div>
      <details className="text-xs text-gray-600">
        <summary className="cursor-pointer hover:text-gray-900 font-medium">
          What does this mean?
        </summary>
        <p className="mt-2 text-xs leading-relaxed">{helpText}</p>
      </details>
    </div>
  );
}
