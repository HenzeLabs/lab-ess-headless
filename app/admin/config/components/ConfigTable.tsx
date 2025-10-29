'use client';

import { useState } from 'react';
import { ConfigRecord } from '@/lib/configStore';
import EditConfigModal from './EditConfigModal';
import HistoryDrawer from './HistoryDrawer';
import Toast, { ToastType } from './Toast';
import { stringify } from 'csv-stringify/sync';

interface Props {
  initialConfigs: ConfigRecord[];
}

type CategoryFilter = 'all' | 'seo' | 'security' | 'other';

interface ToastState {
  show: boolean;
  message: string;
  type: ToastType;
}

export default function ConfigTable({ initialConfigs }: Props) {
  const [configs, setConfigs] = useState(initialConfigs);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [sortColumn, setSortColumn] = useState<keyof ConfigRecord>('key');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingConfig, setEditingConfig] = useState<ConfigRecord | null>(null);
  const [historyConfig, setHistoryConfig] = useState<ConfigRecord | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: '',
    type: 'success',
  });

  const ITEMS_PER_PAGE = 25;

  // Show toast notification
  const showToast = (message: string, type: ToastType) => {
    setToast({ show: true, message, type });
  };

  // Filter configurations by category
  const categoryFilteredConfigs = configs.filter((config) => {
    if (categoryFilter === 'all') return true;
    if (categoryFilter === 'seo') return config.key.startsWith('seo.');
    if (categoryFilter === 'security')
      return config.key.startsWith('security.');
    if (categoryFilter === 'other')
      return (
        !config.key.startsWith('seo.') && !config.key.startsWith('security.')
      );
    return true;
  });

  // Filter configurations based on search term
  const filteredConfigs = categoryFilteredConfigs.filter(
    (config) =>
      config.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.updated_by.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Sort configurations
  const sortedConfigs = [...filteredConfigs].sort((a, b) => {
    const aVal = a[sortColumn];
    const bVal = b[sortColumn];

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Paginate results
  const totalPages = Math.ceil(sortedConfigs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedConfigs = sortedConfigs.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  // Handle column sort
  const handleSort = (column: keyof ConfigRecord) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Handle save configuration
  const handleSaveConfig = async (key: string, value: string) => {
    try {
      const token = prompt('Enter admin token:');
      if (!token) {
        throw new Error('Admin token is required');
      }

      const response = await fetch('/api/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': token,
        },
        body: JSON.stringify({ key, value }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update configuration');
      }

      const result = await response.json();

      // Update local state
      setConfigs((prevConfigs) =>
        prevConfigs.map((c) =>
          c.key === key
            ? {
                ...c,
                value,
                updated_by: result.updated_by || 'admin',
                updated_at: result.updated_at || new Date().toISOString(),
                version: result.version || c.version + 1,
              }
            : c,
        ),
      );

      showToast('Configuration updated successfully', 'success');
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : 'Failed to update configuration',
        'error',
      );
      throw error;
    }
  };

  // Get category badge color
  const getCategoryColor = (key: string) => {
    if (key.startsWith('seo.')) return 'bg-green-100 text-green-800';
    if (key.startsWith('security.')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  // Get category name
  const getCategoryName = (key: string) => {
    const parts = key.split('.');
    return parts[0].toUpperCase();
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get category counts
  const categoryCounts = {
    all: configs.length,
    seo: configs.filter((c) => c.key.startsWith('seo.')).length,
    security: configs.filter((c) => c.key.startsWith('security.')).length,
    other: configs.filter(
      (c) => !c.key.startsWith('seo.') && !c.key.startsWith('security.'),
    ).length,
  };

  // Multi-select functions
  const toggleSelectAll = () => {
    if (selectedKeys.size === paginatedConfigs.length) {
      setSelectedKeys(new Set());
    } else {
      setSelectedKeys(new Set(paginatedConfigs.map((c) => c.key)));
    }
  };

  const toggleSelectRow = (key: string) => {
    const newSelected = new Set(selectedKeys);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelectedKeys(newSelected);
  };

  const isAllSelected =
    paginatedConfigs.length > 0 &&
    selectedKeys.size === paginatedConfigs.length;
  const isSomeSelected =
    selectedKeys.size > 0 && selectedKeys.size < paginatedConfigs.length;

  // Download CSV function
  const downloadCSV = () => {
    const selectedConfigs = configs.filter((c) => selectedKeys.has(c.key));

    const csvData = selectedConfigs.map((config) => ({
      key: config.key,
      value: config.value,
      updated_by: config.updated_by,
      updated_at: config.updated_at,
      version: config.version,
    }));

    const csv = stringify(csvData, {
      header: true,
      columns: ['key', 'value', 'updated_by', 'updated_at', 'version'],
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `config-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    showToast(
      `Exported ${selectedConfigs.length} configurations to CSV`,
      'success',
    );
  };

  // Bulk delete function
  const handleBulkDelete = async () => {
    const selectedConfigs = configs.filter((c) => selectedKeys.has(c.key));

    if (
      !confirm(
        `Are you sure you want to delete ${selectedConfigs.length} configuration(s)?\n\n${selectedConfigs.map((c) => c.key).join('\n')}\n\nThis action cannot be undone.`,
      )
    ) {
      return;
    }

    const token = prompt('Enter admin token:');
    if (!token) {
      showToast('Admin token is required', 'error');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (const key of selectedKeys) {
      try {
        const response = await fetch('/api/config', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'X-Admin-Token': token,
          },
          body: JSON.stringify({ key }),
        });

        if (response.ok) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        errorCount++;
      }
    }

    // Update local state
    setConfigs((prevConfigs) =>
      prevConfigs.filter((c) => !selectedKeys.has(c.key)),
    );
    setSelectedKeys(new Set());

    if (errorCount === 0) {
      showToast(
        `Successfully deleted ${successCount} configuration(s)`,
        'success',
      );
    } else {
      showToast(
        `Deleted ${successCount} configuration(s), ${errorCount} failed`,
        'error',
      );
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow border border-gray-200">
        {/* Search and Actions Bar */}
        <div className="p-4 border-b border-gray-200 space-y-4">
          {/* Search and Category Filter Row */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search configurations..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1}-
              {Math.min(startIndex + ITEMS_PER_PAGE, sortedConfigs.length)} of{' '}
              {sortedConfigs.length} parameters
            </div>
          </div>

          {/* Category Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {(['all', 'seo', 'security', 'other'] as CategoryFilter[]).map(
              (category) => (
                <button
                  key={category}
                  onClick={() => {
                    setCategoryFilter(category);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    categoryFilter === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)} (
                  {categoryCounts[category]})
                </button>
              ),
            )}
          </div>
        </div>

        {/* Bulk Actions Toolbar */}
        {selectedKeys.size > 0 && (
          <div className="px-4 py-3 bg-blue-50 border-b border-blue-200">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-blue-900">
                {selectedKeys.size} selected
              </div>
              <div className="flex gap-2">
                <button
                  onClick={downloadCSV}
                  className="px-4 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
                >
                  Export CSV
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50 transition-colors"
                >
                  Delete Selected
                </button>
                <button
                  onClick={() => setSelectedKeys(new Set())}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table with sticky header */}
        <div className="overflow-x-auto" style={{ maxHeight: '600px' }}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) {
                        input.indeterminate = isSomeSelected;
                      }
                    }}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th
                  onClick={() => handleSort('key')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Key
                    {sortColumn === 'key' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th
                  onClick={() => handleSort('updated_by')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Updated By
                    {sortColumn === 'updated_by' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('updated_at')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Updated At
                    {sortColumn === 'updated_at' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedConfigs.map((config, index) => (
                <tr
                  key={config.key}
                  className={`hover:bg-blue-50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  } ${selectedKeys.has(config.key) ? 'bg-blue-50' : ''}`}
                  style={{ height: '72px' }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedKeys.has(config.key)}
                      onChange={() => toggleSelectRow(config.key)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">
                        {config.key}
                      </div>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-1 w-fit ${getCategoryColor(config.key)}`}
                      >
                        {getCategoryName(config.key)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className="text-sm text-gray-900 max-w-xs truncate"
                      title={config.value}
                    >
                      {config.value}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {config.updated_by}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm text-gray-900">
                        {formatDate(config.updated_at)}
                      </div>
                      <div className="text-xs text-gray-500">
                        v{config.version}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      className="text-blue-600 hover:text-blue-900 mr-3 transition-colors"
                      onClick={() => setEditingConfig(config)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                      onClick={() => setHistoryConfig(config)}
                    >
                      History
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {sortedConfigs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No configurations found matching your filters
            </p>
            {(searchTerm || categoryFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                }}
                className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Footer Stats */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Phase 2 - Week 1 Complete</span>:
            Category filtering, pagination, inline editor, validation
            <span className="mx-2">•</span>
            <span>
              Coming Week 2: Change history viewer, bulk actions, automated
              reports
            </span>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingConfig && (
        <EditConfigModal
          config={editingConfig}
          isOpen={!!editingConfig}
          onClose={() => setEditingConfig(null)}
          onSave={handleSaveConfig}
        />
      )}

      {/* History Drawer */}
      <HistoryDrawer
        config={historyConfig}
        isOpen={!!historyConfig}
        onClose={() => setHistoryConfig(null)}
        onRevert={handleSaveConfig}
      />

      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </>
  );
}
