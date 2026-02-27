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
import { getCartQuery } from '@/lib/queries'; // Corrected import

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

  try {
    const [menuResponse, shopResponse] = await Promise.all([
      shopifyFetch<MainMenuData>({ query: getMainMenuQuery }),
      fetchShopBrand<any>(),
    ]);
    menuData = menuResponse.data;
    shopData = shopResponse.data;
  } catch (error) {
    console.error(
      'HeaderServer Error: Failed to fetch menu or shop brand:',
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
  // --- End of data fetching logic moved from SiteHeader.tsx ---

  return (
    <Header
      collections={enrichedMenu}
      logoUrl={shopData?.shop?.brand?.logo?.image?.url || ''}
      shopName={shopData?.shop?.name || ''}
      logoAlt={shopData?.shop?.brand?.logo?.image?.altText}
      cartItemCount={cartItemCount}
    />
  );
}
