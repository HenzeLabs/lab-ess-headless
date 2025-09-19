import { NextResponse } from 'next/server';
import { shopifyFetch } from '@/lib/shopify';

interface MenuItem {
  id: string;
  title: string;
  url: string;
  handle?: string | null;
  resourceId?: string | null;
  items?: MenuItem[];
}

const QUERY = /* GraphQL */ `
  query Menu {
    menu(handle: "main-menu") {
      items {
        id
        title
        url
        resourceId
        items {
          id
          title
          url
          resourceId
          items {
            id
            title
            url
            resourceId
          }
        }
      }
    }
  }
`;

export async function GET() {
  try {
    const response = await shopifyFetch<{
      menu: { items: MenuItem[] };
    }>({ query: QUERY });
    return NextResponse.json({ items: response.data.menu.items ?? [] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
