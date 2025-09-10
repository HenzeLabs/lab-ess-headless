import React from "react";

export default function ProductFeatures({ features }: { features: string[] }) {
  if (!features || features.length === 0) return null;
  return (
    <section className="py-10 bg-white border-b">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-koala-green mb-6 text-center">
          Features
        </h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, idx) => (
            <li
              key={idx}
              className="flex items-start gap-3 text-lg text-koala-gray"
            >
              <span className="inline-block mt-1 text-koala-green">•</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
