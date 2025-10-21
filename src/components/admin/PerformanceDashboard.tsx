'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Clock,
  Zap,
  Eye,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  RefreshCw,
  Download,
  Filter,
  BarChart3,
} from 'lucide-react';
import { useRealPerformance } from '@/hooks/useRealPerformance';

const PerformanceDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>(
    '24h',
  );
  const [deviceFilter, setDeviceFilter] = useState<
    'all' | 'desktop' | 'mobile' | 'tablet'
  >('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Use real performance data instead of mock data
  const {
    coreWebVitals,
    performanceMetrics,
    topPages,
    recommendations,
    loading,
    error,
  } = useRealPerformance(timeRange, deviceFilter);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsRefreshing(false);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[hsl(var(--brand-dark))]" />
          <p className="mt-2 text-gray-600">Loading performance data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <AlertTriangle className="w-8 h-8 mx-auto text-red-600" />
          <p className="mt-2 text-red-600">
            Error loading performance data: {error}
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
      case 'good':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'needs-improvement':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'poor':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'suggestion':
        return (
          <CheckCircle className="w-5 h-5 text-[hsl(var(--brand-dark))]" />
        );
      default:
        return <CheckCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getMetricIcon = (id: string) => {
    switch (id) {
      case 'page-load':
        return <Clock className="w-5 h-5" />;
      case 'ttfb':
        return <Zap className="w-5 h-5" />;
      case 'speed-index':
        return <Activity className="w-5 h-5" />;
      case 'bounce-rate':
        return <Eye className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Performance Metrics
          </h2>
          <p className="text-gray-600 mt-1">
            Monitor Core Web Vitals and site performance
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Device Filter */}
          <div className="flex items-center bg-white border border-gray-300 rounded-lg">
            {[
              { key: 'all', label: 'All', icon: Globe },
              { key: 'desktop', label: 'Desktop', icon: Monitor },
              { key: 'mobile', label: 'Mobile', icon: Smartphone },
              { key: 'tablet', label: 'Tablet', icon: Tablet },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setDeviceFilter(key as typeof deviceFilter)}
                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  deviceFilter === key
                    ? 'bg-[hsl(var(--brand-dark))] text-white'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Time Range */}
          <div className="flex items-center bg-white border border-gray-300 rounded-lg">
            {(['1h', '24h', '7d', '30d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  timeRange === range
                    ? 'bg-[hsl(var(--brand-dark))] text-white'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-[hsl(var(--brand-dark))] text-white rounded-lg hover:bg-[hsl(var(--brand-dark))] disabled:opacity-50 transition-colors"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Core Web Vitals */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Core Web Vitals
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {coreWebVitals.map((vital) => (
            <motion.div
              key={vital.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg border-2 ${getStatusColor(
                vital.rating,
              )}`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{vital.name}</h4>
                <div
                  className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                    vital.rating,
                  )}`}
                >
                  {vital.rating.replace('-', ' ')}
                </div>
              </div>
              <div className="text-2xl font-bold mb-1">
                {vital.value}
                {vital.name.includes('Layout')
                  ? ''
                  : vital.name.includes('Paint')
                    ? 's'
                    : 'ms'}
              </div>
              <div className="text-sm text-gray-600">
                75th percentile • Target: {vital.threshold.good}
                {vital.name.includes('Layout')
                  ? ''
                  : vital.name.includes('Paint')
                    ? 's'
                    : 'ms'}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceMetrics.map((metric) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-2 rounded-lg ${getStatusColor(metric.status)}`}
              >
                {getMetricIcon(metric.id)}
              </div>
              <div
                className={`flex items-center text-sm ${
                  metric.trend === 'up'
                    ? 'text-red-600'
                    : metric.trend === 'down'
                      ? 'text-green-600'
                      : 'text-gray-600'
                }`}
              >
                {metric.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : metric.trend === 'down' ? (
                  <TrendingDown className="w-4 h-4 mr-1" />
                ) : null}
                {metric.change !== 0 &&
                  `${metric.change > 0 ? '+' : ''}${metric.change}${
                    metric.unit
                  }`}
              </div>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">{metric.name}</h4>
            <div className="text-2xl font-bold mb-1">
              {metric.value}
              {metric.unit}
            </div>
            <div className="text-sm text-gray-600 mb-3">
              Target: {metric.target}
              {metric.unit}
            </div>
            <p className="text-xs text-gray-500">{metric.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Top Pages Performance */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Top Pages Performance
          </h3>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Filter className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Download className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  Page
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">
                  Views
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">
                  Load Time
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">
                  Bounce Rate
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">
                  Conv. Rate
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">
                  Issues
                </th>
              </tr>
            </thead>
            <tbody>
              {topPages.map((page, index) => (
                <motion.tr
                  key={page.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{page.path}</div>
                  </td>
                  <td className="py-3 px-4 text-right text-gray-900">
                    {page.views.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`font-medium ${
                        page.avgLoadTime <= 2
                          ? 'text-green-600'
                          : page.avgLoadTime <= 3
                            ? 'text-yellow-600'
                            : 'text-red-600'
                      }`}
                    >
                      {page.avgLoadTime}s
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`font-medium ${
                        page.bounceRate <= 30
                          ? 'text-green-600'
                          : page.bounceRate <= 50
                            ? 'text-yellow-600'
                            : 'text-red-600'
                      }`}
                    >
                      {page.bounceRate}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-medium text-green-600">
                      {page.conversionRate}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {page.issues > 0 ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {page.issues}
                      </span>
                    ) : (
                      <CheckCircle className="w-4 h-4 text-green-600 mx-auto" />
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Recommendations */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Performance Recommendations
          </h3>
          <button className="flex items-center space-x-2 text-sm text-[hsl(var(--brand-dark))] hover:text-[hsl(var(--foreground))] font-medium">
            <BarChart3 className="w-4 h-4" />
            <span>View All</span>
          </button>
        </div>

        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {getRecommendationIcon(rec.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{rec.title}</h4>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          rec.impact === 'high'
                            ? 'bg-red-100 text-red-800'
                            : rec.impact === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {rec.impact} impact
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          rec.effort === 'low'
                            ? 'bg-green-100 text-green-800'
                            : rec.effort === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {rec.effort} effort
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{rec.description}</p>
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {rec.category.replace('-', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
