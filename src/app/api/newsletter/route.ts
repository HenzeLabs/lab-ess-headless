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

type SubscribeResult =
  | { ok: true }
  | { ok: false; error?: string; status?: number; skipFallback?: boolean };

const DEFAULT_API_VERSION = '2025-01';

function extractErrorMessage(errors: unknown): string | undefined {
  if (!errors) return undefined;

  if (typeof errors === 'string') {
    return errors;
  }

  if (Array.isArray(errors)) {
    const flattened = errors
      .map((entry) => extractErrorMessage(entry))
      .filter(Boolean) as string[];
    if (flattened.length > 0) {
      return flattened.join('; ');
    }
    return undefined;
  }

  if (typeof errors === 'object') {
    for (const value of Object.values(errors as Record<string, unknown>)) {
      const nested = extractErrorMessage(value);
      if (nested) {
        return nested;
      }
    }
  }

  return undefined;
}

async function subscribeViaAdminApi(
  storeDomain: string,
  email: string,
): Promise<SubscribeResult> {
  const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN?.trim();
  if (!adminToken) {
    return { ok: false, skipFallback: false };
  }

  const apiVersion =
    process.env.SHOPIFY_API_VERSION?.trim() || DEFAULT_API_VERSION;
  const baseUrl = `https://${storeDomain}/admin/api/${apiVersion}`;
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': adminToken,
  };

  try {
    const searchResponse = await fetch(
      `${baseUrl}/customers/search.json?query=${encodeURIComponent(
        `email:${email}`,
      )}`,
      {
        method: 'GET',
        headers,
        // Disable caching so repeated attempts always reach Shopify
        cache: 'no-store',
      },
    );

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text().catch(() => 'No response');
      console.error(
        '[newsletter] customer search failed',
        searchResponse.status,
        errorText.substring(0, 200),
      );
      console.error('[newsletter] API endpoint:', `${baseUrl}/customers/search.json`);
      console.error('[newsletter] Token prefix:', adminToken.substring(0, 10) + '...');
      return { ok: false, status: searchResponse.status };
    }

    const searchData = (await searchResponse
      .json()
      .catch(() => null)) as { customers?: Array<{ id: number | string; tags?: string }> } | null;
    const customers = Array.isArray(searchData?.customers)
      ? searchData?.customers
      : [];

    const emailMarketingConsent = {
      state: 'subscribed',
      opt_in_level: 'single_opt_in',
      consent_updated_at: new Date().toISOString(),
    };

    const newsletterTags = ['newsletter', 'headless-site'];

    if (customers.length > 0) {
      const customer = customers[0];
      const id = customer.id;

      const existingTags =
        typeof customer.tags === 'string'
          ? customer.tags
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean)
          : [];

      const updatedTags = Array.from(
        new Set([...existingTags, ...newsletterTags]),
      );

      const updateResponse = await fetch(
        `${baseUrl}/customers/${encodeURIComponent(String(id))}.json`,
        {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            customer: {
              id,
              email,
              accepts_marketing: true,
              marketing_opt_in_level: 'single_opt_in',
              tags: updatedTags.join(', '),
              email_marketing_consent: emailMarketingConsent,
            },
          }),
        },
      );

      if (!updateResponse.ok) {
        const updateData = await updateResponse.json().catch(() => null);
        const errorMessage = extractErrorMessage(updateData?.errors);
        console.error(
          '[newsletter] customer update failed',
          updateResponse.status,
          errorMessage,
        );
        return {
          ok: false,
          status: updateResponse.status,
          error: errorMessage,
        };
      }

      return { ok: true };
    }

    const createResponse = await fetch(`${baseUrl}/customers.json`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        customer: {
          email,
          accepts_marketing: true,
          marketing_opt_in_level: 'single_opt_in',
          tags: newsletterTags.join(', '),
          email_marketing_consent: emailMarketingConsent,
        },
      }),
    });

    if (!createResponse.ok) {
      const createData = await createResponse.json().catch(() => null);
      const errorMessage = extractErrorMessage(createData?.errors);
      console.error(
        '[newsletter] customer creation failed',
        createResponse.status,
        errorMessage,
      );
      return {
        ok: false,
        status: createResponse.status,
        error: errorMessage,
      };
    }

    return { ok: true };
  } catch (error) {
    console.error('[newsletter] admin API subscription failed', error);
    return { ok: false };
  }
}

async function subscribeViaContactForm(
  storeDomain: string,
  email: string,
): Promise<SubscribeResult> {
  const formData = new URLSearchParams();
  formData.set('form_type', 'customer');
  formData.set('utf8', '✓');
  formData.set('contact[email]', email);
  formData.set('contact[tags]', 'newsletter,headless-site');
  formData.set('contact[accepts_marketing]', 'true');

  try {
    const shopifyResponse = await fetch(`https://${storeDomain}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'text/html, */*',
      },
      body: formData.toString(),
      redirect: 'manual',
    });

    if (shopifyResponse.status >= 400) {
      const responseText = await shopifyResponse.text().catch(() => 'No response body');
      console.error(
        '[newsletter] contact form fallback failed',
        shopifyResponse.status,
        responseText.substring(0, 200),
      );
      return {
        ok: false,
        status: shopifyResponse.status,
        error: shopifyResponse.status === 403
          ? 'Newsletter signup is temporarily unavailable. Please email us at support@labessentials.com to subscribe.'
          : 'We could not complete your signup. Please try again.',
      };
    }

    return { ok: true };
  } catch (error) {
    console.error('[newsletter] contact form request failed', error);
    return { ok: false };
  }
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

    const adminResult = await subscribeViaAdminApi(storeDomain, email);
    if (adminResult.ok) {
      return NextResponse.json({ ok: true });
    }

    const contactResult = await subscribeViaContactForm(storeDomain, email);
    if (contactResult.ok) {
      return NextResponse.json({ ok: true });
    }

    const errorMessage =
      contactResult.error ??
      adminResult.error ??
      'We could not complete your signup. Please try again.';

    const statusCode =
      contactResult.status ?? adminResult.status ?? 502;

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  } catch (error) {
    console.error('[newsletter] subscription failed', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}
