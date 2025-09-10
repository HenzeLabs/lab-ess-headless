import { storefront } from "./shopify";

type BrandRes = {
  data?: {
    shop?: {
      brand?: {
        logo?: {
          image?: { url?: string };
          url?: string;
        };
      };
    };
  };
};
