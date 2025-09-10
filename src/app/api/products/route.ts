import { NextResponse } from 'next/server';
import { shopifyFetch } from '@/lib/shopify';

interface ProductNode {
  id: string;
  title: string;
  handle: string;
  availableForSale: boolean;
  featuredImage: {
    url: string;
    altText?: string;
  };
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
}

interface ProductItem {
  id: string;
  title: string;
  handle: string;
  featuredImage: {
    url: string;
    altText?: string;
  } | null;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
}

const QUERY = /* GraphQL */ `
  query Products($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          handle
          availableForSale
          featuredImage {
            url
            altText
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;

export async function GET() {
  try {
    const response = await shopifyFetch<{
      data: { products: { edges: { node: ProductNode }[] } };
    }>({ query: QUERY, variables: { first: 5 } });

    if (response.success) {
      const items: ProductItem[] =
        response.data.data.products?.edges?.map((e: { node: ProductNode }) => {
          const n = e.node;
          return {
            id: n.id,
            title: n.title,
            handle: n.handle,
            featuredImage: n.featuredImage
              ? { url: n.featuredImage.url, altText: n.featuredImage.altText }
              : null,
            priceRange: {
              minVariantPrice: n.priceRange?.minVariantPrice,
            },
          };
        }) ?? [];
      return NextResponse.json({ count: items.length, products: items });
    } else {
      return NextResponse.json({ error: response.errors }, { status: 500 });
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[api/products]`, msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
