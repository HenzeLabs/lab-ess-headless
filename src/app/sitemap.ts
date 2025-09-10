import { type NextRequest } from "next/server";
import { getSiteUrl } from "@/lib/siteUrl";
import { storefront } from "@/lib/shopify";
import { COLLECTION_PRODUCTS_QUERY } from "@/lib/collectionProductsQuery";

const COLLECTIONS_QUERY = `
  query Collections {
    collections(first: 100) {
      edges {
        node {
          handle
        }
      }
    }
  }
`;

const PRODUCTS_QUERY = `
  query Products {
    products(first: 100) {
      edges {
        node {
          handle
        }
      }
    }
  }
`;

export async function GET() {
  const siteUrl = getSiteUrl();
  const urls = [`${siteUrl}/`];

  // Fetch collections
  const collectionsRes = await storefront(COLLECTIONS_QUERY);
  type CollectionNode = { node: { handle: string } };
  const collections =
    typeof collectionsRes === "object" &&
    collectionsRes &&
    "data" in collectionsRes
      ? (
          collectionsRes as {
            data?: { collections?: { edges?: CollectionNode[] } };
          }
        ).data?.collections?.edges || []
      : [];
  for (const { node } of collections) {
    urls.push(`${siteUrl}/collections/${node.handle}`);
  }

  // Fetch products
  const productsRes = await storefront(PRODUCTS_QUERY);
  type ProductNode = { node: { handle: string } };
  const products =
    typeof productsRes === "object" && productsRes && "data" in productsRes
      ? (productsRes as { data?: { products?: { edges?: ProductNode[] } } })
          .data?.products?.edges || []
      : [];
  for (const { node } of products) {
    urls.push(`${siteUrl}/products/${node.handle}`);
  }

  const lastmod = new Date().toISOString().split("T")[0];
  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map(
        (url) =>
          `  <url>\n    <loc>${url}</loc>\n    <changefreq>daily</changefreq>\n    <lastmod>${lastmod}</lastmod>\n  </url>`,
      )
      .join("\n") +
    "\n</urlset>";

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
