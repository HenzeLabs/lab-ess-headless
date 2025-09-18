import Image from 'next/image';
import Link from 'next/link';

import { shopifyFetch } from '@/lib/shopify';
import { getCollectionByHandleQuery } from '@/lib/queries';
import { buttonStyles } from '@/lib/ui';
import type { Product } from '@/lib/types';

interface FeaturedHeroProductProps {
  lifestyleImage?: string;
  learnMoreUrl?: string;
}

type FeaturedCollectionResponse = {
  collection?: {
    products?: {
      edges: { node: Product }[];
    };
  };
};

async function getFeaturedProduct() {
  // Shopify's default handle for the Featured Products collection
  const response = await shopifyFetch<FeaturedCollectionResponse>({
    query: getCollectionByHandleQuery,
    variables: { handle: 'featured-products', first: 1 },
  });
  const product = response.data?.collection?.products?.edges?.[0]?.node;
  return product || null;
}

export default async function FeaturedHeroProduct({
  lifestyleImage = '/images/lifestyle-placeholder.jpg',
  learnMoreUrl,
}: FeaturedHeroProductProps) {
  const product = await getFeaturedProduct();
  if (!product) return null;

  const strippedDescription = product.descriptionHtml
    ? product.descriptionHtml
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim()
    : '';
  const blockedCopy =
    'Equip your schools, clinical labs, and research teams with high-performance tools.';
  const descriptionText =
    strippedDescription && strippedDescription !== blockedCopy
      ? strippedDescription
      : null;

  const isLifestyleVideo =
    typeof lifestyleImage === 'string' && lifestyleImage.endsWith('.mp4');

  return (
    <section className="w-full py-16 md:py-24 fade-in-on-scroll">
      <div className="mx-auto max-w-7xl px-4">
        <div className="relative overflow-hidden rounded-[32px] border border-white/30 bg-white/90 shadow-[0_35px_80px_-40px_rgba(15,23,42,0.6)] backdrop-blur">
          <div
            className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/60 to-white/40"
            aria-hidden="true"
          />
          <div className="relative grid grid-cols-1 gap-10 items-center p-8 md:grid-cols-2 md:p-14 lg:p-16">
            {/* Product Photo */}
            <div className="group relative overflow-hidden rounded-3xl bg-white shadow-[0_25px_60px_-40px_rgba(15,23,42,0.55)] transition-all duration-500">
              <Image
                src={
                  product.featuredImage?.url || '/images/default-product.jpg'
                }
                alt={product.featuredImage?.altText || product.title}
                width={640}
                height={640}
                className="w-full h-auto object-contain bg-white transition-transform duration-500 ease-out group-hover:scale-[1.08] group-hover:rotate-1"
                priority
              />
            </div>
            {/* Lifestyle Image & Content */}
            <div className="flex flex-col gap-10">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl font-extrabold text-heading">
                  {product.title}
                </h1>
                {descriptionText && (
                  <p className="text-lg leading-relaxed text-body/80">
                    {descriptionText}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href={`/products/${product.handle}`}
                  className={`${buttonStyles.primary} rounded-full bg-[#4e2cfb] px-10 py-3 text-base font-semibold text-white shadow-[0_20px_45px_-20px_rgba(78,44,251,0.8)] transition-transform duration-200 hover:-translate-y-[3px] hover:bg-[#3f23d6] hover:shadow-[0_28px_55px_-18px_rgba(63,35,214,0.65)]`}
                >
                  Shop Now
                </Link>
                {learnMoreUrl && (
                  <Link
                    href={learnMoreUrl}
                    className={`${buttonStyles.ghost} rounded-full border border-[#4e2cfb33] bg-white/80 px-10 py-3 text-base font-semibold text-[#272748] shadow-[0_18px_40px_-25px_rgba(30,41,59,0.6)] transition-all duration-200 hover:-translate-y-[3px] hover:border-[#4e2cfb] hover:bg-[#f3f0ff] hover:text-[#2715a0]`}
                  >
                    Learn More
                  </Link>
                )}
              </div>
              <div className="relative mt-4 rounded-3xl border border-white/40 bg-white/95 shadow-[0_30px_70px_-40px_rgba(15,23,42,0.45)]">
                {isLifestyleVideo ? (
                  <video
                    key={lifestyleImage}
                    className="h-full w-full rounded-3xl object-contain"
                    src={lifestyleImage}
                    playsInline
                    autoPlay
                    muted
                    loop
                    controls
                  />
                ) : (
                  <Image
                    src={lifestyleImage || '/images/lifestyle-placeholder.jpg'}
                    alt="Lifestyle"
                    width={640}
                    height={640}
                    className="w-full h-full rounded-3xl object-contain"
                    priority={false}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Fade-in on scroll: add class with IntersectionObserver in _app or layout */}
      <style>{`
        .fade-in-on-scroll {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.7s cubic-bezier(.4,0,.2,1), transform 0.7s cubic-bezier(.4,0,.2,1);
        }
        .fade-in-on-scroll.visible {
          opacity: 1;
          transform: none;
        }
      `}</style>
    </section>
  );
}

// Note: Requires getFeaturedProductsQuery in @/lib/queries and brand tokens in globals.css.
