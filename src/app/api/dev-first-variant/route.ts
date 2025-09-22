import { NextResponse } from 'next/server';
import { shopifyFetch } from '@/lib/shopify';

const QUERY = `
  query FirstVariantId {
    products(first: 1) {
      edges {
        node {
          handle
          variants(first: 1) {
            edges {
              node { id }
            }
          }
        }
      }
    }
  }
`;

export async function GET() {
  try {
    const { data } = await shopifyFetch<{
      products: {
        edges: {
          node: {
            handle: string;
            variants: { edges: { node: { id: string } }[] };
          };
        }[];
      };
    }>({ query: QUERY });
    const node = data.products.edges?.[0]?.node;
    const variantId = node?.variants?.edges?.[0]?.node?.id ?? null;
    return NextResponse.json({ variantId, handle: node?.handle ?? null });
  } catch (e) {
    return NextResponse.json(
      { error: 'Failed to fetch variant id' },
      { status: 500 },
    );
  }
}
