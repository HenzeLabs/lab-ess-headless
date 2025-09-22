
import { shopifyFetch } from '@/lib/shopify';
import { ShopifyCollections } from '@/lib/types';

const GET_ALL_COLLECTIONS_QUERY = /* GraphQL */ `
  query GetAllCollections {
    collections(first: 250) {
      edges {
        node {
          handle
          title
        }
      }
    }
  }
`;

export default async function CollectionsDebugPage() {
  const { data } = await shopifyFetch<ShopifyCollections>({ query: GET_ALL_COLLECTIONS_QUERY });
  const collections = data.collections.edges.map(edge => edge.node);

  return (
    <div>
      <h1>Collections Debug Page</h1>
      <p>Found {collections.length} collections:</p>
      <ul>
        {collections.map(collection => (
          <li key={collection.handle}>
            <a href={`/collections/${collection.handle}`}>
              {collection.title} (handle: {collection.handle})
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
