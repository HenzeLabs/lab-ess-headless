import type { Metadata } from 'next';
import { absoluteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Terms of Service | Lab Essentials',
  description:
    'Lab Essentials terms of service. Review our terms and conditions for purchasing laboratory equipment, shipping, returns, and warranty policies.',
  alternates: {
    canonical: absoluteUrl('/terms'),
  },
  openGraph: {
    title: 'Terms of Service | Lab Essentials',
    description:
      'Lab Essentials terms of service. Review our terms and conditions for purchasing laboratory equipment.',
    url: absoluteUrl('/terms'),
    type: 'website',
  },
};

export default function TermsPage() {
  return <></>;
}
