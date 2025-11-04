'use client';

interface NoDataAvailableProps {
  title?: string;
  message?: string;
  showTroubleshooting?: boolean;
  className?: string;
}

export default function NoDataAvailable({
  title = 'No Data Available',
  message = 'Analytics data is currently unavailable. This may be due to API configuration issues or lack of recent traffic.',
  showTroubleshooting = true,
  className = '',
}: NoDataAvailableProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 ${className}`}
    >
      <div className="mb-4">
        <svg
          className="w-16 h-16 text-gray-400 mx-auto"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 max-w-md mb-4">{message}</p>

      {showTroubleshooting && (
        <details className="mt-4 text-left w-full max-w-md">
          <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 mb-2">
            Troubleshooting Steps
          </summary>
          <div className="text-sm text-gray-600 space-y-2 pl-4">
            <p className="font-medium">Common causes:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>GA4 API credentials not configured</li>
              <li>Service account lacks GA4 property access</li>
              <li>No recent traffic in the selected date range</li>
              <li>GA4 Property ID mismatch</li>
            </ul>

            <p className="font-medium mt-3">Solutions:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Check browser console for error messages</li>
              <li>Verify <code className="bg-gray-200 px-1 rounded">GOOGLE_APPLICATION_CREDENTIALS</code> is set</li>
              <li>
                Ensure <code className="bg-gray-200 px-1 rounded">GA4_PROPERTY_ID</code> is correct
              </li>
              <li>Verify service account has "Viewer" role in GA4</li>
              <li>Try selecting a wider date range</li>
            </ul>

            <p className="font-medium mt-3">Still not working?</p>
            <p>
              Run the verification script:{' '}
              <code className="bg-gray-200 px-1 rounded text-xs">
                node scripts/verify-analytics-accuracy.mjs
              </code>
            </p>
          </div>
        </details>
      )}

      <button
        onClick={() => window.location.reload()}
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
      >
        Retry
      </button>
    </div>
  );
}
