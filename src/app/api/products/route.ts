import { NextResponse } from "next/server";
import { storefront } from "@/lib/shopify";

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
    const data = await storefront<{
      data: { products: { edges: { node: ProductNode }[] } };
    }>(QUERY, { first: 5 });
    const items: ProductItem[] =
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
  } catch (err: unknown) {
    return NextResponse.json(
      {
        error:
          typeof err === "object" && err && "message" in err
            ? (err as { message?: string }).message
            : "Unknown error",
      },
      { status: 500 },
    );
  }
}
