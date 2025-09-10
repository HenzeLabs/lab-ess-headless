import type { MenuItem } from "@/lib/types";
import { shopifyFetch } from "@/lib/shopify";

import Header from "../components/Header";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import Collections from "../components/Bestsellers";

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

async function getCollections() {
  try {
    const response = await shopifyFetch<{
      data: { menu: { items: MenuItem[] } };
    }>({ query: MENU_QUERY });

    if (response.success) {
      return response.data.data.menu.items.map((item) => ({
        ...item,
        handle: item.url?.includes("/collections/")
          ? (item.url.split("/collections/")[1]?.split("?")[0] ?? "")
          : item.title.toLowerCase(),
      }));
    }

    return [];
  } catch (err: unknown) {
    console.error(
      "[getCollections] Error fetching menu from Shopify Storefront API",
      err,
    );
    return [];
  }
}
