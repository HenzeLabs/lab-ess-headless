export default function Hero() {
  return (
    <section className="rounded-2xl bg-gray-50 border border-gray-200 px-8 py-12 text-center mb-10 md:mb-12 shadow-sm">
      <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-gray-900 mb-3">
        Modern Lab Equipment, Delivered
      </h1>
      <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
        Shop microscopes, centrifuges, and accessories—engineered for
        reliability, shipped fast, and supported by real scientists. Built for
        labs of every size.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a
          href="/products"
          className="inline-block rounded-lg bg-black text-white px-6 py-2 font-medium hover:bg-gray-800 transition"
        >
          Shop Bestsellers
        </a>
        <a
          href="/about"
          className="inline-block rounded-lg border border-gray-300 text-gray-800 px-6 py-2 font-medium hover:bg-gray-100 transition"
        >
          Learn More
        </a>
      </div>
    </section>
  );
}
