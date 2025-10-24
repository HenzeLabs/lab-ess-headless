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
    ? plainDescription.length > 215
      ? `${plainDescription.slice(0, plainDescription.lastIndexOf(' ', 215))}…`
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
    <section className={`relative isolate overflow-hidden bg-gradient-to-br from-[hsl(var(--muted))] via-white to-[hsl(var(--muted))] ${layout.section}`}>
      {/* Animated background elements */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--brand)) 1px, transparent 0)', backgroundSize: '40px 40px' }}
        aria-hidden="true"
      />
      <div className="absolute top-0 right-0 w-96 h-96 bg-[hsl(var(--brand))]/5 rounded-full blur-3xl" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[hsl(var(--accent))]/5 rounded-full blur-3xl" aria-hidden="true" />

      <div className={`${layout.container} relative mx-auto max-w-[1400px]`}>
        {/* Section Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--brand))]/10 px-5 py-2 border border-[hsl(var(--brand))]/20">
            <svg className="w-5 h-5 text-[hsl(var(--brand))]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-semibold uppercase tracking-wider text-[hsl(var(--brand))]">
              {badgeLabel}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[hsl(var(--ink))]">
            Product Spotlight
          </h2>
        </div>

        <div className="relative grid items-center gap-10 overflow-hidden rounded-3xl border-2 border-border/50 bg-white p-8 md:p-12 lg:p-16 shadow-[0_20px_70px_-20px_rgba(15,23,42,0.15)] lg:grid-cols-[1fr_1fr]">
          {/* Decorative corner elements */}
          <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4 border-[hsl(var(--brand))]/10 rounded-tl-3xl"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4 border-[hsl(var(--brand))]/10 rounded-br-3xl"></div>

          {/* Glowing orbs */}
          <div className="pointer-events-none absolute -top-20 right-20 h-40 w-40 rounded-full bg-[hsl(var(--brand))]/10 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-20 left-20 h-40 w-40 rounded-full bg-[hsl(var(--accent))]/10 blur-3xl" aria-hidden="true" />

          {/* Product Image */}
          <div className="relative z-10 order-2 lg:order-1">
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-white border-2 border-border/30 shadow-xl transition-all duration-500 hover:shadow-2xl hover:border-[hsl(var(--brand))]/30">
              {/* Shine effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-transparent group-hover:via-white/20 transition-all duration-700 -translate-x-full group-hover:translate-x-full"></div>

              <div className="aspect-square flex items-center justify-center p-8 md:p-12">
                <Image
                  src={product.featuredImage?.url ?? '/images/default-product.jpg'}
                  alt={product.featuredImage?.altText ?? product.title}
                  width={640}
                  height={640}
                  className="relative z-10 w-full h-full object-contain transition-all duration-500 ease-out group-hover:scale-105"
                  priority
                  fetchPriority="high"
                  sizes="(min-width: 1024px) 640px, 90vw"
                />
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="relative z-10 space-y-6 text-[hsl(var(--ink))] order-1 lg:order-2">
            <div className="space-y-4">
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-[hsl(var(--ink))]">
                {product.title}
              </h3>

              {priceAmount ? (
                <div className="inline-flex items-center gap-2 bg-[hsl(var(--brand))]/10 border-2 border-[hsl(var(--brand))]/20 rounded-xl px-5 py-2.5">
                  <svg className="w-5 h-5 text-[hsl(var(--brand))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-2xl font-bold text-[hsl(var(--brand))]">
                    ${priceAmount}
                  </span>
                  {priceCurrency && priceCurrency !== 'USD' ? (
                    <span className="text-sm text-[hsl(var(--muted-foreground))]">{priceCurrency}</span>
                  ) : null}
                </div>
              ) : null}

              {supportingCopy ? (
                <p className="text-base md:text-lg text-[hsl(var(--body))] leading-relaxed">
                  {supportingCopy}
                </p>
              ) : null}
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="flex items-start gap-3 bg-[hsl(var(--muted))] p-4 rounded-xl border border-border/50">
                <div className="flex-shrink-0 w-10 h-10 bg-[hsl(var(--brand))]/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-[hsl(var(--brand))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-sm text-[hsl(var(--ink))]">Free Shipping</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">On orders $300+</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-[hsl(var(--muted))] p-4 rounded-xl border border-border/50">
                <div className="flex-shrink-0 w-10 h-10 bg-[hsl(var(--brand))]/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-[hsl(var(--brand))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-sm text-[hsl(var(--ink))]">1-Year Warranty</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">Full coverage</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href={primaryCtaHref}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[hsl(var(--brand))] px-8 py-4 text-base font-bold text-white hover:text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-[hsl(var(--brand))]/30 hover:scale-105 hover:bg-[hsl(var(--brand-dark))] group"
              >
                Shop Now
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M5 12h14" />
                  <path d="M13 6l6 6-6 6" />
                </svg>
              </Link>
              {secondaryCtaHref ? (
                <Link
                  href={secondaryCtaHref}
                  className={`${buttonStyles.outline} px-8 py-4 text-base font-semibold hover:scale-105 transition-all duration-300`}
                >
                  Learn More
                </Link>
              ) : null}
            </div>

            {/* Lifestyle image/video if provided */}
            {lifestyleImage ? (
              <div className="relative mt-8 overflow-hidden rounded-2xl border-2 border-border/50 bg-white shadow-lg">
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
        </div>
      </div>
    </section>
  );
}
