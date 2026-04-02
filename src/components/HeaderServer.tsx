import { cookies } from 'next/headers';
import {
  getMainMenuQuery,
  getCollectionsByIdQuery,
  getProductsByIdQuery,
  fetchShopBrand,
  shopifyFetch,
} from '@/lib/shopify';
import type { Cart, CollectionDetail, MenuItem, Product } from '@/lib/types';
import { normalizeMenuItems } from '@/lib/menu';
import Header from './Header';
import { getCartQuery, getCollectionProductsByHandleQuery } from '@/lib/queries'; // Corrected import

const isCollectionId = (value?: string | null) =>
  typeof value === 'string' && value.startsWith('gid://shopify/Collection/');

const isProductId = (value?: string | null) =>
  typeof value === 'string' && value.startsWith('gid://shopify/Product/');

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

const collectProductIds = (items: MenuItem[], set: Set<string>) => {
  items.forEach((item) => {
    if (isProductId(item.resourceId)) {
      set.add(item.resourceId as string);
    }
    if (item.items) {
      collectProductIds(item.items, set);
    }
  });
};

const enhanceMenuItems = (
  items: MenuItem[],
  collectionMap: Map<string, CollectionDetail>,
  productMap: Map<string, Product>,
): MenuItem[] =>
  items.map((item) => {
    const enhancedChildren = item.items
      ? enhanceMenuItems(item.items, collectionMap, productMap)
      : undefined;

    let image = item.image ?? null;
    let description = item.description ?? null;

    if (isCollectionId(item.resourceId)) {
      const collection = item.resourceId
        ? collectionMap.get(item.resourceId)
        : undefined;
      if (collection) {
        description = collection.description ?? null;
        if (!image) {
          const candidate =
            collection.image ??
            collection.products?.edges?.[0]?.node.featuredImage ??
            null;
          if (candidate?.url) {
            image = {
              url: candidate.url,
              altText: candidate.altText ?? undefined,
            };
          }
        }
      }
    } else if (isProductId(item.resourceId)) {
      const product = item.resourceId
        ? productMap.get(item.resourceId)
        : undefined;
      if (product && !image) {
        const candidate = product.featuredImage ?? null;
        if (candidate?.url) {
          image = {
            url: candidate.url,
            altText: candidate.altText ?? undefined,
          };
        }
      }
    }

    return {
      ...item,
      image,
      description,
      items: enhancedChildren,
      hasMegaMenu: Boolean(enhancedChildren && enhancedChildren.length > 0),
    };
  });

interface MainMenuData {
  menu: {
    items: MenuItem[];
  };
}

interface ShopifyLabEquipmentCollection {
  collection: {
    id: string;
    title: string;
    handle: string;
    products?: {
      edges: {
        node: {
          id: string;
          title: string;
          handle: string;
          featuredImage?: {
            url: string;
            altText?: string | null;
          } | null;
        };
      }[];
    } | null;
  } | null;
}

const LAB_EQUIPMENT_NAV_ITEM: MenuItem = {
  id: 'manual-lab-equipment',
  title: 'Lab Equipment',
  url: '/collections/lab-equipment',
  handle: 'lab-equipment',
  hasMegaMenu: false,
};

const isLabEquipmentItem = (item: MenuItem) => {
  const normalizedUrl = (item.url || '').toLowerCase();
  const normalizedHandle = (item.handle || '').toLowerCase();
  const normalizedTitle = (item.title || '').trim().toLowerCase();

  return (
    normalizedUrl.endsWith('/collections/lab-equipment') ||
    normalizedHandle === 'lab-equipment' ||
    normalizedTitle === 'lab equipment'
  );
};

const buildLabEquipmentProductMenuItems = (
  collection: ShopifyLabEquipmentCollection['collection'],
): MenuItem[] =>
  (collection?.products?.edges || []).map(({ node }) => ({
    id: node.id,
    title: node.title,
    url: `/products/${node.handle}`,
    handle: node.handle,
    resourceId: node.id,
    image: node.featuredImage?.url
      ? {
          url: node.featuredImage.url,
          altText: node.featuredImage.altText ?? undefined,
        }
      : null,
  }));

