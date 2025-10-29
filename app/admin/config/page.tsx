import { getAllConfig } from '@/lib/configStore';
import ConfigTable from './components/ConfigTable';

export const metadata = {
  title: 'Configuration Management | Lab Essentials Admin',
  description: 'Manage runtime configuration parameters',
};

export default async function ConfigAdminPage() {
  // Fetch all configurations server-side
  const configs = getAllConfig();

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">
          Configuration Management
        </h2>
        <p className="mt-2 text-gray-600">
          Manage all runtime configuration parameters. Changes take effect
          immediately without deployment.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {configs.length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Total Parameters</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {configs.filter((c) => c.key.startsWith('seo.')).length}
            </div>
            <div className="text-sm text-gray-600 mt-1">SEO Parameters</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {configs.filter((c) => c.key.startsWith('security.')).length}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Security Parameters
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">
              {new Set(configs.map((c) => c.updated_by)).size}
            </div>
            <div className="text-sm text-gray-600 mt-1">Contributors</div>
          </div>
        </div>
      </div>

      <ConfigTable initialConfigs={configs} />
    </div>
  );
}
