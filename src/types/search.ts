// Shopify Search API Types

export interface SearchProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  availableForSale: boolean;
  vendor: string;
  productType: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  images: {
    edges: Array<{
      node: {
        id: string;
        url: string;
        altText?: string;
        width: number;
        height: number;
      };
    }>;
  };
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
  variants: {
    edges: Array<{
      node: SearchVariant;
    }>;
  };
}

export interface SearchVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: {
    amount: string;
    currencyCode: string;
  };
  compareAtPrice?: {
    amount: string;
    currencyCode: string;
  };
  selectedOptions: Array<{
    name: string;
    value: string;
  }>;
  image?: {
    id: string;
    url: string;
    altText?: string;
    width: number;
    height: number;
  };
}

export interface SearchCollection {
  id: string;
  title: string;
  handle: string;
  description: string;
  image?: {
    id: string;
    url: string;
    altText?: string;
    width: number;
    height: number;
  };
  products: {
    edges: Array<{
      node: SearchProduct;
    }>;
  };
}

export interface SearchPage {
  id: string;
  title: string;
  handle: string;
  body: string;
  bodySummary: string;
  createdAt: string;
  updatedAt: string;
  url: string;
}

export interface SearchArticle {
  id: string;
  title: string;
  handle: string;
  content: string;
  contentHtml: string;
  excerpt?: string;
  publishedAt: string;
  image?: {
    id: string;
    url: string;
    altText?: string;
    width: number;
    height: number;
  };
  author: {
    firstName: string;
    lastName: string;
    displayName: string;
  };
  blog: {
    id: string;
    title: string;
    handle: string;
  };
  tags: string[];
  url: string;
}

// Search Results
export interface SearchResults {
  products: SearchProduct[];
  collections: SearchCollection[];
  pages: SearchPage[];
  articles: SearchArticle[];
  totalProducts: number;
  totalCollections: number;
  totalPages: number;
  totalArticles: number;
  query: string;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  endCursor?: string;
  startCursor?: string;
}

// Predictive Search Types
export interface PredictiveSearchQuery {
  id: string;
  text: string;
  styledText: string;
}

export interface PredictiveSearchResult {
  queries: PredictiveSearchQuery[];
  products: SearchProduct[];
  collections: SearchCollection[];
}

// Search Filters
export interface SearchFilters {
  available?: boolean;
  price?: {
    min?: number;
    max?: number;
  };
  vendor?: string[];
  productType?: string[];
  tags?: string[];
  variantOption?: {
    name: string;
    value: string[];
  }[];
}

// Search Parameters
export interface SearchParams {
  query: string;
  first?: number;
  after?: string;
  sortKey?: SearchSortKey;
  reverse?: boolean;
  filters?: SearchFilters;
  type?: SearchType;
}

export type SearchSortKey =
  | 'RELEVANCE'
  | 'PRICE'
  | 'BEST_SELLING'
  | 'CREATED'
  | 'ID'
  | 'MANUAL'
  | 'COLLECTION_DEFAULT'
  | 'TITLE';

export type SearchType = 'PRODUCT' | 'PAGE' | 'ARTICLE' | 'COLLECTION';

// Search Suggestions
export interface SearchSuggestion {
  text: string;
  styledText: string;
  url: string;
  type: 'query' | 'product' | 'collection' | 'page' | 'article';
}

// Search History
export interface SearchHistoryItem {
  query: string;
  timestamp: number;
  resultsCount: number;
}

// Hook Types
export interface UseSearchState {
  results: SearchResults | null;
  suggestions: SearchSuggestion[];
  loading: boolean;
  error: string | null;
  hasSearched: boolean;
  query: string;
}

export interface UseSearchActions {
  search: (params: SearchParams) => Promise<void>;
  predictiveSearch: (query: string) => Promise<void>;
  loadMore: () => Promise<void>;
  clearResults: () => void;
  setQuery: (query: string) => void;
}

export interface UseSearch extends UseSearchState, UseSearchActions {}

// Search Component Props
export interface SearchInputProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
  showSuggestions?: boolean;
  autoFocus?: boolean;
  className?: string;
}

export interface SearchResultsProps {
  results: SearchResults;
  loading?: boolean;
  onLoadMore?: () => void;
  className?: string;
}

export interface SearchSuggestionsProps {
  suggestions: SearchSuggestion[];
  onSelect: (suggestion: SearchSuggestion) => void;
  highlightedIndex: number;
  className?: string;
}

// Cache Types
export interface SearchCacheEntry {
  data: SearchResults | PredictiveSearchResult;
  timestamp: number;
  ttl: number;
}

export interface SearchCacheConfig {
  enabled: boolean;
  ttl: number; // Time to live in seconds
  maxEntries: number;
  keyPrefix: string;
}
