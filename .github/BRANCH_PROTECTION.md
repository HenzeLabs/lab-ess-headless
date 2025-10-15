# Branch Protection Configuration

This document outlines the recommended branch protection rules for the repository to ensure code quality and prevent direct pushes to protected branches.

## Recommended Branch Protection Rules

### For `main` branch:

#### Required Status Checks

- ✅ **Require status checks to pass before merging**
- ✅ **Require branches to be up to date before merging**

**Required status checks:**

- `Code Quality & Type Safety`
- `Build Application`
- `E2E Tests (Playwright) (chromium)`
- `E2E Tests (Playwright) (firefox)`
- `Performance Audit (Lighthouse)`
- `Security & Dependency Audit`
- `Deployment Readiness`

#### Additional Protection Rules

- ✅ **Require pull request reviews before merging**

  - Required approving reviews: **1**
  - Dismiss stale reviews when new commits are pushed
  - Require review from code owners (if CODEOWNERS file exists)

- ✅ **Restrict pushes that create files larger than 100MB**

- ✅ **Require signed commits** (recommended for security)

- ✅ **Include administrators** (apply rules to repository administrators)

### For `develop` branch:

#### Required Status Checks

- ✅ **Require status checks to pass before merging**
- ✅ **Require branches to be up to date before merging**

**Required status checks:**

- `Code Quality & Type Safety`
- `Build Application`
- `E2E Tests (Playwright) (chromium)` (minimum browser for faster feedback)

#### Additional Protection Rules

- ✅ **Require pull request reviews before merging**
  - Required approving reviews: **1**

## Setting Up Branch Protection (GitHub UI)

1. Navigate to **Settings** → **Branches** in your repository
2. Click **Add rule** for each branch
3. Configure the following:

### Main Branch Protection

```
Branch name pattern: main

☑️ Require a pull request before merging
  ☑️ Require approvals: 1
  ☑️ Dismiss stale pull request approvals when new commits are pushed
  ☑️ Require review from code owners

☑️ Require status checks to pass before merging
  ☑️ Require branches to be up to date before merging
  Required status checks:
    - Code Quality & Type Safety
    - Build Application
    - E2E Tests (Playwright) (chromium)
    - E2E Tests (Playwright) (firefox)
    - Performance Audit (Lighthouse)
    - Security & Dependency Audit
    - Deployment Readiness

☑️ Require signed commits
☑️ Include administrators
☑️ Restrict pushes that create files larger than 100MB
```

### Develop Branch Protection

```
Branch name pattern: develop

☑️ Require a pull request before merging
  ☑️ Require approvals: 1

☑️ Require status checks to pass before merging
  ☑️ Require branches to be up to date before merging
  Required status checks:
    - Code Quality & Type Safety
    - Build Application
    - E2E Tests (Playwright) (chromium)

☑️ Include administrators
```

## Alternative: GitHub CLI Setup

You can also set up branch protection using GitHub CLI:

```bash
# Install GitHub CLI if not already installed
# https://cli.github.com/

# Main branch protection
gh api repos/:owner/:repo/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"checks":[{"context":"Code Quality & Type Safety"},{"context":"Build Application"},{"context":"E2E Tests (Playwright) (chromium)"},{"context":"E2E Tests (Playwright) (firefox)"},{"context":"Performance Audit (Lighthouse)"},{"context":"Security & Dependency Audit"},{"context":"Deployment Readiness"}]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  --field restrictions=null

# Develop branch protection
gh api repos/:owner/:repo/branches/develop/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"checks":[{"context":"Code Quality & Type Safety"},{"context":"Build Application"},{"context":"E2E Tests (Playwright) (chromium)"}]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1}' \
  --field restrictions=null
```

## CODEOWNERS File (Optional)

Create a `.github/CODEOWNERS` file to automatically request reviews from specific team members:

```
# Global owners
* @your-team

# Frontend-specific
/src/ @frontend-team
/components/ @frontend-team

# CI/CD and infrastructure
/.github/ @devops-team
/docker* @devops-team
/deployment/ @devops-team

# Tests
/tests/ @qa-team @frontend-team
```

## Quality Gates Summary

With this branch protection setup, the following quality gates are enforced:

1. **Code Quality**: TypeScript compilation + ESLint rules
2. **Build Success**: Application builds without errors
3. **Cross-Browser Testing**: Playwright tests on Chromium + Firefox
4. **Performance Standards**: Lighthouse audits with Core Web Vitals
5. **Security**: Dependency vulnerability scanning
6. **Code Review**: Human review required before merging
7. **Branch Currency**: Branches must be up-to-date with target branch

This ensures that only high-quality, tested code reaches your main branches and ultimately production.
