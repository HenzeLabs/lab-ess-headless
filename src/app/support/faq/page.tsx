import type { Metadata } from 'next';
import { ShoppingCart, Truck, PackageCheck, MapPin, Headphones, CreditCard, Shield, Clock, Target, Users, Package, MapPinned, Wrench } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | Lab Essentials',
  description:
    'Get answers to common questions about ordering, shipping, returns, order tracking, and technical support for laboratory equipment and supplies.',
  alternates: {
    canonical: 'https://labessentials.com/support/faq',
  },
  openGraph: {
    title: 'Frequently Asked Questions | Lab Essentials',
    description:
      'Get answers to common questions about ordering, shipping, returns, and technical support.',
    url: 'https://labessentials.com/support/faq',
    type: 'website',
  },
};

const faqs = [
  {
    icon: Target,
    category: 'About Us',
    question: 'What is the mission of Lab Essentials?',
    answer: 'Our mission is simple: to make lab operations easier through reliable, affordable equipment that\'s built for everyday use. We believe in simplicity, precision, trust, accessibility, and reliability—values that guide every product we offer.',
  },
  {
    icon: Users,
    category: 'About Us',
    question: 'Who uses Lab Essentials products?',
    answer: 'Our equipment is trusted by schools, clinical labs, and research facilities across the country. Each product is designed for real-world performance in classrooms, medical offices, and diagnostic environments.',
  },
  {
    icon: ShoppingCart,
    category: 'Ordering',
    question: 'How do I place an order?',
    answer: 'Browse our products, add items to your cart, and proceed to checkout. We accept all major credit cards and several secure payment options.',
  },
  {
    icon: CreditCard,
    category: 'Ordering',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover), PayPal, and purchase orders for institutional customers.',
  },
  {
    icon: Package,
    category: 'Shipping',
    question: 'Do you offer free shipping?',
    answer: 'Yes. Orders over $300 qualify for free shipping within the continental U.S.',
  },
  {
    icon: Truck,
    category: 'Shipping',
    question: 'What are your shipping options?',
    answer: 'We offer standard shipping (1–3 business days) and expedited same-day shipping for orders placed before 2:00 PM EST. Shipping costs vary based on order size and destination.',
  },
  {
    icon: Clock,
    category: 'Shipping',
    question: 'When will my order arrive?',
    answer: 'Standard orders typically arrive within 1–3 business days. Same-day shipping is available for orders placed before 2:00 PM EST. You\'ll receive tracking information once your order ships.',
  },
  {
    icon: MapPin,
    category: 'Shipping',
    question: 'How do I track my order?',
    answer: 'Once your order ships, you\'ll receive a tracking number via email. You can also check order status anytime by logging into your account.',
  },
  {
    icon: MapPinned,
    category: 'Shipping',
    question: 'Where are your products shipped from, and what support is available?',
    answer: 'All orders ship quickly from our U.S. warehouse, with most standard deliveries arriving in 1–3 business days. Our U.S.-based support team is available to help with setup, product selection, and troubleshooting.',
  },
  {
    icon: PackageCheck,
    category: 'Returns',
    question: 'Do you offer returns?',
    answer: 'Yes, most items can be returned within 30 days if they\'re in original condition and packaging. Certain laboratory products may have special return requirements.',
  },
  {
    icon: Wrench,
    category: 'Products',
    question: 'Is your equipment built to last?',
    answer: 'Yes. Our microscopes and centrifuges are engineered for long-term reliability and precision. Models like our Revelation Series microscopes are trusted by over 1,200 labs nationwide for their durable construction and consistent performance.',
  },
  {
    icon: Headphones,
    category: 'Support',
    question: 'Do you provide technical support?',
    answer: 'Yes. Our technical team can assist with setup, troubleshooting, and product questions. Email us at info@labessentials.com for support.',
  },
  {
    icon: Shield,
    category: 'Support',
    question: 'What warranty do you offer?',
    answer: 'All products include a 1-year manufacturer warranty covering defects in materials and workmanship. Extended warranty options are available for select equipment.',
  },
];

export default function FAQPage() {
  return (
    <main className="bg-[hsl(var(--bg))] text-[hsl(var(--ink))] py-12 md:py-16">
      <div className="mx-auto w-full max-w-6xl px-6 md:px-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-[hsl(var(--ink))] lg:text-4xl mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
            Quick answers to common questions about ordering, shipping, and support.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4 mb-12">
          {faqs.map((faq, index) => {
            const Icon = faq.icon;
            return (
              <details
                key={index}
                className="group border-2 border-border/50 rounded-xl bg-white hover:border-[hsl(var(--brand))]/30 hover:shadow-lg transition-all duration-300"
              >
                <summary className="cursor-pointer p-6 font-semibold flex items-center justify-between list-none">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-[hsl(var(--brand))]/10 rounded-xl flex items-center justify-center group-hover:bg-[hsl(var(--brand))]/20 transition-colors">
                      <Icon className="h-6 w-6 text-[hsl(var(--brand))]" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-xs font-semibold text-[hsl(var(--brand))] uppercase tracking-wider mb-1">
                        {faq.category}
                      </span>
                      <span className="text-lg text-[hsl(var(--ink))]">{faq.question}</span>
                    </div>
                  </div>
                  <svg
                    className="h-6 w-6 text-[hsl(var(--muted-foreground))] transition-transform group-open:rotate-180 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-6 pl-[88px]">
                  <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </details>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-[hsl(var(--brand))]/10 via-[hsl(var(--brand))]/5 to-[hsl(var(--accent))]/10 border-2 border-[hsl(var(--brand))]/20 rounded-2xl p-8 md:p-10 text-center shadow-lg">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[hsl(var(--brand))]/10 rounded-2xl mb-4">
            <Headphones className="h-8 w-8 text-[hsl(var(--brand))]" />
          </div>
          <h2 className="text-2xl font-bold text-[hsl(var(--ink))] mb-3">
            Still have questions?
          </h2>
          <p className="text-[hsl(var(--muted-foreground))] mb-6 max-w-xl mx-auto">
            Can't find what you're looking for? Our support team is happy to help—just reach out at info@labessentials.com.
          </p>
          <a
            href="/support/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[hsl(var(--brand))] text-white rounded-xl font-bold hover:bg-[hsl(var(--brand-dark))] hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
          >
            Contact Support
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </main>
  );
}
