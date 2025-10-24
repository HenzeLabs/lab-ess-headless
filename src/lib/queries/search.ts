// Shopify Search API GraphQL Queries

export const SEARCH_PRODUCTS = `
  query searchProducts($query: String!, $first: Int, $after: String, $sortKey: ProductSortKeys, $reverse: Boolean) {
    products(query: $query, first: $first, after: $after, sortKey: $sortKey, reverse: $reverse) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      edges {
        cursor
        node {
          id
          title
          handle
          description
          availableForSale
          vendor
          productType
          tags
          createdAt
          updatedAt
          images(first: 5) {
            edges {
              node {
                id
                url
                altText
                width
                height
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
          variants(first: 5) {
            edges {
              node {
                id
                title
                availableForSale
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
                selectedOptions {
                  name
                  value
                }
                image {
                  id
                  url
                  altText
                  width
                  height
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const SEARCH_COLLECTIONS = `
  query searchCollections($query: String!, $first: Int, $after: String, $sortKey: CollectionSortKeys, $reverse: Boolean) {
    collections(query: $query, first: $first, after: $after, sortKey: $sortKey, reverse: $reverse) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      edges {
        cursor
        node {
          id
          title
          handle
          description
          image {
            id
            url
            altText
            width
            height
          }
          products(first: 3) {
            edges {
              node {
                id
                title
                handle
                images(first: 1) {
                  edges {
                    node {
                      id
                      url
                      altText
                      width
                      height
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
      }
    }
  }
`;

export const SEARCH_PAGES = `
  query searchPages($query: String!, $first: Int, $after: String) {
    pages(query: $query, first: $first, after: $after) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      edges {
        cursor
        node {
          id
          title
          handle
          body
          bodySummary
          createdAt
          updatedAt
        }
      }
    }
  }
`;

export const SEARCH_ARTICLES = `
  query searchArticles($query: String!, $first: Int, $after: String) {
    articles(query: $query, first: $first, after: $after) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      edges {
        cursor
        node {
          id
          title
          handle
          content
          contentHtml
          excerpt
          publishedAt
          image {
            id
            url
            altText
            width
            height
          }
          author {
            firstName
            lastName
          }
          blog {
            id
            title
            handle
          }
          tags
        }
      }
    }
  }
`;

export const PREDICTIVE_SEARCH = `
  query predictiveSearch($query: String!, $limit: Int) {
    predictiveSearch(query: $query, limit: $limit) {
      queries {
        text
        styledText
      }
      products {
        id
        title
        handle
        description
        availableForSale
        vendor
        productType
        tags
        images(first: 1) {
          edges {
            node {
              id
              url
              altText
              width
              height
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
              title
              availableForSale
              price {
                amount
                currencyCode
              }
              compareAtPrice {
                amount
                currencyCode
              }
              selectedOptions {
                name
                value
              }
              image {
                id
                url
                altText
                width
                height
              }
            }
          }
        }
      }
      collections {
        id
        title
        handle
        description
        image {
          id
          url
          altText
          width
          height
        }
        products(first: 1) {
          edges {
            node {
              id
              title
              handle
              images(first: 1) {
                edges {
                  node {
                    id
                    url
                    altText
                    width
                    height
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

export const SEARCH_ALL = `
  query searchAll($query: String!, $first: Int, $after: String, $productSortKey: ProductSortKeys, $reverse: Boolean) {
    products(query: $query, first: $first, after: $after, sortKey: $productSortKey, reverse: $reverse) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      edges {
        cursor
        node {
          id
          title
          handle
          description
          availableForSale
          vendor
          productType
          tags
          createdAt
          updatedAt
          images(first: 3) {
            edges {
              node {
                id
                url
                altText
                width
                height
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
          variants(first: 3) {
            edges {
              node {
                id
                title
                availableForSale
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
                selectedOptions {
                  name
                  value
                }
                image {
                  id
                  url
                  altText
                  width
                  height
                }
              }
            }
          }
        }
      }
    }
    
    collections(query: $query, first: 5) {
      edges {
        node {
          id
          title
          handle
          description
          image {
            id
            url
            altText
            width
            height
          }
          products(first: 3) {
            edges {
              node {
                id
                title
                handle
                images(first: 1) {
                  edges {
                    node {
                      id
                      url
                      altText
                      width
                      height
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
      }
    }
    
    pages(query: $query, first: 5) {
      edges {
        node {
          id
          title
          handle
          body
          bodySummary
          createdAt
          updatedAt
        }
      }
    }

    articles(query: $query, first: 5) {
      edges {
        node {
          id
          title
          handle
          content
          contentHtml
          excerpt
          publishedAt
          image {
            id
            url
            altText
            width
            height
          }
          author {
            firstName
            lastName
          }
          blog {
            id
            title
            handle
          }
          tags
        }
      }
    }
  }
`;

// Fragments for reusability
export const SEARCH_PRODUCT_FRAGMENT = `
  fragment SearchProductFragment on Product {
    id
    title
    handle
    description
    availableForSale
    vendor
    productType
    tags
    createdAt
    updatedAt
    images(first: 3) {
      edges {
        node {
          id
          url
          altText
          width
          height
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
    variants(first: 3) {
      edges {
        node {
          id
          title
          availableForSale
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
          selectedOptions {
            name
            value
          }
          image {
            id
            url
            altText
            width
            height
          }
        }
      }
    }
  }
`;

export const SEARCH_COLLECTION_FRAGMENT = `
  fragment SearchCollectionFragment on Collection {
    id
    title
    handle
    description
    image {
      id
      url
      altText
      width
      height
    }
    products(first: 3) {
      edges {
        node {
          id
          title
          handle
          images(first: 1) {
            edges {
              node {
                id
                url
                altText
                width
                height
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

export const SEARCH_SUGGESTIONS = `
  query searchSuggestions($query: String!) {
    productRecommendations: products(query: $query, first: 5) {
      edges {
        node {
          id
          title
          handle
          tags
        }
      }
    }
    collectionSuggestions: collections(query: $query, first: 3) {
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
