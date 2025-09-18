import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

function sanitizeEmail(email: unknown): string | null {
  if (typeof email !== 'string') {
    return null;
  }

  const trimmed = email.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(trimmed) ? trimmed : null;
}

function getStoreDomain() {
  const domain = process.env.SHOPIFY_STORE_DOMAIN?.trim();
  if (!domain) return null;
  return domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const email = sanitizeEmail(body?.email);

    if (!email) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }

    const storeDomain = getStoreDomain();
    if (!storeDomain) {
      return NextResponse.json(
        { error: 'Newsletter signup is not available right now. Please try again later.' },
        { status: 500 },
      );
    }

    const formData = new URLSearchParams();
    formData.set('form_type', 'customer');
    formData.set('utf8', '✓');
    formData.set('contact[email]', email);
    formData.set('contact[tags]', 'newsletter,headless-site');
    formData.set('contact[accepts_marketing]', 'true');

    const shopifyResponse = await fetch(`https://${storeDomain}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json, text/html, */*',
      },
      body: formData.toString(),
      redirect: 'manual',
    });

    if (shopifyResponse.status >= 400) {
      return NextResponse.json(
        { error: 'We could not complete your signup. Please try again.' },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[newsletter] subscription failed', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}
