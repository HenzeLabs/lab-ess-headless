import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { absoluteUrl, jsonLd } from './seo';

describe('seo helpers', () => {
  const originalEnv = process.env.NEXT_PUBLIC_SITE_URL;

  afterEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = originalEnv;
  });

  it('absoluteUrl respects NEXT_PUBLIC_SITE_URL', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';
    assert.equal(absoluteUrl('/path'), 'https://example.com/path');
  });

  it('absoluteUrl falls back to default', () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    assert.equal(absoluteUrl('/path'), 'https://www.labessentials.com/path');
  });

  it('jsonLd escapes script tags', () => {
    const html = jsonLd({ script: '<script>alert(1)</script>' }).__html;
    assert.ok(html.includes('\\u003cscript'));
  });
});
