import { storefront } from "../../../lib/shopify";
import AnnouncementBar from "../../../components/AnnouncementBar";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import Image from "next/image";
import TrustSignals from "../../../components/TrustSignals";
import CustomerReviews from "../../../components/CustomerReviews";
import DeliveryInfo from "../../../components/DeliveryInfo";
import StarRating from "../../../components/StarRating";
import DeliveryCalculator from "../../../components/DeliveryCalculator";
import FAQ from "../../../components/FAQ";
import RelatedProducts from "../../../components/RelatedProducts";
import type { MenuItem, Product } from "@/lib/types";
import { notNull } from "@/lib/utils";

// Local extension types for GraphQL responses
interface ProductNode extends Product {
  description: string;
  availableForSale: boolean;
  tags: string[];
  images: {
    edges: {
      node: {
        url: string;
        altText?: string;
      };
    }[];
  };
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
    maxVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  variants: {
    edges: {
      node: {
        id: string;
        title: string;
        availableForSale: boolean;
        price: {
          amount: string;
          currencyCode: string;
        };
        compareAtPrice?: {
          amount: string;
          currencyCode: string;
        };
      };
    }[];
  };
}

interface CollectionData {
  id: string;
  title: string;
  handle: string;
  image?: {
    url: string;
    altText?: string;
  };
  products?: {
    edges: {
      node: Product;
    }[];
  };
}

const getProductByHandleQuery = `
  query getProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      title
      description
      tags
      images(first: 10) {
        edges {
          node {
            url
            altText
          }
        }
      }
      variants(first: 10) {
        edges {
          node {
            id
            title
            price {
              amount
              currencyCode
            }
            availableForSale
          }
        }
      }
      featuredImage {
        url
        altText
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
    }
  }
`;

// Fetch menu/collections directly from Shopify Storefront API (copied from collection page)
const MENU_QUERY = `
  query Menu {
    menu(handle: "main-menu") {
      items {
        id
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
`;

async function getCollections() {
  const toAppHref = (url: string) => url.replace(/^https?:\/\/[^/]+/, "");
  const COLLECTION_IMAGE_QUERY = `
    query getCollectionImage($handle: String!) {
      collection(handle: $handle) {
        id
        title
        image {
          url
          altText
        }
        products(first: 1) {
          edges { node { id title featuredImage { url altText } } }
        }
      }
    }
  `;
  const PRODUCT_IMAGE_QUERY = `
    query getProductImage($handle: String!) {
      product(handle: $handle) {
        id
        title
        featuredImage { url altText }
      }
    }
    `;
  try {
    const data = await storefront<{ data: { menu: { items: MenuItem[] } } }>(
      MENU_QUERY,
    );
    const menuItems = await Promise.all(
      (data?.data?.menu?.items || []).map(async (item: MenuItem) => {
        const processedItem: MenuItem = {
          id: item.id,
          title: item.title,
          url: item.url,
          handle: item.url
            ? toAppHref(item.url).replace("/collections/", "")
            : item.title.toLowerCase(),
          items: (
            await Promise.all(
              (item.items || []).map(async (subItem: MenuItem) => {
                const subHandle = subItem.url
                  ? toAppHref(subItem.url).replace("/collections/", "")
                  : subItem.title.toLowerCase();
                let image = null;
                if (subItem.url) {
                  try {
                    if (subItem.url.includes("/collections/")) {
                      const collectionData = await storefront<{
                        data: { collection: CollectionData };
                      }>(COLLECTION_IMAGE_QUERY, { handle: subHandle });
                      const collection = collectionData?.data?.collection;
                      if (collection) {
                        image =
                          collection.image ||
                          collection.products?.edges?.[0]?.node
                            ?.featuredImage ||
                          null;
                      }
                    } else if (subItem.url.includes("/products/")) {
                      const productHandle = subItem.url
                        ? toAppHref(subItem.url).replace("/products/", "")
                        : subItem.title.toLowerCase();
                      const productData = await storefront<{
                        data: { product: ProductNode };
                      }>(PRODUCT_IMAGE_QUERY, { handle: productHandle });
                      const product = productData?.data?.product;
                      if (product && product.featuredImage) {
                        image = product.featuredImage;
                      }
                    }
                  } catch (err: unknown) {
                    const msg =
                      err instanceof Error ? err.message : String(err);
                    console.warn(`Error fetching image for ${subHandle}:`, msg);
                  }
                }
                if (!subItem.title || subItem.title.trim() === "") {
                  return null;
                }
                return {
                  ...subItem,
                  image,
                  items: (subItem.items || []).map((subSubItem: MenuItem) => ({
                    id: subSubItem.id,
                    title: subSubItem.title,
                    url: subSubItem.url,
                    handle: subSubItem.url
                      ? toAppHref(subSubItem.url).replace("/collections/", "")
                      : subSubItem.title.toLowerCase(),
                  })),
                };
              }),
            )
          ).filter(notNull) as MenuItem[],
        };
        return processedItem;
      }),
    );
    return menuItems as MenuItem[];
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(
      "[getCollections] Error fetching menu from Shopify Storefront API",
      msg,
    );
    return [];
  }
}

