import { notFound } from "next/navigation";
import Image from "next/image";

async function getProduct(handle: string) {
  const res = await fetch(
    `${
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    }/api/product-by-handle?handle=${handle}`,
    { cache: "no-store" }
  );
  if (!res.ok) return null;
  return res.json();
}

export default async function ProductPage({
  params,
}: {
  params: { handle: string };
}) {
  const data = await getProduct(params.handle);
  if (!data || data.error) return notFound();
  const p = data.product;
  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">{p.title}</h1>
      <div className="mb-4 text-lg">
        {p.priceRange.minVariantPrice.amount}{" "}
        {p.priceRange.minVariantPrice.currencyCode}
      </div>
      <div className="mb-4">
        {p.descriptionHtml ? (
          <div dangerouslySetInnerHTML={{ __html: p.descriptionHtml }} />
        ) : null}
      </div>
      {p.featuredImage?.url && (
        <Image
          src={p.featuredImage.url}
          alt={p.featuredImage.altText || p.title}
          width={600}
          height={600}
          className="mb-4 rounded"
        />
      )}
      {p.images?.length > 1 && (
        <div className="grid grid-cols-3 gap-2">
          {p.images.slice(0, 6).map((img: any, i: number) => (
            <Image
              key={img.id || i}
              src={img.url}
              alt={img.altText || p.title}
              width={200}
              height={200}
              className="rounded"
            />
          ))}
        </div>
      )}
    </main>
  );
}
