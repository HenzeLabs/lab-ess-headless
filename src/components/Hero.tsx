import Link from 'next/link';
import { Button } from './ui/button';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className="relative bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center text-center py-20 md:py-32">
          <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6 max-w-4xl animate-fade-in">
            Essential Lab Equipment
            <br />
            for Scientific Excellence
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl animate-slide-up">
            Discover professional microscopes, centrifuges, and lab equipment
            for research, education, and clinical applications
          </p>
          <div className="w-full max-w-3xl aspect-[3/1] relative mb-10">
            <Image
              src="https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png"
              alt="Modern laboratory with microscopes and scientific equipment"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 60vw"
              className="object-cover rounded-lg"
              style={{ aspectRatio: '3/1' }}
            />
          </div>
          <Button
            asChild
            variant="default"
            size="lg"
            className="uppercase tracking-wide animate-slide-up"
            style={{ animationDelay: '0.2s' }}
          >
            <Link href="/collections/microscopes">Shop Microscopes</Link>
          </Button>
        </div>
      </div>
      {/* Decorative element */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
        aria-hidden="true"
      ></div>
    </section>
  );
}
