import React from 'react';
import { shopifyFetch, getMainMenuQuery } from '@/lib/shopify';
import { normalizeMenuItems } from '@/lib/menu';
import type { MenuItem } from '@/lib/types';
import Link from 'next/link';

interface MainMenuResponse {
  menu: {
    items: MenuItem[];
  } | null;
}

function resolveHref(item: MenuItem): string {
  if (item.url && /^https?:\/\//i.test(item.url)) return item.url;
  if (item.url && item.url.startsWith('/')) return item.url;
  if (item.handle) return `/collections/${item.handle}`;
  return '#';
}

export default async function FooterServerStatic() {
  let items: MenuItem[] = [];
  try {
    const { data } = await shopifyFetch<MainMenuResponse>({
      query: getMainMenuQuery,
    });
    items = data.menu?.items ?? [];
  } catch (err) {
    // If Shopify env is missing or request fails during dev, fall back to empty menu
    // so the footer still renders server-side for bots and curl without throwing.
    console.warn(
      'FooterServerStatic: failed to fetch main menu, falling back to static links',
      err,
    );
    items = [];
  }
  const normalized = normalizeMenuItems(items);

  const links: { title: string; href: string }[] = [];
  const collect = (menuItems: MenuItem[]) => {
    menuItems.forEach((it) => {
      if (it.items && it.items.length > 0) collect(it.items);
      const href = resolveHref(it);
      if (it.title && href !== '#') links.push({ title: it.title, href });
    });
  };
  collect(normalized);

  // Deduplicate by href
  const seen = new Map<string, { title: string; href: string }>();
  links.forEach((l) => {
    if (!seen.has(l.href)) seen.set(l.href, l);
  });

  const deduped = Array.from(seen.values()).slice(0, 12);

  return (
    <footer
      data-test-id="footer"
      className="border-t border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--body))]"
    >
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide mb-4 text-[hsl(var(--muted-foreground))]">
              Shop
            </h3>
            <ul className="space-y-2">
              {deduped.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm font-medium text-[hsl(var(--ink))]"
                  >
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide mb-4 text-[hsl(var(--muted-foreground))]">
              Company
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/pages/about-lab-essentials"
                  className="text-sm font-medium"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/pages/contact-us" className="text-sm font-medium">
                  Contact
                </Link>
              </li>
              <li>
                <a
                  href="mailto:info@labessentials.com"
                  className="text-sm font-medium"
                >
                  info@labessentials.com
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide mb-4 text-[hsl(var(--muted-foreground))]">
              Support
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/pages/shipping-info"
                  className="text-sm font-medium"
                >
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/pages/returns" className="text-sm font-medium">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link href="/pages/faq" className="text-sm font-medium">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[hsl(var(--border))] pt-6 mt-6 text-sm text-[hsl(var(--muted-foreground))]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p>
              © {new Date().getFullYear()} Lab Essentials. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="/privacy"
                className="transition hover:text-[hsl(var(--brand))]"
              >
                Privacy Policy
              </a>
              <span aria-hidden>•</span>
              <a
                href="/terms"
                className="transition hover:text-[hsl(var(--brand))]"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
