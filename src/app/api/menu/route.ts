import { NextResponse } from 'next/server';
import { shopifyFetch } from '@/lib/shopify';

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
    if (response.success && response.data?.data?.menu?.items) {
      return NextResponse.json({ items: response.data.data.menu.items });
    } else if (response.success) {
      return NextResponse.json({ items: [] });
    } else {
      return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[api/menu]`, msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
