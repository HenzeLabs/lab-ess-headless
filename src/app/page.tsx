import Image from "next/image";
import Link from "next/link";
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
      {/* Hero Section */}
      <section className="w-full bg-white rounded-xl shadow-sm mb-12 px-6 py-12 flex flex-col items-center text-center gap-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-2 leading-tight">
          Sustainable comfort meets effortless style.
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-6">
          Discover modern essentials made for movement, crafted with natural
          materials and a lighter footprint.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/collections/mens"
            className="inline-block px-8 py-3 rounded-full bg-gray-900 text-white font-semibold shadow hover:bg-gray-700 transition text-lg"
          >
            Shop Men
          </Link>
          <Link
            href="/collections/womens"
            className="inline-block px-8 py-3 rounded-full bg-gray-200 text-gray-900 font-semibold shadow hover:bg-gray-300 transition text-lg"
          >
            Shop Women
          </Link>
        </div>
      </section>

      {/* Product Grid Section */}
      <section>
        <h2 className="text-2xl font-bold mb-6 text-gray-900 tracking-tight">
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
