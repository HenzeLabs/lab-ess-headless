// Utility to get the absolute site URL for server-side fetches
export function getSiteUrl() {
  // Prefer NEXT_PUBLIC_SITE_URL if set
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  // VERCEL_URL is just the domain, so add protocol if present
  if (process.env.VERCEL_URL) {
    if (process.env.VERCEL_URL.startsWith('http')) {
      return process.env.VERCEL_URL;
    }
    return `https://${process.env.VERCEL_URL}`;
  }
  // Fallback to localhost
  return 'http://localhost:3000';
  // (no trailing brace)
}
