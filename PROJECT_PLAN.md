# Project Plan: Astro Affiliate Site for GitHub Pages

## PHASE 1 — Baseline validation & cleanup
- [x] Verify astro.config.mjs has correct site and base for GitHub Pages
- [x] Ensure sitemap output is generated and robots.txt references the correct sitemap URL
- [x] Ensure JsonLd.astro is hardened (null guard + < escape) and all guide JSON-LD is inserted into <head> via head slot in BaseLayout
- [x] Acceptance: npm run build passes; dist contains sitemap; pages render correctly in npm run preview

## PHASE 2 — Compliance + affiliate link hygiene
- [x] Ensure AffiliateLink outputs safe attrs (target _blank + rel="nofollow sponsored noopener noreferrer")
- [x] Ensure a clear affiliate disclosure page exists and is linked from header/footer
- [x] Ensure Amazon disclosure sentence is included on the disclosure page
- [x] Acceptance: Disclosure visible, easy to find, and inline disclosure appears near affiliate links

## PHASE 3 — “Money pages” and internal linking
- [x] Ensure Guides pages have: summary, top picks, comparison table, how-to-choose, FAQs (no FAQ schema), and strong internal links to /recommended/ pages
- [x] Make sure “top picks” slugs are correct and products exist in products.json
- [x] Acceptance: At least 3 guides fully working, internally linked from Home and nav

## PHASE 4 — Programmatic SEO done safely (States hub)
- [x] Build /states index and /states/[slug]/ pages via getStaticPaths from states.json. Each state page has unique content, proper internal links, and structured data (JSON-LD). Navigation updated to include States. All state slugs valid and present.
- [x] Build and verify static output (npm run build: success, all /states pages generated, no errors)
- [x] Update PROJECT_PLAN.md and BUILD_LOG.md
Acceptance: /states index and detail pages generated for all states in states.json, navigation updated, build passes, and no errors.

## PHASE 5 — SEO polish & site quality
- [x] Add: editorial policy page, about page, contact page (simple), and improve footer links
- [x] Add canonical tags consistently, meta descriptions, and OpenGraph basics
- [x] Add a lightweight “last updated” visible stamp for guides/states
- [x] Acceptance: Consistent metadata across key pages; no broken links; Lighthouse baseline improvements where easy

## PHASE 6 — Release readiness checklist
- [x] Add a RELEASE_CHECKLIST.md with:
  - verify sitemap/robots
  - verify build/deploy workflow
  - verify affiliate disclosures
  - verify internal linking
  - verify 404 handling (GitHub Pages)
  - verify Search Console readiness notes
- [x] Acceptance: Document exists and is actionable
