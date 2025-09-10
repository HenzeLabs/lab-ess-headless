export function toAppHref(url: string): string {
  if (!url) return url;
  // Remove protocol and domain for Shopify/cdn links
  url = url.replace(
    /^https?:\/\/(cdn\.|www\.)?([\w-]+\.)?(shopify|myshopify)\.[^/]+/,
    "",
  );
  // Product handle
  const prodMatch = url.match(/\/products\/([a-zA-Z0-9-_]+)/);
  if (prodMatch) return `/products/${prodMatch[1]}`;
  // Collection handle
  const collMatch = url.match(/\/collections\/([a-zA-Z0-9-_]+)/);
  if (collMatch) return `/collections/${collMatch[1]}`;
  // Otherwise, return as-is (strip domain if present)
  return url.startsWith("/") ? url : `/${url.split("/").slice(1).join("/")}`;
}
