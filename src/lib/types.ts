export type ProductNode = {
  id: string;
  title: string;
  handle: string;
  featuredImage?: { url: string; altText?: string } | null;
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

export type CartLine = {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    price: {
      amount: string;
      currencyCode: string;
    };
    product: {
      title: string;
      handle: string;
      featuredImage: {
        url: string;
        altText: string;
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

export type ShopifyFetchResponse<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      errors: string;
    };
