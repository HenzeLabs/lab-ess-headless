import type { CollectionData } from "@/lib/types";
import { storefront } from "../lib/shopify";
import { toAppHref } from "../lib/links";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import Collections from "../components/Bestsellers";
import { COLLECTION_PRODUCTS_QUERY } from "../lib/collectionProductsQuery";
import { notNull } from "../lib/utils";
import CustomerReviews from "../components/CustomerReviews";
import BrandValues from "../components/BrandValues";

import { getSiteUrl } from "@/lib/siteUrl";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getSiteUrl();
  return {
    title: "Lab Essentials",
    description: "Premium Lab Equipment for Research and Industry",
    openGraph: {
      title: "Lab Essentials",
      description: "Premium Lab Equipment for Research and Industry",
      url: siteUrl,
      type: "website",
      images: [
        {
          url: siteUrl + "/logo.svg",
          alt: "Lab Essentials Logo",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Lab Essentials",
      description: "Premium Lab Equipment for Research and Industry",
      images: [siteUrl + "/logo.svg"],
    },
  };
}

export default async function HomePage() {
  const collections = await getCollections();
  // TODO: Fetch real products for Collections/Bestsellers if needed
  return (
    <>
      <Header collections={collections} />
      <main className="bg-koala-light-grey">
        <Hero />
        <section className="py-16">
          <Collections productsByCollection={{}} />
        </section>
        <section className="py-16 bg-white">
          <CustomerReviews />
        </section>
        <section className="py-16">
          <BrandValues />
        </section>
      </main>
      <Footer />
    </>
  );
}

// GraphQL query for the menu with collection images
const MENU_QUERY = /* GraphQL */ `
  query Menu {
    menu(handle: "main-menu") {
      items {
        id
        title
        url
        items {
          id
                        const msg = err instanceof Error ? err.message : String(err);
          title
          url
          items {
            id
            title
            url
          }
        }
      }
    }
  }
`;

// GraphQL query to get collection image and first product for menu items
const COLLECTION_IMAGE_QUERY = /* GraphQL */ `
  query CollectionImage($handle: String!) {
    collection(handle: $handle) {
      id
      title
      handle
      image {
        url
        altText
      }
      products(first: 1) {
        edges {
          node {
            id
            title
            handle
            featuredImage {
              url
              altText
            }
          }
        }
      }
    }
  }
`;

// GraphQL query to get product image
const PRODUCT_IMAGE_QUERY = /* GraphQL */ `
  query ProductImage($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      featuredImage {
        url
        altText
      }
    }
  }
`;

async function getCollections() {
  try {
    const data = await storefront<{ data: { menu: { items: MenuItem[] } } }>(
      MENU_QUERY,
    );

    // Process menu items and fetch images for collections
    const menuItems = (
      await Promise.all(
        (data?.data?.menu?.items ?? []).map(async (subItem) => {
          if (!subItem?.title?.trim()) return null;

          const subHandle = subItem.url?.includes("/collections/")
            ? (subItem.url.split("/collections/")[1]?.split("?")[0] ?? "")
            : subItem.title.toLowerCase();

          let image: MenuItem["image"] = null;
          try {
            if (subItem.url?.includes("/collections/")) {
              const collectionData = await storefront<{
                data: { collection: CollectionData };
              }>(COLLECTION_IMAGE_QUERY, { handle: subHandle });
              const collection = collectionData?.data?.collection;
              image =
                collection?.image ??
                collection?.products?.edges?.[0]?.node?.featuredImage ??
                null;
            } else if (subItem.url?.includes("/products/")) {
              const productHandle =
                subItem.url.split("/products/")[1]?.split("?")[0] ?? "";
              const productData = await storefront<{
                data: { product: ProductNode };
              }>(PRODUCT_IMAGE_QUERY, { handle: productHandle });
              const product = productData?.data?.product;
              image = product?.featuredImage ?? null;
            }
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            console.warn(`Error fetching image for ${subHandle}:`, msg);
          }

          return {
            id: subItem.id,
            title: subItem.title,
            url: subItem.url,
            handle: subHandle,
            image,
            items: [],
          } satisfies MenuItem;
        }),
      )
    ).filter(notNull) as MenuItem[];
    return menuItems;
  } catch (err: unknown) {
    console.error(
      "[getCollections] Error fetching menu from Shopify Storefront API",
      err,
    );
    return [];
  }
}
