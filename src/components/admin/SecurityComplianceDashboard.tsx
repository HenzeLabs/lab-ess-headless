'use client';

import React, { useState } from 'react';
import {
  ShieldCheckIcon,
  LockIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ActivityIcon,
  FileTextIcon,
  SettingsIcon,
  RefreshCwIcon,
  DownloadIcon,
} from 'lucide-react';
import { useRealSecurity } from '@/hooks/useRealSecurity';
import type { SecurityAudit, ComplianceCheck } from '@/hooks/useRealSecurity';

const SecurityComplianceDashboard: React.FC = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');

  // Use real security data instead of mock data
  const {
    securityAudits,
    complianceChecks,
    securityMetrics,
    loading,
    error,
    refreshData,
  } = useRealSecurity(selectedTimeRange);

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <RefreshCwIcon className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600">Loading security data...</p>
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
            Error loading security data: {error}
          </p>
          <button
            onClick={refreshData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Filter audits based on severity
  const filteredAudits =
    filterSeverity === 'all'
      ? securityAudits
      : securityAudits.filter((audit) => audit.severity === filterSeverity);

  const getSeverityIcon = (severity: SecurityAudit['severity']) => {
    switch (severity) {
      case 'critical':
        return <XCircleIcon className="w-4 h-4 text-red-600" />;
      case 'high':
        return <AlertTriangleIcon className="w-4 h-4 text-orange-600" />;
      case 'medium':
        return <ClockIcon className="w-4 h-4 text-yellow-600" />;
      case 'low':
        return <CheckCircleIcon className="w-4 h-4 text-green-600" />;
      default:
        return <ActivityIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusIcon = (status: SecurityAudit['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircleIcon className="w-4 h-4 text-red-600" />;
      case 'blocked':
        return <ShieldCheckIcon className="w-4 h-4 text-yellow-600" />;
      default:
        return <ActivityIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  const getComplianceIcon = (status: ComplianceCheck['status']) => {
    switch (status) {
      case 'compliant':
        return <CheckCircleIcon className="w-4 h-4 text-green-600" />;
      case 'non_compliant':
        return <XCircleIcon className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <AlertTriangleIcon className="w-4 h-4 text-yellow-600" />;
      case 'pending':
        return <ClockIcon className="w-4 h-4 text-blue-600" />;
      default:
        return <ActivityIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheckIcon className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Security & Compliance
            </h1>
            <p className="text-gray-600">
              Monitor security events and compliance status
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>

          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <button
            onClick={refreshData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <RefreshCwIcon className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Security Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Risk Level</p>
              <p
                className={`text-2xl font-bold capitalize ${
                  getRiskColor(securityMetrics.riskLevel).split(' ')[0]
                }`}
              >
                {securityMetrics.riskLevel}
              </p>
            </div>
            <ShieldCheckIcon className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Compliance Score
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {securityMetrics.complianceScore}%
              </p>
            </div>
            <CheckCircleIcon className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Security Alerts
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {securityMetrics.securityAlerts}
              </p>
            </div>
            <AlertTriangleIcon className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Critical Vulnerabilities
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {securityMetrics.criticalVulnerabilities}
              </p>
            </div>
            <XCircleIcon className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: ActivityIcon },
            { id: 'audits', label: 'Security Audits', icon: FileTextIcon },
            { id: 'compliance', label: 'Compliance', icon: ShieldCheckIcon },
            { id: 'settings', label: 'Settings', icon: SettingsIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
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
          {/* Security Score Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Access Control
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-gray-900">
                  {securityMetrics.accessControl}%
                </span>
                <LockIcon className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                User access management
              </p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Data Protection
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-gray-900">
                  {securityMetrics.dataProtection}%
                </span>
                <ShieldCheckIcon className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Data encryption & privacy
              </p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Threat Detection
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-gray-900">
                  {securityMetrics.threatDetection}%
                </span>
                <AlertTriangleIcon className="w-8 h-8 text-yellow-600" />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Active monitoring & alerts
              </p>
            </div>
          </div>

          {/* Recent Security Events */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Security Events
            </h3>
            <div className="space-y-3">
              {filteredAudits.slice(0, 5).map((audit) => (
                <div
                  key={audit.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getSeverityIcon(audit.severity)}
                    <div>
                      <p className="font-medium text-gray-900">
                        {audit.action}
                      </p>
                      <p className="text-sm text-gray-600">
                        {audit.user} • {audit.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(audit.status)}
                    <span className="text-sm text-gray-600">
                      {new Date(audit.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'audits' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Security Audit Log
            </h3>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <DownloadIcon className="w-4 h-4" />
              Export
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAudits.map((audit) => (
                  <tr key={audit.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(audit.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getSeverityIcon(audit.severity)}
                        <span className="text-sm capitalize text-gray-900">
                          {audit.severity}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {audit.user}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {audit.action}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(audit.status)}
                        <span className="text-sm capitalize text-gray-900">
                          {audit.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {audit.location}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'compliance' && (
        <div className="space-y-6">
          {/* Compliance Overview */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Compliance Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {['GDPR', 'CCPA', 'PCI_DSS', 'SOC2', 'ISO27001'].map(
                (standard) => {
                  const checks = complianceChecks.filter(
                    (c) => c.standard === standard,
                  );
                  const compliant = checks.filter(
                    (c) => c.status === 'compliant',
                  ).length;
                  const percentage =
                    checks.length > 0 ? (compliant / checks.length) * 100 : 0;

                  return (
                    <div
                      key={standard}
                      className="text-center p-4 border border-gray-200 rounded-lg"
                    >
                      <h4 className="font-medium text-gray-900 mb-2">
                        {standard}
                      </h4>
                      <div className="text-2xl font-bold text-gray-900">
                        {Math.round(percentage)}%
                      </div>
                      <div className="text-sm text-gray-600">
                        {compliant}/{checks.length} checks
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </div>

          {/* Compliance Checks */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Compliance Checks
            </h3>
            <div className="space-y-3">
              {complianceChecks.map((check) => (
                <div
                  key={check.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      {getComplianceIcon(check.status)}
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {check.requirement}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {check.standard}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          check.priority === 'critical'
                            ? 'bg-red-100 text-red-800'
                            : check.priority === 'high'
                            ? 'bg-orange-100 text-orange-800'
                            : check.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {check.priority}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                          check.status === 'compliant'
                            ? 'bg-green-100 text-green-800'
                            : check.status === 'non_compliant'
                            ? 'bg-red-100 text-red-800'
                            : check.status === 'warning'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {check.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {check.description}
                  </p>
                  {check.remediation && check.status !== 'compliant' && (
                    <p className="text-sm text-blue-600 font-medium">
                      Remediation: {check.remediation}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Last checked: {new Date(check.lastChecked).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Security Settings
          </h3>
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h4 className="font-medium text-gray-900 mb-2">
                Audit Log Retention
              </h4>
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="30">30 days</option>
                <option value="90">90 days</option>
                <option value="365">1 year</option>
                <option value="forever">Forever</option>
              </select>
            </div>

            <div className="border-b border-gray-200 pb-4">
              <h4 className="font-medium text-gray-900 mb-2">
                Alert Notifications
              </h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    defaultChecked
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Critical security events
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    defaultChecked
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Compliance violations
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Login anomalies
                  </span>
                </label>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Export Security Report
              </h4>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <DownloadIcon className="w-4 h-4" />
                Generate Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityComplianceDashboard;
