# Package.json Changes Preview

## Current Dependencies (Next.js 15 + React 19)

```json
{
  "dependencies": {
    "next": "15.5.3",
    "react": "19.1.0",
    "react-dom": "19.1.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0"
  }
}
```

## Target Dependencies (Next.js 14 + React 18)

```json
{
  "dependencies": {
    "next": "14.2.15",
    "react": "18.3.1",
    "react-dom": "18.3.1"
  },
  "devDependencies": {
    "@types/react": "18.3.12",
    "@types/react-dom": "18.3.1"
  }
}
```

## Breaking Changes Summary

### Next.js 15 → 14 Breaking Changes

1. **Turbopack Configuration**

   - ❌ Remove top-level `turbopack` config
   - ✅ Use `experimental.turbo` if needed

2. **ModuleResolution**

   - ❌ `"moduleResolution": "bundler"`
   - ✅ `"moduleResolution": "node"`

3. **Experimental Features**
   - ❌ Some experimental APIs may not work
   - ✅ Use stable Next.js 14 features

### React 19 → 18 Breaking Changes

1. **New React 19 APIs**

   - ❌ `use()` hook
   - ❌ Form actions (automatic submission)
   - ❌ New concurrent features

2. **Component Types**

   - ❌ React 19 component typing
   - ✅ React 18 component typing

3. **Server Components**
   - ❌ React 19 server component features
   - ✅ React 18 server component features

## Compatibility Matrix

| Package      | Current | Target  | Status             |
| ------------ | ------- | ------- | ------------------ |
| next         | 15.5.3  | 14.2.15 | ⚠️ Major downgrade |
| react        | 19.1.0  | 18.3.1  | ⚠️ Major downgrade |
| react-dom    | 19.1.0  | 18.3.1  | ⚠️ Major downgrade |
| @types/react | 19.0.0  | 18.3.12 | ⚠️ Type changes    |
| next-pwa     | 5.6.0   | 5.6.0   | ✅ Compatible      |
| playwright   | 1.55.0  | 1.55.0  | ✅ Compatible      |
| typescript   | latest  | latest  | ✅ Compatible      |

## Risk Assessment

### High Risk (Manual Review Required)

- [ ] Components using React 19 features
- [ ] Server components with React 19 APIs
- [ ] Custom Turbopack configurations
- [ ] TypeScript moduleResolution changes

### Medium Risk (Likely Compatible)

- [ ] PWA functionality
- [ ] API routes
- [ ] Middleware
- [ ] Image optimization

### Low Risk (Should Work)

- [ ] CSS/Tailwind styles
- [ ] Static assets
- [ ] Most component logic
- [ ] Third-party integrations

## Pre-Migration Checklist

### Prerequisites

- [ ] Git repository is clean
- [ ] All changes are committed
- [ ] CI/CD pipeline is working
- [ ] Backup strategy in place

### Testing Strategy

- [ ] Run existing E2E tests
- [ ] Test core user flows manually
- [ ] Performance benchmarking
- [ ] PWA functionality verification

### Rollback Plan

- [ ] Backup branch created
- [ ] Config files backed up
- [ ] Quick rollback commands ready
- [ ] Team notification plan

## Migration Commands

### Option 1: Automated Script (Recommended)

```bash
# Run the automated migration script
./migrate-to-next14.sh
```

### Option 2: Manual Step-by-Step

```bash
# 1. Create backup
git checkout -b backup/next15-state
git add -A && git commit -m "Backup before migration"

# 2. Create migration branch
git checkout main
git checkout -b feat/downgrade-to-next14

# 3. Update dependencies
npm uninstall next react react-dom @types/react @types/react-dom
npm install next@14.2.15 react@18.3.1 react-dom@18.3.1
npm install --save-dev @types/react@18.3.12 @types/react-dom@18.3.1

# 4. Clean install
rm -rf node_modules package-lock.json .next
npm install

# 5. Update configs (see MIGRATION_GUIDE.md)
# 6. Test build
npm run build

# 7. Run tests
npm run test:core
npx playwright test
```

## Post-Migration Verification

### Build Verification

```bash
npm run build
npm run start
```

### Test Suite

```bash
npm run test:core
npm run test:e2e
npm run lint
npm run typecheck
```

### Performance Check

```bash
npm run lh  # Lighthouse audit
npm run analyze  # Bundle analysis
```

## Emergency Rollback

If the migration fails:

```bash
# Quick rollback to working state
git checkout backup/next15-state
git checkout -b rollback/restore-next15

# Or revert specific commits
git revert HEAD~1  # Revert last commit
```

## Support

If you encounter issues:

1. Check the `MIGRATION_GUIDE.md` for detailed solutions
2. Review the backup files: `*.backup`
3. Check git history for changes
4. Test in isolation to identify specific problems

The migration script includes comprehensive error handling and rollback capabilities.
