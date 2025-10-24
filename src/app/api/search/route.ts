import { NextRequest, NextResponse } from 'next/server';
import { SEARCH_ALL } from '@/lib/queries/search';

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

export async function POST(request: NextRequest) {
  try {
    const {
      query,
      sortKey = 'RELEVANCE',
      reverse = false,
      first = 20,
      after,
    } = await request.json();

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        products: [],
        collections: [],
        pages: [],
        articles: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalResults: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
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
          query: SEARCH_ALL,
          variables: {
            query,
            first,
            after,
            productSortKey: sortKey,
            reverse,
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

    const products = data.data?.products?.edges?.map((edge: any) => edge.node) || [];
    const collections = data.data?.collections?.edges?.map((edge: any) => edge.node) || [];
    const pages = data.data?.pages?.edges?.map((edge: any) => edge.node) || [];
    const articles = data.data?.articles?.edges?.map((edge: any) => edge.node) || [];

    const pageInfo = data.data?.products?.pageInfo || {};

    return NextResponse.json({
      products,
      collections,
      pages,
      articles,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalResults: products.length + collections.length + pages.length + articles.length,
        hasNextPage: pageInfo.hasNextPage || false,
        hasPreviousPage: pageInfo.hasPreviousPage || false,
        endCursor: pageInfo.endCursor,
        startCursor: pageInfo.startCursor,
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      {
        error: 'Failed to perform search',
        products: [],
        collections: [],
        pages: [],
        articles: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalResults: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
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
