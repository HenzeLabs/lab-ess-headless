# Shopify Technical Specifications Metafields Setup Guide

This guide explains how to set up metafields in Shopify to store dynamic technical specifications for laboratory equipment products.

## Overview

The technical specifications system uses Shopify metafields to store product specifications, compatibility information, and download links. This replaces hardcoded data with dynamic content manageable through the Shopify admin.

## Required Metafields

### 1. Technical Specifications (`specifications`)

- **Namespace**: `custom`
- **Key**: `specifications`
- **Type**: `JSON`
- **Description**: Product technical specifications organized by categories

**JSON Structure:**

```json
{
  "specifications": {
    "Magnification Range": "40x - 1000x",
    "Objective Lenses": "4x, 10x, 40x, 100x (oil)",
    "Illumination": "LED, 3W, 6300K",
    "Focus": "Coaxial coarse/fine",
    "Stage": "110mm x 120mm mechanical stage",
    "Power Requirements": "100-240V AC, 50/60Hz",
    "Dimensions": "350mm x 200mm x 420mm",
    "Weight": "4.2 kg"
  },
  "categories": {
    "Magnification Range": "optics",
    "Objective Lenses": "optics",
    "Illumination": "lighting",
    "Focus": "mechanics",
    "Stage": "mechanics",
    "Power Requirements": "electrical",
    "Dimensions": "physical",
    "Weight": "physical"
  }
}
```

### 2. Compatibility Information (`compatibility`)

- **Namespace**: `custom`
- **Key**: `compatibility`
- **Type**: `JSON`
- **Description**: Laboratory compatibility requirements and standards

**JSON Structure:**

```json
{
  "items": [
    "Standard laboratory benchtops",
    "Compatible with most slide formats",
    "Works with digital cameras",
    "C-mount adapter included"
  ]
}
```

### 3. Downloads (`downloads`)

- **Namespace**: `custom`
- **Key**: `downloads`
- **Type**: `JSON`
- **Description**: Documentation and software downloads

**JSON Structure:**

```json
{
  "items": [
    {
      "id": "microscope-datasheet",
      "name": "Technical Datasheet",
      "type": "PDF",
      "size": "2.3 MB",
      "category": "datasheet",
      "url": "https://example.com/datasheet.pdf"
    },
    {
      "id": "microscope-manual",
      "name": "User Manual",
      "type": "PDF",
      "size": "8.1 MB",
      "category": "manual",
      "url": "https://example.com/manual.pdf"
    },
    {
      "id": "microscope-software",
      "name": "Control Software",
      "type": "ZIP",
      "size": "45.2 MB",
      "category": "software",
      "url": "https://example.com/software.zip"
    }
  ]
}
```

### 4. Product Type (`product_type`)

- **Namespace**: `custom`
- **Key**: `product_type`
- **Type**: `Single line text`
- **Description**: Equipment category for fallback specifications

**Allowed Values:**

- `microscope`
- `centrifuge`
- `camera`
- `incubator`
- `spectrophotometer`
- `ph_meter`
- `balance`
- `pipette`
- `thermometer`
- `general`

## Setup Instructions

### Step 1: Create Metafield Definitions

1. Go to **Settings > Metafields** in your Shopify admin
2. Click **Add definition**
3. Create each metafield definition with the specifications above

### Step 2: Configure Product Types

For each product type, create a template product with complete metafield data:

#### Microscope Example

```json
// specifications
{
  "specifications": {
    "Magnification Range": "40x - 1000x",
    "Objective Lenses": "4x, 10x, 40x, 100x (oil)",
    "Illumination": "LED, 3W, 6300K",
    "Focus": "Coaxial coarse/fine",
    "Stage": "110mm x 120mm mechanical stage",
    "Condenser": "Abbe N.A. 1.25 with iris",
    "Power Requirements": "100-240V AC, 50/60Hz",
    "Dimensions": "350mm x 200mm x 420mm",
    "Weight": "4.2 kg",
    "Warranty": "2-year full coverage"
  },
  "categories": {
    "Magnification Range": "optics",
    "Objective Lenses": "optics",
    "Illumination": "lighting",
    "Focus": "mechanics",
    "Stage": "mechanics",
    "Condenser": "optics",
    "Power Requirements": "electrical",
    "Dimensions": "physical",
    "Weight": "physical",
    "Warranty": "general"
  }
}

// compatibility
{
  "items": [
    "Standard laboratory benchtops",
    "Compatible with most slide formats",
    "Works with digital cameras",
    "C-mount adapter included"
  ]
}

// downloads
{
  "items": [
    {
      "id": "microscope-datasheet",
      "name": "Technical Datasheet",
      "type": "PDF",
      "size": "2.3 MB",
      "category": "datasheet"
    },
    {
      "id": "microscope-manual",
      "name": "User Manual",
      "type": "PDF",
      "size": "8.1 MB",
      "category": "manual"
    }
  ]
}

// product_type
microscope
```

