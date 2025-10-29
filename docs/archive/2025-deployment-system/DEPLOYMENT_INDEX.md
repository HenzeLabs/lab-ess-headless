# Deployment System Index

Complete guide to the Lab Essentials headless storefront deployment infrastructure.

---

## 🚀 Quick Start

**First time here?** Start with these three documents:

1. **[FINAL_PRE_LAUNCH_SUMMARY.md](./FINAL_PRE_LAUNCH_SUMMARY.md)** - Current system status, launch readiness
2. **[DEPLOYMENT_QUICK_REFERENCE.md](./DEPLOYMENT_QUICK_REFERENCE.md)** - Command cheat sheet
3. **[DEPLOYMENT_PLAYBOOK.md](./DEPLOYMENT_PLAYBOOK.md)** - Step-by-step deployment guide

**Ready to launch?**
```bash
./scripts/final-pre-launch-check.sh
npm run release:prepare v1.0.0
vercel --prod
./scripts/post-deploy-validation.sh https://store.labessentials.com
```

---

## 📋 Document Directory

### 🎯 Core Deployment

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **[FINAL_PRE_LAUNCH_SUMMARY.md](./FINAL_PRE_LAUNCH_SUMMARY.md)** | Complete system status, launch checklist | Before every production deployment |
| **[DEPLOYMENT_PLAYBOOK.md](./DEPLOYMENT_PLAYBOOK.md)** | Step-by-step deployment guide (650 lines) | During deployment execution |
| **[DEPLOYMENT_QUICK_REFERENCE.md](./DEPLOYMENT_QUICK_REFERENCE.md)** | One-page command cheat sheet | Quick command lookup |
| **[DEPLOYMENT_SYSTEM_README.md](./DEPLOYMENT_SYSTEM_README.md)** | System overview, training guide | Onboarding new team members |

### 🔍 Quality & Auditing

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **[DEPLOYMENT_AUDIT.md](./DEPLOYMENT_AUDIT.md)** | Complete audit system documentation | Understanding quality gates |
| **[deployment-gates.config.json](./deployment-gates.config.json)** | Quality gate thresholds | Adjusting gate parameters |

### 🔄 Rollback & Recovery

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **[ROLLBACK_PROCEDURES.md](./ROLLBACK_PROCEDURES.md)** | Rollback decision tree & procedures | When deployment fails |
| **[DISASTER_RECOVERY_DRILL_GUIDE.md](./DISASTER_RECOVERY_DRILL_GUIDE.md)** | Comprehensive drill procedures | Quarterly disaster recovery drills |
| **[ROLLBACK_LOG.md](./ROLLBACK_LOG.md)** | Historical rollback event log | After any rollback or drill |

### 📊 Monitoring & Observability

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **[OBSERVABILITY_SETUP.md](./OBSERVABILITY_SETUP.md)** | Monitoring configuration guide | Setting up Sentry, alerts, RUM |
| **[CONTINUOUS_IMPROVEMENT.md](./CONTINUOUS_IMPROVEMENT.md)** | CI tracking & regression prevention | Monthly reviews, trend analysis |

---

## 🛠️ Scripts Directory

### Pre-Deployment

| Script | Purpose | Usage |
|--------|---------|-------|
| `pre-deploy-checklist.mjs` | Main audit orchestrator (11 checks) | `npm run pre-deploy` |
| `final-pre-launch-check.sh` | Comprehensive 14-section validation | `./scripts/final-pre-launch-check.sh` |
| `prepare-release.sh` | 8-step release preparation | `npm run release:prepare v1.0.0` |

### Individual Audits

| Script | Purpose | Usage |
|--------|---------|-------|
| `check-security.mjs` | Secret scanning, vulnerabilities | `npm run audit:security` |
| `check-bundle-size.mjs` | Bundle size validation | `npm run audit:bundle` |
| `validate-seo.mjs` | SEO configuration check | `npm run audit:seo` |
| `check-links.mjs` | Broken link detection | `npm run audit:links` |
| `deployment-audit.mjs` | Comprehensive audit | `npm run audit:deployment` |

