# TechnicalSpecs Component Usage Examples

This document provides examples of how to use the `TechnicalSpecs` component in various scenarios.

## Basic Usage

### Example 1: Product-specific specifications (recommended)

Use this when you have the product handle for dynamic specifications from Shopify metafields.

```tsx
import TechnicalSpecs from '@/components/TechnicalSpecs';

function ProductPage({ productHandle }: { productHandle: string }) {
  return (
    <div>
      <h1>Product Details</h1>
      {/* Other product content */}

      <TechnicalSpecs productHandle={productHandle} className="mt-8" />
    </div>
  );
}
```

### Example 2: Product type fallback

Use this when you only know the product type and want to show generic specifications.

```tsx
import TechnicalSpecs from '@/components/TechnicalSpecs';
import { SupportedProductType } from '@/types/technical-specs';

function ProductTypeGrid({
  productType,
}: {
  productType: SupportedProductType;
}) {
  return (
    <div>
      <h2>All {productType} Products</h2>

      <TechnicalSpecs productType={productType} className="mb-6" />

      {/* Product grid */}
    </div>
  );
}
```

## Advanced Usage

### Example 3: Server-side rendering with preloaded data

Use this for SSR optimization to ensure faster client-side loading.

```tsx
import TechnicalSpecs from '@/components/TechnicalSpecs';
import { preloadTechnicalSpecs } from '@/lib/services/technical-specs';

async function ProductPageSSR({ productHandle }: { productHandle: string }) {
  // Preload specifications server-side (optional)
  // This ensures faster client-side loading
  await preloadTechnicalSpecs([productHandle]);

  return (
    <div>
      <h1>Product Details</h1>
      <TechnicalSpecs productHandle={productHandle} />
    </div>
  );
}
```

### Example 4: Error boundary for graceful degradation

Wrap the component in an error boundary for better user experience.

```tsx
import TechnicalSpecs from '@/components/TechnicalSpecs';
import { ErrorBoundary } from 'react-error-boundary';

function ProductPageWithErrorHandling({
  productHandle,
}: {
  productHandle: string;
}) {
  return (
    <div>
      <h1>Product Details</h1>

      <ErrorBoundary
        fallback={
          <div className="text-sm text-muted-foreground">
            Technical specifications are temporarily unavailable.
          </div>
        }
      >
        <TechnicalSpecs productHandle={productHandle} />
      </ErrorBoundary>
    </div>
  );
}
```

### Example 5: Conditional rendering based on product type

Only show technical specs for laboratory equipment.

```tsx
import TechnicalSpecs from '@/components/TechnicalSpecs';
import { SupportedProductType } from '@/types/technical-specs';

function AdaptiveProductSpecs({
  product,
}: {
  product: { handle: string; productType?: string };
}) {
  // Only show technical specs for laboratory equipment
  const labEquipmentTypes = [
    'microscope',
    'centrifuge',
    'camera',
    'incubator',
    'spectrophotometer',
    'ph_meter',
    'balance',
    'pipette',
    'thermometer',
  ];

  const showSpecs =
    !product.productType || labEquipmentTypes.includes(product.productType);

  if (!showSpecs) {
    return null;
  }

  return (
    <TechnicalSpecs
      productHandle={product.handle}
      productType={product.productType as SupportedProductType}
    />
  );
}
```

## Integration Examples

### Example 6: Product page integration

Complete product page with technical specifications.

```tsx
import TechnicalSpecs from '@/components/TechnicalSpecs';
import { Product } from '@/types/shopify';

function ProductDetails({ product }: { product: Product }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Product header */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div>{/* Product images */}</div>
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
          <p className="text-lg text-muted-foreground mb-6">
            {product.description}
          </p>
          {/* Add to cart, price, etc. */}
        </div>
      </div>

      {/* Technical specifications */}
      <TechnicalSpecs
        productHandle={product.handle}
        className="border-t pt-8"
      />

      {/* Reviews, related products, etc. */}
    </div>
  );
}
```

### Example 7: Collection page with type-specific specs

Show specifications for a product type on collection pages.

