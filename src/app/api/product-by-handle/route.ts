import { NextResponse } from "next/server";
import { storefront } from "@/lib/shopify";

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
    const data = await storefront<{ data: { productByHandle: any } }>(QUERY, {
      handle,
    });
    const p = data?.data?.productByHandle;
    if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({
      product: {
        ...p,
        images: p.images?.edges?.map((e: any) => e.node) || [],
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
