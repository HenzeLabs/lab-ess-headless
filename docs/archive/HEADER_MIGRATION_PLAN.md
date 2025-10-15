# Header Component Refactoring Migration Plan

## Overview

This migration plan outlines the step-by-step process for refactoring the monolithic Header.tsx component into smaller, maintainable pieces with Sentry error monitoring integration.

## Migration Steps

### Phase 1: Component Decomposition ✅ COMPLETED

#### 1. Created Header Sub-components

- **CartPreview.tsx** - Handles cart icon and live count updates
- **Search.tsx** - Manages search modal and keyboard shortcuts
- **Nav.tsx** - Handles navigation menus and mobile menu
- **HeaderRefactored.tsx** - Main orchestrating component

#### 2. Error Boundary Integration ✅ COMPLETED

- **ErrorBoundary.tsx** - Comprehensive React error boundary
- **HeaderRefactored.tsx** - Wrapped with error boundary and Sentry integration

#### 3. Sentry API Monitoring ✅ COMPLETED

- **sentry-api.ts** - API route error monitoring utilities

### Phase 2: Installation and Configuration

#### 1. Install Sentry Dependencies

```bash
npm install @sentry/nextjs
```

#### 2. Configure Sentry

Create `.env.local` with:

```env
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
SENTRY_ORG=your_organization
SENTRY_PROJECT=your_project
SENTRY_AUTH_TOKEN=your_auth_token
```

#### 3. Create Sentry Configuration Files

**sentry.client.config.js**:

```javascript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
```

**sentry.server.config.js**:

```javascript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

#### 4. Update Next.js Configuration

**next.config.mjs**:

```javascript
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig = {
  // Your existing config
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  widenClientFileUpload: true,
  tunnelRoute: '/monitoring',
  hideSourceMaps: true,
  disableLogger: true,
});
```

### Phase 3: Component Migration

#### 1. Update Layout to Use New Header (5 minutes)

**Before**: `src/app/layout.tsx`

```tsx
import Header from '@/components/Header';

// In layout component:
<Header
  collections={collections}
  logoUrl="/logo.svg"
  shopName="Your Shop"
  cartItemCount={cartCount}
/>;
```

**After**: `src/app/layout.tsx`

```tsx
import Header from '@/components/HeaderRefactored';

// Same props - no changes needed
<Header
  collections={collections}
  logoUrl="/logo.svg"
  shopName="Your Shop"
  cartItemCount={cartCount}
/>;
```

#### 2. Update API Routes with Sentry Monitoring (10 minutes per route)

**Before**: `src/app/api/cart/route.ts`

```tsx
export async function GET(request: Request) {
  try {
    // Cart logic
    return Response.json({ cart });
  } catch (error) {
    console.error('Cart error:', error);
    return Response.json({ error: 'Failed' }, { status: 500 });
  }
}
```

**After**: `src/app/api/cart/route.ts`

```tsx
import { withSentry } from '@/lib/sentry-api';

