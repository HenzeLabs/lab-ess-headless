// TypeScript types for technical specifications

export interface TechnicalSpecMetafield {
  id: string;
  namespace: string;
  key: string;
  value: string;
  type: string;
  description?: string;
}

export interface SpecificationItem {
  key: string;
  value: string;
  unit?: string;
  category?: string;
  order?: number;
}

export interface TechnicalSpecifications {
  specifications: SpecificationItem[];
  compatibility: string[];
  downloads: DownloadItem[];
  productType: string;
  certification?: string[];
  warranty?: WarrantyInfo;
}

export interface DownloadItem {
  id: string;
  name: string;
  type: 'PDF' | 'ZIP' | 'EXE' | 'DMG' | 'DOC' | 'XLS';
  size: string;
  url?: string;
  description?: string;
  version?: string;
  lastUpdated?: string;
  category?: 'manual' | 'software' | 'datasheet' | 'certificate' | 'driver';
}

export interface WarrantyInfo {
  duration: string;
  type: 'full' | 'limited' | 'parts_only' | 'labor_only';
  coverage: string;
  support?: string;
  regions?: string[];
}

export interface ProductTypeSpecsSchema {
  productType: string;
  defaultSpecs: SpecificationItem[];
  requiredFields: string[];
  optionalFields: string[];
  categories: SpecCategory[];
  validation?: ValidationRule[];
}

export interface SpecCategory {
  id: string;
  name: string;
  description?: string;
  order: number;
  fields: string[];
}

export interface ValidationRule {
  field: string;
  type: 'required' | 'numeric' | 'range' | 'pattern' | 'enum';
  value?: string | number | string[];
  message: string;
}

// Shopify metafield value structures
export interface SpecsMetafieldValue {
  specifications: Record<string, string | number>;
  categories?: Record<string, SpecificationItem[]>;
  lastUpdated?: string;
  version?: string;
}

export interface CompatibilityMetafieldValue {
  items: string[];
  categories?: {
    software?: string[];
    hardware?: string[];
    accessories?: string[];
    standards?: string[];
  };
}

export interface DownloadsMetafieldValue {
  items: DownloadItem[];
  categories?: Record<string, DownloadItem[]>;
}

// Response types for GraphQL queries
export interface ProductWithSpecs {
  id: string;
  handle: string;
  title: string;
  productType: string;
  metafields: TechnicalSpecMetafield[];
}

export interface ProductTypeWithSpecs {
  id: string;
  name: string;
  metafields: TechnicalSpecMetafield[];
}

// Cache types
export interface CachedTechnicalSpecs {
  productHandle: string;
  productType: string;
  specs: TechnicalSpecifications;
  cachedAt: number;
  expiresAt: number;
}

export interface SpecsCacheEntry {
  data: TechnicalSpecifications;
  timestamp: number;
  ttl: number;
}

// Product type mappings
export type SupportedProductType =
  | 'microscope'
  | 'centrifuge'
  | 'camera'
  | 'incubator'
  | 'spectrophotometer'
  | 'ph_meter'
  | 'balance'
  | 'pipette'
  | 'thermometer'
  | 'general';

// Error types
export interface SpecsError {
  code: string;
  message: string;
  field?: string;
  productHandle?: string;
}

// Configuration types
export interface SpecsConfig {
  cacheEnabled: boolean;
  cacheTTL: number; // seconds
  fallbackToHardcoded: boolean;
  enableValidation: boolean;
  defaultProductType: SupportedProductType;
}

// Admin/management types for Shopify Admin API
export interface MetafieldInput {
  namespace: string;
  key: string;
  value: string;
  type: string;
  description?: string;
}

export interface CreateProductSpecsInput {
  productId: string;
  specifications: SpecsMetafieldValue;
  compatibility?: CompatibilityMetafieldValue;
  downloads?: DownloadsMetafieldValue;
}

export interface UpdateProductSpecsInput extends CreateProductSpecsInput {
  metafieldIds?: Record<string, string>;
}
