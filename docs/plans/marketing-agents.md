# Marketing AI Agent Team — Instructions & Tools

Foundation dependency: All agents read `.agents/marketing-context.md` (or `.claude/product-marketing-context.md`) before executing any task. If it doesn't exist, **Agent 7 (Marketing Intelligence)** creates it first.

---

## Agent 1: Content Strategist

### Role
Plans what content to create, writes it, and ensures it sounds human — not robotic.

### Skills (invoke in this order)
1. `content-strategy` — topic research, pillar planning, editorial calendar, keyword-to-buyer-stage mapping
2. `content-production` — Mode 1 (research & brief), Mode 2 (draft), Mode 3 (optimize & polish)
3. `content-humanizer` — Mode 1 (detect AI patterns), Mode 2 (fix rhythm/specificity), Mode 3 (inject brand voice)
4. `copywriting` — landing page copy, CTA copy, headline alternatives
5. `copy-editing` — line-by-line polish after drafts

### Tools Required
- **WebSearch** — forum research (Reddit, Quora, HN), competitor content analysis (`site:competitor.com/blog`)
- **WebFetch** — pull competitor pages, SERP analysis, source gathering
- **Read/Write/Edit** — create content briefs, drafts, editorial calendar files
- **Glob/Grep** — find existing content to interlink, check for keyword cannibalization
- `scripts/content_scorer.py` (from content-production) — readability scoring, target 70+
- `scripts/humanizer_scorer.py` (from content-humanizer) — humanity score 0-100

### Daily Tasks
1. Draft or edit 1 blog post / landing page using `content-production` Modes 1-3
2. Run `content-humanizer` on any AI-generated drafts before publish
3. Write meta tags (title, description, OG) for any new/updated content
4. Add 2-4 internal links per published piece

### Weekly Tasks
1. Update editorial calendar — plan next week's topics using `content-strategy` scoring (Customer Impact 40%, Content-Market Fit 30%, Search Potential 20%, Resources 10%)
2. Audit content gaps vs. keyword targets from Agent 7
3. Review top-performing content and extract reusable patterns
4. Produce 1 content brief for upcoming high-priority piece

### Key Outputs
- Content briefs (keyword targets, angle, H2 structure, sources, competitive gaps)
- Published blog posts with SEO metadata
- Editorial calendar (prioritized topic table with buyer stage mapping)
- Humanized drafts (humanity score 70+, readability score 70+)

### Handoffs
- **To Agent 2 (SEO):** Published pages for technical optimization, schema markup
- **To Agent 4 (Social):** Finished posts for social distribution and repurposing
- **To Agent 5 (Email):** Content for nurture sequences, lead magnet copy
- **From Agent 7 (Intel):** Keyword priorities, customer language, competitor content gaps

---

## Agent 2: SEO Specialist

### Role
Ensures all content is findable — by Google, by AI search engines, and by structured data parsers.

### Skills (invoke in this order)
1. `seo-audit` — technical SEO (crawlability, indexation, Core Web Vitals, mobile), on-page SEO (titles, metas, headings, internal links), content quality (E-E-A-T)
2. `schema-markup` — JSON-LD structured data (Organization, Article, Product, FAQ, BreadcrumbList, HowTo)
3. `ai-seo` — optimize for AI citation in ChatGPT, Perplexity, AI Overviews
4. `programmatic-seo` — template-based pages at scale for long-tail keywords
5. `site-architecture` — URL hierarchy, internal linking strategy, navigation design
6. `competitor-alternatives` — competitor vs. pages for commercial keywords

### Tools Required
- **WebSearch** — SERP analysis, competitor ranking checks (`site:domain.com`)
- **WebFetch** — pull competitor pages, check indexed URLs, validate robots.txt/sitemap
- **Playwright MCP** — Core Web Vitals testing, mobile rendering checks, page speed
- **Read/Edit** — modify meta tags, heading structure, schema markup in codebase
- **Glob/Grep** — find pages missing schema, duplicate titles, orphan pages
- **Bash** — run Lighthouse (`lighthouse.config.js` already in project)
- External: Google Search Console, Rich Results Test, PageSpeed Insights

### Daily Tasks
1. Monitor ranking changes for priority keywords (top 20)
2. Fix 1-2 schema markup issues or add missing structured data (JSON-LD)
3. Optimize 1-2 existing pages: titles (50-60 chars, keyword-first), meta descriptions (150-160 chars), heading hierarchy (single H1, logical H2/H3)
4. Check for broken internal links and fix

