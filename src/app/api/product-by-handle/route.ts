import { NextResponse } from "next/server";
import { storefront } from "@/lib/shopify";

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
  const handle = searchParams.get("handle");
  if (!handle)
    return NextResponse.json({ error: "Missing handle" }, { status: 400 });
  try {
    const data = await storefront<{
      data: { productByHandle: ProductByHandle };
    }>(QUERY, {
      handle,
    });
    const p = data?.data?.productByHandle;
    if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({
      product: {
        ...p,
        images: p.images?.edges?.map((e: { node: ImageNode }) => e.node) || [],
      },
    });
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