### Post-Deployment

| Script | Purpose | Usage |
|--------|---------|-------|
| `post-deploy-validation.sh` | Automated post-deploy checks | `./scripts/post-deploy-validation.sh [URL]` |
| `emergency-rollback.sh` | One-click rollback (<60s) | `./scripts/emergency-rollback.sh` |

---

## 🧪 Test Directory

| Test Suite | Tests | Purpose | Usage |
|------------|-------|---------|-------|
| `post-deploy-smoke.spec.ts` | 17 | Critical path validation | `npm run test:smoke` |
| `checkout-flow.spec.ts` | Pending | E2E checkout testing | Post-launch expansion |
| `quiz-flow.spec.ts` | Pending | Quiz functionality | Post-launch expansion |
| `search-filters.spec.ts` | Pending | Search & filtering | Post-launch expansion |
| `analytics.spec.ts` | Pending | Event tracking validation | Post-launch expansion |

---

## ⚙️ CI/CD Workflows

### GitHub Actions

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| **deployment-gates.yml** | Push to main, PRs | 8 parallel quality gates |
| **scheduled-governance.yml** | Weekly (Sun 2 AM UTC) | Automated audits, bundle tracking |
| **lighthouse-ci.yml** | PRs, push to main | Performance regression detection |

### Quality Gates

1. **Code Quality:** TypeScript (0 errors), ESLint (0 errors)
2. **Security:** Secret scanning, npm audit (0 high/critical)
3. **Build:** Production build successful
4. **Core Tests:** Smoke tests passing
5. **Accessibility:** axe-core (0 critical)
6. **Lighthouse:** Perf ≥90, A11y/SEO/BP ≥95
7. **SEO:** Sitemap, robots.txt, meta tags
8. **Final Check:** Comprehensive validation

---

## 📊 Configuration Files

| File | Purpose |
|------|---------|
| `deployment-gates.config.json` | Quality gate thresholds, performance budgets |
| `.lighthouserc.json` | Lighthouse CI assertions and collection |
| `next.config.mjs` | Security headers, redirects, PWA config |
| `.eslintrc.json` | Linting rules and ignored paths |
| `package.json` | npm scripts and dependencies |
| `renovate.json` | Dependency automation (to be created) |

---

## 🎯 Common Tasks

### Pre-Deployment

```bash
# 1. Run quick pre-deploy check
npm run pre-deploy:quick

# 2. Run full pre-deploy audit
npm run pre-deploy

# 3. Final pre-launch validation
./scripts/final-pre-launch-check.sh

# 4. Prepare release with artifacts
npm run release:prepare v1.0.0
```

### Deployment

```bash
# Option 1: Vercel CLI
vercel --prod

# Option 2: GitHub Actions
# Navigate to Actions → Deployment Gates → Run workflow

# Option 3: Vercel Dashboard
# Visit vercel.com → Deploy → Production
```

### Post-Deployment

```bash
# 1. Automated validation
./scripts/post-deploy-validation.sh https://store.labessentials.com

# 2. Smoke tests
PRODUCTION_URL=https://store.labessentials.com npm run test:smoke

# 3. Manual checks
# - GA4 Real-Time events
# - Sentry dashboard
# - Vercel Analytics
# - Test checkout flow
```

### Rollback

```bash
# One-click emergency rollback
./scripts/emergency-rollback.sh

# Or manual via Vercel CLI
vercel ls --prod
vercel rollback [deployment-url] --prod
```

### Monitoring

```bash
# Weekly bundle size tracking
npm run audit:bundle

# Security audit
npm run audit:security

# Lighthouse audit
npm run audit:lighthouse

# Comprehensive deployment audit
npm run audit:deployment
```

---

## 📈 Metrics & Thresholds

### Performance Budgets

| Asset | Budget | Current | Utilization |
|-------|--------|---------|-------------|
| JavaScript | 1300 KB | 1207 KB | 93% |
| CSS | 150 KB | 121 KB | 81% |
| Third-Party | 200 KB | TBD | TBD |
| Fonts | 100 KB | TBD | TBD |

### Lighthouse Thresholds

