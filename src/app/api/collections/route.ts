// Copyright (c) 2025 Lab Essentials. MIT License.

import { NextResponse } from 'next/server';
import { shopifyFetch } from '@/lib/shopify';

const QUERY = /* GraphQL */ `
  query CollectionsWithFirstProduct($first: Int!) {
    collections(first: $first) {
      edges {
        node {
          id
          title
          handle
          description
          image {
            url
            altText
          }
          products(first: 1) {
            edges {
              node {
                featuredImage {
                  url
                  altText
                }
              }
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
      collections: {
        edges: {
          node: {
            id: string;
            title: string;
            handle: string;
            description?: string;
            image?: { url: string; altText?: string } | null;
            products?: {
              edges: {
                node: {
                  featuredImage?: { url: string; altText?: string } | null;
                };
              }[];
            };
          };
        }[];
      };
    }>({
      query: QUERY,
      variables: { first: 5 },
    });

    const edges = response.data.collections?.edges ?? [];
    const items = edges.map((e) => {
      const n = e.node;
      let image = n.image;
      if (!image && n.products && n.products.edges.length > 0) {
        const prodImg = n.products.edges[0].node.featuredImage;
        if (prodImg) {
          image = { url: prodImg.url, altText: prodImg.altText };
        }
      }
      return {
        id: n.id,
        title: n.title,
        handle: n.handle,
        description: n.description || '',
        image,
      };
    });

    return NextResponse.json({ collections: items });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
