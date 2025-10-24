export const cartCreateMutation = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        totalQuantity
        cost {
          subtotalAmount { amount currencyCode }
          totalAmount { amount currencyCode }
          totalTaxAmount { amount currencyCode }
        }
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              cost {
                amountPerQuantity { amount currencyCode }
                subtotalAmount { amount currencyCode }
                totalAmount { amount currencyCode }
              }
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  product {
                    title
                    handle
                    featuredImage {
                      url
                      altText
                    }
                  }
                }
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const cartLinesAddMutation = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        totalQuantity
        cost {
          subtotalAmount { amount currencyCode }
          totalAmount { amount currencyCode }
          totalTaxAmount { amount currencyCode }
        }
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              cost {
                amountPerQuantity { amount currencyCode }
                subtotalAmount { amount currencyCode }
                totalAmount { amount currencyCode }
              }
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  product {
                    title
                    handle
                    featuredImage {
                      url
                      altText
                    }
                  }
                }
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;
export const getShopBrandQuery = `
  query getShopBrand {
    shop {
      name
      brand {
        logo {
          image {
            url
            altText
          }
        }
      }
    }
  }
`;

export const getMainMenuQuery = `
  query getMainMenu {
    menu(handle: "main-menu") {
      items {
        id
        title
        url
        resourceId
        items {
          id
          title
          url
          resourceId
          items {
            id
            title
            url
            resourceId
          }
        }
      }
    }
  }
`;

export const getCollectionsByIdQuery = `
  query getCollectionsById($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Collection {
        id
        title
        image {
          url
          altText
        }
        products(first: 1) {
          edges {
            node {
              featuredImage {
                url
                altText
              }
            }
          }
        }
      }
    }
  }
`;

export const getProductsByIdQuery = `
  query getProductsById($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Product {
        id
        title
        featuredImage {
          url
          altText
        }
      }
    }
  }
`;

export const getProductByHandleQuery = `
  query getProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      title
      descriptionHtml
      tags
      handle
      images(first: 10) {
        edges {
          node {
            url
            altText
          }
        }
      }
      variants(first: 10) {
        edges {
          node {
            id
            title
            price {
              amount
              currencyCode
            }
            availableForSale
          }
        }
      }
      featuredImage {
        url
        altText
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      collections(first: 1) {
        edges {
          node {
            id
            title
            handle
          }
        }
      }
      metafields(identifiers: [
        { namespace: "custom", key: "features" },
        { namespace: "custom", key: "applications" },
        { namespace: "custom", key: "specs" },
        { namespace: "custom", key: "equipment_category" },
        { namespace: "custom", key: "faq" },
        { namespace: "custom", key: "manual_url" },
        { namespace: "custom", key: "quick_start_url" }
      ]) {
        namespace
        key
        value
        type
        references(first: 10) {
          edges {
            node {
              ... on Metaobject {
                fields {
                  key
                  value
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const getCartQuery = `
  query getCart($cartId: ID!) {
    cart(id: $cartId) {
      id
      checkoutUrl
      totalQuantity
      cost {
        subtotalAmount { amount currencyCode }
        totalAmount { amount currencyCode }
        totalTaxAmount { amount currencyCode }
      }
      lines(first: 100) {
        edges {
          node {
            id
            quantity
            cost {
              amountPerQuantity { amount currencyCode }
              subtotalAmount { amount currencyCode }
              totalAmount { amount currencyCode }
            }
            merchandise {
              ... on ProductVariant {
                id
                title
                price {
                  amount
                  currencyCode
                }
                product {
                  title
                  handle
                  featuredImage {
                    url
                    altText
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const getCollectionByHandleQuery = `
  query getCollectionByHandle($handle: String!, $first: Int = 8) {
    collection(handle: $handle) {
      id
      title
      handle
      description
      image {
        url
        altText
      }
      products(first: $first) {
        edges {
          node {
            id
            title
            handle
            descriptionHtml
            featuredImage {
              url
              altText
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            metafields(identifiers: [
              { namespace: "custom", key: "features" },
              { namespace: "custom", key: "applications" },
              { namespace: "custom", key: "specs" },
              { namespace: "custom", key: "equipment_category" },
              { namespace: "custom", key: "brand" }
            ]) {
              namespace
              key
              value
              type
            }
          }
        }
      }
    }
  }
`;

export const getProductRecommendationsQuery = `
  query getProductRecommendations($productId: ID!) {
    productRecommendations(productId: $productId) {
      id
      title
      handle
      featuredImage {
        url
        altText
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
    }
  }
`;

export const getPageByHandleQuery = `
  query getPageByHandle($handle: String!) {
    pageByHandle(handle: $handle) {
      id
      title
      handle
      body
      seo {
        title
        description
      }
    }
  }
`;

export const cartLinesRemoveMutation = `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        id
        checkoutUrl
        totalQuantity
        cost {
          subtotalAmount { amount currencyCode }
          totalAmount { amount currencyCode }
          totalTaxAmount { amount currencyCode }
        }
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              cost {
                amountPerQuantity { amount currencyCode }
                subtotalAmount { amount currencyCode }
                totalAmount { amount currencyCode }
              }
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  product {
                    title
                    handle
                    featuredImage {
                      url
                      altText
                    }
                  }
                }
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const cartLinesUpdateMutation = `
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        totalQuantity
        cost {
          subtotalAmount { amount currencyCode }
          totalAmount { amount currencyCode }
          totalTaxAmount { amount currencyCode }
        }
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              cost {
                amountPerQuantity { amount currencyCode }
                subtotalAmount { amount currencyCode }
                totalAmount { amount currencyCode }
              }
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  product {
                    title
                    handle
                    featuredImage {
                      url
                      altText
                    }
                  }
                }
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const getHomepageCollectionsQuery = `
  query getHomepageCollections($first: Int = 4) {
    collections(first: $first) {
      edges {
        node {
          id
          title
          handle
          description
          image {
            url
            altText
          }
          products(first: 1) {
            edges {
              node {
                id
                featuredImage {
                  url
                  altText
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const getHomepageProductsQuery = `
  query getHomepageProducts($first: Int = 8) {
    products(first: $first) {
      edges {
        node {
          id
          title
          handle
          descriptionHtml
          featuredImage {
            url
            altText
          }
          images(first: 4) {
            edges {
              node {
                url
                altText
              }
            }
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;

export const getCollectionsListQuery = `
  query getCollectionsList {
    collections(first: 250) {
      edges {
        node {
          id
          title
          handle
          updatedAt
          image {
            url
            altText
          }
        }
      }
    }
  }
`;

export const getCollectionProductsByHandleQuery = `
  query getCollectionProductsByHandle($handle: String!, $first: Int = 4) {
    collection(handle: $handle) {
      id
      title
      handle
      products(first: $first) {
        edges {
          node {
            id
            title
            handle
            featuredImage {
              url
              altText
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  }
`;

export const getAllProductsQuery = `
  query getAllProducts {
    products(first: 250) {
      edges {
        node {
          handle
          updatedAt
        }
      }
    }
  }
`;

export const getCollectionWithProductsQuery = `
  query getCollectionWithProducts($handle: String!, $productsFirst: Int = 20) {
    collection(handle: $handle) {
      id
      title
      description
      image {
        url
        altText
      }
      products(first: $productsFirst) {
        edges {
          node {
            id
            handle
            title
            description
            featuredImage {
              url
              altText
            }
            variants(first: 1) {
              edges {
                node {
                  id
                  title
                  availableForSale
                  price {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;
