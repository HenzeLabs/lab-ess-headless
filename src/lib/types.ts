type ProductNode = {
  id: string;
  title: string;
  handle: string;
};

export type CollectionData = {
  id: string;
  title: string;
  handle: string;
  image?: { url: string; altText?: string } | null;
  products?: { edges: { node: ProductNode }[] };
};
export type MenuItem = {
  id: string;
  title: string;
  url: string;
  handle: string;
  image?: { url: string; altText?: string } | null;
  items?: MenuItem[];
  hasMegaMenu?: boolean;
};

export type Product = {
  id: string;
  title: string;
  handle: string;
  description: string;
  tags?: string[];
  featuredImage?: { url: string; altText?: string };
  images?: {
    edges: {
      node: {
        url: string;
        altText?: string;
      };
    }[];
  };
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  variants?: {
    edges: {
      node: {
        id: string;
        title: string;
      };
    }[];
  };
};

type CartLine = {
  id: string;
  quantity: number;
  merchandise: {
    price: { amount: string; currencyCode: string };
    product: {
      handle: string;
      title: string;
      featuredImage: {
        url: string;
        altText?: string;
      };
    };
  };
};

export type Cart = {
  id: string;
  checkoutUrl: string;
  lines: {
    edges: {
      node: CartLine;
    }[];
  };
};

export type ShopifyFetchResponse<T> = {
  success: boolean;
  data?: T;
  errors?: string;
};