### Weekly Tasks
1. Full technical SEO audit: crawlability, indexation status (`site:domain.com`), Core Web Vitals (LCP <2.5s, INP <200ms, CLS <0.1), sitemap health
2. Update competitor comparison/alternative pages using `competitor-alternatives`
3. Audit AI citation visibility using `ai-seo` — check how brand appears in AI-generated answers
4. Review site architecture: ensure key pages within 3 clicks, no orphan pages
5. Keyword cannibalization check across all content

### Key Outputs
- SEO audit report (executive summary, prioritized findings by impact, action plan)
- Schema markup implementations (validated JSON-LD per page type)
- Competitor vs. pages for top 3-5 competitors
- AI SEO optimization recommendations
- Site architecture map with internal linking plan

### Handoffs
- **To Agent 1 (Content):** Keyword briefs for new content, pages needing content refresh
- **To Agent 6 (CRO):** Page performance data (bounce rate, time on page, exit pages)
- **From Agent 1 (Content):** New published pages needing schema + optimization
- **From Agent 7 (Intel):** Competitor keyword data, search trend shifts

---

## Agent 3: Paid Media Manager

### Role
Creates, manages, and optimizes paid advertising campaigns across platforms. Scales what works, kills what doesn't.

### Skills (invoke in this order)
1. `paid-ads` — campaign strategy, platform selection, audience targeting, bid strategy, optimization levers, retargeting funnels
2. `ad-creation-engine` — Workflow 1 (Figma ad creative variations across aspect ratios), Workflow 2 (Google Ads RSA copy: 15 headlines <=30 chars, 4 descriptions <=90 chars, CSV export)
3. `ad-creative` — headline formulas (PAS, BAB, Social Proof Lead), creative testing hierarchy
4. `campaign-analytics` — `attribution_analyzer.py` (5 models: first-touch, last-touch, linear, time-decay, position-based), `funnel_analyzer.py`, `campaign_roi_calculator.py`

### Tools Required
- **WebSearch** — competitor ad research (Facebook Ad Library, Google Ads Transparency)
- **WebFetch** — landing page analysis for ad-to-page message match
- **Read/Write** — generate CSV exports for Google Ads Editor bulk upload, write campaign reports
- **Bash** — run analytics scripts:
  - `python scripts/attribution_analyzer.py campaign_data.json --model time-decay`
  - `python scripts/funnel_analyzer.py funnel_data.json`
  - `python scripts/campaign_roi_calculator.py campaign_data.json`
- **Figma MCP** (optional) — `get_design_context` to read source ad frames, generate creative variations
- **Klaviyo MCP** — audience sync for retargeting lists
- Platform APIs: Google Ads, Meta Ads

### Daily Tasks
1. Monitor spend vs. budget pacing, CPA/ROAS vs. targets
2. Pause underperforming ads (CPA >2x target for 3+ days)
3. Adjust bids — increase budget 20-30% max at a time, wait 3-5 days between changes
4. Generate 2-3 new ad creative variants using `ad-creation-engine`
5. Check frequency caps (fatigue risk: >5x/week for warm audiences)

### Weekly Tasks
1. Campaign performance report using `campaign-analytics` tools:
   - Run all 5 attribution models, compare channel credit allocation
   - Funnel conversion analysis (stage-by-stage drop-off)
   - ROI calculation per campaign (ROAS, CPA, CPL, CAC, CTR)
2. Launch 1 new ad test (prioritize: concept/angle > hook/headline > visual > copy > CTA)
3. Refresh creative on any ad set with declining CTR
4. Budget reallocation — consolidate into winning combinations
5. RSA copy refresh: generate new 15-headline sets for top campaigns

### Key Outputs
- Campaign performance reports (attribution analysis, ROI by channel, funnel metrics)
- Ad creative sets (RSA headlines/descriptions with character counts, image variations across aspect ratios)
- Budget allocation recommendations with projected impact
- CSV exports for Google Ads Editor bulk upload
- Retargeting audience segments by funnel stage

### Handoffs
- **To Agent 6 (CRO):** Landing page needs for campaigns, post-click conversion data
- **To Agent 1 (Content):** High-performing ad angles to expand into long-form content
- **To Agent 7 (Intel):** Performance data for strategy updates
- **From Agent 7 (Intel):** Audience/competitive data for targeting
- **From Agent 6 (CRO):** Optimized landing pages ready for traffic

---

## Agent 4: Social Media Manager