export const GET = withSentry(async (req, res) => {
  // Cart logic - same as before
  // Errors automatically captured by Sentry
  return Response.json({ cart });
});
```

### Phase 4: Testing and Validation

#### 1. Component Testing Checklist

- [ ] Desktop navigation works correctly
- [ ] Mobile menu opens/closes properly
- [ ] Search modal functions with keyboard shortcuts
- [ ] Cart count updates in real-time
- [ ] Error boundary shows fallback UI on component errors
- [ ] Responsive design maintains layout

#### 2. Error Monitoring Testing

- [ ] Component errors are captured in Sentry
- [ ] API route errors are logged with context
- [ ] Error boundaries provide graceful fallbacks
- [ ] Performance monitoring tracks component renders

#### 3. Accessibility Testing

- [ ] Keyboard navigation works for all components
- [ ] Screen readers can navigate menus properly
- [ ] ARIA labels are descriptive and helpful
- [ ] Focus management works correctly

### Phase 5: Performance Optimization

#### 1. Code Splitting Benefits

- **Before**: 479-line monolithic component
- **After**: Multiple focused components (~100-150 lines each)
- **Result**: Better tree shaking and bundle optimization

#### 2. Error Recovery

- **Before**: Single point of failure crashes entire header
- **After**: Component-level error boundaries isolate failures

#### 3. Maintainability Improvements

- **Before**: Complex state management in single component
- **After**: Focused state management per component concern

## Code Diffs

### CartPreview Component

```diff
+ Created: src/components/header/CartPreview.tsx
+ Features:
+   - Live cart count updates via API polling
+   - Event listener for cart updates
+   - Error handling for API failures
+   - Optimistic UI updates
+   - Accessible cart icon with proper labeling
```

### Search Component

```diff
+ Created: src/components/header/Search.tsx
+ Features:
+   - Modal-based search interface
+   - Keyboard shortcuts (Cmd+K, Ctrl+K, /)
+   - Focus management and accessibility
+   - Portal-based modal rendering
+   - Analytics integration ready
```

### Nav Component

```diff
+ Created: src/components/header/Nav.tsx
+ Features:
+   - Responsive navigation with mobile menu
+   - Mega menu support for complex navigation
+   - Keyboard navigation and accessibility
+   - ARIA compliance for screen readers
+   - Click outside to close functionality
```

### Refactored Header

```diff
+ Created: src/components/HeaderRefactored.tsx
+ Changes:
+   - Decomposed into smaller sub-components
+   - Added error boundary protection
+   - Improved prop passing and state management
+   - Enhanced accessibility and keyboard navigation
+   - Sentry error monitoring integration
```

### Error Monitoring

```diff
+ Created: src/components/ErrorBoundary.tsx
+ Created: src/lib/sentry-api.ts
+ Features:
+   - React error boundary with recovery
+   - API route error monitoring
+   - Request context and user tracking
+   - Structured error reporting
+   - Development vs production error handling
```

## Implementation Timeline

| Phase   | Duration    | Tasks                                        |
| ------- | ----------- | -------------------------------------------- |
| Phase 1 | ✅ Complete | Component decomposition and error boundaries |
| Phase 2 | 30 minutes  | Sentry installation and configuration        |
| Phase 3 | 1 hour      | Component migration and API route updates    |
| Phase 4 | 2 hours     | Testing and validation                       |
| Phase 5 | Ongoing     | Performance monitoring and optimization      |

## Rollback Plan

If issues occur during migration:

1. **Quick Rollback** (2 minutes):

   ```tsx
   // In layout.tsx, change import back to:
   import Header from '@/components/Header';
   ```

2. **Component-Level Rollback**:

   - Individual components can be reverted while keeping others
   - Error boundaries provide automatic fallbacks

3. **API Route Rollback**:
   - Remove `withSentry` wrapper to revert to original error handling
   - Sentry monitoring can be disabled without affecting functionality

## Success Metrics

- **Code Maintainability**: Reduced component complexity (479 lines → ~150 lines per component)
- **Error Recovery**: Zero header crashes due to component-level error boundaries
- **Performance**: Faster initial page loads due to better code splitting
- **Monitoring**: 100% API route error coverage with Sentry integration
- **Accessibility**: All WCAG AA compliance maintained and improved

## Next Steps After Migration

1. **Monitor Sentry Dashboard**: Check error rates and performance metrics
2. **Optimize Bundle Size**: Analyze webpack bundle after decomposition
3. **Add Integration Tests**: Create tests for component interactions
4. **Performance Tuning**: Monitor Core Web Vitals improvements
5. **Documentation**: Update component documentation and usage examples

## Support and Resources

- **Sentry Documentation**: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **React Error Boundaries**: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
- **Next.js Error Handling**: https://nextjs.org/docs/advanced-features/error-handling
