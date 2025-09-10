#!/usr/bin/env bash
set -euo pipefail

say(){ printf "\n=== %s ===\n" "$1"; }

# 0) Git safety
say "Create working branch"
git switch -c "prep/harden-$(date +%Y%m%d%H%M)" || git checkout -b "prep/harden-$(date +%Y%m%d%H%M)" || true

# 1) Baseline & clean
say "Baseline: Node + clean install + purge caches"
node -v || true
# Source nvm if available
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 20
npm -v
rm -rf .next .turbo .vercel node_modules/.cache
npm ci
git add -A && git commit -m "chore: baseline clean" || true

# 2) Env & secrets sanity
say "Env keys: compare .env.example vs .env.local"
cut -d= -f1 .env.example | sort > /tmp/ex || true
cut -d= -f1 .env.local   | sort > /tmp/loc || true
echo "Missing in .env.local (if any):"; comm -23 /tmp/ex /tmp/loc || true

say "Secret scan for hardcoded values (quick)"
if command -v rg >/dev/null 2>&1; then
  rg -n "(TOKEN|SECRET|API_KEY)=[^$]" -g "!*.env*" || true
else
  grep -RInE "(TOKEN|SECRET|API_KEY)=[^$]" . --exclude-dir=.git --exclude="*.env*" || true
fi
git add -A && git commit -m "chore: env & secrets sanity" || true

# 3) Static correctness
say "Typecheck (must be clean)"
npx tsc --noEmit

say "Lint (errors only)"
npx eslint . --max-warnings=0

say "Prettier check"
npx prettier --check .

git add -A && git commit -m "chore: types/lint/format clean" || true

# 4) Project sanity greps
say "Footguns: bad catches, stray any, artifact reads"
if command -v rg >/dev/null 2>&1; then
  rg -n "catch \(err: Error\)" src app lib || true
  rg -n ": any\b" src app lib || true
  rg -n "routes-manifest\.json" . || true
else
  grep -RIn "catch (err: Error)" src app lib || true
  grep -RIn ": any\b" src app lib || true
  grep -RIn "routes-manifest\.json" . || true
fi
echo "If any hits above: fix, then re-run this section."
git add -A && git commit -m "chore: footgun scan" || true

# 5) Dependencies & dead code
say "Vulnerability scan"
npm audit --production || true

say "Unused/missing deps (depcheck)"
npx depcheck || true

say "Unused TS exports (ts-prune)"
npx ts-prune || true

git add -A && git commit -m "chore: deps/dead-code pass" || true

# 6) Local runtime smoke (manual)
say "Manual step: run dev, exercise routes, fix first error"
echo "Run: npm run dev"
echo "Visit: / , /collections/<handle> , /products/<handle> ; add to cart, checkout."
echo "Stop dev when stable, commit fixes."

# 7) Production build health
say "Production build (must pass)"
npm run build

say "Optional: bundle analyzer"
ANALYZE=true npm run build || true

git add -A && git commit -m "build: production-green" || true

# 8) A11y/SEO/links quick checks (requires dev running)
say "Optional quick checks (run with dev server ON in another terminal)"
echo "Accessibility (axe): npx @axe-core/cli http://localhost:3000 \
http://localhost:3000/collections/<handle> \
http://localhost:3000/products/<handle>"
echo "Lighthouse sanity: npx @lhci/cli autorun --collect.url=http://localhost:3000 --collect.numberOfRuns=1"
echo "Broken links: npx linkinator http://localhost:3000 --recurse --skip '.*logout.*'"

say "Done. You’re ready to tweak design."
