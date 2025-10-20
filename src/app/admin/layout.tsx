import AdminLayout from '@/components/admin/AdminLayout';
import AdminAuthWrapper from '@/components/admin/AdminAuthWrapper';
import FooterServer from '@/components/FooterServer';
import { ErrorBoundary } from '@/components/error-boundaries/ErrorBoundary';

export default function AdminLayoutPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdminAuthWrapper>
        <AdminLayout>{children}</AdminLayout>
      </AdminAuthWrapper>
      <ErrorBoundary level="component" context="footer">
        <div
          style={{
            position: 'fixed',
            left: 280,
            right: 0,
            bottom: 0,
            zIndex: 40,
          }}
          aria-hidden={false}
        >
          <div className="max-w-7xl mx-auto">
            <FooterServer />
          </div>
        </div>
      </ErrorBoundary>
    </>
  );
}
