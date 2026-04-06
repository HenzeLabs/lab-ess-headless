# FAQ Schema Plan

Goal: Add `FAQPage` JSON-LD to the support FAQ page using the same on-page question and answer content as the source of truth.

Implementation:
- add a shared `generateFAQPageSchema` helper in `src/lib/seo.ts`
- derive the schema from the existing `faqs` array in `src/app/support/faq/page.tsx`
- render one `application/ld+json` script on the FAQ page
- verify with `npm run typecheck`
