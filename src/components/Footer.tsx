'use client';

import Link from 'next/link';
import {
  CameraIcon,
  UsersIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline';

import { Input } from './ui/input';
import { Button } from './ui/button';
import { layout } from '@/lib/ui';

const footerLinks = {
  shop: [
    { name: 'Lab Glassware', href: '/collections/glassware' },
    { name: 'Instruments', href: '/collections/instruments' },
    { name: 'Consumables', href: '/collections/consumables' },
    { name: 'Safety', href: '/collections/safety' },
    { name: 'All Products', href: '/collections/all' },
  ],
  support: [
    { name: 'Contact Us', href: '/support/contact' },
    { name: 'FAQ', href: '/support/faq' },
    { name: 'Shipping', href: '/support/shipping' },
    { name: 'Returns', href: '/support/returns' },
    { name: 'Warranty', href: '/support/warranty' },
  ],
  company: [
    { name: 'About Lab Essentials', href: '/about' },
    { name: 'Reviews', href: '/reviews' },
    { name: 'Blog', href: '/blog' },
    { name: 'Careers', href: '/careers' },
    { name: 'Sustainability', href: '/sustainability' },
    { name: 'Press', href: '/press' },
  ],
  connect: [
    { name: 'Instagram', href: 'https://instagram.com/labessentials' },
    { name: 'Facebook', href: 'https://facebook.com/labessentials' },
    { name: 'LinkedIn', href: 'https://linkedin.com/company/labessentials' },
  ],
};

const SocialIcon = ({ type }: { type: string }) => {
  const icons: Record<string, React.ReactElement> = {
    instagram: <CameraIcon className="h-5 w-5" aria-hidden="true" />,
    facebook: <UsersIcon className="h-5 w-5" aria-hidden="true" />,
    linkedin: <BriefcaseIcon className="h-5 w-5" aria-hidden="true" />,
  };

  return icons[type.toLowerCase()] ?? <span className="sr-only" />;
};

export default function Footer() {
  return (
    <footer className="border-t border-[hsl(var(--border))] bg-surface text-body">
      <div className={`${layout.container} py-12 md:py-16`}>
        <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Shop Column */}
          <div>
            <h3 className="mb-4 text-base font-semibold text-heading">Shop</h3>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-body/75 transition-colors hover:text-[hsl(var(--brand))]"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h3 className="mb-4 text-base font-semibold text-heading">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-body/75 transition-colors hover:text-[hsl(var(--brand))]"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="mb-4 text-base font-semibold text-heading">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-body/75 transition-colors hover:text-[hsl(var(--brand))]"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div className="lg:col-span-2">
            <h3 className="mb-4 text-base font-semibold text-heading">
              Join the Lab Essentials community
            </h3>
            <p className="mb-4 text-sm text-body/75">
              Get exclusive offers, lab tips, and be the first to know about new
              products.
            </p>
            <form
              className="flex flex-col sm:flex-row gap-2"
              onSubmit={(e) => e.preventDefault()}
            >
              <Input
                type="email"
                required
                placeholder="Enter your email"
                inputSize="md"
                className="flex-grow"
              />
              <Button type="submit" className="whitespace-nowrap">
                Subscribe
              </Button>
            </form>

            {/* Social Icons */}
            <div className="mt-6 flex items-center space-x-4">
              {['instagram', 'facebook', 'linkedin'].map((social) => (
                <a
                  key={social}
                  href={
                    footerLinks.connect.find(
                      (l) => l.name.toLowerCase() === social,
                    )?.href
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[hsl(var(--border))] text-body/70 transition hover:border-[hsl(var(--brand))] hover:text-[hsl(var(--brand))]"
                  aria-label={`Follow us on ${social}`}
                >
                  <SocialIcon type={social} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-[hsl(var(--border))] pt-8">
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-body/70 md:flex-row">
            <div className="flex flex-col items-center gap-4 md:flex-row">
              <p>
                © {new Date().getFullYear()} Lab Essentials. All rights
                reserved.
              </p>
              <span className="hidden md:inline">•</span>
              <Link
                href="/privacy"
                className="transition-colors hover:text-[hsl(var(--brand))]"
              >
                Privacy Policy
              </Link>
              <span className="hidden md:inline">•</span>
              <Link
                href="/terms"
                className="transition-colors hover:text-[hsl(var(--brand))]"
              >
                Terms of Service
              </Link>
            </div>

            {/* Certifications */}
            <div className="flex items-center gap-4 text-xs">
              <span className="rounded-full border border-[hsl(var(--border))] px-3 py-1 text-body/70">
                B Corp Certified
              </span>
              <span className="rounded-full border border-[hsl(var(--border))] px-3 py-1 text-body/70">
                1% for the Planet
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
