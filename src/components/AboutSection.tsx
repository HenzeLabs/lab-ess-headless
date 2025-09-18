'use client';

import React, { useEffect, useRef } from 'react';

import { buttonStyles, layout, textStyles } from '@/lib/ui';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface AboutSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  features?: Feature[];
  imageUrl?: string;
}

const AboutSection: React.FC<AboutSectionProps> = ({
  title = "Why Choose Our Lab Equipment",
  subtitle = "Built for Performance",
  description = "We understand that precision and reliability are non-negotiable in laboratory environments. That's why every piece of equipment we offer is rigorously tested and backed by industry-leading warranties.",
  features = [
    {
      icon: "🔬",
      title: "Precision Engineering",
      description: "Accurate to 0.001% tolerance"
    },
    {
      icon: "🚚",
      title: "Fast Delivery",
      description: "Ships within 24 hours"
    },
    {
      icon: "🛡️",
      title: "2-Year Warranty",
      description: "Comprehensive coverage"
    },
    {
      icon: "💡",
      title: "Expert Support",
      description: "24/7 technical assistance"
    }
  ],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  imageUrl: _imageUrl = "/medical_lab.mp4"
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in', 'fade-in', 'slide-in-from-bottom-5', 'duration-700');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    if (featuresRef.current) observer.observe(featuresRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <section className={layout.section + ' bg-[hsl(var(--bg))]'}>
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
        <div ref={sectionRef} className="grid lg:grid-cols-2 gap-12 items-center mb-16 opacity-0">
          <div>
            <h2 className={`${textStyles.heading} mb-4 text-[hsl(var(--ink))] md:text-5xl`}>
              {title}
            </h2>
            <h3 className="text-2xl font-semibold text-[hsl(var(--ink))]/80 mb-6">
              {subtitle}
            </h3>
            <p className="text-lg text-[hsl(var(--muted))] leading-relaxed">
              {description}
            </p>
            
            <div className="mt-8 flex gap-4">
              <a
                href="/about"
                className={`${buttonStyles.primary} px-8 py-4 font-semibold`}
              >
                Learn More
              </a>
              <a
                href="/support/contact"
                className={`${buttonStyles.ghost} px-8 py-4 font-semibold`}
              >
                Contact Sales
              </a>
            </div>
          </div>
          
          <div className="relative flex h-[400px] items-center justify-center overflow-hidden rounded-2xl bg-[hsl(var(--brand))]/10 shadow-2xl">
            <div className="text-center p-8">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[hsl(var(--brand))] text-3xl text-white mx-auto mb-4">
                🔬
              </div>
              <h3 className="text-xl font-semibold text-[hsl(var(--ink))] mb-2">
                Lab Equipment
              </h3>
              <p className="text-sm text-[hsl(var(--muted))]">
                Premium laboratory solutions
              </p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--brand))]/25 to-transparent" />
          </div>
        </div>
        
        <div ref={featuresRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 opacity-0">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[hsl(var(--bg))] text-3xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl mx-auto mb-4">
                {feature.icon}
              </div>
              <h4 className="mb-2 text-xl font-semibold text-[hsl(var(--ink))]">
                {feature.title}
              </h4>
              <p className="text-[hsl(var(--muted))]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