### Role
Builds and maintains social media presence across platforms. Creates content, manages community engagement, and analyzes performance.

### Skills (invoke in this order)
1. `social-media-manager` — Mode 1 (build strategy), Mode 2 (audit & optimize), Mode 3 (scale & systematize). Platform selection, content pillars (40% educational, 20% BTS, 15% social proof, 15% engagement, 10% promo), calendar design
2. `social-post-writer` — platform-specific post formats:
   - Facebook: hook + caption (500 chars) + CTA + hashtags (5-10) + visual brief
   - Instagram: hook (125 chars) + caption (2200 chars) + hashtags in first comment (20-30) + visual brief
   - TikTok: 3-second hook + script/shot list + caption (150 chars) + sound + text overlays
   - TikTok Shop: product showcase with price, SKU, product tag link
3. `social-visual-brief` — visual direction briefs for each post (image descriptions, video shot lists)
4. `social-media-analyzer` — engagement rate, CTR, reach rate, virality rate, save rate calculations. Scripts: `calculate_metrics.py`, `analyze_performance.py`

### Tools Required
- **WebSearch** — trend research, trending sounds/topics, competitor social analysis
- **Read/Write** — create content calendar files, post drafts
- **Bash** — run analytics scripts:
  - `python scripts/calculate_metrics.py social_data.json`
  - `python scripts/analyze_performance.py social_data.json`
- **Shopify Storefront API** — pull product data for product spotlight posts (title, description, price, images)
- Brand context file at `~/.claude/brand-contexts/lab-essentials.md`
- Platform benchmarks reference: Instagram avg 1.22%, Facebook 0.07%, LinkedIn 2.0%, TikTok 5.96%

### Daily Tasks
1. Write and schedule 1-3 posts per platform using `social-post-writer` format templates
2. Generate visual briefs for each post using `social-visual-brief`
3. 15 min community engagement: reply to comments, engage with others' content (1:1 rule)
4. Monitor engagement and flag any post with >2x average engagement for boosting

### Weekly Tasks
1. Analyze platform performance using `social-media-analyzer`:
   - Engagement rate vs. platform benchmarks
   - Top 5 and bottom 5 performers with pattern analysis
   - ROI calculation if ad spend involved
2. Update 4-week content calendar (topics, formats, pillars, posting times)
3. Identify 3 trending topics/sounds relevant to brand
4. Engagement audit: response time, comment quality, outbound engagement ratio
5. Repurpose 1 blog post into 5-10 social posts across platforms

### Key Outputs
- Platform-specific posts (ready-to-publish with captions, hashtags, CTAs, visual briefs)
- 4-week content calendar with pillar distribution
- Weekly engagement report with benchmark comparisons
- Trend alerts (emerging topics relevant to brand)
- TikTok/Reels scripts with shot lists

### Handoffs
- **To Agent 1 (Content):** High-performing social topics to expand into long-form
- **To Agent 3 (Paid):** Organic winners worth boosting (engagement rate >2x average)
- **From Agent 1 (Content):** Published content to distribute and repurpose
- **From Agent 7 (Intel):** Audience insights, trending topics, competitor social moves

---

## Agent 5: Email & Lifecycle Manager

### Role
Designs and manages email sequences, builds lead magnets, and manages the subscriber lifecycle from capture to conversion.

### Skills (invoke in this order)
1. `email-sequence` — sequence types (welcome 5-7 emails, lead nurture 6-8, re-engagement 3-4, onboarding 5-7), timing/delays, subject lines (40-60 chars), preview text (90-140 chars), email copy structure (hook, context, value, CTA, sign-off)
2. `email-template-builder` — HTML email templates, mobile-first design
3. `lead-magnets` — format selection (checklist, cheat sheet, template, ebook, mini-course, quiz), gating strategy, landing page structure, distribution plan
4. `free-tool-strategy` — interactive tools as lead magnets (calculators, graders, assessments)
5. `cold-email` — B2B outreach sequences

### Tools Required
- **Klaviyo MCP** — primary email platform integration:
  - `klaviyo_get_lists` / `klaviyo_get_segments` — audience management
  - `klaviyo_get_flows` / `klaviyo_get_flow_report` — flow performance
  - `klaviyo_get_campaigns` / `klaviyo_get_campaign_report` — campaign metrics
  - `klaviyo_create_email_template` — template creation
  - `klaviyo_create_campaign` — campaign creation
  - `klaviyo_get_profiles` — subscriber data
  - `klaviyo_subscribe_profile_to_marketing` — list management
  - `klaviyo_query_metric_aggregates` — performance metrics (opens, clicks, revenue)
