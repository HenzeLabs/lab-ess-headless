import { NextResponse } from "next/server";
import { storefront } from "@/lib/shopify";

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
    const data = await storefront<{ data: { products: { edges: any[] } } }>(
      QUERY,
      { first: 5 }
    );
    const items =
      data?.data?.products?.edges?.map((e) => {
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
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
