// GraphQL query to fetch products for a given collection handle
export const getCollectionProductsQuery = `
  query CollectionByHandle($handle: String!, $first: Int!) {
    collectionByHandle(handle: $handle) {
      id
      title
      products(first: $first) {
        edges {
          node {
            id
            title
            handle
            description
            availableForSale
            tags
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
              maxVariantPrice {
                amount
                currencyCode
              }
            }
            variants(first: 1) {
              edges {
                node {
                  id
                  availableForSale
                  price {
                    amount
                    currencyCode
                  }
                  compareAtPrice {
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
