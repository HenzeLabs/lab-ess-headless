import { getMainMenuQuery, fetchShopBrand, shopifyFetch } from '@/lib/shopify';
import Header from '@/components/Header';
import { MenuItem } from '@/lib/types';

interface MainMenuData {
  menu: {
    items: MenuItem[];
  };
}

interface ShopBrandData {
  shop: {
    name: string;
    brand: {
      logo: {
        alt: string;
        image: {
          url: string;
        };
      };
    };
  };
}

export default async function HeaderServer() {
  const { data: menuData } = await shopifyFetch<MainMenuData>({
    query: getMainMenuQuery,
  });

  const { data: shopData } = await fetchShopBrand<ShopBrandData>();

  const menuItems = menuData?.menu?.items;

  if (!menuItems) {
    console.warn('Main menu is empty or failed to load.');
  }

  return (
    <Header
      collections={menuItems ?? []}
      logoUrl={shopData?.shop.brand?.logo?.image?.url || ''}
      shopName={shopData?.shop?.name || ''}
      logoAlt={shopData?.shop.brand?.logo?.alt}
    />
  );
}
