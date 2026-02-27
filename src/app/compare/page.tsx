import Link from 'next/link';
import type { Metadata } from 'next';

import { getFallbackProduct } from '@/lib/fallback/catalog';
import { layout, buttonStyles } from '@/lib/ui';

const comparisonHandles = [
  'innovation-biological-microscope',
  'zipcombo-centrifuge',
] as const;

const comparisonProducts = comparisonHandles
  .map((handle) => getFallbackProduct(handle))
  .filter((product): product is NonNullable<ReturnType<typeof getFallbackProduct>> =>
    Boolean(product),
  );

export const metadata: Metadata = {
  title: 'Product Comparison | Lab Essentials',
  description:
    'Compare our highlighted microscopes and centrifuges side-by-side to see which equipment best fits your lab workflow.',
};

type ListKey = 'features' | 'applications';

function extractList(product: (typeof comparisonProducts)[number], key: ListKey) {
  const field = product.metafields?.find((item) => item.key === key);
  if (!field?.value) {
    return [];
  }

  try {
    const parsed = JSON.parse(field.value) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.map((entry) => String(entry));
    }
  } catch (error) {
    console.warn(`Failed to parse ${key} metafield for ${product.handle}`, error);
  }

  return [];
}

export default function ComparePage() {
  return (
    <main id="main-content" className="bg-background text-foreground">
      <section className={`${layout.container} py-12 md:py-16`}>
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[hsl(var(--brand))]">
            Compare Your Options
          </p>
          <h1 className="mt-3 text-3xl font-bold text-[hsl(var(--ink))] md:text-4xl">
            Spotlight Equipment At A Glance
          </h1>
          <p className="mt-4 text-base text-[hsl(var(--muted-foreground))] md:text-lg">
            We pulled our most visited microscope and centrifuge into a single grid so it is
            easy to confirm which model matches the throughput and workloads you are running.
          </p>
        </div>

        <div className="mt-12 overflow-hidden rounded-2xl border border-border/60 bg-white shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] divide-y divide-border/60 text-left text-sm md:text-base">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-6 py-5 font-semibold text-[hsl(var(--muted-foreground))]">
                    Criteria
                  </th>
                  {comparisonProducts.map((product) => (
                    <th
                      key={product.id}
                      className="px-6 py-5 font-semibold text-[hsl(var(--ink))]"
                      scope="col"
                    >
                      <div>
                        <p className="text-xs uppercase tracking-wide text-[hsl(var(--brand))]">
                          {product.tags?.[0] ?? 'Lab Equipment'}
                        </p>
                        <p className="mt-1 text-lg font-bold">{product.title}</p>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                <tr>
                  <th
                    scope="row"
                    className="bg-muted/20 px-6 py-6 text-sm font-semibold text-[hsl(var(--muted-foreground))]"
                  >
                    Starting price
                  </th>
                  {comparisonProducts.map((product) => (
                    <td key={`${product.id}-price`} className="px-6 py-6">
                      <span className="inline-flex items-center rounded-full bg-[hsl(var(--brand))]/10 px-3 py-1 text-sm font-semibold text-[hsl(var(--brand))]">
                        $
                        {Number(
                          product.priceRange?.minVariantPrice?.amount ?? 0,
                        ).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </td>
                  ))}
                </tr>

                <tr>
                  <th
                    scope="row"
                    className="bg-muted/20 px-6 py-6 text-sm font-semibold text-[hsl(var(--muted-foreground))]"
                  >
                    Key features
                  </th>
                  {comparisonProducts.map((product) => {
                    const features = extractList(product, 'features').slice(0, 4);
                    return (
                      <td key={`${product.id}-features`} className="px-6 py-6 text-sm">
                        <ul className="space-y-2 text-[hsl(var(--body))]">
                          {features.length ? (
                            features.map((feature, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[hsl(var(--brand))]" />
                                <span>{feature}</span>
                              </li>
                            ))
                          ) : (
                            <li className="text-[hsl(var(--muted-foreground))]">
                              Feature list coming soon.
                            </li>
                          )}
                        </ul>
                      </td>
                    );
                  })}
                </tr>

                <tr>
                  <th
                    scope="row"
                    className="bg-muted/20 px-6 py-6 text-sm font-semibold text-[hsl(var(--muted-foreground))]"
                  >
                    Ideal workflows
                  </th>
                  {comparisonProducts.map((product) => {
                    const useCases = extractList(product, 'applications').slice(0, 4);
                    return (
                      <td key={`${product.id}-applications`} className="px-6 py-6 text-sm">
                        <ul className="space-y-2 text-[hsl(var(--body))]">
                          {useCases.length ? (
                            useCases.map((application, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[hsl(var(--brand))]/70" />
                                <span>{application}</span>
                              </li>
                            ))
                          ) : (
                            <li className="text-[hsl(var(--muted-foreground))]">
                              Contact the team for tailored guidance.
                            </li>
                          )}
                        </ul>
                      </td>
                    );
                  })}
                </tr>

                <tr>
                  <th
                    scope="row"
                    className="bg-muted/20 px-6 py-6 text-sm font-semibold text-[hsl(var(--muted-foreground))]"
                  >
                    Next step
                  </th>
                  {comparisonProducts.map((product) => (
                    <td key={`${product.id}-cta`} className="px-6 py-6">
                      <Link
                        href={`/products/${product.handle}`}
                        className={`${buttonStyles.primary} inline-flex items-center gap-2`}
                      >
                        View product
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                          />
                        </svg>
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Need a different configuration or documentation packet? Email{' '}
            <a
              href="mailto:support@labessentials.com"
              className="font-semibold text-[hsl(var(--brand))] hover:text-[hsl(var(--brand-dark))]"
            >
              support@labessentials.com
            </a>{' '}
            and an applications specialist will follow up within one business day.
          </p>
        </div>
      </section>
    </main>
  );
}
