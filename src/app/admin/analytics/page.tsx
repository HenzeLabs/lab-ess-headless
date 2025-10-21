import dynamic from 'next/dynamic';

const UserBehaviorAnalytics = dynamic(
  () => import('@/components/admin/UserBehaviorAnalytics'),
  {
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading analytics...</div>
      </div>
    ),
  },
);

export default function AnalyticsPage() {
  return <UserBehaviorAnalytics />;
}
