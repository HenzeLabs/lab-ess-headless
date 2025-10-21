import dynamic from 'next/dynamic';

const SecurityComplianceDashboard = dynamic(
  () => import('@/components/admin/SecurityComplianceDashboard'),
  {
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading security dashboard...</div>
      </div>
    ),
  },
);

export default function SecurityPage() {
  return <SecurityComplianceDashboard />;
}
