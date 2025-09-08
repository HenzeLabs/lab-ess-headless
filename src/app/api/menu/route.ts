import { NextResponse } from "next/server";
import { storefront } from "@/lib/shopify";

const QUERY = /* GraphQL */ `
  query Menu {
    menu(handle: "main-menu") {
      items {
        id
        title
        url
        items {
          id
          title
          url
          items {
            id
            title
            url
          }
        }
      }
    }
  }
`;

export async function GET() {
  try {
    const data = await storefront<{ data: { menu: { items: any[] } } }>(QUERY);
    return NextResponse.json({ items: data?.data?.menu?.items || [] });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
