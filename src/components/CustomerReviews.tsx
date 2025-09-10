"use client";

import { useState, useEffect } from "react";

interface Testimonial {
  id: number;
  name: string;
  product: string;
  rating: number;
  text: string;
  verified: boolean;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah M.",
    product: "Koala Sofa Bed",
    rating: 5,
    text: "Absolutely love my Koala Sofa Bed! It's incredibly comfortable as both a sofa and a bed. The transformation is so easy, even my kids can do it.",
    verified: true,
  },
  {
    id: 2,
    name: "James L.",
    product: "Koala Mattress",
    rating: 5,
    text: "Best mattress I've ever owned. The support is perfect and I wake up feeling refreshed every morning. Highly recommend!",
    verified: true,
  },
  {
    id: 3,
    name: "Emma K.",
    product: "Cushy Sofa Bed",
    rating: 5,
    text: "The quality is outstanding and it looks beautiful in our living room. Guests always comment on how comfortable it is to sleep on.",
    verified: true,
  },
  {
    id: 4,
    name: "Michael R.",
    product: "Calm As Mattress",
    rating: 5,
    text: "Worth every penny! The cooling technology actually works and I no longer wake up hot during the night.",
    verified: true,
  },
];

const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg
    className={`h-4 w-4 ${filled ? "text-koala-yellow" : "text-gray-200"}`}
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z" />
  </svg>
);

export default function CustomerReviews() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  return (
    <section className="section-padding bg-koala-cream">
      <div className="container-koala">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-section text-koala-green mb-4">
            Customer Reviews
          </h2>
          <p className="text-lg text-koala-gray">
            More than 50,000 five-star reviews worldwide
          </p>
        </div>

        {/* Testimonial Carousel */}
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                  <div className="bg-white rounded-card p-8 shadow-card">
                    {/* Rating */}
                    <div className="flex items-center justify-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} filled={i < testimonial.rating} />
                      ))}
                    </div>

                    {/* Quote */}
                    <blockquote className="text-center mb-6">
                      <p className="text-lg text-koala-gray-dark italic">
                        &ldquo;{testimonial.text}&rdquo;
                      </p>
                    </blockquote>

                    {/* Author */}
                    <div className="text-center">
                      <p className="font-semibold text-koala-green">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-koala-gray">
                        {testimonial.verified && (
                          <span className="inline-flex items-center gap-1">
                            <svg
                              className="h-4 w-4 text-koala-green"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Verified Buyer
                          </span>
                        )}{" "}
                        • {testimonial.product}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Navigation */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "bg-koala-green w-8"
                    : "bg-koala-gray/30 hover:bg-koala-gray/50"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 flex flex-wrap justify-center gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-koala-green">50,000+</div>
            <div className="text-sm text-koala-gray">Five-Star Reviews</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-koala-green">120</div>
            <div className="text-sm text-koala-gray">Day Trial</div>
          </div>
        </div>
      </div>
    </section>
  );
}
