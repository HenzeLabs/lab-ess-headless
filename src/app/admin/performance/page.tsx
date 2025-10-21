import dynamic from 'next/dynamic';

const PerformanceDashboard = dynamic(
  () => import('@/components/admin/PerformanceDashboard'),
  {
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading performance dashboard...</div>
      </div>
    ),
  },
);

export default function PerformancePage() {
  return <PerformanceDashboard />;
}
