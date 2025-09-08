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
                  priority={true}
                />
              </div>
            )}
            <div className="font-medium text-lg mb-1">{p.title}</div>
            <div className="text-gray-700 mb-2">
              {p.priceRange?.minVariantPrice?.amount}{" "}
              {p.priceRange?.minVariantPrice?.currencyCode}
            </div>
            <span className="text-blue-600 hover:underline mt-auto">
              View product
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
