"use client";
import ProductCard from "@/components/ProductCard";

import { useState } from "react";

import type { Product } from "@/lib/types";

interface BestsellersProps {
  productsByCollection: Record<string, Product[]>;
}

export default function Bestsellers({
  productsByCollection,
}: BestsellersProps) {
  const [activeTab, setActiveTab] = useState("microscopes");

  const tabs = [
    { id: "microscopes", name: "Microscopes" },
    { id: "microscope-cameras", name: "Microscope Cameras" },
    { id: "centrifuges", name: "Centrifuges" },
    { id: "lab-equipment", name: "Lab Equipment" },
    {
      id: "incubators-slide-preparation",
      name: "Incubators & Slide Preparation",
    },
  ];

  const productsToDisplay = productsByCollection[activeTab] || [];

  return (
    <section className="py-16 bg-white">
      <div className="container-koala">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-koala-green mb-4">
            Our Bestsellers
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore our most popular lab equipment, trusted by professionals
            worldwide.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center flex-wrap gap-2 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-koala-green text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-fade-in items-stretch">
          {productsToDisplay.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