### Step 3: Bulk Product Setup

1. Export existing products
2. Add metafield columns to the CSV
3. Populate with appropriate data for each product
4. Import the updated CSV

### Step 4: Validation

Use the GraphQL Admin API to verify metafields are properly set:

```graphql
query getProductMetafields($id: ID!) {
  product(id: $id) {
    id
    handle
    title
    metafields(first: 10, namespace: "custom") {
      edges {
        node {
          key
          value
          type
        }
      }
    }
  }
}
```

## Category Organization

Specifications are organized into logical categories for better presentation:

### Optical Equipment Categories

- **optics**: Magnification, lenses, optical components
- **lighting**: Illumination systems, LED specifications
- **imaging**: Sensors, resolution, frame rates

### Mechanical Equipment Categories

- **mechanics**: Moving parts, focus systems, stages
- **physical**: Dimensions, weight, form factor
- **capacity**: Volume, throughput, sample capacity

### Electronic Categories

- **electrical**: Power requirements, consumption
- **connectivity**: Interfaces, communication protocols
- **performance**: Speed, accuracy, operational specs

### Environmental Categories

- **environmental**: Temperature, humidity, operating conditions
- **measurement**: Ranges, accuracy, precision
- **compliance**: Certifications, standards, regulations

## Migration Strategy

### Phase 1: Setup Infrastructure

1. Create metafield definitions in Shopify
2. Deploy the new TechnicalSpecs component
3. Test with a few sample products

### Phase 2: Content Migration

1. Identify products that need specifications
2. Create metafield templates for each product type
3. Bulk update products with metafield data

### Phase 3: Validation & Cleanup

1. Verify all products have appropriate specifications
2. Test the frontend rendering
3. Remove hardcoded fallback data (optional)

## Best Practices

### Data Consistency

- Use consistent units (metric preferred)
- Standardize terminology across products
- Maintain consistent categorization

### Performance Optimization

- The system includes Redis caching for specifications
- Cache TTL is set to 1 hour by default
- Fallback data ensures graceful degradation

### Content Management

- Create templates for each product type
- Use clear, descriptive specification names
- Include relevant download categories (datasheet, manual, software)

### Error Handling

- Always provide fallback specifications
- Validate JSON metafields before saving
- Monitor for parsing errors in application logs

## Troubleshooting

### Common Issues

1. **Metafields not appearing**: Check namespace and key spelling
2. **JSON parsing errors**: Validate JSON structure before saving
3. **Missing specifications**: Verify product type fallback is working
4. **Cache issues**: Clear Redis cache if specifications don't update

### Debugging Tools

Use the browser console to check for errors:

```javascript
// Check if specifications loaded
console.log('Specs loaded:', window.__specs);

// Test API endpoint
fetch('/api/technical-specs/product-handle')
  .then((res) => res.json())
  .then(console.log);
```

### Support

For technical issues:

1. Check application logs for parsing errors
2. Verify Shopify metafield configuration
3. Test GraphQL queries in Shopify admin
4. Monitor Redis cache performance

## API Reference

### Service Functions

- `getTechnicalSpecs(productHandle)`: Get specs for specific product
- `getTechnicalSpecsByProductType(productType)`: Get specs by product type
- `preloadTechnicalSpecs(handles[])`: Preload multiple products
- `clearSpecsCache(productHandle)`: Clear cache for product
- `healthCheck()`: Check system health

### GraphQL Queries

Available in `/src/lib/queries/technical-specs.ts`:

- `GET_PRODUCT_WITH_SPECS`: Fetch product with metafields
- `GET_PRODUCT_TYPE_SPECS`: Fetch by product type
- `GET_ALL_PRODUCT_TYPES_WITH_SPECS`: Fetch all product types

## Updates and Maintenance

### Regular Tasks

- Monitor cache hit rates
- Update product specifications as needed
- Add new product types when required
- Review and optimize GraphQL queries

### Scaling Considerations

- Consider CDN for download files
- Implement metafield versioning for major changes
- Monitor API rate limits for bulk operations
- Plan for internationalization if needed
