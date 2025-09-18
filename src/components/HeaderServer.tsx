import { getMainMenuQuery, fetchShopBrand, shopifyFetch } from '@/lib/shopify';
import Header from '@/components/Header';
import { MenuItem } from '@/lib/types';
import { normalizeMenuItems } from '@/lib/menu';

interface MainMenuData {
  menu: {
    items: MenuItem[];
  };
}

export default async function HeaderServer() {
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

  const menuItems = menuData?.menu?.items;

  const normalizedMenu = menuItems ? normalizeMenuItems(menuItems) : [];

  if (!menuItems) {
    console.warn('Main menu is empty or failed to load.');
  }

  return (
    <Header
      collections={normalizedMenu}
      logoUrl={shopData?.shop?.brand?.logo?.image?.url || ''}
      shopName={shopData?.shop?.name || ''}
      logoAlt={shopData?.shop?.brand?.logo?.image?.altText}
    />
  );
}
