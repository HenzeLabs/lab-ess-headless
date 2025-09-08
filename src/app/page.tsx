import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  const res = await fetch("http://localhost:3000/api/products", {
    cache: "no-store",
  }).catch(() => null);
  const data =
    res && res.ok
      ? await res.json()
      : { count: 0, products: [], error: "Fetch failed" };

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold mb-6">Lab Essentials — Headless</h1>
      {"error" in data && data.error ? (
        <p className="text-red-700 text-sm">API error: {data.error}</p>
      ) : null}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {data.products?.map((p: any) => (
          <Link
            key={p.id}
            href={`/products/${p.handle}`}
            className="border rounded-lg p-4 flex flex-col hover:shadow-lg transition group"
          >
            {p.featuredImage?.url && (
              <div className="relative w-full aspect-square mb-3 bg-gray-50 overflow-hidden rounded">
                <Image
                  src={p.featuredImage.url}
                  alt={p.featuredImage.altText || p.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-contain group-hover:scale-105 transition"
                  return (
                    <>
                      {/* Hero Section */}
                      <section className="w-full bg-white rounded-xl shadow-sm mb-12 px-6 py-12 flex flex-col items-center text-center gap-4">
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-2 leading-tight">
                          Sustainable comfort meets effortless style.
                        </h1>
                        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-6">
                          Discover modern essentials made for movement, crafted with natural materials and a lighter footprint.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                          <Link href="/collections/mens" className="inline-block px-8 py-3 rounded-full bg-gray-900 text-white font-semibold shadow hover:bg-gray-700 transition text-lg">
                            Shop Men
                          </Link>
                          <Link href="/collections/womens" className="inline-block px-8 py-3 rounded-full bg-gray-200 text-gray-900 font-semibold shadow hover:bg-gray-300 transition text-lg">
                            Shop Women
                          </Link>
                        </div>
                      </section>

                      {/* Product Grid Section */}
                      <section>
                        <h2 className="text-2xl font-bold mb-6 text-gray-900 tracking-tight">Bestsellers</h2>
                        {"error" in data && data.error ? (
                          <p className="text-red-700 text-sm">API error: {data.error}</p>
                        ) : null}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                          {data.products?.map((p: any) => (
                            <Link
                              key={p.id}
                              href={`/products/${p.handle}`}
                              className="group bg-white rounded-xl shadow-md hover:shadow-xl transition border border-gray-100 flex flex-col overflow-hidden"
                            >
                              {p.featuredImage?.url && (
                                <div className="relative w-full aspect-square bg-gray-50 overflow-hidden">
                                  <Image
                                    src={p.featuredImage.url}
                                    alt={p.featuredImage.altText || p.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                    className="object-contain group-hover:scale-105 transition-transform duration-300"
                                    priority={true}
                                  />
                                </div>
                              )}
                              <div className="p-5 flex-1 flex flex-col">
                                <div className="font-semibold text-lg text-gray-900 mb-1 group-hover:text-blue-700 transition">
                                  {p.title}
                                </div>
                                <div className="text-gray-700 mb-2 text-base">
                                  {p.priceRange?.minVariantPrice?.amount} {p.priceRange?.minVariantPrice?.currencyCode}
                                </div>
                                <span className="mt-auto text-blue-600 font-medium hover:underline">View product</span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </section>
                    </>
                  );
                }
