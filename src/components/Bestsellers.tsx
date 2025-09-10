'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import type { Product } from '@/lib/types';
import { Button } from './ui/button';

const ProductCard = dynamic(() => import('@/components/ProductCard'), {
  ssr: false,
});

interface BestsellersProps {
  productsByCollection: Record<string, Product[]>;
}

export default function Bestsellers({
  productsByCollection,
}: BestsellersProps) {
  const [activeTab, setActiveTab] = useState('microscopes');

  const tabs = [
    { id: 'microscopes', name: 'Microscopes' },
    { id: 'microscope-cameras', name: 'Microscope Cameras' },
    { id: 'centrifuges', name: 'Centrifuges' },
    { id: 'lab-equipment', name: 'Lab Equipment' },
    {
      id: 'incubators-slide-preparation',
      name: 'Incubators & Slide Preparation',
    },
  ];

  const productsToDisplay = productsByCollection[activeTab] || [];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Our Bestsellers
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Explore our most popular lab equipment, trusted by professionals
            worldwide.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center flex-wrap gap-2 mb-12">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              size="sm"
              className="rounded-full text-sm font-medium"
              aria-pressed={activeTab === tab.id}
            >
              {tab.name}
            </Button>
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