| Category | Mobile | Desktop |
|----------|--------|---------|
| Performance | ≥90 | ≥95 |
| Accessibility | ≥95 | ≥95 |
| Best Practices | ≥95 | ≥95 |
| SEO | ≥95 | ≥95 |
| PWA | ≥95 | ≥95 |

### Core Web Vitals (p75 Mobile)

| Metric | Threshold | Current |
|--------|-----------|---------|
| LCP | ≤2.5s | TBD (post-launch) |
| INP | ≤200ms | TBD (post-launch) |
| CLS | ≤0.1 | TBD (post-launch) |

---

## 🚨 Emergency Procedures

### Critical Issue Decision Tree

```
Is production broken?
├─ Yes → How severe?
│  ├─ Critical → ROLLBACK NOW
│  │  • Error rate >5%
│  │  • Checkout broken
│  │  • Site down
│  │  • Security breach
│  │
│  └─ Minor → Can fix forward?
│     ├─ Yes (fix <10min) → Deploy fix
│     └─ No → ROLLBACK
│
└─ No → Monitor
```

### Rollback Execution

```bash
# 1. Execute rollback
./scripts/emergency-rollback.sh

# 2. Verify restoration
PRODUCTION_URL=https://store.labessentials.com npm run test:smoke

# 3. Document in ROLLBACK_LOG.md

# 4. Schedule post-mortem
```

### Emergency Contacts

- **Engineering Lead:** [Contact info]
- **DevOps:** [Contact info]
- **Vercel Support:** support@vercel.com
- **Shopify Support:** partners.shopify.com

---

## 📅 Operational Schedules

### Weekly (Automated)

- **Sunday 2:00 AM UTC:** Scheduled governance workflow
  - Comprehensive audit
  - Bundle size tracking
  - Dependency security scan
  - Performance baseline comparison

### Monthly (Manual)

- **First Monday:** Review previous month's metrics
  - Generate monthly report
  - Review bundle size trends
  - Analyze Core Web Vitals
  - Update action items

### Quarterly (Manual)

- **Disaster Recovery Drill:** Test rollback procedures
- **Dependency Review:** Major version updates
- **Performance Review:** Optimization opportunities
- **Documentation Update:** Keep guides current

---

## 🎓 Training & Onboarding

### New Team Member Checklist

1. **Read Core Documentation:**
   - [ ] [DEPLOYMENT_SYSTEM_README.md](./DEPLOYMENT_SYSTEM_README.md)
   - [ ] [DEPLOYMENT_PLAYBOOK.md](./DEPLOYMENT_PLAYBOOK.md)
   - [ ] [ROLLBACK_PROCEDURES.md](./ROLLBACK_PROCEDURES.md)

2. **Set Up Local Environment:**
   - [ ] Clone repository
   - [ ] Install dependencies: `npm install`
   - [ ] Configure environment variables
   - [ ] Run local build: `npm run build`

3. **Practice Workflows:**
   - [ ] Run pre-deploy checks: `npm run pre-deploy:quick`
   - [ ] Review quality gates: Read `deployment-gates.config.json`
   - [ ] Test rollback script in staging

4. **Shadow Deployment:**
   - [ ] Observe a production deployment
   - [ ] Review post-deploy validation
   - [ ] Participate in team debrief

5. **Solo Deployment (Supervised):**
   - [ ] Lead a staging deployment
   - [ ] Execute pre-deploy checks
   - [ ] Run post-deploy validation
   - [ ] Document lessons learned

---

## 🔗 External Resources

