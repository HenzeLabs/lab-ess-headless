// Product type with tags and priceRange for filters and cards
export type ProductWithFilters = {
  id: string;
  title: string;
  handle: string;
  featuredImage?: { url: string; altText?: string };
  tags: string[];
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
};
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
  featuredImage?: { url: string; altText?: string };
};
