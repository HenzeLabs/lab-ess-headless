import { NextResponse } from 'next/server';
import { shopifyFetch } from '@/lib/shopify';

interface ImageNode {
  id: string;
  url: string;
  altText?: string;
}

interface ProductByHandle {
  id: string;
  title: string;
  handle: string;
  descriptionHtml: string;
  featuredImage: {
    url: string;
    altText?: string;
  };
  images: {
    edges: {
      node: ImageNode;
    }[];
  };
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
}

const QUERY = /* GraphQL */ `
  query ProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id
      title
      handle
      descriptionHtml
      featuredImage {
        url
        altText
      }
      images(first: 6) {
        edges {
          node {
            id
            url
            altText
          }
        }
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
    }
  }
`;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const handle = searchParams.get('handle');
  if (!handle)
    return NextResponse.json({ error: 'Missing handle' }, { status: 400 });
  try {
    const response = await shopifyFetch<{
      data: { productByHandle: ProductByHandle };
    }>({ query: QUERY, variables: { handle } });

    if (response.success && response.data?.data?.productByHandle) {
      const p = response.data.data.productByHandle;
      if (!p) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      return NextResponse.json({
        product: {
          ...p,
          images:
            p.images?.edges?.map((e: { node: ImageNode }) => e.node) || [],
        },
      });
    } else if (response.success) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    } else {
      return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[api/product-by-handle]`, msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
