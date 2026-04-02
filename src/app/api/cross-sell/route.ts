import { NextRequest, NextResponse } from 'next/server';
import { shopifyFetch } from '@/lib/shopify';
import {
  getProductRecommendationsQuery,
  getCollectionByHandleQuery,
} from '@/lib/queries';

type RecommendedProduct = {
  id: string;
  title: string;
  handle: string;
  featuredImage?: { url: string; altText?: string } | null;
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
  };
  variants?: {
    edges: {
      node: {
        id: string;
        title: string;
        availableForSale?: boolean;
        price: { amount: string; currencyCode: string };
      };
    }[];
  };
};

const PRODUCT_BY_HANDLE_WITH_VARIANTS_QUERY = `
  query getProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      variants(first: 1) {
        edges {
          node {
            id
          }
        }
      }
    }
  }
`;

const RECOMMENDATIONS_WITH_VARIANTS_QUERY = `
  query getProductRecommendations($productId: ID!) {
    productRecommendations(productId: $productId) {
      id
      title
      handle
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
      variants(first: 1) {
        edges {
          node {
            id
            title
            availableForSale
            price {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;

const BESTSELLERS_QUERY = `
  query getBestsellers {
    collection(handle: "featured-products") {
      products(first: 8) {
        edges {
          node {
            id
            title
            handle
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
            variants(first: 1) {
              edges {
                node {
                  id
                  title
                  availableForSale
                  price {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const handles = url.searchParams.get('handles')?.split(',').filter(Boolean) ?? [];
  const excludeHandles = url.searchParams.get('exclude')?.split(',').filter(Boolean) ?? [];
  const limit = Math.min(Number(url.searchParams.get('limit') ?? 4), 8);

  try {
    let recommendations: RecommendedProduct[] = [];

    // Try to get recommendations based on cart product handles
    if (handles.length > 0) {
      // Get the product ID for the first handle (Shopify recommendations work per-product)
      const { data: productData } = await shopifyFetch<{
        product: { id: string; variants: { edges: { node: { id: string } }[] } } | null;
      }>({
        query: PRODUCT_BY_HANDLE_WITH_VARIANTS_QUERY,
        variables: { handle: handles[0] },
        revalidate: 300,
        tags: ['shopify', 'cross-sell'],
      });

      if (productData.product?.id) {
        const { data: recData } = await shopifyFetch<{
          productRecommendations: RecommendedProduct[] | null;
        }>({
          query: RECOMMENDATIONS_WITH_VARIANTS_QUERY,
          variables: { productId: productData.product.id },
          revalidate: 300,
          tags: ['shopify', 'cross-sell'],
        });

        recommendations = recData.productRecommendations ?? [];
      }
    }

    // Filter out products already in cart
    recommendations = recommendations.filter(
      (p) => !excludeHandles.includes(p.handle),
    );

    // If we don't have enough recommendations, fall back to bestsellers
    if (recommendations.length < limit) {
      const { data: bestsellerData } = await shopifyFetch<{
        collection: { products: { edges: { node: RecommendedProduct }[] } } | null;
      }>({
        query: BESTSELLERS_QUERY,
        revalidate: 300,
        tags: ['shopify', 'cross-sell'],
      });

      const bestsellers =
        bestsellerData.collection?.products?.edges?.map((e) => e.node) ?? [];

      // Merge, avoiding duplicates and cart items
      const existingIds = new Set(recommendations.map((r) => r.id));
      for (const product of bestsellers) {
        if (
          recommendations.length >= limit ||
          existingIds.has(product.id) ||
          excludeHandles.includes(product.handle)
        ) {
          continue;
        }
        recommendations.push(product);
        existingIds.add(product.id);
      }
    }

    return NextResponse.json({
      products: recommendations.slice(0, limit),
    });
  } catch (error) {
    console.error('Cross-sell API error:', error);
    return NextResponse.json({ products: [] }, { status: 200 });
  }
}
