import { NextRequest, NextResponse } from 'next/server';
import { shopifyFetch } from '@/lib/shopify';

// GraphQL query to fetch real order data for analytics
const GET_ORDERS_ANALYTICS = `
  query getOrdersAnalytics($first: Int!, $after: String) {
    orders(first: $first, after: $after, sortKey: CREATED_AT, reverse: true) {
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
          customer {
            id
            email
            createdAt
          }
          lineItems(first: 10) {
            edges {
              node {
                quantity
                variant {
                  product {
                    title
                    productType
                  }
                }
              }
            }
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

// GraphQL query to get customer analytics
const GET_CUSTOMERS_ANALYTICS = `
  query getCustomersAnalytics($first: Int!) {
    customers(first: $first, sortKey: CREATED_AT, reverse: true) {
      edges {
        node {
          id
          email
          createdAt
          ordersCount
          totalSpent
        }
      }
    }
  }
`;

// GraphQL query to get product analytics
const GET_PRODUCTS_ANALYTICS = `
  query getProductsAnalytics($first: Int!) {
    products(first: $first, sortKey: CREATED_AT, reverse: true) {
      edges {
        node {
          id
          title
          handle
          createdAt
          totalInventory
          variants(first: 1) {
            edges {
              node {
                price
              }
            }
          }
        }
      }
    }
  }
`;

interface ShopifyOrder {
  id: string;
  name: string;
  createdAt: string;
  totalPriceSet: {
    shopMoney: {
      amount: string;
      currencyCode: string;
    };
  };
  customer: {
    id: string;
    email: string;
    createdAt: string;
  } | null;
  lineItems: {
    edges: Array<{
      node: {
        quantity: number;
        variant: {
          product: {
            title: string;
            productType: string;
          };
        };
      };
    }>;
  };
}

interface ShopifyCustomer {
  id: string;
  email: string;
  createdAt: string;
  ordersCount: number;
  totalSpent: string;
}

interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  createdAt: string;
  totalInventory: number;
  variants: {
    edges: Array<{
      node: {
        price: string;
      };
    }>;
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';

    // Calculate date range
    const daysBack =
      timeRange === '24h'
        ? 1
        : timeRange === '7d'
        ? 7
        : timeRange === '30d'
        ? 30
        : 90;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    console.log(`Fetching real Shopify data for last ${daysBack} days...`);

    // Fetch data in parallel
    const [ordersResponse, customersResponse, productsResponse] =
      await Promise.all([
        shopifyFetch<{ orders: { edges: Array<{ node: ShopifyOrder }> } }>({
          query: GET_ORDERS_ANALYTICS,
          variables: { first: 250 },
        }),
        shopifyFetch<{
          customers: { edges: Array<{ node: ShopifyCustomer }> };
        }>({
          query: GET_CUSTOMERS_ANALYTICS,
          variables: { first: 100 },
        }),
        shopifyFetch<{ products: { edges: Array<{ node: ShopifyProduct }> } }>({
          query: GET_PRODUCTS_ANALYTICS,
          variables: { first: 50 },
        }),
      ]);

    if (
      !ordersResponse.data ||
      !customersResponse.data ||
      !productsResponse.data
    ) {
      throw new Error('Failed to fetch Shopify data');
    }

    const orders = ordersResponse.data.orders.edges.map((edge) => edge.node);
    const customers = customersResponse.data.customers.edges.map(
      (edge) => edge.node,
    );
    const products = productsResponse.data.products.edges.map(
      (edge) => edge.node,
    );

    // Filter orders by date range
    const filteredOrders = orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDate;
    });

    // Calculate analytics metrics
    const totalRevenue = filteredOrders.reduce((sum, order) => {
      return sum + parseFloat(order.totalPriceSet.shopMoney.amount);
    }, 0);

    const totalOrders = filteredOrders.length;

    // Count unique customers who ordered in the time period
    const uniqueCustomerIds = new Set(
      filteredOrders.map((order) => order.customer?.id).filter(Boolean),
    );
    const activeCustomers = uniqueCustomerIds.size;

    // Calculate conversion rate (simplified - orders vs total customers)
    const totalCustomers = customers.length;
    const conversionRate =
      totalCustomers > 0 ? (totalOrders / totalCustomers) * 100 : 0;

    // Average order value
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Product metrics
    const totalProducts = products.length;
    const totalInventory = products.reduce(
      (sum, product) => sum + (product.totalInventory || 0),
      0,
    );

    // Recent activity (last 5 orders)
    const recentActivities = filteredOrders.slice(0, 5).map((order) => ({
      id: order.id,
      type: 'order' as const,
      title: `Order ${order.name}`,
      description: `$${parseFloat(order.totalPriceSet.shopMoney.amount).toFixed(
        2,
      )} - ${order.customer?.email || 'Guest'}`,
      timestamp: new Date(order.createdAt),
      status: 'success' as const,
    }));

    // Daily breakdown for chart data
    const dailyData: {
      [key: string]: { revenue: number; orders: number; date: string };
    } = {};

    for (let i = daysBack - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      dailyData[dateKey] = { revenue: 0, orders: 0, date: dateKey };
    }

    filteredOrders.forEach((order) => {
      const dateKey = order.createdAt.split('T')[0];
      if (dailyData[dateKey]) {
        dailyData[dateKey].revenue += parseFloat(
          order.totalPriceSet.shopMoney.amount,
        );
        dailyData[dateKey].orders += 1;
      }
    });

    const chartData = Object.values(dailyData).map((day) => ({
      label: new Date(day.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      value: day.revenue,
    }));

    return NextResponse.json({
      success: true,
      summary: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders,
        activeCustomers,
        conversionRate: Math.round(conversionRate * 100) / 100,
        avgOrderValue: Math.round(avgOrderValue * 100) / 100,
        totalProducts,
        totalInventory,
        totalCustomers,
      },
      chartData,
      recentActivities,
      timeRange,
      dataSource: 'shopify',
      storeInfo: {
        domain: process.env.SHOPIFY_STORE_DOMAIN,
        ordersCount: orders.length,
        customersCount: customers.length,
        productsCount: products.length,
      },
    });
  } catch (error) {
    console.error('Error fetching real Shopify analytics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch real Shopify data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
