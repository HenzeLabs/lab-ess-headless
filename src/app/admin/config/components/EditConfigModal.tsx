'use client';

import { useState } from 'react';
import { ConfigRecord } from '@/lib/configStore';

interface EditConfigModalProps {
  config: ConfigRecord;
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string, value: string) => Promise<void>;
}

// Protected keys that cannot be edited from the UI
const PROTECTED_KEYS = [
  'CONFIG_ADMIN_TOKEN',
  'ADMIN_TOKEN',
  'NEXT_PUBLIC_GA_MEASUREMENT_ID',
];

// Helper descriptions for config keys (plain English)
const CONFIG_DESCRIPTIONS: Record<string, string> = {
  'seo.siteName':
    "Your site's name that appears in browser tabs and search results",
  'seo.siteUrl': 'The main URL of your website (e.g., https://lab-essentials.com)',
  'seo.defaultTitle':
    'Default page title shown on Google and browser tabs when a specific page title is not set',
  'seo.defaultDescription':
    'Short description of your site that appears in Google search results',
  'seo.defaultImage':
    'Image that appears when someone shares your site on social media',
  'seo.twitterHandle': 'Your Twitter/X username (e.g., @LabEssentials)',
  'security.rateLimit.admin.maxRequests':
    'How many times per minute someone can access admin pages (lower = more protection against attacks, but may block rapid legitimate use)',
  'security.rateLimit.admin.windowMs':
    'Time window in milliseconds (60000 = 1 minute) - how long to track requests before resetting the count',
  'security.rateLimit.auth.maxRequests':
    'How many login attempts allowed per time window (lower = harder for hackers to guess passwords)',
  'security.rateLimit.cart.maxRequests':
    'How many times per minute someone can add/remove items from cart (prevents bots from spamming your cart system)',
  'security.rateLimit.api.maxRequests':
    'How many API calls per minute allowed (general limit for backend requests)',
  'security.rateLimit.search.maxRequests':
    'How many search queries per minute allowed (prevents search spam)',
  'security.rateLimit.default.maxRequests':
    'Default limit for any page not covered by other limits (fallback protection)',
};

function getConfigDescription(key: string): string | null {
  // Exact match
  if (CONFIG_DESCRIPTIONS[key]) {
    return CONFIG_DESCRIPTIONS[key];
  }

  // Pattern matching for rate limits
  if (key.includes('maxRequests')) {
    return 'Maximum number of requests allowed per time window. Lower numbers = stricter protection.';
  }
  if (key.includes('windowMs')) {
    return 'Time window in milliseconds. 60000 = 1 minute, 900000 = 15 minutes.';
  }

  // SEO fields
  if (key.startsWith('seo.')) {
    return 'Controls what information appears in search engines and social media.';
  }

  // Security fields
  if (key.startsWith('security.')) {
    return 'Security setting that helps protect your site from bots and attacks.';
  }

  return null;
}

export default function EditConfigModal({
  config,
  isOpen,
  onClose,
  onSave,
}: EditConfigModalProps) {
  const [value, setValue] = useState(config.value);
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState('');

  if (!isOpen) return null;

  const isProtected = PROTECTED_KEYS.some((key) => config.key.includes(key));

  const validateValue = (val: string): boolean => {
    setValidationError('');

    // Required field
    if (!val || val.trim() === '') {
      setValidationError('Value cannot be empty');
      return false;
    }

    // Validate numeric fields
    if (config.key.includes('maxRequests') || config.key.includes('windowMs')) {
      const num = Number(val);
      if (isNaN(num) || num <= 0) {
        setValidationError('Must be a positive number');
        return false;
      }
    }

    // Validate URL fields
    if (config.key.includes('Url') || config.key.includes('url')) {
      try {
        new URL(val);
      } catch {
        setValidationError('Must be a valid URL');
        return false;
      }
    }

    // Validate boolean fields
    if (config.key.includes('enabled') || config.key.includes('noindex')) {
      if (val !== 'true' && val !== 'false') {
        setValidationError('Must be "true" or "false"');
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateValue(value)) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave(config.key, value);
      onClose();
    } catch (error) {
      setValidationError(
        error instanceof Error ? error.message : 'Failed to save configuration',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && e.metaKey) {
      handleSave();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full"
          onKeyDown={handleKeyDown}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3
                  className="text-lg font-semibold text-gray-900"
                  id="modal-title"
                >
                  {isProtected ? 'View Configuration' : 'Edit Configuration'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {isProtected
                    ? 'This parameter is protected and cannot be edited from the UI'
                    : 'Update the parameter value'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-4 space-y-4">
            {/* Description Helper */}
            {getConfigDescription(config.key) && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-blue-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-800">
                      <strong>What this controls:</strong>{' '}
                      {getConfigDescription(config.key)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Key (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parameter Key
              </label>
              <input
                type="text"
                value={config.key}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>

            {/* Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Value {!isProtected && <span className="text-red-500">*</span>}
              </label>
              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                disabled={isProtected}
                rows={4}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isProtected
                    ? 'bg-gray-50 text-gray-500 cursor-not-allowed border-gray-300'
                    : validationError
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300'
                }`}
                placeholder="Enter value..."
              />
              {validationError && (
                <p className="mt-2 text-sm text-red-600">{validationError}</p>
              )}
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">
                  Last Updated By
                </p>
                <p className="text-sm text-gray-900 mt-1">
                  {config.updated_by}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">
                  Last Updated
                </p>
                <p className="text-sm text-gray-900 mt-1">
                  {new Date(config.updated_at).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">
                  Version
                </p>
                <p className="text-sm text-gray-900 mt-1">v{config.version}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">
                  Category
                </p>
                <p className="text-sm text-gray-900 mt-1">
                  {config.key.split('.')[0].toUpperCase()}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {!isProtected && 'Press Cmd+Enter to save, Esc to cancel'}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                {isProtected ? 'Close' : 'Cancel'}
              </button>
              {!isProtected && (
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