### Vercel
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Analytics](https://vercel.com/docs/analytics)

### Shopify
- [Shopify Partners](https://partners.shopify.com)
- [Storefront API Docs](https://shopify.dev/api/storefront)
- [Shopify Admin](https://[your-store].myshopify.com/admin)

### Monitoring
- Sentry: (To be configured post-launch)
- GA4: [Analytics Dashboard](https://analytics.google.com)
- Lighthouse CI: [GitHub Artifacts](https://github.com/[org]/[repo]/actions)

### Tools
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Web Vitals](https://web.dev/vitals/)
- [PageSpeed Insights](https://pagespeed.web.dev/)

---

## 📊 System Metrics

### Current Status (2024-10-24)

- **Quality Gates:** 6/6 critical passing ✅
- **TypeScript Errors:** 0 ✅
- **ESLint Errors:** 0 ✅
- **Build Status:** Passing ✅
- **Bundle Size:** Within budget ✅
- **Security:** 0 critical vulnerabilities ✅
- **Documentation:** Complete (10 guides) ✅

### Infrastructure

- **Scripts:** 10 automated scripts ✅
- **Tests:** 17 smoke tests ✅
- **CI/CD Workflows:** 3 configured ✅
- **Rollback RTO:** <60 seconds ✅

---

## 🎯 Roadmap

### Week 1 Post-Launch
- [ ] Capture CWV baseline (T+24h)
- [ ] Daily monitoring and bug triage
- [ ] User feedback collection
- [ ] Performance review

### Month 1 Post-Launch
- [ ] Expand test coverage (30 E2E tests)
- [ ] Install Renovate bot
- [ ] First disaster recovery drill
- [ ] Generate first monthly review

### Quarter 1 (Q1 2025)
- [ ] Quarterly performance review
- [ ] Lighthouse CI baseline comparison
- [ ] Dependency major version updates
- [ ] Documentation refresh

### Ongoing
- Weekly automated audits
- Monthly metric reviews
- Quarterly drills
- Continuous improvement

---

## 🤝 Contributing

### Making Changes to Deployment System

1. **Update Documentation:**
   - Keep deployment docs in sync with code
   - Update version numbers and dates
   - Add lessons learned from deployments

2. **Modify Scripts:**
   - Test changes in staging first
   - Update corresponding documentation
   - Add to CHANGELOG if significant

3. **Adjust Thresholds:**
   - Discuss with team before changing
   - Update `deployment-gates.config.json`
   - Document rationale in commit message

4. **Add New Checks:**
   - Create script in `scripts/`
   - Add to `pre-deploy-checklist.mjs`
   - Update documentation
   - Add to CI/CD workflow if needed

---

## 📝 Version History

### v1.0.0 (Pending - 2024-10-24)
- Initial production-ready deployment system
- 10 automated scripts
- 10 documentation guides
- 3 CI/CD workflows
- 17 smoke tests
- Comprehensive quality gates

### Future Versions
- v1.1.0: Expanded test coverage (30+ E2E tests)
- v1.2.0: Renovate bot integration
- v1.3.0: Enhanced monitoring (Sentry, SpeedCurve)

---

## ❓ FAQ

**Q: What's the fastest way to deploy to production?**
A: `npm run release:prepare v1.0.0 && vercel --prod`

**Q: How do I rollback a deployment?**
A: Run `./scripts/emergency-rollback.sh` and select the previous stable deployment.

**Q: What if a quality gate fails?**
A: Fix the issue locally, verify with `npm run pre-deploy`, then retry deployment.

**Q: How often should we run disaster recovery drills?**
A: Quarterly minimum, monthly recommended for critical systems.

**Q: Where can I see historical performance metrics?**
A: Check GitHub Actions artifacts for weekly reports, or generate monthly review.

**Q: What's the rollback SLA?**
A: <60 seconds from decision to application restored.

---

## 📞 Support

**Questions or issues with deployment?**
- Slack: #deployments
- Email: devops@labessentials.com
- On-call: [rotation link]

**Documentation issues?**
- Create issue: [GitHub Issues](https://github.com/[org]/[repo]/issues)
- PR welcome: Contributions appreciated

---

**Last Updated:** 2024-10-24
**Maintained By:** Engineering Team
**Next Review:** Post-launch (T+24h)

---

## Quick Navigation

- [🚀 Quick Start](#-quick-start)
- [📋 Document Directory](#-document-directory)
- [🛠️ Scripts Directory](#%EF%B8%8F-scripts-directory)
- [🎯 Common Tasks](#-common-tasks)
- [🚨 Emergency Procedures](#-emergency-procedures)
- [📊 System Metrics](#-system-metrics)
