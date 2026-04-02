export type Review = {
  id: string;
  productHandle: string;
  productTitle: string;
  author: string;
  email: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
  verified: boolean;
};

export type ReviewSummary = {
  averageRating: number;
  totalCount: number;
  distribution: Record<number, number>; // 1-5 star counts
};

/**
 * Mock review data for MVP. This will be replaced with Shopify metafields
 * or a proper backend once the reviews integration is chosen.
 */
const MOCK_REVIEWS: Review[] = [
  {
    id: 'rev-001',
    productHandle: 'lw-scientific-zip-iqa-centrifuge',
    productTitle: 'LW Scientific ZipCombo Centrifuge',
    author: 'Dr. Sarah Mitchell',
    email: 'sarah.m@example.com',
    rating: 5,
    title: 'Excellent benchtop centrifuge',
    body: 'We replaced our aging centrifuge with this unit and the difference is night and day. Quiet operation, consistent results, and the digital timer is a huge quality-of-life improvement for our lab techs.',
    createdAt: '2026-03-15T10:30:00Z',
    verified: true,
  },
  {
    id: 'rev-002',
    productHandle: 'lw-scientific-zip-iqa-centrifuge',
    productTitle: 'LW Scientific ZipCombo Centrifuge',
    author: 'James Park',
    email: 'jpark@example.com',
    rating: 4,
    title: 'Great value for the price',
    body: 'Solid centrifuge that handles our daily workload without issues. Only reason for 4 stars is the rotor selection could be wider. Otherwise, highly recommended for small to mid-size labs.',
    createdAt: '2026-03-02T14:15:00Z',
    verified: true,
  },
  {
    id: 'rev-003',
    productHandle: 'lw-scientific-zip-iqa-centrifuge',
    productTitle: 'LW Scientific ZipCombo Centrifuge',
    author: 'Maria Gonzalez',
    email: 'mgonzalez@example.com',
    rating: 5,
    title: 'Perfect for our clinic',
    body: 'Fast shipping from Lab Essentials and the centrifuge works exactly as described. Our phlebotomy team loves it.',
    createdAt: '2026-02-18T09:45:00Z',
    verified: false,
  },
  {
    id: 'rev-004',
    productHandle: 'lw-scientific-usa-zipocrit-centrifuge',
    productTitle: 'LW Scientific USA ZipoCrit Centrifuge',
    author: 'Dr. Robert Chen',
    email: 'rchen@example.com',
    rating: 5,
    title: 'Reliable hematocrit readings',
    body: 'We use this daily for hematocrit testing. Consistent spin times, easy to load, and the compact footprint is perfect for our crowded bench space.',
    createdAt: '2026-03-20T11:00:00Z',
    verified: true,
  },
  {
    id: 'rev-005',
    productHandle: 'lw-scientific-usa-zipocrit-centrifuge',
    productTitle: 'LW Scientific USA ZipoCrit Centrifuge',
    author: 'Amanda Foster',
    email: 'afoster@example.com',
    rating: 4,
    title: 'Does exactly what we need',
    body: 'Simple, reliable, and affordable. Lab Essentials had the best price we could find online and it arrived in two days.',
    createdAt: '2026-02-28T16:30:00Z',
    verified: true,
  },
  {
    id: 'rev-006',
    productHandle: 'combo-v24-centrifuge',
    productTitle: 'LW Scientific Combo V24 Centrifuge',
    author: 'Dr. Karen Thompson',
    email: 'kthompson@example.com',
    rating: 5,
    title: 'Versatile and well-built',
    body: 'The variable speed control gives us flexibility for different sample types. Build quality is excellent — feels like it will last for years.',
    createdAt: '2026-03-10T08:20:00Z',
    verified: true,
  },
  {
    id: 'rev-007',
    productHandle: 'combo-v24-centrifuge',
    productTitle: 'LW Scientific Combo V24 Centrifuge',
    author: 'Michael Brown',
    email: 'mbrown@example.com',
    rating: 3,
    title: 'Good but noisy at high speed',
    body: 'Performance is solid overall. At maximum RPM it gets louder than expected, but at normal operating speeds it is fine. Would still recommend for the price point.',
    createdAt: '2026-01-25T13:45:00Z',
    verified: false,
  },
  {
    id: 'rev-008',
    productHandle: 'lw-scientific-e8-centrifuge',
    productTitle: 'LW Scientific E8 Centrifuge',
    author: 'Lisa Wang',
    email: 'lwang@example.com',
    rating: 5,
    title: 'Best compact centrifuge we have owned',
    body: 'Upgraded from an older model and this is a massive improvement. Spins down samples fast, the digital display is clear, and cleanup is easy.',
    createdAt: '2026-03-22T10:00:00Z',
    verified: true,
  },
];

export function getReviewsForProduct(productHandle: string): Review[] {
  return MOCK_REVIEWS.filter((r) => r.productHandle === productHandle);
}

export function getAllReviews(): Review[] {
  return [...MOCK_REVIEWS].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function getReviewSummary(reviews: Review[]): ReviewSummary {
  if (reviews.length === 0) {
    return { averageRating: 0, totalCount: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
  }

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let total = 0;

  for (const review of reviews) {
    distribution[review.rating] = (distribution[review.rating] ?? 0) + 1;
    total += review.rating;
  }

  return {
    averageRating: Math.round((total / reviews.length) * 10) / 10,
    totalCount: reviews.length,
    distribution,
  };
}

/**
 * Generate AggregateRating JSON-LD for product schema.
 * Returns undefined if no reviews exist.
 */
export function generateReviewSchema(reviews: Review[], productHandle: string) {
  if (reviews.length === 0) return undefined;

  const summary = getReviewSummary(reviews);

  return {
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: summary.averageRating.toString(),
      reviewCount: summary.totalCount.toString(),
      bestRating: '5',
      worstRating: '1',
    },
    review: reviews.slice(0, 5).map((r) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: r.author,
      },
      datePublished: r.createdAt.split('T')[0],
      reviewRating: {
        '@type': 'Rating',
        ratingValue: r.rating.toString(),
        bestRating: '5',
        worstRating: '1',
      },
      name: r.title,
      reviewBody: r.body,
    })),
  };
}
