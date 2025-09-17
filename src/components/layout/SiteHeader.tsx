import Header from '@/components/Header';
import {
  getMainMenuQuery,
  getCollectionsByIdQuery,
  fetchShopBrand,
  shopifyFetch,
} from '@/lib/shopify';
import type { CollectionDetail, MenuItem } from '@/lib/types';
import { normalizeMenuItems } from '@/lib/menu';

interface MainMenuData {
  menu: {
    items: MenuItem[];
  };
}

const isCollectionId = (value?: string | null) =>
  typeof value === 'string' && value.startsWith('gid://shopify/Collection/');

const collectCollectionIds = (items: MenuItem[], set: Set<string>) => {
  items.forEach((item) => {
    if (isCollectionId(item.resourceId)) {
      set.add(item.resourceId as string);
    }
    if (item.items) {
      collectCollectionIds(item.items, set);
    }
  });
};

const enhanceMenuWithCollections = (
  items: MenuItem[],
  collectionMap: Map<string, CollectionDetail>,
): MenuItem[] =>
  items.map((item) => {
    const enhancedChildren = item.items
      ? enhanceMenuWithCollections(item.items, collectionMap)
      : undefined;

    const collection = item.resourceId ? collectionMap.get(item.resourceId) : undefined;
    let image = item.image ?? null;
    if (!image && collection) {
      const candidate = collection.image ?? collection.products?.edges?.[0]?.node.featuredImage ?? null;
      if (candidate?.url) {
        image = {
          url: candidate.url,
          altText: candidate.altText ?? undefined,
        };
      }
    } else if (image?.url) {
      image = {
        url: image.url,
        altText: image.altText ?? undefined,
      };
    }

    return {
      ...item,
      image,
      items: enhancedChildren,
      hasMegaMenu: Boolean(enhancedChildren && enhancedChildren.length > 0),
      description: collection?.description,
    };
  });

export default async function SiteHeader() {
  const { data: menuData } = await shopifyFetch<MainMenuData>({
    query: getMainMenuQuery,
  });

  const { data: shopData } = await fetchShopBrand<{
    shop: {
      name: string;
      brand: {
        logo: {
          image: {
            url: string;
            altText?: string;
          } | null;
        } | null;
      } | null;
    } | null;
  }>();

  const menuItems = menuData?.menu?.items ?? [];
  const normalizedMenu = menuItems.length ? normalizeMenuItems(menuItems) : [];

  const collectionIds = new Set<string>();
  collectCollectionIds(normalizedMenu, collectionIds);

  let collectionsMap = new Map<string, CollectionDetail>();
  if (collectionIds.size > 0) {
    const { data: collectionData } = await shopifyFetch<{ nodes: (CollectionDetail | null)[]}>({
      query: getCollectionsByIdQuery,
      variables: { ids: Array.from(collectionIds) },
    });

    collectionsMap = new Map(
      (collectionData.nodes || [])
        .filter((node): node is CollectionDetail => Boolean(node))
        .map((node) => [node.id, node]),
    );
  }

  const enrichedMenu = enhanceMenuWithCollections(normalizedMenu, collectionsMap);

  // Note: AnnouncementBar is already rendered inside Header.tsx in this codebase.
  // To avoid duplication, we only render Header here.
  return (
    <Header
      collections={enrichedMenu}
      logoUrl={shopData?.shop?.brand?.logo?.image?.url || ''}
      shopName={shopData?.shop?.name || ''}
      logoAlt={shopData?.shop?.brand?.logo?.image?.altText}
    />
  );
}
