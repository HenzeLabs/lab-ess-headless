import Image from 'next/image';
import Link from 'next/link';

import { getCollectionByHandleQuery } from '@/lib/queries';
import { stripHtml } from '@/lib/seo';
import { shopifyFetch } from '@/lib/shopify';
import type { Product } from '@/lib/types';
import { layout, buttonStyles } from '@/lib/ui';

interface FeaturedHeroProductProps {
  lifestyleImage?: string;
  learnMoreUrl?: string;
}

interface FeaturedCollectionResponse {
  collection: {
    handle: string;
    title: string;
    description?: string | null;
    products: {
      edges: {
        node: Product;
      }[];
    };
  } | null;
}

interface FeaturedProductData {
  product: Product;
  collectionTitle?: string;
  collectionHandle?: string;
  collectionDescription?: string | null;
}

const FEATURED_COLLECTION_HANDLE = 'featured-products';

async function getFeaturedProduct(): Promise<FeaturedProductData | null> {
  try {
    const response = await shopifyFetch<FeaturedCollectionResponse>({
      query: getCollectionByHandleQuery,
      variables: {
        handle: FEATURED_COLLECTION_HANDLE,
        first: 10,
      },
    });

    const featuredCollection = response.data.collection;

    // Try to find the centrifuge product first
    const centrifugeProduct = featuredCollection?.products?.edges?.find(
      (edge) =>
        edge.node.handle === 'centrinova-6-place-centrifuge' ||
        edge.node.title?.toLowerCase().includes('centrifuge'),
    )?.node;

    // Fall back to first product if centrifuge not found
    const product =
      centrifugeProduct || featuredCollection?.products?.edges?.[0]?.node;

    if (!product) {
      console.error('No products found in featured collection');
      return null;
    }

    return {
      product,
      collectionTitle: featuredCollection?.title ?? undefined,
      collectionHandle: featuredCollection?.handle ?? undefined,
      collectionDescription: featuredCollection?.description ?? null,
    };
  } catch (error) {
    console.error('Error fetching featured product:', error);
    return null;
  }
}

