// Core product and collection types
export interface Product {
  id: string;
  title: string;
  handle: string;
  description?: string;
  availableForSale: boolean;
  vendor?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  featuredImage: {
    url: string;
    altText?: string;
  } | null;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
    maxVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  collections?: Collection[];
  variants?: ProductVariant[];
}

export interface Collection {
  id: string;
  title: string;
  handle: string;
  description?: string;
  image?: {
    url: string;
    altText?: string;
  };
}

export interface ProductVariant {
  id: string;
  title: string;
  price: {
    amount: string;
    currencyCode: string;
  };
  availableForSale: boolean;
  selectedOptions: {
    name: string;
    value: string;
  }[];
}

// Analytics and tracking types
export interface TrackingEvent {
  event: string;
  timestamp: number;
  userId?: string;
  sessionId: string;
  properties: Record<string, unknown>;
}

export interface UserProfile {
  id: string;
  email?: string;
  preferences: {
    categories: string[];
    priceRange: {
      min: number;
      max: number;
    };
    brands: string[];
    size?: string;
    color?: string;
  };
  history: {
    purchases: string[];
    views: string[];
    searches: string[];
  };
}

// Cart and checkout types
export interface CartItem {
  variantId: string;
  productId: string;
  quantity: number;
  title: string;
  price: {
    amount: string;
    currencyCode: string;
  };
  image?: {
    url: string;
    altText?: string;
  };
}

export interface Cart {
  id: string;
  items: CartItem[];
  totalQuantity: number;
  cost: {
    subtotalAmount: {
      amount: string;
      currencyCode: string;
    };
    totalAmount: {
      amount: string;
      currencyCode: string;
    };
    totalTaxAmount?: {
      amount: string;
      currencyCode: string;
    };
  };
}
