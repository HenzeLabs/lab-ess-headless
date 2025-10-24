import { NextRequest, NextResponse } from 'next/server';
import { PREDICTIVE_SEARCH } from '@/lib/queries/search';

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

export async function POST(request: NextRequest) {
  try {
    const { query, limit = 10 } = await request.json();

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        results: {
          queries: [],
          products: [],
          collections: [],
        },
        suggestions: [],
      });
    }

    const response = await fetch(
      `https://${SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_ACCESS_TOKEN!,
        },
        body: JSON.stringify({
          query: PREDICTIVE_SEARCH,
          variables: {
            query,
            limit,
          },
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      throw new Error('GraphQL query failed');
    }

    const predictiveSearch = data.data?.predictiveSearch || {};

    return NextResponse.json({
      results: {
        queries: predictiveSearch.queries || [],
        products: predictiveSearch.products || [],
        collections: predictiveSearch.collections || [],
      },
      suggestions: predictiveSearch.queries || [],
    });
  } catch (error) {
    console.error('Predictive search error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch search suggestions',
        results: {
          queries: [],
          products: [],
          collections: [],
        },
        suggestions: [],
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    error: 'Method not allowed. Use POST instead.',
  }, { status: 405 });
}