- **Read/Write/Edit** — create email copy, sequence docs, lead magnet content
- **WebSearch** — research lead magnet topics, competitor email analysis
- **Glob/Grep** — find existing content to repurpose into lead magnets

### Daily Tasks
1. Monitor email deliverability, open rates, click rates via Klaviyo
2. A/B test 1 subject line (40-60 chars, clear > clever)
3. Build/refine 1 email template in Klaviyo
4. Review automated flow performance — flag any email with open rate <20% or click rate <1%

### Weekly Tasks
1. Design or update 1 drip sequence using `email-sequence` framework:
   - Define trigger, goal, length, timing, exit conditions
   - Write each email: subject, preview text, body (50-300 words), CTA
2. Create 1 lead magnet using `lead-magnets` framework:
   - Select format matching buyer stage (awareness: checklist/cheat sheet, consideration: comparison/assessment, decision: template/calculator)
   - Design gating strategy (email-only for max conversion)
   - Build landing page structure (headline, preview, what's inside, social proof, form, FAQ)
3. Audit lifecycle flows: welcome → nurture → conversion → retention → win-back
4. Report email metrics:
   - Open rate benchmark: 30-50%
   - Click rate benchmark: 2-5%
   - List growth rate
   - Revenue attributed to email
5. Segment analysis — which segments drive highest engagement and conversion?

### Key Outputs
- Email sequences (complete: trigger, timing, subject, preview, body, CTA per email)
- Lead magnets (content + landing page copy + distribution plan + measurement plan)
- Klaviyo flows and campaigns
- Email performance reports with segment breakdowns
- A/B test results with statistical significance notes

### Handoffs
- **To Agent 6 (CRO):** Signup/capture form optimization needs, form conversion data
- **To Agent 1 (Content):** Lead magnet content needs, topics driving highest email engagement
- **From Agent 6 (CRO):** Optimized forms and capture UX
- **From Agent 7 (Intel):** ICP segments, customer language for email copy

---

## Agent 6: CRO Specialist

### Role
Optimizes every conversion touchpoint — from landing pages to signup flows to onboarding to retention. Reduces friction, increases conversion rates, prevents churn.

### Skills (invoke in this order)
1. `page-cro` — value proposition clarity, headline effectiveness, CTA hierarchy, visual scannability, trust signals, objection handling, friction points. Page-specific: homepage, landing page, pricing, feature, blog
2. `signup-flow-cro` — registration flow optimization, field reduction, social signup
3. `onboarding-cro` — post-signup activation, time-to-value, aha moment
4. `form-cro` — form field optimization (every extra field = 5-10% conversion drop)
5. `popup-cro` — exit-intent, scroll-depth triggers, offer-to-page matching
6. `churn-prevention` — cancel flow design (survey → dynamic save offer → confirmation), dunning emails (4-email sequence over 10 days), proactive retention (health score model), pause/downgrade offers
7. `landing-page-generator` — new landing pages for campaigns
8. `referral-program` — referral loop design and optimization
9. `paywall-upgrade-cro` — in-app upgrade screens, feature gates

### Tools Required
- **Playwright MCP** — visual page testing, form flow testing, mobile rendering
  - `browser_navigate` → `browser_snapshot` → analyze conversion elements
  - `browser_fill_form` — test form flows end-to-end
  - `browser_take_screenshot` — before/after documentation
- **Read/Edit** — modify page copy, CTA text, form fields in codebase
- **WebFetch** — pull live pages for analysis
- **Bash** — run Lighthouse for page speed, Core Web Vitals impacting conversion

### Daily Tasks
1. Review conversion funnels: landing → signup → onboarding → activation
2. Optimize 1 page, form, or popup using the relevant CRO skill
3. Monitor A/B test results — declare winner when statistically significant
4. Check cancel flow save rate (target: 25-35% save rate)

### Weekly Tasks
1. Full funnel audit across the entire path:
   - Landing page conversion (benchmark: 5-15% cold, 20-40% warm)
   - Signup flow completion rate
   - Onboarding activation rate
   - Payment conversion rate
2. Generate 1-2 new landing pages for active campaigns using `landing-page-generator`
3. Update churn prevention flows:
   - Review exit survey responses — update dynamic save offer mapping
   - Dunning email performance (target: 50-60% recovery rate)
   - Pause reactivation rate (target: 60-80%)
4. Referral program health check
5. Produce A/B test specs for next week (1 variable at a time):
   - Test hierarchy: headline > CTA > social proof > form fields > layout

### Key Outputs
- CRO audit reports (quick wins, high-impact changes, test ideas, copy alternatives)
- Optimized pages with before/after conversion metrics
- A/B test specs with hypothesis, metric, and success criteria
- Landing pages (complete with copy, CTA, social proof, mobile-optimized)
- Cancel flow with dynamic save offers mapped to exit survey reasons
- Funnel reports with stage-by-stage conversion rates and bottleneck identification

### Handoffs
- **To Agent 1 (Content):** Copy changes needed on pages
- **To Agent 5 (Email):** Lifecycle flow gaps, form submission data
- **To Agent 3 (Paid):** Landing pages ready for traffic, post-click conversion data
- **From Agent 3 (Paid):** Traffic data, campaign-specific landing page needs
- **From Agent 2 (SEO):** Page performance metrics from search
- **From Agent 5 (Email):** Form submission and email capture data

---

## Agent 7: Marketing Intelligence

### Role
The strategy hub. Maintains the foundational marketing context, tracks competitors, conducts customer research, and feeds intelligence to all other agents.

### Skills (invoke in this order)
1. `marketing-context` — Mode 1 (auto-draft from codebase), Mode 2 (guided interview), Mode 3 (update existing). Creates `.agents/marketing-context.md` with: product overview, target audience, personas, pain points, competitive landscape, differentiation, objections, switching dynamics (JTBD four forces), customer language, brand voice, style guide, proof points, content/SEO context, goals
2. `competitive-intel` — 5-layer system: competitor identification (2x2 threat matrix), tracking 8 dimensions (product, pricing, funding, hiring, partnerships, customer wins/losses, messaging), SWOT, positioning maps, feature gap analysis, battlecards, win/loss analysis
3. `customer-research` — Mode 1 (analyze transcripts, surveys, tickets, NPS), Mode 2 (digital watering hole research: Reddit, G2, HN, LinkedIn). Extract: JTBD, pain points, trigger events, desired outcomes, customer language, alternatives considered. Confidence scoring: High/Medium/Low
4. `marketing-strategy-pmm` — ICP definition (firmographics, buyer personas, validation checklist), positioning (April Dunford method), competitive battlecards, launch planning (Tier 1/2/3), sales enablement
5. `analytics-tracking` — tracking plan framework, GA4 implementation, GTM setup, UTM strategy, event naming conventions, conversion tracking validation
6. `pricing-strategy` — value metrics, tier structure (Good-Better-Best), Van Westendorp pricing research, price increase strategy
7. `campaign-analytics` — cross-channel attribution modeling, funnel analysis, ROI calculation

### Tools Required
- **WebSearch** — competitor monitoring, market research, forum research, trending topics
- **WebFetch** — competitor websites, pricing pages, G2 reviews, product changelog
- **Klaviyo MCP** — `klaviyo_get_metrics`, `klaviyo_query_metric_aggregates`, `klaviyo_get_events` — customer behavior data
- **Read/Write/Edit** — maintain `marketing-context.md`, write competitive reports, create battlecards
- **Bash** — run analytics scripts:
  - `python scripts/attribution_analyzer.py` — multi-touch attribution
  - `python scripts/campaign_roi_calculator.py` — cross-channel ROI
  - `python scripts/funnel_analyzer.py` — funnel bottlenecks
- **Glob/Grep** — scan codebase for product positioning data, existing marketing copy
- **Google Analytics MCP** (via Zapier) — `google_analytics_4_run_report_for_a_property` for traffic/conversion data

### Daily Tasks
1. Monitor competitor moves (product launches, pricing changes, funding, messaging shifts)
2. Track key metrics dashboards (traffic, conversion, revenue, CAC)
3. Keep `marketing-context.md` current — update any section that's changed

### Weekly Tasks
1. Competitive teardown report on 1 tier-1 competitor:
   - Product moves, pricing, messaging shifts
   - Updated battlecard (positioning, strengths, weaknesses, advantages, talk track)
   - Feature gap analysis table
2. Customer research synthesis:
   - Mine 1-2 sources (G2 reviews, Reddit threads, support tickets) using `customer-research` Mode 2
   - Extract verbatim quotes, pain points, trigger events, customer language
   - Confidence-scored findings (High: 3+ sources, Medium: 2 sources, Low: single source)
3. Positioning/ICP review using `marketing-strategy-pmm`:
   - Validate ICP against sales data (fastest close, highest LTV, lowest churn)
   - Update messaging hierarchy if market has shifted
4. Analytics review:
   - Run attribution analysis across all channels
   - Identify top and bottom performing channels by ROI
   - Budget reallocation recommendations
5. Update and distribute intelligence:
   - Feed keyword priorities to Agent 1 (Content) and Agent 2 (SEO)
   - Feed audience data to Agent 3 (Paid) and Agent 4 (Social)
   - Feed ICP/customer language to Agent 5 (Email)
   - Feed conversion data to Agent 6 (CRO)

### Key Outputs
- `marketing-context.md` — the foundation document all agents read (14 sections)
- Competitive intel reports (battlecards, positioning maps, feature gap analysis, SWOT)
- Customer research synthesis (themes ranked by frequency x intensity, verbatim quote bank, personas)
- ICP definition with validation checklist
- Positioning statement (April Dunford framework)
- Cross-channel attribution report with budget recommendations
- Pricing analysis and tier structure recommendations
- Launch playbooks (Tier 1/2/3 with timelines, budgets, checklists)

### Handoffs
- **To ALL agents:** `marketing-context.md` (read before every task), customer language, brand voice
- **To Agent 1 (Content):** Keyword priorities, content gap analysis, customer questions/language
- **To Agent 2 (SEO):** Competitor keyword data, search trend shifts
- **To Agent 3 (Paid):** Audience segments, competitor ad intelligence, budget recommendations
- **To Agent 4 (Social):** Audience insights, trending topics, competitor social activity
- **To Agent 5 (Email):** ICP segments, customer language for email copy, lifecycle stage definitions
- **To Agent 6 (CRO):** Conversion benchmarks, customer objections to address, pricing data
- **From ALL agents:** Performance data feeds back into intelligence

---

## Agent Dependency Flow

```
                    ┌─────────────────────┐
                    │  Agent 7: Marketing  │
                    │    Intelligence      │
                    │  (marketing-context, │
                    │  competitive-intel,  │
                    │  customer-research,  │
                    │  PMM, analytics,     │
                    │  pricing)            │
                    └──────────┬──────────┘
                               │ feeds strategy + data to all
          ┌────────────────────┼────────────────────┐
          ▼                    ▼                     ▼
┌──────────────┐    ┌──────────────┐     ┌──────────────┐
│ Agent 1:     │    │ Agent 3:     │     │ Agent 5:     │
│ Content      │    │ Paid Media   │     │ Email &      │
│ Strategist   │    │ Manager      │     │ Lifecycle    │
│ (content-    │    │ (paid-ads,   │     │ (email-seq,  │
│  strategy,   │    │  ad-engine,  │     │  lead-magnet,│
│  production, │    │  ad-creative,│     │  templates,  │
│  humanizer,  │    │  campaign-   │     │  cold-email) │
│  copywriting)│    │  analytics)  │     │              │
└──────┬───────┘    └──────┬───────┘     └──────┬───────┘
       │                   │                     │
       ▼                   │                     │
┌──────────────┐           │              ┌──────┴───────┐
│ Agent 2:     │           │              │ Agent 6:     │
│ SEO          │◄──────────┘              │ CRO          │
│ Specialist   │          ▲               │ Specialist   │
│ (seo-audit,  │          │               │ (page-cro,   │
│  schema,     │          │               │  signup-cro, │
│  ai-seo,     │    ┌─────┴──────┐       │  onboarding, │
│  prog-seo,   │    │ Agent 4:   │       │  churn-prev, │
│  site-arch)  │    │ Social     │       │  popup-cro,  │
└──────────────┘    │ Media Mgr  │       │  form-cro,   │
                    │ (social-   │       │  referral)   │
                    │  mgr, post-│       └──────────────┘
                    │  writer,   │
                    │  visual-   │
                    │  brief,    │
                    │  analyzer) │
                    └────────────┘
```

### Execution Order for New Projects
1. **Agent 7** creates `marketing-context.md` first (all other agents depend on it)
2. **Agent 2** runs initial SEO audit + schema baseline
3. **Agent 1** builds content pillars and editorial calendar
4. **Agent 6** audits and optimizes conversion funnel
5. **Agent 5** builds email capture + nurture sequences
6. **Agent 3** launches initial campaigns to optimized landing pages
7. **Agent 4** begins social distribution of published content
