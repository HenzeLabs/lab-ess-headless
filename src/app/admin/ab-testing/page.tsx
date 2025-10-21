import dynamic from 'next/dynamic';

const ABTestingDashboard = dynamic(
  () => import('@/components/admin/ABTestingDashboard'),
  {
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading A/B testing dashboard...</div>
      </div>
    ),
  },
);

export default function ABTestingPage() {
  return <ABTestingDashboard />;
}
