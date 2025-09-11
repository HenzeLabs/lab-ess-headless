import { shopifyFetch } from './shopify';
import { getShopBrandQuery } from './queries';

export async function fetchShopBrand(): Promise<{
  logoUrl: string;
  shopName: string;
  altText?: string;
} | null> {
  type ShopifyBrandData = {
    shop: {
      name: string;
      brand: {
        logo: {
          image: {
            url: string;
            altText?: string;
          };
        };
      };
    };
  };
  const res = await shopifyFetch<{ data: ShopifyBrandData }>({
    query: getShopBrandQuery,
  });
  const brandData = res.data?.data;
  if (!brandData?.shop?.brand?.logo?.image?.url) return null;
  return {
    logoUrl: brandData.shop.brand.logo.image.url,
    shopName: brandData.shop.name,
    altText: brandData.shop.brand.logo.image.altText || brandData.shop.name,
  };
}
