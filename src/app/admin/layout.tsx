import { ReactNode } from 'react';
import Link from 'next/link';

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // In production, verify authentication here
  // For now, this is open for development
  // TODO: Add session verification in production

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Lab Essentials Admin
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Configuration Management System
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/admin/config"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                Configurations
              </Link>
              <Link
                href="/admin/metrics"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                Metrics
              </Link>
              <Link
                href="/"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                Back to Site
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
      <footer className="mt-auto py-6 text-center text-sm text-gray-500">
        <p>Lab Essentials Configuration Management v1.0</p>
        <p className="mt-1">Phase 2: Admin Dashboard</p>
      </footer>
    </div>
  );
}
