'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Order {
  id: string;
  cursor: string;
  name: string;
  orderNumber: number;
  processedAt: string;
  fulfillmentStatus: string;
  financialStatus: string;
  currentTotalPrice: {
    amount: string;
    currencyCode: string;
  };
  lineItems: {
    edges: Array<{
      node: {
        title: string;
        quantity: number;
      };
    }>;
  };
}

interface OrdersResponse {
  orders: Order[];
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor?: string;
    endCursor?: string;
  };
  totalCount: number;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageInfo, setPageInfo] = useState<OrdersResponse['pageInfo'] | null>(
    null,
  );

  const fetchOrders = async (cursor?: string, direction?: 'next' | 'prev') => {
    setLoading(true);
    setError(null);

    try {
      // Get access token from localStorage
      const accessToken = localStorage.getItem('accessToken');

      if (!accessToken) {
        router.push('/account/login');
        return;
      }

      // Build query parameters
      const params = new URLSearchParams();
      if (direction === 'next' && cursor) {
        params.set('after', cursor);
        params.set('first', '10');
      } else if (direction === 'prev' && cursor) {
        params.set('before', cursor);
        params.set('last', '10');
      } else {
        params.set('first', '10');
      }

      const response = await fetch(`/api/orders?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 401) {
        // Token expired, try to refresh
        const refreshResponse = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });

        if (refreshResponse.ok) {
          const { accessToken: newAccessToken } = await refreshResponse.json();
          localStorage.setItem('accessToken', newAccessToken);

          // Retry the request
          const retryResponse = await fetch(
            `/api/orders?${params.toString()}`,
            {
              headers: {
                Authorization: `Bearer ${newAccessToken}`,
              },
            },
          );

          if (retryResponse.ok) {
            const data: OrdersResponse = await retryResponse.json();
            setOrders(data.orders);
            setPageInfo(data.pageInfo);
          } else {
            throw new Error('Failed to fetch orders');
          }
        } else {
          // Refresh failed, redirect to login
          router.push('/account/login');
        }
      } else if (response.ok) {
        const data: OrdersResponse = await response.json();
        setOrders(data.orders);
        setPageInfo(data.pageInfo);
      } else {
        throw new Error('Failed to fetch orders');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatPrice = (amount: string, currencyCode: string) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    });
    return formatter.format(parseFloat(amount));
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'fulfilled':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'unfulfilled':
        return 'bg-yellow-100 text-yellow-800';
      case 'refunded':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Order History</h1>
        <div className="bg-white p-12 rounded-lg shadow">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--brand-dark))]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Order History</h1>
        <div className="bg-red-50 p-6 rounded-lg">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => fetchOrders()}
            className="mt-4 text-[hsl(var(--brand-dark))] hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Order History</h1>

      {orders.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-center py-8">
            You have no orders yet.
          </p>
          <div className="text-center">
            <Link
              href="/collections"
              className="text-[hsl(var(--brand-dark))] hover:underline"
            >
              Start Shopping →
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">
                      Order {order.name}
                    </h2>
                    <p className="text-sm text-gray-600">
                      Placed on {formatDate(order.processedAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">
                      {formatPrice(
                        order.currentTotalPrice.amount,
                        order.currentTotalPrice.currencyCode,
                      )}
                    </p>
                    <div className="mt-2 space-x-2">
                      <span
                        className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(order.financialStatus)}`}
                      >
                        {order.financialStatus}
                      </span>
                      <span
                        className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(order.fulfillmentStatus)}`}
                      >
                        {order.fulfillmentStatus}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-2">
                    {order.lineItems.edges.length} item
                    {order.lineItems.edges.length !== 1 ? 's' : ''}
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-700">
                      {order.lineItems.edges.slice(0, 2).map((item, index) => (
                        <span key={index}>
                          {item.node.title} ({item.node.quantity})
                          {index <
                            Math.min(1, order.lineItems.edges.length - 1) &&
                            ', '}
                        </span>
                      ))}
                      {order.lineItems.edges.length > 2 && ' ...'}
                    </div>
                    <Link
                      href={`/account/orders/${order.id.split('/').pop()}`}
                      className="text-[hsl(var(--brand-dark))] hover:underline text-sm font-medium"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pageInfo && (pageInfo.hasNextPage || pageInfo.hasPreviousPage) && (
            <div className="flex justify-center mt-8 space-x-4">
              <button
                onClick={() => fetchOrders(pageInfo.startCursor, 'prev')}
                disabled={!pageInfo.hasPreviousPage}
                className={`px-4 py-2 rounded ${
                  pageInfo.hasPreviousPage
                    ? 'bg-[hsl(var(--brand-dark))] text-white hover:bg-[hsl(var(--brand-dark))]'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                ← Previous
              </button>
              <button
                onClick={() => fetchOrders(pageInfo.endCursor, 'next')}
                disabled={!pageInfo.hasNextPage}
                className={`px-4 py-2 rounded ${
                  pageInfo.hasNextPage
                    ? 'bg-[hsl(var(--brand-dark))] text-white hover:bg-[hsl(var(--brand-dark))]'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
