'use client';

import { useState, useEffect } from 'react';
import { ConfigRecord } from '@/lib/configStore';

interface HistoryEntry {
  value: string;
  updated_by: string;
  updated_at: string;
  version: number;
  commit?: string;
  message?: string;
}

interface HistoryDrawerProps {
  config: ConfigRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onRevert: (key: string, value: string) => Promise<void>;
}

export default function HistoryDrawer({
  config,
  isOpen,
  onClose,
  onRevert,
}: HistoryDrawerProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reverting, setReverting] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && config) {
      fetchHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, config]);

  const fetchHistory = async () => {
    if (!config) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/config/history?key=${encodeURIComponent(config.key)}`,
      );

      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }

      const data = await response.json();
      setHistory(data.history || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRevert = async (version: number, value: string) => {
    if (!config || !confirm(`Revert ${config.key} to version ${version}?`)) {
      return;
    }

    setReverting(version);

    try {
      await onRevert(config.key, value);
      onClose();
    } catch (error) {
      alert(
        `Failed to revert: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    } finally {
      setReverting(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getValueDiff = (oldValue: string, newValue: string) => {
    if (oldValue === newValue) return null;

    return (
      <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono">
        <div className="flex items-start gap-2">
          <span className="text-red-600 flex-shrink-0">−</span>
          <span className="text-red-600 line-through break-all">
            {oldValue}
          </span>
        </div>
        <div className="flex items-start gap-2 mt-1">
          <span className="text-green-600 flex-shrink-0">+</span>
          <span className="text-green-600 break-all">{newValue}</span>
        </div>
      </div>
    );
  };

  if (!isOpen || !config) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl z-50 overflow-hidden flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Change History
              </h2>
              <p className="text-sm text-gray-600 mt-1 break-all">
                {config.key}
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

        {/* Current Value */}
        <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded">
                  CURRENT
                </span>
                <span className="text-sm text-gray-600">v{config.version}</span>
              </div>
              <div className="mt-2 text-sm font-medium text-gray-900 break-all">
                {config.value}
              </div>
              <div className="mt-2 text-xs text-gray-600">
                Updated by{' '}
                <span className="font-medium">{config.updated_by}</span> on{' '}
                {formatDate(config.updated_at)}
              </div>
            </div>
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <svg
                  className="animate-spin h-8 w-8 text-blue-600 mx-auto"
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
                <p className="text-sm text-gray-600 mt-3">Loading history...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="px-6 py-12 text-center">
              <div className="text-red-600 mb-3">
                <svg
                  className="w-12 h-12 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-600">{error}</p>
              <button
                onClick={fetchHistory}
                className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && history.length === 0 && (
            <div className="px-6 py-12 text-center">
              <div className="text-gray-400 mb-3">
                <svg
                  className="w-12 h-12 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-600">No history available</p>
              <p className="text-xs text-gray-500 mt-2">
                This parameter has not been modified yet, or history is not
                tracked in git.
              </p>
            </div>
          )}

          {!loading && !error && history.length > 0 && (
            <div className="px-6 py-4 space-y-4">
              <div className="text-sm font-medium text-gray-700">
                {history.length} previous{' '}
                {history.length === 1 ? 'version' : 'versions'}
              </div>

              {history.map((entry, index) => {
                const nextEntry =
                  index < history.length - 1 ? history[index + 1] : null;

                return (
                  <div
                    key={`${entry.version}-${entry.updated_at}`}
                    className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs font-medium rounded">
                            v{entry.version}
                          </span>
                          {entry.commit && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-mono rounded">
                              {entry.commit}
                            </span>
                          )}
                        </div>

                        <div className="mt-2 text-sm font-medium text-gray-900 break-all">
                          {entry.value}
                        </div>

                        {nextEntry &&
                          getValueDiff(nextEntry.value, entry.value)}

                        <div className="mt-3 text-xs text-gray-600">
                          Updated by{' '}
                          <span className="font-medium">
                            {entry.updated_by}
                          </span>{' '}
                          on {formatDate(entry.updated_at)}
                        </div>

                        {entry.message && (
                          <div className="mt-2 text-xs text-gray-500 italic">
                            {entry.message}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleRevert(entry.version, entry.value)}
                        disabled={reverting !== null}
                        className="ml-4 px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {reverting === entry.version ? (
                          <span className="flex items-center gap-1">
                            <svg
                              className="animate-spin h-3 w-3"
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
                            Reverting...
                          </span>
                        ) : (
                          'Revert to this version'
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-600">
              History pulled from git commits and configuration backups
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
