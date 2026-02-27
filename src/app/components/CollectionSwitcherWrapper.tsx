import CollectionSwitcher from '@/components/CollectionSwitcher';
import { getCollectionsListQuery } from '@/lib/queries';
import { shopifyFetch } from '@/lib/shopify';
import type { CollectionData } from '@/lib/types';
import {
  getFallbackCollection,
  getFallbackCollectionHandles,
} from '@/lib/fallback/catalog';

interface CollectionsData {
  collections: {
    edges: { node: CollectionData }[];
  };
}

const preferredHandles = new Set([
  'microscopes',
  'centrifuges',
  'featured-products',
  'best-sellers',
  'microscope-cameras',
  'incubators-slide-preparation',
  'lab-equipment',
]);

export default async function CollectionSwitcherWrapper() {
  let initialCollections: CollectionData[] = [];

  try {
    const { data } = await shopifyFetch<CollectionsData>({
      query: getCollectionsListQuery,
    });

    initialCollections = data.collections.edges
      .map((edge) => edge.node)
      .filter((collection) => preferredHandles.has(collection.handle));
  } catch (error) {
    console.error('Failed to load collections for switcher', error);
  }

  if (!initialCollections.length) {
    initialCollections = getFallbackCollectionHandles()
      .map((handle) => getFallbackCollection(handle))
      .filter((collection): collection is CollectionData => Boolean(collection));
  }

  return <CollectionSwitcher initialCollections={initialCollections} />;
}
