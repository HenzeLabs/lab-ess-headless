import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";

export default async function Home() {
  const res = await fetch("http://localhost:3000/api/products", {
    cache: "no-store",
  }).catch(() => null);
  const data =
    res && res.ok
      ? await res.json()
      : { count: 0, products: [], error: "Fetch failed" };

  return (
    <>
      <Hero />
      <section className="mt-10 md:mt-12">
        <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-gray-900 mb-6">
          Bestsellers
        </h2>
        {"error" in data && data.error ? (
          <p className="text-red-700 text-sm">API error: {data.error}</p>
        ) : null}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {data.products?.map((p: any) => (
            <ProductCard
              key={p.id}
              id={p.id}
              handle={p.handle}
              title={p.title}
              featuredImage={p.featuredImage}
              price={p.priceRange?.minVariantPrice}
            />
          ))}
        </div>
      </section>
    </>
  );
}
