'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BeakerIcon,
  PlayIcon,
  PauseIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  UsersIcon,
  TargetIcon,
  BarChart3Icon,
  PlusIcon,
  EditIcon,
  EyeIcon,
  PercentIcon,
  FilterIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  RefreshCwIcon,
} from 'lucide-react';
import { useRealABTesting } from '@/hooks/useRealABTesting';

const ABTestingDashboard = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('lastModified');
  const [expandedTests, setExpandedTests] = useState<Set<string>>(new Set());

  // Use real A/B testing data instead of mock data
  const { tests, loading, error } = useRealABTesting();

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <RefreshCwIcon className="w-8 h-8 animate-spin mx-auto text-[hsl(var(--brand-dark))]" />
          <p className="mt-2 text-gray-600">Loading A/B testing data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <AlertTriangleIcon className="w-8 h-8 mx-auto text-red-600" />
          <p className="mt-2 text-red-600">
            Error loading A/B testing data: {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'text-green-600 bg-green-100';
      case 'completed':
        return 'text-[hsl(var(--brand-dark))] bg-[hsl(var(--brand))]/10';
      case 'paused':
        return 'text-yellow-600 bg-yellow-100';
      case 'draft':
        return 'text-gray-600 bg-gray-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <PlayIcon className="w-4 h-4" />;
      case 'completed':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'paused':
        return <PauseIcon className="w-4 h-4" />;
      case 'draft':
        return <ClockIcon className="w-4 h-4" />;
      case 'failed':
        return <XCircleIcon className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'stop_winner':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'continue':
        return <PlayIcon className="w-5 h-5 text-[hsl(var(--brand-dark))]" />;
      case 'stop_inconclusive':
        return <AlertTriangleIcon className="w-5 h-5 text-yellow-600" />;
      case 'extend':
        return <ClockIcon className="w-5 h-5 text-[hsl(var(--brand-dark))]" />;
      default:
        return <AlertTriangleIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const toggleTestExpansion = (testId: string) => {
    const newExpanded = new Set(expandedTests);
    if (newExpanded.has(testId)) {
      newExpanded.delete(testId);
    } else {
      newExpanded.add(testId);
    }
    setExpandedTests(newExpanded);
  };

  const filteredTests = tests.filter(
    (test) => filterStatus === 'all' || test.status === filterStatus,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <BeakerIcon className="w-8 h-8 text-[hsl(var(--brand-dark))]" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">A/B Testing</h1>
            <p className="text-gray-600">
              Manage experiments and analyze results
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--brand-dark))] text-white rounded-lg hover:bg-[hsl(var(--brand-dark))] transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Create Test
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          className="bg-white p-6 rounded-lg border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Tests</p>
              <p className="text-2xl font-bold text-gray-900">
                {tests.filter((t) => t.status === 'running').length}
              </p>
            </div>
            <PlayIcon className="w-8 h-8 text-green-600" />
          </div>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-lg border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Visitors</p>
              <p className="text-2xl font-bold text-gray-900">
                {tests
                  .reduce((sum, test) => sum + test.metrics.totalVisitors, 0)
                  .toLocaleString()}
              </p>
            </div>
            <UsersIcon className="w-8 h-8 text-[hsl(var(--brand-dark))]" />
          </div>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-lg border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {(
                  tests.reduce((sum, test) => {
                    const avgRate =
                      (test.metrics.totalConversions /
                        test.metrics.totalVisitors) *
                      100;
                    return sum + avgRate;
                  }, 0) / tests.length
                ).toFixed(1)}
                %
              </p>
            </div>
            <TargetIcon className="w-8 h-8 text-[hsl(var(--brand-dark))]" />
          </div>
        </motion.div>

        <motion.div
          className="bg-white p-6 rounded-lg border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                $
                {tests
                  .reduce((sum, test) => sum + test.metrics.revenue, 0)
                  .toLocaleString()}
              </p>
            </div>
            <TrendingUpIcon className="w-8 h-8 text-emerald-600" />
          </div>
        </motion.div>
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FilterIcon className="w-4 h-4 text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-[hsl(var(--brand))] focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="running">Running</option>
              <option value="completed">Completed</option>
              <option value="paused">Paused</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3Icon className="w-4 h-4 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-[hsl(var(--brand))] focus:border-transparent"
            >
              <option value="lastModified">Last Modified</option>
              <option value="startDate">Start Date</option>
              <option value="significance">Statistical Significance</option>
              <option value="visitors">Total Visitors</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tests List */}
      <div className="space-y-4">
        {filteredTests.map((test, index) => (
          <motion.div
            key={test.id}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {/* Test Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {test.name}
                    </h3>
                    <div
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        test.status,
                      )}`}
                    >
                      {getStatusIcon(test.status)}
                      {test.status.charAt(0).toUpperCase() +
                        test.status.slice(1)}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      {getRecommendationIcon(test.statistical.recommendation)}
                      <span className="capitalize">
                        {test.statistical.recommendation.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-3">{test.description}</p>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Visitors</p>
                      <p className="font-semibold">
                        {test.metrics.totalVisitors.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Conversions</p>
                      <p className="font-semibold">
                        {test.metrics.totalConversions}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Significance</p>
                      <p className="font-semibold">
                        {test.metrics.statisticalSignificance}%
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Revenue</p>
                      <p className="font-semibold">
                        ${test.metrics.revenue.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Duration</p>
                      <p className="font-semibold">
                        {test.endDate
                          ? `${Math.ceil(
                              (new Date(test.endDate).getTime() -
                                new Date(test.startDate).getTime()) /
                                (1000 * 60 * 60 * 24),
                            )} days`
                          : `${Math.ceil(
                              (Date.now() -
                                new Date(test.startDate).getTime()) /
                                (1000 * 60 * 60 * 24),
                            )} days`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => toggleTestExpansion(test.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {expandedTests.has(test.id) ? (
                      <ChevronUpIcon className="w-5 h-5" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5" />
                    )}
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <EditIcon className="w-4 h-4" />
                  </button>
                  {test.status === 'running' && (
                    <button className="p-2 text-yellow-500 hover:text-yellow-600 transition-colors">
                      <PauseIcon className="w-4 h-4" />
                    </button>
                  )}
                  {test.status === 'paused' && (
                    <button className="p-2 text-green-500 hover:text-green-600 transition-colors">
                      <PlayIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
              {expandedTests.has(test.id) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-gray-100"
                >
                  <div className="p-6 space-y-6">
                    {/* Variants Comparison */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Variant Performance
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {test.variants.map((variant) => (
                          <div
                            key={variant.id}
                            className="bg-gray-50 p-4 rounded-lg"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-semibold text-gray-900">
                                {variant.name}
                              </h5>
                              <div className="flex items-center gap-2">
                                <PercentIcon className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-600">
                                  {variant.allocation}% traffic
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">
                              {variant.description}
                            </p>

                            <div className="grid grid-cols-3 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500">Visitors</p>
                                <p className="font-semibold">
                                  {variant.metrics.visitors.toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">Conv. Rate</p>
                                <div className="flex items-center gap-1">
                                  <p className="font-semibold">
                                    {variant.metrics.conversionRate.toFixed(1)}%
                                  </p>
                                  {variant.id !== 'control' && (
                                    <div className="flex items-center">
                                      {variant.metrics.conversionRate >
                                      test.variants[0].metrics
                                        .conversionRate ? (
                                        <TrendingUpIcon className="w-3 h-3 text-green-600" />
                                      ) : (
                                        <TrendingDownIcon className="w-3 h-3 text-red-600" />
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div>
                                <p className="text-gray-500">Revenue</p>
                                <p className="font-semibold">
                                  ${variant.metrics.revenue.toLocaleString()}
                                </p>
                              </div>
                            </div>

                            {variant.metrics.confidence && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-500">
                                    Confidence
                                  </span>
                                  <span
                                    className={`font-semibold ${
                                      variant.metrics.confidence >= 95
                                        ? 'text-green-600'
                                        : 'text-yellow-600'
                                    }`}
                                  >
                                    {variant.metrics.confidence}%
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Statistical Analysis */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Statistical Analysis
                      </h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Sample Size</p>
                            <p className="font-semibold">
                              {test.statistical.sampleSize.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Statistical Power</p>
                            <p className="font-semibold">
                              {test.statistical.powerAnalysis}%
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">P-Value</p>
                            <p className="font-semibold">
                              {test.metrics.pValue.toFixed(3)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Effect Size</p>
                            <p className="font-semibold">
                              {test.metrics.effect.toFixed(1)}%
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-3">
                            {getRecommendationIcon(
                              test.statistical.recommendation,
                            )}
                            <div>
                              <p className="font-semibold text-gray-900 capitalize">
                                {test.statistical.recommendation.replace(
                                  '_',
                                  ' ',
                                )}
                              </p>
                              <p className="text-sm text-gray-600">
                                Bayesian probability:{' '}
                                {test.statistical.bayesianProbability}%
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Audience Configuration */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        Audience & Targeting
                      </h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500 mb-2">Device Types</p>
                            <div className="flex flex-wrap gap-1">
                              {test.audience.deviceTypes.map((device) => (
                                <span
                                  key={device}
                                  className="px-2 py-1 bg-[hsl(var(--brand))]/10 text-blue-700 rounded text-xs"
                                >
                                  {device}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-gray-500 mb-2">Locations</p>
                            <div className="flex flex-wrap gap-1">
                              {test.audience.locations.map((location) => (
                                <span
                                  key={location}
                                  className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs"
                                >
                                  {location}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-gray-500 mb-2">
                              Traffic Sources
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {test.audience.trafficSource.map((source) => (
                                <span
                                  key={source}
                                  className="px-2 py-1 bg-[hsl(var(--brand))]/10 text-[hsl(var(--brand-dark))] rounded text-xs"
                                >
                                  {source}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Create Test Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Create New A/B Test
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircleIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="text-center py-8 text-gray-500">
              <BeakerIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>A/B Test creation form would be implemented here with:</p>
              <ul className="mt-4 text-left max-w-md mx-auto space-y-2">
                <li>• Test configuration and goals</li>
                <li>• Variant setup and changes</li>
                <li>• Audience targeting rules</li>
                <li>• Statistical power analysis</li>
                <li>• Traffic allocation settings</li>
              </ul>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ABTestingDashboard;