const ensureLabEquipmentNavItem = (
  items: MenuItem[],
  fallbackItems: MenuItem[],
): MenuItem[] => {
  const existingIndex = items.findIndex(isLabEquipmentItem);
  const existingItem =
    existingIndex === -1 ? LAB_EQUIPMENT_NAV_ITEM : items[existingIndex];

  const mergedItems =
    existingItem.items && existingItem.items.length > 0
      ? existingItem.items
      : fallbackItems;

  const nextLabEquipmentItem: MenuItem = {
    ...LAB_EQUIPMENT_NAV_ITEM,
    ...existingItem,
    items: mergedItems.length > 0 ? mergedItems : undefined,
    hasMegaMenu: mergedItems.length > 0,
  };

  const itemsWithoutLabEquipment =
    existingIndex === -1
      ? items
      : items.filter((_, index) => index !== existingIndex);

  const insertionIndex = itemsWithoutLabEquipment.findIndex((item) => {
    const normalizedTitle = (item.title || '').trim().toLowerCase();
    const normalizedHandle = (item.handle || '').toLowerCase();
    const normalizedUrl = (item.url || '').toLowerCase();

    return (
      normalizedTitle === 'incubators & slide preparation equipment' ||
      normalizedHandle === 'incubators-slide-preparation-equipment' ||
      normalizedUrl.endsWith('/collections/incubators-slide-preparation-equipment')
    );
  });

  if (insertionIndex === -1) {
    return [...itemsWithoutLabEquipment, nextLabEquipmentItem];
  }

  return [
    ...itemsWithoutLabEquipment.slice(0, insertionIndex + 1),
    nextLabEquipmentItem,
    ...itemsWithoutLabEquipment.slice(insertionIndex + 1),
  ];
};

export default async function HeaderServer() {
  const cookieStore = await cookies(); // Awaited cookies()
  const cartId = cookieStore.get('cartId')?.value;
  let cart: Cart | null = null;

  if (cartId) {
    try {
      const res = await shopifyFetch<{
        cart: Cart;
      }>({
        query: getCartQuery,
        variables: { cartId },
        cache: 'no-store',
      });
      cart = res.data.cart;
    } catch (e) {
      console.error('Error fetching cart in HeaderServer:', e);
      // Do not mutate cookies in a Server Component render path.
      // Next.js only allows cookie mutation in Route Handlers or Server Actions.
      // Keep rendering with an empty cart instead of escalating to global-error.
    }
  }

  const cartItemCount =
    cart?.lines?.edges?.reduce((acc, item) => acc + item.node.quantity, 0) || 0;

  // --- Start of data fetching logic moved from SiteHeader.tsx ---
  let menuData: MainMenuData | null = null;
  let shopData: any = null;
  let labEquipmentCollection: ShopifyLabEquipmentCollection['collection'] = null;

  try {
    const [menuResponse, shopResponse, labEquipmentResponse] = await Promise.all([
      shopifyFetch<MainMenuData>({ query: getMainMenuQuery }),
      fetchShopBrand<any>(),
      shopifyFetch<ShopifyLabEquipmentCollection>({
        query: getCollectionProductsByHandleQuery,
        variables: { handle: 'lab-equipment', first: 5 },
      }),
    ]);
    menuData = menuResponse.data;
    shopData = shopResponse.data;
    labEquipmentCollection = labEquipmentResponse.data?.collection ?? null;
  } catch (error) {
    console.error(
      'HeaderServer Error: Failed to fetch menu, shop brand, or lab equipment products:',
      error,
    );
  }

  const menuItems = menuData?.menu?.items ?? [];
  const normalizedMenu = menuItems.length ? normalizeMenuItems(menuItems) : [];

  const collectionIds = new Set<string>();
  collectCollectionIds(normalizedMenu, collectionIds);

  const productIds = new Set<string>();
  collectProductIds(normalizedMenu, productIds);

  let collectionsMap = new Map<string, CollectionDetail>();
  if (collectionIds.size > 0) {
    try {
      const { data: collectionData } = await shopifyFetch<{
        nodes: (CollectionDetail | null)[];
      }>({
        query: getCollectionsByIdQuery,
        variables: { ids: Array.from(collectionIds) },
      });

      collectionsMap = new Map(
        (collectionData.nodes || [])
          .filter((node): node is CollectionDetail => Boolean(node))
          .map((node) => [node.id, node]),
      );
    } catch (error) {
      console.error('HeaderServer Error: Failed to fetch collections:', error);
    }
  }

  let productsMap = new Map<string, Product>();
  if (productIds.size > 0) {
    try {
      const { data: productData } = await shopifyFetch<{
        nodes: (Product | null)[];
      }>({
        query: getProductsByIdQuery,
        variables: { ids: Array.from(productIds) },
      });

      productsMap = new Map(
        (productData.nodes || [])
          .filter((node): node is Product => Boolean(node))
          .map((node) => [node.id, node]),
      );
    } catch (error) {
      console.error('HeaderServer Error: Failed to fetch products:', error);
    }
  }

  const enrichedMenu = enhanceMenuItems(
    normalizedMenu,
    collectionsMap,
    productsMap,
  );
  const labEquipmentMenuItems = buildLabEquipmentProductMenuItems(
    labEquipmentCollection,
  );
  const finalMenu = ensureLabEquipmentNavItem(
    enrichedMenu,
    labEquipmentMenuItems,
  );
  // --- End of data fetching logic moved from SiteHeader.tsx ---

  return (
    <Header
      collections={finalMenu}
      logoUrl={shopData?.shop?.brand?.logo?.image?.url || ''}
      shopName={shopData?.shop?.name || ''}
      logoAlt={shopData?.shop?.brand?.logo?.image?.altText}
      cartItemCount={cartItemCount}
    />
  );
}
