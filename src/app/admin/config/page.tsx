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

      {/* What is this page? Info banner */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-6 rounded-r-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-6 w-6 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              What is this page?
            </h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p>
                <strong>This is your website&apos;s control panel.</strong> You
                can change important settings instantly without touching any
                code or waiting for a deployment.
              </p>
              <div className="mt-3 space-y-1">
                <p>
                  <strong>📝 SEO Settings:</strong> Change your site title,
                  description, and social media info (what shows up on Google
                  and social shares)
                </p>
                <p>
                  <strong>🔒 Security Settings:</strong> Control how many times
                  people can access different parts of your site (protects
                  against bots and attackers)
                </p>
              </div>
              <p className="mt-3 pt-3 border-t border-blue-200">
                <strong>Example:</strong> If someone is attacking your site, you
                can click &quot;Edit&quot; on a security setting and reduce the
                number from 100 to 10. This limits how fast they can hit your
                server, and it happens <em>instantly</em> - no technical skills
                needed!
              </p>
              <p className="mt-2 text-xs text-blue-700">
                💡 <strong>Tip:</strong> Every change you make is tracked (who,
                when, what) and can be undone by clicking &quot;History&quot;
                then &quot;Revert&quot;.
              </p>
            </div>
          </div>
        </div>
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
