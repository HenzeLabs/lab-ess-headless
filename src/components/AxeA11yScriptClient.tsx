'use client';
import dynamic from 'next/dynamic';

const AxeA11yScript = dynamic(() => import('@/components/AxeA11yScript'), {
  ssr: false,
});

export default function AxeA11yScriptClient() {
  if (process.env.NODE_ENV !== 'development') return null;
  return <AxeA11yScript />;
}
