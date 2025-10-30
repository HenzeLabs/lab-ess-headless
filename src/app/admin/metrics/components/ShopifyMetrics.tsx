'use client';

import { useEffect, useState } from 'react';

interface ShopifyMetricsData {
  revenue: {
    total: number;
    currency: string;
    previousPeriod: number;
    change: number;
  };
  orders: {
    total: number;
    previousPeriod: number;
    change: number;
  };
  averageOrderValue: number;
  customers: {
    new: number;
    returning: number;
    total: number;
  };
  abandonedCarts: {
    count: number;
    value: number;
  };
  topProducts: Array<{
    id: string;
    title: string;
    revenue: number;
    quantity: number;
    image?: string;
  }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customer: string;
    total: number;
    createdAt: string;
    status: string;
  }>;
}

interface ShopifyMetricsProps {
  startDate: string;
  endDate: string;
}

export default function ShopifyMetrics({
  startDate,
  endDate,
}: ShopifyMetricsProps) {
  const [data, setData] = useState<ShopifyMetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/metrics/shopify?start=${startDate}&end=${endDate}`,
      );

      if (!response.ok) {
        throw new Error('Failed to fetch Shopify metrics');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-gray-100 animate-pulse rounded-lg"></div>
        <div className="h-32 bg-gray-100 animate-pulse rounded-lg"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">
          ⚠️ {error || 'No Shopify data available'}
        </p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: data.revenue.currency,
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Revenue & Orders KPIs */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          💰 Revenue & Sales
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Revenue */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-start mb-2">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <span
                className={`text-sm font-medium ${getChangeColor(data.revenue.change)}`}
              >
                {formatPercent(data.revenue.change)}
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(data.revenue.total)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              vs {formatCurrency(data.revenue.previousPeriod)} last period
            </p>
          </div>

          {/* Total Orders */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-start mb-2">
              <p className="text-sm text-gray-600">Orders</p>
              <span
                className={`text-sm font-medium ${getChangeColor(data.orders.change)}`}
              >
                {formatPercent(data.orders.change)}
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {data.orders.total}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              vs {data.orders.previousPeriod} last period
            </p>
          </div>

          {/* Average Order Value */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-start mb-2">
              <p className="text-sm text-gray-600">Avg Order Value</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(data.averageOrderValue)}
            </p>
            <p className="text-xs text-gray-500 mt-1">per order</p>
          </div>
        </div>
      </div>

      {/* Customers & Carts */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          👥 Customers & Carts
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* New Customers */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <p className="text-sm text-gray-600 mb-2">New Customers</p>
            <p className="text-3xl font-bold text-green-600">
              {data.customers.new}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {data.customers.returning} returning
            </p>
          </div>

          {/* Abandoned Carts */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <p className="text-sm text-gray-600 mb-2">Abandoned Carts</p>
            <p className="text-3xl font-bold text-orange-600">
              {data.abandonedCarts.count}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatCurrency(data.abandonedCarts.value)} potential revenue
            </p>
          </div>

          {/* Total Customers */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <p className="text-sm text-gray-600 mb-2">Total Customers</p>
            <p className="text-3xl font-bold text-gray-900">
              {data.customers.total}
            </p>
            <p className="text-xs text-gray-500 mt-1">unique customers</p>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🏆 Top Products
        </h3>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.topProducts.map((product, index) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 mr-3">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.title}
                            className="h-10 w-10 rounded object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                            #{index + 1}
                          </div>
                        )}
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {product.title}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {product.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                    {formatCurrency(product.revenue)}
                  </td>
                </tr>
              ))}
              {data.topProducts.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No products sold in this period
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📦 Recent Orders
        </h3>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.orderNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span
                      className={`inline-flex px-2 text-xs font-semibold rounded-full ${
                        order.status === 'PAID'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
              {data.recentOrders.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No orders in this period
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
