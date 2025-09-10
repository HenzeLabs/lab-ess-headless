import { NextResponse } from "next/server";
import { shopifyFetch } from "@/lib/shopify";

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
    const response = await shopifyFetch<{
      data: { menu: { items: MenuItem[] } };
    }>({ query: QUERY });
    if (response.success) {
      return NextResponse.json({ items: response.data.data.menu.items || [] });
    } else {
      return NextResponse.json({ error: response.errors }, { status: 500 });
    }
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
