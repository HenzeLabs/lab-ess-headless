'use client';

import React, { useState } from 'react';
import {
  UsersIcon,
  TrendingUpIcon,
  MapIcon,
  ClockIcon,
  CreditCardIcon,
  ArrowRightIcon,
  BarChart3Icon,
  PieChartIcon,
  ActivityIcon,
  SmartphoneIcon,
  MonitorIcon,
  TabletIcon,
  GlobeIcon,
  RefreshCwIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
} from 'lucide-react';
import { useRealUserBehavior } from '@/hooks/useRealUserBehavior';

const UserBehaviorAnalytics: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [selectedDevice, setSelectedDevice] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');

  // Use real user behavior data instead of mock data
  const { journeys, conversionFunnel, customerSegments, loading, error } =
    useRealUserBehavior(selectedTimeRange, selectedDevice);

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <RefreshCwIcon className="w-8 h-8 animate-spin mx-auto text-[hsl(var(--brand-dark))]" />
          <p className="mt-2 text-gray-600">Loading user behavior data...</p>
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
            Error loading user behavior data: {error}
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

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'mobile':
        return <SmartphoneIcon className="w-4 h-4" />;
      case 'tablet':
        return <TabletIcon className="w-4 h-4" />;
      case 'desktop':
        return <MonitorIcon className="w-4 h-4" />;
      default:
        return <GlobeIcon className="w-4 h-4" />;
    }
  };

  // Calculate summary metrics from real data
  const totalRevenue = journeys.reduce(
    (sum, journey) => sum + (journey.revenue || 0),
    0,
  );
  const avgSessionDuration =
    journeys.length > 0
      ? journeys.reduce((sum, journey) => sum + journey.duration, 0) /
        journeys.length
      : 0;
  const conversionRate =
    journeys.length > 0
      ? (journeys.filter((j) => j.converted).length / journeys.length) * 100
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <ActivityIcon className="w-8 h-8 text-[hsl(var(--brand-dark))]" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              User Behavior Analytics
            </h1>
            <p className="text-gray-600">
              Track user journeys and optimize conversion paths
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[hsl(var(--brand))] focus:border-[hsl(var(--brand))]"
          >
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>

          <select
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[hsl(var(--brand))] focus:border-[hsl(var(--brand))]"
          >
            <option value="all">All Devices</option>
            <option value="desktop">Desktop</option>
            <option value="mobile">Mobile</option>
            <option value="tablet">Tablet</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Sessions
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {journeys.length.toLocaleString()}
              </p>
            </div>
            <UsersIcon className="w-8 h-8 text-[hsl(var(--brand-dark))]" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Conversion Rate
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {conversionRate.toFixed(1)}%
              </p>
            </div>
            <TrendingUpIcon className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Avg Session Duration
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(avgSessionDuration / 60)}m
              </p>
            </div>
            <ClockIcon className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ${totalRevenue.toFixed(0)}
              </p>
            </div>
            <CreditCardIcon className="w-8 h-8 text-[hsl(var(--brand-dark))]" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3Icon },
            { id: 'funnel', label: 'Conversion Funnel', icon: ArrowRightIcon },
            { id: 'segments', label: 'Customer Segments', icon: PieChartIcon },
            { id: 'journeys', label: 'User Journeys', icon: MapIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-[hsl(var(--brand))] text-[hsl(var(--brand-dark))]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Conversion Funnel */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Conversion Funnel
            </h3>
            <div className="space-y-4">
              {conversionFunnel.map((stage, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-4 h-4 bg-[hsl(var(--brand-dark))] rounded-full"></div>
                    <span className="font-medium text-gray-900">
                      {stage.stage}
                    </span>
                  </div>
                  <div className="flex items-center space-x-6">
                    <span className="text-sm text-gray-600">
                      {stage.visitors.toLocaleString()} users
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {stage.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Segments */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Customer Segments
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {customerSegments.map((segment) => (
                <div
                  key={segment.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">
                      {segment.name}
                    </h4>
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: segment.color }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {segment.description}
                  </p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Size:</span>
                      <span className="font-medium">
                        {segment.size.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Conv. Rate:</span>
                      <span className="font-medium">
                        {segment.conversionRate}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">AOV:</span>
                      <span className="font-medium">
                        ${segment.avgOrderValue}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'journeys' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent User Journeys
          </h3>
          <div className="space-y-4">
            {journeys.slice(0, 10).map((journey) => (
              <div
                key={journey.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getDeviceIcon(journey.device)}
                    <span className="font-medium text-gray-900">
                      Session {journey.sessionId}
                    </span>
                    {journey.converted && (
                      <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {Math.round(journey.duration / 60)}m • {journey.location} •{' '}
                    {journey.source}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {journey.steps.map((step, index) => (
                    <React.Fragment key={step.id}>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-[hsl(var(--brand-dark))] rounded-full"></div>
                        <span className="text-xs text-gray-600">
                          {step.page}
                        </span>
                      </div>
                      {index < journey.steps.length - 1 && (
                        <ArrowRightIcon className="w-3 h-3 text-gray-400" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
                {journey.revenue && (
                  <div className="mt-2 text-sm text-green-600 font-medium">
                    Revenue: ${journey.revenue.toFixed(2)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserBehaviorAnalytics;
