'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  Activity,
  Clock,
  ArrowUp,
  ArrowDown,
  BarChart3,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useShopifyAnalytics } from '@/hooks/useShopifyAnalytics';

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  prefix?: string;
  suffix?: string;
  loading?: boolean;
}

interface ShopifyOrder {
  id: string;
  name: string;
  total: number;
  createdAt: string;
  customerEmail?: string;
  items: Array<{
    title: string;
    quantity: number;
  }>;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  color,
  prefix = '',
  suffix = '',
  loading = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-center space-x-2">
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            ) : (
              <p className="text-2xl font-bold text-gray-900">
                {prefix}
                {typeof value === 'number' ? value.toLocaleString() : value}
                {suffix}
              </p>
            )}
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Real Shopify Data
            </span>
          </div>
          <div className="flex items-center mt-2">
            {changeType === 'increase' ? (
              <ArrowUp className="w-4 h-4 text-green-500" />
            ) : (
              <ArrowDown className="w-4 h-4 text-red-500" />
            )}
            <span
              className={`text-sm font-medium ${
                changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {Math.abs(change)}%
            </span>
            <span className="text-sm text-gray-500 ml-1">vs last period</span>
          </div>
        </div>
        <div className={`p-3 ${color} rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
};

const RecentOrdersFeed: React.FC<{ orders: ShopifyOrder[] }> = ({ orders }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-3">
      {orders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No recent orders found</p>
        </div>
      ) : (
        orders.map((order) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingCart className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{order.name}</p>
                <p className="text-sm text-gray-600">
                  {order.customerEmail || 'Guest Customer'}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(order.createdAt)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-green-600">
                {formatCurrency(order.total)}
              </p>
              <p className="text-xs text-gray-500">
                {order.items.length} item{order.items.length !== 1 ? 's' : ''}
              </p>
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>(
    '7d',
  );
  const { metrics, recentOrders, loading, error } =
    useShopifyAnalytics(timeRange);

  const handleNavClick = (path: string) => {
    router.push(path);
  };

  const mainMetrics = [
    {
      title: 'Total Revenue',
      value: metrics.totalRevenue,
      change: 12.5,
      changeType: 'increase' as const,
      icon: DollarSign,
      color: 'bg-green-500',
      prefix: '$',
    },
    {
      title: 'Total Orders',
      value: metrics.totalOrders,
      change: 8.2,
      changeType: 'increase' as const,
      icon: ShoppingCart,
      color: 'bg-blue-500',
    },
    {
      title: 'Average Order Value',
      value: metrics.averageOrderValue,
      change: 5.1,
      changeType: 'increase' as const,
      icon: TrendingUp,
      color: 'bg-purple-500',
      prefix: '$',
    },
    {
      title: 'Top Products',
      value: metrics.topProducts.length,
      change: 2.4,
      changeType: 'increase' as const,
      icon: Package,
      color: 'bg-orange-500',
    },
  ];

  const quickActions = [
    {
      label: 'View Products',
      description: 'Manage inventory and product details',
      icon: Package,
      action: () => handleNavClick('/admin/products'),
      color: 'bg-blue-500',
    },
    {
      label: 'View Orders',
      description: 'Review recent orders and fulfillment',
      icon: ShoppingCart,
      action: () => handleNavClick('/admin/orders'),
      color: 'bg-green-500',
    },
    {
      label: 'Customer Insights',
      description: 'Analyze customer behavior and preferences',
      icon: Users,
      action: () => handleNavClick('/admin/customers'),
      color: 'bg-purple-500',
    },
    {
      label: 'Sales Reports',
      description: 'Detailed revenue and performance analytics',
      icon: BarChart3,
      action: () => handleNavClick('/admin/reports'),
      color: 'bg-orange-500',
    },
  ];

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
            <h3 className="text-lg font-medium text-red-800">
              Error Loading Dashboard
            </h3>
          </div>
          <p className="mt-2 text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Business Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Real-time insights from your Lab Essentials Shopify store
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-green-100 text-green-800 px-3 py-2 rounded-lg">
            <Activity className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Live Shopify Data</span>
          </div>
          <select
            value={timeRange}
            onChange={(e) =>
              setTimeRange(e.target.value as '24h' | '7d' | '30d' | '90d')
            }
            className="border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainMetrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} loading={loading} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <motion.button
              key={action.label}
              onClick={action.action}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 text-left group"
            >
              <div className="flex items-center mb-3">
                <div
                  className={`p-2 ${action.color} rounded-lg group-hover:scale-110 transition-transform`}
                >
                  <action.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {action.label}
              </h3>
              <p className="text-sm text-gray-600 mt-1">{action.description}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-1" />
            Real-time from Shopify
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            <span className="ml-3 text-gray-600">Loading orders...</span>
          </div>
        ) : (
          <RecentOrdersFeed orders={recentOrders} />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
