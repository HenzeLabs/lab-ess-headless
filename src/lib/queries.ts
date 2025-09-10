export const getCollectionsQuery = `
  query getCollections {
    collections(first: 250) {
      edges {
        node {
          id
          title
          handle
        }
      }
    }
  }
`;

export const getProductsQuery = `
  query getProducts {
    products(first: 250) {
      edges {
        node {
          id
          handle
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
      description
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

export const createCartMutation = `
  mutation cartCreate {
    cartCreate {
      cart {
        id
        checkoutUrl
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

export { getCollectionProductsQuery as getCollectionByHandleQuery } from "./collectionProductsQuery";
