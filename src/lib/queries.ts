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
    }
  }
`;

export const getCartQuery = `
  query getCart($cartId: ID!) {
    cart(id: $cartId) {
      id
      checkoutUrl
      lines(first: 100) {
        edges {
          node {
            id
            quantity
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
          }
        }
      }
    }
  }
`;

export const cartLinesRemoveMutation = `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        id
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
    collections(first: 20) {
      edges {
        node {
          id
          title
          handle
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