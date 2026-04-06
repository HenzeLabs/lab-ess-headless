# Project File Cleanup Plan

**Date:** 2026-04-06
**Goal:** Clean up root-level clutter, archive stale docs, untrack build artifacts, reorganize loose files.

---

## Phase 1: Delete Ephemeral/Backup Files

Delete these files outright — they have zero ongoing value and are covered by git history:

```
rm build_output.txt
rm static-audit-details.log
rm unused-empty-todo-parse.log
rm audit-report.json
rm real-analytics-report.json
rm metafields-backup-20251022-131256.txt
rm package.json.bak2
rm .env.local.bak
rm scripts/quick-gtm-check.mjs.bak2
rm scripts/real-analytics-checker.mjs.bak
rm scripts/run-gtm-audit.mjs.bak
```

---

## Phase 2: Untrack Build Artifacts

These are in `.gitignore` but still tracked, or should be gitignored:

```bash
# Untrack playwright report (already in .gitignore but tracked)
git rm -r --cached playwright-report/

# Untrack test-results.json (already in .gitignore but tracked)
git rm --cached test-results.json

# Add .lighthouseci/ to .gitignore, then remove
echo ".lighthouseci/" >> .gitignore
git rm -r --cached .lighthouseci/

# Add testsprite_tests/ to .gitignore (one-time MCP test run, not maintained)
echo "testsprite_tests/" >> .gitignore

# Ensure quiz-testing/.env is ignored
echo "quiz-testing/.env" >> .gitignore
```

---

## Phase 3: Archive Stale Root Markdown Files

Move these 20 files from project root into `docs/archive/reports/`:

```bash
# Analytics cluster (6 files)
mv ANALYTICS_STATUS.md docs/archive/reports/
mv ANALYTICS_SUMMARY.md docs/archive/reports/
mv ANALYTICS_COMPLETE_SUMMARY.md docs/archive/reports/
mv ANALYTICS_ACCURACY_REPORT.md docs/archive/reports/
mv ANALYTICS_ACCURACY_FIX_SUMMARY.md docs/archive/reports/
mv ANALYTICS_DIAGNOSTIC_REPORT.md docs/archive/reports/

# Webhook cluster (3 files — keep SHOPIFY_WEBHOOK_SETUP.md, move to guides)
mv WEBHOOK_SETUP_CHECKLIST.md docs/archive/reports/
mv WEBHOOK_SUCCESS.md docs/archive/reports/
mv WEBHOOK_VERIFICATION.md docs/archive/reports/

# Clarity cluster (3 files)
mv CLARITY_FIX.md docs/archive/reports/
mv CLARITY_QUICK_FIX.md docs/archive/reports/
mv CLARITY_STATUS_REPORT.md docs/archive/reports/

# One-time status snapshots (7 files)
mv COMPLETE_STATUS.md docs/archive/reports/
mv DEMO_READY.md docs/archive/reports/
mv PRODUCTION_READY.md docs/archive/reports/
mv DEPLOYMENT_VERIFICATION.md docs/archive/reports/
mv DATA_VERIFICATION.md docs/archive/reports/
mv GIT_RELEASE_NOTES.md docs/archive/reports/
mv PHASE_2_KICKOFF.md docs/archive/reports/

# Remaining one-off root docs
mv ISSUES_TO_FIX.md docs/archive/reports/
mv UX_OPTIMIZATION_REPORT.md docs/archive/reports/
mv SHOPIFY_READ_CUSTOMERS_SCOPE.md docs/archive/reports/
mv ADMIN_DASHBOARD_ACCESS.md docs/archive/reports/
```

---

## Phase 4: Move Root Docs to Proper Locations

