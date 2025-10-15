'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  ShoppingCart,
  TrendingUp,
  Users,
  Activity,
  DollarSign,
  Globe,
  Clock,
} from 'lucide-react';

interface LiveMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  timestamp: number;
}

interface GeographicData {
  country: string;
  visitors: number;
  sessions: number;
  conversionRate: number;
}

interface RealtimeEvent {
  id: string;
  type: 'pageview' | 'purchase' | 'cart_add' | 'search' | 'signup';
  userId: string;
  page?: string;
  product?: string;
  value?: number;
  location: string;
  timestamp: number;
}

const LiveAnalyticsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<LiveMetric[]>([
    {
      id: 'active_users',
      name: 'Active Users',
      value: 127,
      change: 12,
      trend: 'up',
      icon: Users,
      color: 'text-blue-600',
      timestamp: Date.now(),
    },
    {
      id: 'page_views',
      name: 'Page Views (Last Hour)',
      value: 1534,
      change: -8,
      trend: 'down',
      icon: Eye,
      color: 'text-green-600',
      timestamp: Date.now(),
    },
    {
      id: 'cart_adds',
      name: 'Cart Additions',
      value: 23,
      change: 5,
      trend: 'up',
      icon: ShoppingCart,
      color: 'text-orange-600',
      timestamp: Date.now(),
    },
    {
      id: 'revenue',
      name: 'Revenue (Today)',
      value: 8432,
      change: 15,
      trend: 'up',
      icon: DollarSign,
      color: 'text-purple-600',
      timestamp: Date.now(),
    },
  ]);

  const [geographicData] = useState<GeographicData[]>([
    {
      country: 'United States',
      visitors: 456,
      sessions: 523,
      conversionRate: 3.2,
    },
    { country: 'Canada', visitors: 234, sessions: 267, conversionRate: 2.8 },
    {
      country: 'United Kingdom',
      visitors: 198,
      sessions: 223,
      conversionRate: 4.1,
    },
    { country: 'Germany', visitors: 167, sessions: 189, conversionRate: 3.5 },
    { country: 'France', visitors: 123, sessions: 145, conversionRate: 2.9 },
  ]);

  const [recentEvents, setRecentEvents] = useState<RealtimeEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update metrics with realistic fluctuations
      setMetrics((prevMetrics) =>
        prevMetrics.map((metric) => {
          const changePercent = (Math.random() - 0.5) * 0.1; // ±5% change
          const newValue = Math.max(
            0,
            Math.round(metric.value * (1 + changePercent)),
          );
          const change = ((newValue - metric.value) / metric.value) * 100;

          return {
            ...metric,
            value: newValue,
            change: Math.round(change * 10) / 10,
            trend: change > 1 ? 'up' : change < -1 ? 'down' : 'stable',
            timestamp: Date.now(),
          };
        }),
      );

      // Add new real-time event
      const eventTypes: RealtimeEvent['type'][] = [
        'pageview',
        'purchase',
        'cart_add',
        'search',
        'signup',
      ];
      const locations = [
        'New York, US',
        'Toronto, CA',
        'London, UK',
        'Berlin, DE',
        'Paris, FR',
      ];
      const pages = [
        '/products/wireless-earbuds',
        '/collections/electronics',
        '/cart',
        '/checkout',
        '/account',
      ];

      const newEvent: RealtimeEvent = {
        id: Math.random().toString(36).substr(2, 9),
        type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        userId: `user_${Math.random().toString(36).substr(2, 8)}`,
        page:
          Math.random() > 0.3
            ? pages[Math.floor(Math.random() * pages.length)]
            : undefined,
        product: Math.random() > 0.7 ? 'Wireless Earbuds' : undefined,
        value:
          Math.random() > 0.8
            ? Math.round(Math.random() * 200 + 50)
            : undefined,
        location: locations[Math.floor(Math.random() * locations.length)],
        timestamp: Date.now(),
      };

      setRecentEvents((prev) => [newEvent, ...prev.slice(0, 19)]);
    }, 2000 + Math.random() * 3000); // Every 2-5 seconds

    // Simulate connection status
    setIsConnected(true);

    return () => clearInterval(interval);
  }, []);

  const formatValue = (value: number, type: string) => {
    if (type === 'revenue') {
      return `$${value.toLocaleString()}`;
    }
    return value.toLocaleString();
  };

  const getEventIcon = (type: RealtimeEvent['type']) => {
    switch (type) {
      case 'pageview':
        return <Eye className="w-4 h-4" />;
      case 'purchase':
        return <DollarSign className="w-4 h-4" />;
      case 'cart_add':
        return <ShoppingCart className="w-4 h-4" />;
      case 'search':
        return <TrendingUp className="w-4 h-4" />;
      case 'signup':
        return <Users className="w-4 h-4" />;
    }
  };

  const getEventColor = (type: RealtimeEvent['type']) => {
    switch (type) {
      case 'pageview':
        return 'text-blue-600 bg-blue-50';
      case 'purchase':
        return 'text-green-600 bg-green-50';
      case 'cart_add':
        return 'text-orange-600 bg-orange-50';
      case 'search':
        return 'text-purple-600 bg-purple-50';
      case 'signup':
        return 'text-pink-600 bg-pink-50';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Live Analytics Dashboard
            </h1>
            <p className="text-gray-600">
              Real-time insights into your store performance
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span className="text-sm text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric) => (
            <motion.div
              key={metric.id}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {metric.name}
                  </p>
                  <div className="flex items-center mt-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {formatValue(metric.value, metric.id)}
                    </span>
                    <motion.div
                      key={metric.timestamp}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className={`ml-2 flex items-center text-sm ${
                        metric.trend === 'up'
                          ? 'text-green-600'
                          : metric.trend === 'down'
                          ? 'text-red-600'
                          : 'text-gray-600'
                      }`}
                    >
                      <TrendingUp
                        className={`w-4 h-4 mr-1 ${
                          metric.trend === 'down' ? 'rotate-180' : ''
                        }`}
                      />
                      {Math.abs(metric.change)}%
                    </motion.div>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${metric.color} bg-opacity-10`}>
                  <metric.icon className={`w-6 h-6 ${metric.color}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Geographic Data */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center mb-6">
              <Globe className="w-5 h-5 text-gray-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">
                Geographic Distribution
              </h2>
            </div>
            <div className="space-y-4">
              {geographicData.map((country, index) => (
                <div
                  key={country.country}
                  className="flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {country.country}
                      </span>
                      <span className="text-sm text-gray-600">
                        {country.visitors} visitors
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(country.visitors / 456) * 100}%`,
                        }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className="bg-blue-600 h-2 rounded-full"
                      />
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {country.conversionRate}%
                    </p>
                    <p className="text-xs text-gray-600">Conv. Rate</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Events */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center mb-6">
              <Clock className="w-5 h-5 text-gray-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">
                Real-time Events
              </h2>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              <AnimatePresence>
                {recentEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center p-3 border border-gray-100 rounded-lg bg-gray-50"
                  >
                    <div
                      className={`p-2 rounded-lg ${getEventColor(
                        event.type,
                      )} mr-3`}
                    >
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 capitalize">
                          {event.type.replace('_', ' ')}
                        </p>
                        <span className="text-xs text-gray-500">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 truncate">
                        {event.page && `Page: ${event.page}`}
                        {event.product && ` • Product: ${event.product}`}
                        {event.value && ` • Value: $${event.value}`}
                      </p>
                      <p className="text-xs text-gray-500">{event.location}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveAnalyticsDashboard;
