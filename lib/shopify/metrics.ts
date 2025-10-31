/**
 * Shopify Admin API Metrics Integration
 *
 * Fetches sales, revenue, and customer data from Shopify Admin API
 * to display in the admin metrics dashboard.
 */

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_ADMIN_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || '2025-07';

export interface ShopifyMetrics {
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
  conversionRate: number;
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

/**
 * Fetch Shopify metrics via Admin API (GraphQL)
 */
async function shopifyAdminFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ADMIN_ACCESS_TOKEN) {
    throw new Error('Shopify Admin API credentials not configured');
  }

  const endpoint = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': SHOPIFY_ADMIN_ACCESS_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 300 }, // Cache for 5 minutes
  });

  if (!response.ok) {
    throw new Error(`Shopify API error: ${response.status}`);
  }

  const result = await response.json();

  // GraphQL can return both errors and data - only fail if there's no data
  if (result.errors && !result.data) {
    console.error('Shopify GraphQL errors:', result.errors);
    throw new Error('Shopify GraphQL query failed');
  }

  // Log access scope warnings but continue with available data
  if (result.errors) {
    console.warn(
      'Shopify GraphQL warnings (continuing with available data):',
      result.errors,
    );
  }

  return result.data as T;
}

/**
 * Fetch Shopify metrics for a date range
 */
export async function fetchShopifyMetrics(
  startDate: string,
  endDate: string,
): Promise<ShopifyMetrics | null> {
  try {
    // Calculate previous period for comparison
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    const prevStart = new Date(start);
    prevStart.setDate(prevStart.getDate() - daysDiff);
    const prevEnd = new Date(start);
    prevEnd.setDate(prevEnd.getDate() - 1);

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    // Fetch orders for current period
    const ordersQuery = `
      query GetOrders($query: String!) {
        orders(first: 250, query: $query) {
          edges {
            node {
              id
              name
              createdAt
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              displayFinancialStatus
              customer {
                id
                displayName
                email
              }
              lineItems(first: 10) {
                edges {
                  node {
                    id
                    title
                    quantity
                    originalTotalSet {
                      shopMoney {
                        amount
                      }
                    }
                    image {
                      url
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const currentQuery = `created_at:>='${formatDate(start)}' AND created_at:<='${formatDate(end)}'`;
    const previousQuery = `created_at:>='${formatDate(prevStart)}' AND created_at:<='${formatDate(prevEnd)}'`;

    const [currentOrders, previousOrders] = await Promise.all([
      shopifyAdminFetch<{
        orders: { edges: Array<{ node: any }> };
      }>(ordersQuery, { query: currentQuery }),
      shopifyAdminFetch<{
        orders: { edges: Array<{ node: any }> };
      }>(ordersQuery, { query: previousQuery }),
    ]);

    // Calculate revenue
    const currentRevenue = currentOrders.orders.edges.reduce(
      (sum, { node }) => sum + parseFloat(node.totalPriceSet.shopMoney.amount),
      0,
    );
    const previousRevenue = previousOrders.orders.edges.reduce(
      (sum, { node }) => sum + parseFloat(node.totalPriceSet.shopMoney.amount),
      0,
    );

    const currentOrderCount = currentOrders.orders.edges.length;
    const previousOrderCount = previousOrders.orders.edges.length;

    // Calculate average order value
    const avgOrderValue =
      currentOrderCount > 0 ? currentRevenue / currentOrderCount : 0;

    // Track customers
    const customerIds = new Set<string>();
    const returningCustomerIds = new Set<string>();

    currentOrders.orders.edges.forEach(({ node }) => {
      if (node.customer?.id) {
        customerIds.add(node.customer.id);
      }
    });

    // Check if customers had previous orders
    previousOrders.orders.edges.forEach(({ node }) => {
      if (node.customer?.id && customerIds.has(node.customer.id)) {
        returningCustomerIds.add(node.customer.id);
      }
    });

    const newCustomers = customerIds.size - returningCustomerIds.size;
    const returningCustomers = returningCustomerIds.size;

    // Calculate top products
    const productSales = new Map<
      string,
      { title: string; revenue: number; quantity: number; image?: string }
    >();

    currentOrders.orders.edges.forEach(({ node }) => {
      node.lineItems.edges.forEach(({ node: item }: { node: any }) => {
        const existing = productSales.get(item.title) || {
          title: item.title,
          revenue: 0,
          quantity: 0,
          image: item.image?.url,
        };
        existing.revenue += parseFloat(item.originalTotalSet.shopMoney.amount);
        existing.quantity += item.quantity;
        productSales.set(item.title, existing);
      });
    });

    const topProducts = Array.from(productSales.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Get recent orders (last 10)
    const recentOrders = currentOrders.orders.edges
      .slice(0, 10)
      .map(({ node }) => ({
        id: node.id,
        orderNumber: node.name,
        customer: node.customer?.displayName || 'Guest',
        total: parseFloat(node.totalPriceSet.shopMoney.amount),
        createdAt: node.createdAt,
        status: node.displayFinancialStatus,
      }));

    // Fetch abandoned checkouts
    const abandonedCheckoutsQuery = `
      query GetAbandonedCheckouts($query: String!) {
        checkouts(first: 250, query: $query) {
          edges {
            node {
              id
              totalPriceV2 {
                amount
                currencyCode
              }
            }
          }
        }
      }
    `;

    const abandonedCheckouts = await shopifyAdminFetch<{
      checkouts: { edges: Array<{ node: any }> };
    }>(abandonedCheckoutsQuery, { query: currentQuery });

    const abandonedCartCount = abandonedCheckouts.checkouts.edges.length;
    const abandonedCartValue = abandonedCheckouts.checkouts.edges.reduce(
      (sum, { node }) => sum + parseFloat(node.totalPriceV2.amount),
      0,
    );

    // Calculate percentage changes
    const revenueChange =
      previousRevenue > 0
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
        : 0;
    const ordersChange =
      previousOrderCount > 0
        ? ((currentOrderCount - previousOrderCount) / previousOrderCount) * 100
        : 0;

    const currency =
      currentOrders.orders.edges[0]?.node?.totalPriceSet?.shopMoney
        ?.currencyCode || 'USD';

    return {
      revenue: {
        total: currentRevenue,
        currency,
        previousPeriod: previousRevenue,
        change: revenueChange,
      },
      orders: {
        total: currentOrderCount,
        previousPeriod: previousOrderCount,
        change: ordersChange,
      },
      averageOrderValue: avgOrderValue,
      conversionRate: 0, // Will be calculated with GA4 sessions
      customers: {
        new: newCustomers,
        returning: returningCustomers,
        total: customerIds.size,
      },
      abandonedCarts: {
        count: abandonedCartCount,
        value: abandonedCartValue,
      },
      topProducts,
      recentOrders,
    };
  } catch (error) {
    console.error('Error fetching Shopify metrics:', error);
    return null;
  }
}

/**
 * Calculate conversion rate using GA4 sessions
 */
export function calculateConversionRate(
  orders: number,
  sessions: number,
): number {
  if (sessions === 0) return 0;
  return (orders / sessions) * 100;
}
