import { NextResponse } from "next/server";
import { storefront } from "@/lib/shopify";

interface MenuItem {
  id: string;
  title: string;
  url: string;
  items?: MenuItem[];
}

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
    const data = await storefront<{ data: { menu: { items: MenuItem[] } } }>(
      QUERY,
    );
    return NextResponse.json({ items: data?.data?.menu?.items || [] });
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