export default async function ProductPage({
  params,
}: {
  params: { handle: string };
}) {
  // Debug: log the handle
  console.log("[ProductPage] handle:", params.handle);
  // Fetch product from Shopify

  const apiResponse: { data?: { product?: ProductNode } } = await storefront(
    getProductByHandleQuery,
    {
      handle: params.handle,
    },
  );
  // Debug: log the raw API response
  console.log(
    "[ProductPage] Shopify API response:",
    JSON.stringify(apiResponse),
  );
  const product = apiResponse?.data?.product ?? null;

  // Fetch menu/collections for Header
  const collections = await getCollections();

  // JSON-LD and BreadcrumbList logic (inside the function, after data fetching)
  let productJsonLd = null;
  let breadcrumbJsonLd = null;
  if (product) {
    productJsonLd = {
      "@context": "https://schema.org/",
      "@type": "Product",
      name: product.title,
      image: product.featuredImage?.url ? [product.featuredImage.url] : [],
      description: product.description ?? "",
      sku: product.id,
      offers: {
        "@type": "Offer",
        priceCurrency:
          product.priceRange?.minVariantPrice?.currencyCode ?? "USD",
        price: product.priceRange?.minVariantPrice?.amount ?? "",
        availability: "https://schema.org/InStock",
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/products/${product.handle}`,
      },
    };

    const breadcrumbs = [
      { name: "Home", url: "/" },
      { name: "Collections", url: "/collections" },
      // Optionally add collection if available (not implemented here, but can be added)
      { name: product.title, url: `/products/${product.handle}` },
    ];

    breadcrumbJsonLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((crumb, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: crumb.name,
        item: `${process.env.NEXT_PUBLIC_SITE_URL}${crumb.url}`,
      })),
    };
  }

  if (!product) {
    return (
      <>
        <AnnouncementBar />
        <Header collections={collections} />
        <main className="max-w-3xl mx-auto py-24 px-4 text-center">
          <p className="text-lg text-koala-gray mb-8">
            Sorry, we couldn&apos;t find this product.
          </p>
        </main>
        <Footer />
      </>
    );
  }

  // Extract images and variants
  const images = product.images?.edges?.map((edge) => edge.node) || [];
  const variants = product.variants?.edges?.map((edge) => edge.node) || [];

  return (
    <>
      {/* JSON-LD structured data for SEO */}
      {productJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
      )}
      {breadcrumbJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      )}
      <AnnouncementBar />
      <Header collections={collections} />
      <main>
        {/* Main Product Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-start">
            {/* Image gallery */}
            <div className="flex flex-col gap-6">
              <div className="w-full aspect-square bg-koala-light-grey rounded-lg overflow-hidden">
                <div className="relative w-full h-full">
                  <Image
                    src={
                      product.featuredImage?.url ?? "/placeholder-product.jpg"
                    }
                    alt={product.featuredImage?.altText ?? product.title}
                    width={600} // Example width
                    height={600} // Example height
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-6">
                {images
                  .slice(0, 4)
                  .map(
                    (
                      image: { url: string; altText?: string },
                      index: number,
                    ) => (
                      <div
                        key={index}
                        className="aspect-square bg-koala-light-grey rounded-lg overflow-hidden"
                      >
                        <div className="relative w-full h-full">
                          <Image
                            src={image.url}
                            alt={image.altText || product.title}
                            width={150} // Example width
                            height={150} // Example height
                            className="object-cover"
                          />
                        </div>
                      </div>
                    ),
                  )}
              </div>
            </div>

            {/* Product details */}
            <div className="flex flex-col sticky top-8">
              <h1 className="text-4xl font-extrabold tracking-tight text-koala-dark-grey sm:text-5xl">
                {product.title}
              </h1>
              {/* Star Rating & Reviews Summary */}
              <div className="mt-4 mb-2">
                <StarRating rating={5} count={1234} />
              </div>
              <p className="mt-6 text-3xl text-koala-dark-grey">
                {product.priceRange.minVariantPrice.amount}{" "}
                {product.priceRange.minVariantPrice.currencyCode}
              </p>
              {/* Key Features/Icons */}
              <div className="mt-6">
                <TrustSignals />
              </div>
              {/* Variant Selector */}
              <div className="mt-8">
                <h3 className="text-base text-koala-dark-grey font-medium">
                  Options
                </h3>
                <select className="mt-2 block w-full pl-4 pr-12 py-3 text-base border-koala-dark-grey/20 focus:outline-none focus:ring-koala-green focus:border-koala-green sm:text-sm rounded-lg">
                  {variants.map((variant) => (
                    <option key={variant.id} value={variant.id}>
                      {variant.title}
                    </option>
                  ))}
                </select>
              </div>
              {/* Add to Cart & Payment Options */}
              <button type="button" className="btn-primary w-full mt-12">
                Add to cart
              </button>
              <div className="text-sm text-gray-500 mt-2">
                or 4 payments of $
                {(
                  Number(product.priceRange.minVariantPrice.amount) / 4
                ).toFixed(2)}{" "}
                with Afterpay
              </div>
              {/* Delivery Calculator */}
              <div className="mt-8">
                <DeliveryCalculator />
              </div>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <section className="py-12 bg-white border-b">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-koala-green mb-6 text-center">
              Product Description
            </h2>
            <div
              className="text-lg text-koala-dark-grey/80 space-y-8"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        </section>

        {/* Delivery & Returns Section */}
        <DeliveryInfo />

        {/* Customer Reviews Section */}
        <CustomerReviews />

        {/* FAQ Section */}
        <FAQ />

        {/* Related Products Section */}
        <RelatedProducts />
      </main>
      <Footer />
    </>
  );
}