```bash
# Webhook setup guide → docs/guides/
mv SHOPIFY_WEBHOOK_SETUP.md docs/guides/

# Shopify metafields → docs/guides/
mv SHOPIFY_METAFIELDS_SETUP.md docs/guides/

# Deployment → merge intent with existing docs/PRODUCTION_DEPLOYMENT_GUIDE.md, then delete
rm DEPLOYMENT.md

# Environment setup → delete root copy, keep docs/ version
rm ENVIRONMENT_SETUP.md

# Quick references → docs/guides/
mv QUICK_COMMANDS.md docs/guides/
mv QUICK_START.md docs/guides/
mv DASHBOARD_GUIDE.md docs/guides/
```

---

## Phase 5: Reorganize Loose docs/ Files

Move loose files at `docs/` root into subdirectories:

```bash
# One-time reports → archive
mv docs/ANALYTICS_DEPLOYMENT_SUCCESS.md docs/archive/reports/
mv docs/GA4_DEPLOYMENT_CHECKLIST.md docs/archive/
mv docs/GTM_AUDIT_SUMMARY.md docs/archive/reports/
mv docs/GTM_VALIDATION_RESULTS.md docs/archive/reports/
mv docs/PRODUCTION_ANALYTICS_VALIDATION_REPORT.md docs/archive/reports/
mv docs/PRODUCTION_DEPLOYMENT_REPORT.md docs/archive/reports/
mv docs/SEARCH_IMPROVEMENTS_DEPLOYMENT.md docs/archive/
mv docs/PHASE_2_DEPLOYMENT.md docs/archive/
mv docs/PHASE_2_QUICKSTART.md docs/archive/

# Active guides → docs/guides/
mv docs/CLARITY_GTM_SETUP.md docs/guides/
mv docs/CLARITY_TECHNICAL_FIX.md docs/guides/
mv docs/COMPONENT_USAGE_EXAMPLES.md docs/guides/
mv docs/GA4_ALIGNMENT_GUIDE.md docs/guides/
mv docs/GTM_VALIDATION_GUIDE.md docs/guides/
mv docs/OPERATIONS_GUIDE.md docs/guides/
mv docs/ENVIRONMENT_SETUP.md docs/guides/
```

---

## Phase 6: Archive testsprite_tests/

```bash
mv testsprite_tests/ docs/archive/testsprite-2025/
```

---

## Phase 7: Commit

Stage all changes and commit:

```
git add -A
git commit -m "chore: project file cleanup — archive stale docs, remove temp files, untrack build artifacts

- Archive 20+ stale root markdown files to docs/archive/reports/
- Delete backup files (.bak, .log, temp .json)
- Untrack playwright-report/, .lighthouseci/, test-results.json
- Reorganize loose docs/ files into guides/ and archive/
- Move testsprite_tests/ to archive"
```

---

## Post-Cleanup: Expected Root Structure

After cleanup, the project root should contain only:

```
README.md              # Project overview
CHANGELOG.md           # Release history
TROUBLESHOOTING.md     # Active troubleshooting guide
HANDOFF.md             # Handoff document

# Config files
package.json / package-lock.json / tsconfig.json
next.config.mjs / tailwind.config.js
.eslintrc.json / .stylelintrc.json / .lighthouserc.json
.gitignore / .env* / next-env.d.ts / tsconfig.tsbuildinfo

# Directories
src/                   # Source code
docs/                  # All documentation
tests/                 # Playwright tests
scripts/               # Utility scripts
tools/                 # Shopify tools
public/                # Static assets
styles/                # Global styles
archive/               # Pre-launch audit archive
quiz-testing/          # Quiz validation (consider future cleanup)
.github/ .husky/ .claude/ .vercel/
```

---

## Notes for Implementation

- Run each phase sequentially — Phase 2 depends on Phase 1, etc.
- Phase 2 git commands must run before Phase 7's `git add`.
- If any `mv` target directory doesn't exist, `mkdir -p` it first.
- Don't delete `docs/PRODUCTION_DEPLOYMENT_GUIDE.md` — it's the canonical deployment doc.
- `HANDOFF.md` at root should stay — it's a recent (March 2026) active document.
- `TROUBLESHOOTING.md` stays — it's short (69 lines) and actively useful.
