export type CollectionData = {
  id: string;
  title: string;
  handle: string;
  description?: string | null;
  image?: { url: string; altText?: string } | null;
  products?: { edges: { node: Product }[] };
};

export type CollectionDetail = {
  id: string;
  description?: string | null;
  image?: {
    url: string;
    altText?: string | null;
  } | null;
  products?: {
    edges: {
      node: {
        featuredImage?: {
          url: string;
          altText?: string | null;
        } | null;
      };
    }[];
  } | null;
};
export type MenuItem = {
  id: string;
  title: string;
  url: string;
  handle?: string;
  resourceId?: string | null;
  image?: { url: string; altText?: string } | null;
  items?: MenuItem[];
  hasMegaMenu?: boolean;
  description?: string | null;
};

export type Product = {
  id: string;
  title: string;
  handle: string;
  descriptionHtml?: string;
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
  success: true;
  data: T;
};
