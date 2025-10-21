import { LoadingSpinner, PulseAnimation } from '@/components/ui/animations';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center">
        <PulseAnimation className="mb-8">
          <div className="w-24 h-24 bg-[hsl(var(--brand-dark))] rounded-full flex items-center justify-center mx-auto">
            <LoadingSpinner className="w-8 h-8 text-white" />
          </div>
        </PulseAnimation>

        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Loading Lab Essentials
        </h2>

        <p className="text-gray-600">
          Preparing your premium lab experience...
        </p>

        {/* Loading dots animation */}
        <div className="flex justify-center mt-6 space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-[hsl(var(--brand-dark))] rounded-full animate-pulse"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1s',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
