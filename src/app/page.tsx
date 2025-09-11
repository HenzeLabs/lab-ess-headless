import Image from 'next/image';

// import BrandValues from '../components/BrandValues';
// import CustomerReviews from '../components/CustomerReviews';
// import FAQ from '../components/FAQ';
// import PersonaHero from '../../components/PersonaHero';
// import PersonaEmphasisBlock from '../../components/PersonaEmphasisBlock';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
} from '../components/ui/sheet';
import { Button } from '../components/ui/button';

import { getCart } from '@/lib/cart';

export default async function HomePage() {
  const cart = await getCart();
  return (
    <>
      {/* <AnnouncementBar /> */}
      {/* <PersonaGate> */}
      <Sheet>
        <SheetTrigger asChild>
          <Button className="fixed bottom-8 right-8 z-[60] rounded-full shadow-2xl bg-primary text-primary-foreground px-7 py-4 text-base font-semibold flex items-center gap-2 hover:scale-105 hover:shadow-3xl transition-all focus:outline-none focus:ring-4 focus:ring-primary/30">
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6.5-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6"
              />
            </svg>
            View Cart
            <span className="ml-2 inline-flex items-center justify-center h-6 w-6 rounded-full bg-accent text-white text-xs font-bold">
              {cart?.lines?.edges?.length ?? 0}
            </span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right">
          <div className="flex items-center justify-between border-b pb-2 mb-4">
            <div className="text-lg font-semibold">Your Cart</div>
            <SheetClose asChild>
              <Button variant="ghost" className="absolute top-2 right-2">
                Close
              </Button>
            </SheetClose>
          </div>
          {/* Cart content preview (minimal, for now) */}
          {cart && cart.lines.edges.length > 0 ? (
            <ul className="divide-y divide-border my-4">
              {cart.lines.edges.map((item) => (
                <li key={item.node.id} className="flex items-center gap-4 py-4">
                  <Image
                    src={item.node.merchandise.product.featuredImage.url}
                    alt={
                      item.node.merchandise.product.featuredImage.altText || ''
                    }
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded object-cover border"
                  />
                  <div className="flex-1">
                    <div className="font-medium">
                      {item.node.merchandise.product.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Qty {item.node.quantity}
                    </div>
                  </div>
                  <div className="font-semibold">
                    {item.node.merchandise.price.amount}{' '}
                    {item.node.merchandise.price.currencyCode}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-muted-foreground my-8">
              Your cart is empty.
            </div>
          )}
          {cart && cart.lines.edges.length > 0 && (
            <a
              href={cart.checkoutUrl}
              className="block w-full mt-6 bg-primary text-primary-foreground font-bold py-3 rounded-lg text-center hover:bg-primary/90 transition"
            >
              Checkout
            </a>
          )}
        </SheetContent>
      </Sheet>
      <main
        id="main-content"
        className="container mx-auto px-4 lg:px-8 space-y-20 lg:space-y-32 bg-[hsl(var(--bg))] text-[hsl(var(--ink))] pt-8 lg:pt-12"
        role="main"
      >
        {/* <section className="mb-8 lg:mb-12">
            <PersonaHero />
          </section>
          <section className="mb-8 lg:mb-12">
            <PersonaEmphasisBlock />
          </section>
          <section className="mb-8 lg:mb-12">
            <BrandValues />
          </section>
          <section className="mb-8 lg:mb-12">
            <CustomerReviews />
          </section>
          <section className="mb-8 lg:mb-12">
            <FAQ />
          </section> */}
      </main>
      {/* </PersonaGate> */}
    </>
  );
}
