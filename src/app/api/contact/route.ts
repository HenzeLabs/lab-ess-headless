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

function sanitizeString(input: unknown, maxLength: number): string | null {
  if (typeof input !== 'string') {
    return null;
  }

  const trimmed = input.trim();
  if (trimmed.length === 0 || trimmed.length > maxLength) {
    return null;
  }

  // Basic XSS protection: remove potentially dangerous characters
  return trimmed
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .substring(0, maxLength);
}

function getStoreDomain() {
  const domain = process.env.SHOPIFY_STORE_DOMAIN?.trim();
  if (!domain) return null;
  return domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    // Validate all required fields
    const name = sanitizeString(body?.name, 100);
    const email = sanitizeEmail(body?.email);
    const subject = sanitizeString(body?.subject, 200);
    const message = sanitizeString(body?.message, 2000);

    // Validation errors
    const errors: Record<string, string> = {};

    if (!name) {
      errors.name = 'Please provide your name.';
    }

    if (!email) {
      errors.email = 'Please provide a valid email address.';
    }

    if (!subject) {
      errors.subject = 'Please provide a subject.';
    }

    if (!message) {
      errors.message = 'Please provide a message.';
    } else if (body?.message?.trim().length < 10) {
      errors.message = 'Message must be at least 10 characters.';
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    // At this point, all fields are validated and not null
    // TypeScript doesn't know this, so we use type assertion
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const storeDomain = getStoreDomain();
    if (!storeDomain) {
      return NextResponse.json(
        {
          error:
            'Contact form is not available right now. Please try again later or email us directly at support@labessentials.com.',
        },
        { status: 500 },
      );
    }

    // Submit to Shopify contact form
    const formData = new URLSearchParams();
    formData.set('form_type', 'contact');
    formData.set('utf8', '✓');
    formData.set('contact[name]', name);
    formData.set('contact[email]', email);
    formData.set('contact[subject]', subject);
    formData.set('contact[body]', message);

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
      console.error(
        '[contact] Shopify returned error status:',
        shopifyResponse.status,
      );
      return NextResponse.json(
        {
          error:
            'We could not send your message. Please try again or email us directly at support@labessentials.com.',
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      message:
        'Thank you for contacting us! We will respond to your inquiry within 24 hours.',
    });
  } catch (error) {
    console.error('[contact] form submission failed', error);
    return NextResponse.json(
      {
        error:
          'Something went wrong. Please try again or email us directly at support@labessentials.com.',
      },
      { status: 500 },
    );
  }
}
