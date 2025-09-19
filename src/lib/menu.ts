import type { MenuItem } from '@/lib/types';

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const extractHandleFromUrl = (url?: string | null) => {
  if (!url) return '';
  try {
    const parsed = new URL(url, 'https://example.com');
    const parts = parsed.pathname.split('/').filter(Boolean);
    return parts.pop() || '';
  } catch {
    return url.split('/').filter(Boolean).pop() || '';
  }
};

type MenuHandleSource = Pick<MenuItem, 'handle' | 'url' | 'title' | 'id'>;

export const deriveMenuHandle = (item: MenuHandleSource): string => {
  const base =
    item.handle ||
    extractHandleFromUrl(item.url) ||
    item.title ||
    item.id;
  return slugify(base);
};

export const normalizeMenuItems = (items: MenuItem[]): MenuItem[] =>
  items.map((item) => {
    const normalizedHandle = deriveMenuHandle(item);
    const childItems = item.items ? normalizeMenuItems(item.items) : undefined;

    return {
      ...item,
      handle: normalizedHandle || undefined,
      hasMegaMenu: Boolean(childItems && childItems.length > 0),
      items: childItems,
    };
  });

export const slugifyMenuValue = slugify;
