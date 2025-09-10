import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative bg-koala-cream overflow-hidden">
      <div className="container-koala">
        <div className="flex flex-col items-center justify-center text-center py-20 md:py-32">
          <h1 className="text-hero-mobile md:text-hero text-koala-green mb-6 max-w-4xl animate-fade-in">
            Essential Lab Equipment
            <br />
            for Scientific Excellence
          </h1>
          <p className="text-lg md:text-xl text-koala-gray mb-10 max-w-2xl animate-slide-up">
            Discover professional microscopes, centrifuges, and lab equipment
            for research, education, and clinical applications
          </p>
          <Link
            href="/collections/microscopes"
            className="btn-primary uppercase tracking-wide animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            Shop Microscopes
          </Link>
        </div>
      </div>

      {/* Decorative element */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-koala-green/20 to-transparent"></div>
    </section>
  );
}
