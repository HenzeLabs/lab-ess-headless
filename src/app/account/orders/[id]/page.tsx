'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface OrderDetail {
  id: string;
  name: string;
  orderNumber: number;
  processedAt: string;
  fulfillmentStatus: string;
  financialStatus: string;
  customerUrl: string;
  statusUrl: string;
  currentTotalPrice: {
    amount: string;
    currencyCode: string;
  };
  totalShippingPrice: {
    amount: string;
    currencyCode: string;
  };
  totalTax: {
    amount: string;
    currencyCode: string;
  };
  subtotalPrice: {
    amount: string;
    currencyCode: string;
  };
  totalRefunded: {
    amount: string;
    currencyCode: string;
  };
  shippingAddress: {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    country: string;
    zip: string;
    phone?: string;
  };
  billingAddress: {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    country: string;
    zip: string;
    phone?: string;
  };
  lineItems: {
    edges: Array<{
      node: {
        title: string;
        quantity: number;
        variant: {
          id: string;
          title: string;
          price: {
            amount: string;
            currencyCode: string;
          };
          image?: {
            url: string;
            altText?: string;
          };
          product: {
            id: string;
            title: string;
            handle: string;
          };
        };
        originalTotalPrice: {
          amount: string;
          currencyCode: string;
        };
        discountedTotalPrice: {
          amount: string;
          currencyCode: string;
        };
      };
    }>;
  };
  fulfillments: Array<{
    trackingCompany?: string;
    trackingInfo?: Array<{
      number: string;
      url: string;
    }>;
    fulfillmentLineItems: {
      edges: Array<{
        node: {
          quantity: number;
          lineItem: {
            title: string;
          };
        };
      }>;
    };
  }>;
}

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrderDetail = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get access token from localStorage
      const accessToken = localStorage.getItem('accessToken');

      if (!accessToken) {
        router.push('/account/login');
        return;
      }

      const response = await fetch(`/api/orders/${orderId}`, {
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
          const retryResponse = await fetch(`/api/orders/${orderId}`, {
            headers: {
              Authorization: `Bearer ${newAccessToken}`,
            },
          });

          if (retryResponse.ok) {
            const data = await retryResponse.json();
            setOrder(data.order);
          } else if (retryResponse.status === 404) {
            setError('Order not found');
          } else {
            throw new Error('Failed to fetch order details');
          }
        } else {
          // Refresh failed, redirect to login
          router.push('/account/login');
        }
      } else if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
      } else if (response.status === 404) {
        setError('Order not found');
      } else {
        throw new Error('Failed to fetch order details');
      }
    } catch (err) {
      console.error('Error fetching order detail:', err);
      setError('Failed to load order details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrderDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
        <div className="bg-white p-12 rounded-lg shadow">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 p-6 rounded-lg">
          <p className="text-red-600">{error}</p>
          <Link
            href="/account/orders"
            className="mt-4 text-blue-600 hover:underline inline-block"
          >
            ← Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Order not found</p>
        <Link
          href="/account/orders"
          className="mt-4 text-blue-600 hover:underline inline-block"
        >
          ← Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/account/orders"
          className="text-blue-600 hover:underline mb-4 inline-block"
        >
          ← Back to Orders
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Order {order.name}</h1>
            <p className="text-gray-600">
              Placed on {formatDate(order.processedAt)}
            </p>
          </div>
          <div className="text-right">
            <div className="space-x-2">
              <span
                className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getStatusBadgeColor(order.financialStatus)}`}
              >
                Payment: {order.financialStatus}
              </span>
              <span
                className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getStatusBadgeColor(order.fulfillmentStatus)}`}
              >
                Fulfillment: {order.fulfillmentStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">Order Items</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {order.lineItems.edges.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-4 pb-4 border-b last:border-b-0 last:pb-0"
                  >
                    {item.node.variant.image && (
                      <Image
                        src={item.node.variant.image.url}
                        alt={item.node.variant.image.altText || item.node.title}
                        width={80}
                        height={80}
                        className="w-20 h-20 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <Link
                        href={`/products/${item.node.variant.product.handle}`}
                        className="font-medium hover:text-blue-600"
                      >
                        {item.node.title}
                      </Link>
                      {item.node.variant.title !== 'Default Title' && (
                        <p className="text-sm text-gray-600">
                          {item.node.variant.title}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">
                        Quantity: {item.node.quantity}
                      </p>
                      <div className="mt-1">
                        <span className="font-medium">
                          {formatPrice(
                            item.node.discountedTotalPrice.amount,
                            item.node.discountedTotalPrice.currencyCode,
                          )}
                        </span>
                        {item.node.originalTotalPrice.amount !==
                          item.node.discountedTotalPrice.amount && (
                          <span className="ml-2 text-sm text-gray-500 line-through">
                            {formatPrice(
                              item.node.originalTotalPrice.amount,
                              item.node.originalTotalPrice.currencyCode,
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tracking Information */}
          {order.fulfillments && order.fulfillments.length > 0 && (
            <div className="bg-white rounded-lg shadow mt-6">
              <div className="px-6 py-4 border-b">
                <h2 className="text-xl font-semibold">Tracking Information</h2>
              </div>
              <div className="p-6">
                {order.fulfillments.map((fulfillment, index) => (
                  <div key={index} className="mb-4 last:mb-0">
                    {fulfillment.trackingCompany && (
                      <p className="text-sm text-gray-600 mb-2">
                        Carrier: {fulfillment.trackingCompany}
                      </p>
                    )}
                    {fulfillment.trackingInfo &&
                      fulfillment.trackingInfo.map(
                        (tracking, trackingIndex) => (
                          <div
                            key={trackingIndex}
                            className="flex items-center space-x-2"
                          >
                            <span className="text-sm">
                              Tracking #: {tracking.number}
                            </span>
                            {tracking.url && (
                              <a
                                href={tracking.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm"
                              >
                                Track Package →
                              </a>
                            )}
                          </div>
                        ),
                      )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Order Summary and Addresses */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">Order Summary</h2>
            </div>
            <div className="p-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>
                    {formatPrice(
                      order.subtotalPrice.amount,
                      order.subtotalPrice.currencyCode,
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>
                    {formatPrice(
                      order.totalShippingPrice.amount,
                      order.totalShippingPrice.currencyCode,
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span>
                    {formatPrice(
                      order.totalTax.amount,
                      order.totalTax.currencyCode,
                    )}
                  </span>
                </div>
                {parseFloat(order.totalRefunded.amount) > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Refunded</span>
                    <span>
                      -
                      {formatPrice(
                        order.totalRefunded.amount,
                        order.totalRefunded.currencyCode,
                      )}
                    </span>
                  </div>
                )}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>
                      {formatPrice(
                        order.currentTotalPrice.amount,
                        order.currentTotalPrice.currencyCode,
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold">Shipping Address</h2>
              </div>
              <div className="p-6">
                <p className="font-medium">
                  {order.shippingAddress.firstName}{' '}
                  {order.shippingAddress.lastName}
                </p>
                <p className="text-sm text-gray-600">
                  {order.shippingAddress.address1}
                  {order.shippingAddress.address2 && (
                    <>, {order.shippingAddress.address2}</>
                  )}
                </p>
                <p className="text-sm text-gray-600">
                  {order.shippingAddress.city}, {order.shippingAddress.province}{' '}
                  {order.shippingAddress.zip}
                </p>
                <p className="text-sm text-gray-600">
                  {order.shippingAddress.country}
                </p>
                {order.shippingAddress.phone && (
                  <p className="text-sm text-gray-600 mt-2">
                    Phone: {order.shippingAddress.phone}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Billing Address */}
          {order.billingAddress && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold">Billing Address</h2>
              </div>
              <div className="p-6">
                <p className="font-medium">
                  {order.billingAddress.firstName}{' '}
                  {order.billingAddress.lastName}
                </p>
                <p className="text-sm text-gray-600">
                  {order.billingAddress.address1}
                  {order.billingAddress.address2 && (
                    <>, {order.billingAddress.address2}</>
                  )}
                </p>
                <p className="text-sm text-gray-600">
                  {order.billingAddress.city}, {order.billingAddress.province}{' '}
                  {order.billingAddress.zip}
                </p>
                <p className="text-sm text-gray-600">
                  {order.billingAddress.country}
                </p>
                {order.billingAddress.phone && (
                  <p className="text-sm text-gray-600 mt-2">
                    Phone: {order.billingAddress.phone}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          {order.statusUrl && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <a
                  href={order.statusUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
                >
                  View Order Status on Shopify →
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
