import Link from 'next/link';

export default function CTASection() {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-[hsl(var(--brand))] via-[#4457ff] to-[hsl(var(--accent))] px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_55%)]" aria-hidden="true" />
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 rounded-3xl border border-white/20 bg-white/10 p-10 text-center shadow-[0_24px_60px_-30px_rgba(8,9,57,0.65)] backdrop-blur-xl md:flex-row md:items-center md:justify-between md:text-left">
        <div className="max-w-2xl">
          <Link
            href="https://labessentials.com/blogs/news/the-amscope-tax-why-cheap-microscopes-cost-more"
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className="text-balance text-3xl font-semibold leading-tight text-white sm:text-4xl">
              The AmScope Tax – Why Cheap Microscopes Cost More
            </h2>
          </Link>
          <p className="mt-3 text-base text-white/80 sm:text-lg">
            Learn how to spot the hidden costs in bargain lab equipment and choose microscopes built to last.
          </p>
        </div>

        <div className="flex w-full flex-col items-center gap-4 md:w-auto md:flex-row">
          <Link
            href="https://labessentials.com/blogs/news/the-amscope-tax-why-cheap-microscopes-cost-more"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center rounded-full border border-transparent bg-[linear-gradient(135deg,hsl(var(--brand))_0%,hsl(var(--brand-dark))_100%)] px-8 py-3 text-base font-semibold text-white shadow-[0_20px_45px_-20px_rgba(8,9,57,0.6)] transition hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(12,15,60,0.45)] md:w-auto"
          >
            Read the Guide
          </Link>
          <Link
            href="/collections/microscopes"
            className="inline-flex w-full items-center justify-center rounded-full border border-white/50 bg-transparent px-8 py-3 text-base font-semibold text-white shadow-[0_18px_38px_-20px_rgba(8,9,57,0.4)] transition hover:-translate-y-0.5 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(12,15,60,0.35)] md:w-auto"
          >
            Shop Reliable Microscopes
          </Link>
        </div>
      </div>
    </section>
  );
}
