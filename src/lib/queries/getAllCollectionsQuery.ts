export const getAllCollectionsQuery = /* GraphQL */ `
  query getAllCollections($first: Int = 20) {
    collections(first: $first) {
      edges {
        node {
          id
          handle
          title
          description
          image {
            url
            altText
          }
          products(first: 1) {
            edges {
              node {
                id
              }
            }
          }
        }
      }
    }
  }
`;
