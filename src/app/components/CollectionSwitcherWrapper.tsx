import { shopifyFetch } from '@/lib/shopify';
import { getCollectionsListQuery } from '@/lib/queries';
import CollectionSwitcher from '@/components/CollectionSwitcher';
import type { CollectionData } from '@/lib/types';

interface CollectionsData {
  collections: {
    edges: { node: CollectionData }[];
  };
}

export default async function CollectionSwitcherWrapper() {
  const { data } = await shopifyFetch<CollectionsData>({
    query: getCollectionsListQuery,
  });

  const initialCollections = data.collections.edges.map((edge) => edge.node);

  return <CollectionSwitcher initialCollections={initialCollections} />;
}
