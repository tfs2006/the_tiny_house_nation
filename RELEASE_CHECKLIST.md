# Release Checklist: The Tiny House Nation

Use this checklist before publishing or updating the site to ensure everything is production-ready and compliant.

## 1. Sitemap & Robots.txt
- [x] Confirm `dist/sitemap-index.xml` is present and up to date
- [x] Confirm `public/robots.txt` references the correct sitemap URL

## 2. Build & Deploy Workflow
- [x] Run `npm run build` and verify all pages are generated without errors
- [x] Confirm GitHub Actions workflow is present and deploys to GitHub Pages
- [x] Confirm `dist/` output matches expected site structure

## 3. Affiliate Disclosures
- [x] Affiliate disclosure page is present, prominent, and Amazon-compliant
- [x] Inline affiliate disclosures appear near all affiliate links
- [x] All affiliate links use rel="nofollow sponsored noopener noreferrer"

## 4. Internal Linking
- [x] Navigation (header/footer) includes all key sections (Guides, States, Recommended, etc.)
- [x] All internal links work and point to correct URLs (including subpaths)
- [ ] No broken links (use a link checker if possible)

## 5. 404 Handling (GitHub Pages)
- [x] Custom 404.html exists in `dist/` and is user-friendly
- [ ] 404 page is linked from navigation or footer (optional but recommended)

## 6. Search Console & Analytics
- [ ] Add or update Google Search Console property for the deployed URL
- [ ] Submit sitemap.xml in Search Console
- [ ] Add analytics/tracking if desired (optional)

## 7. Final QA
- [ ] Check meta tags, Open Graph, and Twitter Card tags on key pages
- [ ] Validate JSON-LD/structured data (use Rich Results Test)
- [ ] Run Lighthouse for accessibility, SEO, and performance
- [ ] Review on mobile and desktop

---

**Sign-off:**
- [ ] All items above are complete and site is ready for public release
