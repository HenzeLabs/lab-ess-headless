import Footer, { FooterLink } from '@/components/Footer';
import { normalizeMenuItems } from '@/lib/menu';
import { shopifyFetch, getMainMenuQuery } from '@/lib/shopify';
import type { MenuItem } from '@/lib/types';

import { ALLOWED_COLLECTION_HANDLES } from './footer/constants';

interface MainMenuResponse {
  menu: {
    items: MenuItem[];
  } | null;
}

function resolveHref(item: MenuItem): string {
  if (item.url && /^https?:\/\//i.test(item.url)) {
    return item.url;
  }
  const handle = item.handle;
  if (item.url && item.url.startsWith('/')) {
    return item.url;
  }
  if (handle) {
    return `/collections/${handle}`;
  }
  return '#';
}

export default async function FooterServer() {
  const { data } = await shopifyFetch<MainMenuResponse>({
    query: getMainMenuQuery,
  });

  const items = data.menu?.items ?? [];
  const normalized = normalizeMenuItems(items);

  const collectLinks = (menuItems: MenuItem[]): FooterLink[] => {
    const links: FooterLink[] = [];
    menuItems.forEach((item) => {
      const href = resolveHref(item);
      if (item.items && item.items.length > 0) {
        links.push(...collectLinks(item.items));
      }
      const handle = item.handle ?? '';
      if (item.title && href !== '#' && ALLOWED_COLLECTION_HANDLES.has(handle)) {
        links.push({ title: item.title, href });
      }
    });
    return links;
  };

  const deduped = new Map<string, FooterLink>();
  collectLinks(normalized).forEach((link) => {
    if (!deduped.has(link.href)) {
      deduped.set(link.href, link);
    }
  });

  const shopLinks = Array.from(deduped.values());

  return <Footer shopLinks={shopLinks} />;
}
