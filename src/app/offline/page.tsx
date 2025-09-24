import Link from 'next/link';
import { textStyles, buttonStyles } from '@/lib/ui';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="max-w-md w-full text-center">
        {/* Offline Icon */}
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636l-12.728 12.728m0 0L5.636 18.364m12.728-12.728L18.364 18.364M12 2.25c5.385 0 9.75 4.365 9.75 9.75s-4.365 9.75-9.75 9.75S2.25 17.635 2.25 12 6.615 2.25 12 2.25z"
              />
            </svg>
          </div>
        </div>

        {/* Content */}
        <h1 className={`${textStyles.h2} text-gray-900 mb-4`}>
          You&apos;re Offline
        </h1>

        <p className="text-gray-600 mb-8 leading-relaxed">
          It looks like you&apos;re not connected to the internet. Don&apos;t
          worry - you can still browse some cached content or try reconnecting.
        </p>

        {/* Actions */}
        <div className="space-y-4">
          <button
            onClick={() => window.location.reload()}
            className={`${buttonStyles.primary} w-full`}
          >
            Try Again
          </button>

          <Link
            href="/"
            className={`${buttonStyles.outline} w-full inline-block`}
          >
            Go to Homepage
          </Link>
        </div>

        {/* Cached Content Note */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-700">
            💡 <strong>Pro tip:</strong> Some pages may still be available from
            your cache. Try navigating to recently visited pages.
          </p>
        </div>

        {/* Connection Status */}
        <div className="mt-6">
          <div id="connection-status" className="text-sm text-gray-500">
            <span className="inline-block w-2 h-2 bg-red-400 rounded-full mr-2"></span>
            Offline
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-blue-100 rounded-full opacity-20"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-purple-100 rounded-full opacity-20"></div>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Update connection status
            function updateConnectionStatus() {
              const statusElement = document.getElementById('connection-status');
              if (navigator.onLine) {
                statusElement.innerHTML = '<span class="inline-block w-2 h-2 bg-green-400 rounded-full mr-2"></span>Online';
                statusElement.className = 'text-sm text-green-600';
              } else {
                statusElement.innerHTML = '<span class="inline-block w-2 h-2 bg-red-400 rounded-full mr-2"></span>Offline';
                statusElement.className = 'text-sm text-red-600';
              }
            }

            // Listen for connection changes
            window.addEventListener('online', updateConnectionStatus);
            window.addEventListener('offline', updateConnectionStatus);
            
            // Auto-reload when back online
            window.addEventListener('online', () => {
              setTimeout(() => {
                if (navigator.onLine) {
                  window.location.reload();
                }
              }, 1000);
            });
          `,
        }}
      />
    </div>
  );
}