```tsx
import TechnicalSpecs from '@/components/TechnicalSpecs';
import { Collection, Product } from '@/types/shopify';

function CollectionPage({
  collection,
  products,
}: {
  collection: Collection;
  products: Product[];
}) {
  // Determine the primary product type for this collection
  const primaryProductType = determineCollectionProductType(collection);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{collection.title}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {collection.description}
        </p>
      </div>

      {/* Show general specs for the product type */}
      {primaryProductType && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            Technical Overview
          </h2>
          <div className="max-w-3xl mx-auto">
            <TechnicalSpecs
              productType={primaryProductType}
              className="bg-muted/30 rounded-lg p-6"
            />
          </div>
        </div>
      )}

      {/* Product grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
```

## Performance Optimization

### Example 8: Bulk preloading for product lists

Preload specifications for multiple products to improve performance.

```tsx
import { preloadTechnicalSpecs } from '@/lib/services/technical-specs';

async function ProductListPage({ products }: { products: Product[] }) {
  // Preload all product specifications
  const productHandles = products.map((p) => p.handle);
  await preloadTechnicalSpecs(productHandles);

  return (
    <div className="grid gap-6">
      {products.map((product) => (
        <div key={product.id} className="border rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">{product.title}</h3>

          {/* Specifications will load quickly from cache */}
          <TechnicalSpecs productHandle={product.handle} className="mt-4" />
        </div>
      ))}
    </div>
  );
}
```

### Example 9: Lazy loading with Suspense

Use React Suspense for progressive enhancement.

```tsx
import { Suspense } from 'react';
import TechnicalSpecs from '@/components/TechnicalSpecs';

function ProductPageWithSuspense({ productHandle }: { productHandle: string }) {
  return (
    <div>
      <h1>Product Details</h1>

      {/* Other product content loads immediately */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Product images, description, etc. */}
      </div>

      {/* Technical specs load asynchronously */}
      <Suspense
        fallback={
          <div className="animate-pulse">
            <div className="h-12 bg-muted rounded mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          </div>
        }
      >
        <TechnicalSpecs productHandle={productHandle} />
      </Suspense>
    </div>
  );
}
```

## Testing Examples

### Example 10: Component testing

Test the component with mock data.

```tsx
// TechnicalSpecs.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import TechnicalSpecs from '@/components/TechnicalSpecs';
import { getTechnicalSpecs } from '@/lib/services/technical-specs';

// Mock the service
jest.mock('@/lib/services/technical-specs');

const mockGetTechnicalSpecs = getTechnicalSpecs as jest.MockedFunction<
  typeof getTechnicalSpecs
>;

describe('TechnicalSpecs', () => {
  beforeEach(() => {
    mockGetTechnicalSpecs.mockClear();
  });

  it('displays technical specifications', async () => {
    // Mock specification data
    mockGetTechnicalSpecs.mockResolvedValue({
      specifications: [
        { key: 'Magnification', value: '40x-1000x', category: 'optics' },
        { key: 'Weight', value: '4.2 kg', category: 'physical' },
      ],
      compatibility: ['Standard lab benches'],
      downloads: [
        {
          id: '1',
          name: 'Manual',
          type: 'PDF',
          size: '2MB',
          category: 'manual',
        },
      ],
      productType: 'microscope',
    });

    render(<TechnicalSpecs productHandle="test-microscope" />);

    // Wait for specifications to load
    await waitFor(() => {
      expect(screen.getByText('Magnification')).toBeInTheDocument();
      expect(screen.getByText('40x-1000x')).toBeInTheDocument();
    });

    // Test tab functionality
    const compatibilityTab = screen.getByText('Compatibility');
    expect(compatibilityTab).toBeInTheDocument();
  });

  it('shows fallback data when metafields fail', async () => {
    mockGetTechnicalSpecs.mockRejectedValue(new Error('API Error'));

    render(<TechnicalSpecs productType="microscope" />);

    // Should fall back to hardcoded specifications
    await waitFor(() => {
      expect(screen.getByText('Technical Specifications')).toBeInTheDocument();
    });
  });
});
```

## Component Props Reference

### TechnicalSpecs Props

| Prop            | Type                   | Required | Description                                          |
| --------------- | ---------------------- | -------- | ---------------------------------------------------- |
| `productHandle` | `string`               | No       | Shopify product handle for dynamic specs             |
| `productType`   | `SupportedProductType` | No       | Product type for fallback specs (default: 'general') |
| `className`     | `string`               | No       | Additional CSS classes                               |

### Notes

- Either `productHandle` or `productType` should be provided
- `productHandle` takes precedence over `productType`
- The component gracefully degrades to fallback data if Shopify metafields fail
- Caching is handled automatically via Redis
- Loading and error states are built-in