export default async function FeaturedHeroProduct({
  lifestyleImage,
  learnMoreUrl,
}: FeaturedHeroProductProps) {
  const featured = await getFeaturedProduct();

  if (!featured) {
    return null;
  }

  const { product, collectionHandle, collectionDescription } = featured;

  const plainDescription = stripHtml(product.descriptionHtml ?? '').trim();

  const descriptionText = plainDescription
    ? plainDescription.length > 220
      ? `${plainDescription.slice(0, plainDescription.lastIndexOf(' ', 220))}…`
      : plainDescription
    : null;

  const isLifestyleVideo =
    typeof lifestyleImage === 'string' && lifestyleImage.endsWith('.mp4');

  const primaryCtaHref = `/products/${product.handle}`;
  const secondaryCtaHref =
    learnMoreUrl ??
    (collectionHandle ? `/collections/${collectionHandle}` : undefined);

  const badgeLabel = 'Featured Product';
  const supportingCopy = descriptionText ?? collectionDescription ?? undefined;

  const priceAmount = product.priceRange?.minVariantPrice?.amount;
  const priceCurrency = product.priceRange?.minVariantPrice?.currencyCode;

  return (
    <section className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_top_left,hsl(var(--brand)_/_0.12),transparent_60%),radial-gradient(circle_at_bottom_right,hsl(var(--accent)_/_0.1),transparent_55%)] px-4 py-20 sm:py-24">
      <div
        className="absolute inset-0 -z-10 bg-[linear-gradient(160deg,rgba(9,12,40,0.85)0%,rgba(9,13,46,0.55)45%,rgba(9,12,40,0.82)100%)]"
        aria-hidden="true"
      />
      <div className="absolute inset-0 -z-5 opacity-40">
        <div className="absolute -left-12 top-10 h-40 w-40 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute bottom-8 right-0 h-56 w-56 rounded-full bg-[hsl(var(--accent))]/30 blur-3xl" />
      </div>

      <div className={`${layout.container} relative mx-auto max-w-[1200px]`}>
        <div className="relative grid items-center gap-12 overflow-hidden rounded-[32px] border border-white/15 bg-white/90 p-10 shadow-[0_45px_95px_-48px_rgba(6,11,40,0.9)] backdrop-blur-xl lg:grid-cols-[1.15fr_0.85fr] lg:p-14">
          <div
            className="pointer-events-none absolute -top-16 left-1/2 h-44 w-44 -translate-x-1/2 rounded-full bg-white/18 blur-[90px]"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute bottom-0 right-0 h-36 w-36 translate-x-12 translate-y-12 rounded-full bg-[hsl(var(--brand))]/20 blur-[70px]"
            aria-hidden="true"
          />

          <div className="relative z-10 space-y-6 text-[hsl(var(--ink))]">
            <span className="inline-flex items-center rounded-full bg-[hsl(var(--brand))]/15 px-4 py-1 text-sm font-semibold uppercase tracking-wide text-[hsl(var(--brand))]">
              {badgeLabel}
            </span>
            <h2 className="text-balance text-4xl font-semibold leading-tight sm:text-5xl">
              {product.title}
            </h2>
            {priceAmount ? (
              <p className="text-lg font-semibold text-[hsl(var(--brand))]">
                {priceAmount} {priceCurrency}
              </p>
            ) : null}
            {supportingCopy ? (
              <p className="max-w-xl text-base text-[hsl(var(--body))] sm:text-lg">
                {supportingCopy}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href={primaryCtaHref}
                className={`${buttonStyles.primary} px-8 py-3 text-base hover:scale-105 transition-all duration-300 shadow-[0_8px_25px_-8px_rgba(78,44,251,0.6)]`}
              >
                Shop Now
                <svg
                  aria-hidden="true"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  viewBox="0 0 24 24"
                >
                  <path d="M5 12h14" />
                  <path d="M13 6l6 6-6 6" />
                </svg>
              </Link>
              {secondaryCtaHref ? (
                <Link
                  href={secondaryCtaHref}
                  className={`${buttonStyles.ghost} px-8 py-3 text-base hover:scale-105 transition-all duration-300 shadow-[0_8px_25px_-8px_rgba(255,255,255,0.2)]`}
                >
                  Learn More
                </Link>
              ) : null}
            </div>

            {lifestyleImage ? (
              <div className="relative mt-8 overflow-hidden rounded-3xl border border-white/60 bg-white shadow-[0_30px_75px_-48px_rgba(19,23,64,0.55)]">
                {isLifestyleVideo ? (
                  <video
                    key={lifestyleImage}
                    className="h-full w-full object-cover"
                    src={lifestyleImage}
                    playsInline
                    autoPlay
                    muted
                    loop
                    controls
                    poster={product.featuredImage?.url}
                  />
                ) : (
                  <Image
                    src={lifestyleImage}
                    alt={`${product.title} lifestyle`}
                    width={720}
                    height={520}
                    className="h-full w-full object-cover"
                    priority={false}
                  />
                )}
              </div>
            ) : null}
          </div>

          <div className="relative z-10">
            <div className="group relative overflow-hidden rounded-[28px] bg-white/95 shadow-[0_35px_85px_-45px_rgba(19,23,64,0.65)] transition duration-500">
              <div
                className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(76,102,255,0.12),transparent_65%)]"
                aria-hidden="true"
              />
              <Image
                src={
                  product.featuredImage?.url ?? '/images/default-product.jpg'
                }
                alt={product.featuredImage?.altText ?? product.title}
                width={640}
                height={640}
                className="relative z-10 w-full bg-white object-contain p-8 transition duration-500 ease-out group-hover:scale-[1.05] group-hover:rotate-[0.8deg]"
                priority
                fetchPriority="high"
                sizes="(min-width: 1024px) 640px, 90vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
