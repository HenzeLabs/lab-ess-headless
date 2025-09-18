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
  fallbackImageUrl?: string;
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

export interface AnalyticsItemInput {
  id: string;
  name: string;
  price?: number | string | null;
  currency?: string | null;
  quantity?: number | null;
  category?: string | null;
}

export interface AnalyticsOrderInput {
  orderId: string;
  value: number | string | null;
  currency?: string | null;
  items: AnalyticsItemInput[];
}

export interface LabAnalytics {
  trackViewItem: (p: AnalyticsItemInput) => void;
  trackViewItemList: (listName: string, products: AnalyticsItemInput[]) => void;
  trackAddToCart: (p: AnalyticsItemInput) => void;
  trackRemoveFromCart: (p: AnalyticsItemInput) => void;
  trackViewCart: (items: AnalyticsItemInput[]) => void;
  trackBeginCheckout: (items: AnalyticsItemInput[]) => void;
  trackPurchase: (order: AnalyticsOrderInput) => void;
  trackNewsletterSignup: (email: string) => void;
  trackDownload: (payload: { id: string; name: string; category?: string | null }) => void;
}