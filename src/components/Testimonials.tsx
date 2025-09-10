import React from "react";

const testimonials = [
  {
    quote:
      "“The mattress is a game-changer. I haven't slept this well in years. Plus, the delivery was so fast and easy!”",
    author: "Jessica H., Sydney",
  },
  {
    quote:
      "“Our new Koala sofa is the best thing we've bought for our home. It's comfortable, stylish, and the whole family loves it.”",
    author: "Mark R., Melbourne",
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-blue-50">
      <div className="max-w-4xl mx-auto px-4">
        <h3 className="mb-12 text-3xl font-bold text-gray-800 text-center">
          What Our Customers Say
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.author}
              className="rounded-xl bg-white p-8 shadow-md"
            >
              <p className="text-gray-600 text-lg italic mb-6">
                {testimonial.quote}
              </p>
              <div className="font-bold text-blue-600 text-lg">
                — {testimonial.author}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
