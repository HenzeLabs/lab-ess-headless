// GraphQL fragments and queries for technical specifications metafields

export const TECHNICAL_SPECS_METAFIELD_FRAGMENT = `
  fragment TechnicalSpecsMetafields on Product {
    metafields(identifiers: [
      { namespace: "technical_specs", key: "specifications" }
      { namespace: "technical_specs", key: "compatibility" }
      { namespace: "technical_specs", key: "downloads" }
      { namespace: "technical_specs", key: "product_type" }
      { namespace: "technical_specs", key: "certification" }
      { namespace: "technical_specs", key: "warranty" }
    ]) {
      id
      namespace
      key
      value
      type
      description
    }
  }
`;

export const PRODUCT_TYPE_SPECS_METAFIELD_FRAGMENT = `
  fragment ProductTypeSpecsMetafields on ProductType {
    metafields(identifiers: [
      { namespace: "product_type_specs", key: "default_specifications" }
      { namespace: "product_type_specs", key: "default_compatibility" }
      { namespace: "product_type_specs", key: "default_downloads" }
      { namespace: "product_type_specs", key: "spec_schema" }
    ]) {
      id
      namespace
      key
      value
      type
      description
    }
  }
`;

export const GET_PRODUCT_WITH_SPECS = `
  query getProductWithSpecs($handle: String!) {
    product(handle: $handle) {
      id
      handle
      title
      productType
      ...TechnicalSpecsMetafields
    }
  }
  ${TECHNICAL_SPECS_METAFIELD_FRAGMENT}
`;

export const GET_PRODUCT_TYPE_SPECS = `
  query getProductTypeSpecs($query: String!) {
    products(first: 1, query: $query) {
      edges {
        node {
          id
          productType
          ...TechnicalSpecsMetafields
        }
      }
    }
  }
  ${TECHNICAL_SPECS_METAFIELD_FRAGMENT}
`;

export const GET_ALL_PRODUCT_TYPES_WITH_SPECS = `
  query getAllProductTypesWithSpecs {
    productTypes(first: 50) {
      edges {
        node {
          id
          name
          ...ProductTypeSpecsMetafields
        }
      }
    }
  }
  ${PRODUCT_TYPE_SPECS_METAFIELD_FRAGMENT}
`;

// Bulk operation for fetching multiple products with specs
export const BULK_GET_PRODUCTS_WITH_SPECS = `
  mutation bulkOperationRunQuery($query: String!) {
    bulkOperationRunQuery(
      query: $query
    ) {
      bulkOperation {
        id
        status
        errorCode
        createdAt
        completedAt
        objectCount
        fileSize
        url
        partialDataUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const BULK_OPERATION_STATUS = `
  query getCurrentBulkOperation {
    currentBulkOperation {
      id
      status
      errorCode
      createdAt
      completedAt
      objectCount
      fileSize
      url
      partialDataUrl
    }
  }
`;

// Query for bulk operation to get all products with specs
export const BULK_PRODUCTS_QUERY = `
  {
    products {
      edges {
        node {
          id
          handle
          title
          productType
          metafields(identifiers: [
            { namespace: "technical_specs", key: "specifications" }
            { namespace: "technical_specs", key: "compatibility" }
            { namespace: "technical_specs", key: "downloads" }
            { namespace: "technical_specs", key: "product_type" }
          ]) {
            id
            namespace
            key
            value
            type
          }
        }
      }
    }
  }
`;
