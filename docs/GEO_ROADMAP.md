# Skillance GEO (Generative Engine Optimization) Roadmap

> **Goal:** When someone asks ChatGPT, Perplexity, Claude, Gemini, or Google AI Overviews questions like *"best freelancer service in South Africa"*, *"where to find a verified tutor in Cape Town"*, or *"how do I hire a plumber in Johannesburg"*, Skillance is surfaced and cited by name.

This doc is the follow-up plan to the GEO hygiene work (`public/llms.txt`, `public/llms-full.txt`, `public/robots.txt`, and the expanded JSON-LD in `index.html`).

---

## Why the current hygiene fixes aren't enough

LLM assistants quote pages whose **content already matches the user's phrasing**. Our homepage is brand-heavy; a user asking "find a tutor in Cape Town" sees no page on `skillance.co.za` whose `<h1>` matches that intent. Search engines rank query-shaped pages; those rankings feed the retrieval step of ChatGPT Search, Perplexity, and Google AI Overviews.

We need **content pages that exist for each (category × city) query pattern**.

---

## Scope C — Content strategy

### C.1 Category landing pages (hub)

Goal: give each top-level category a rich, crawlable URL instead of the JS-rendered `/category/:id`.

**Route pattern:** `/services/<category-slug>`
- `/services/handyman`
- `/services/tutors` (alias to `education`; the user-intent word is "tutors", not "education")
- `/services/cleaning`
- `/services/pet-care`
- `/services/fitness`
- `/services/automotive`
- `/services/gardening`
- `/services/it-support`
- `/services/professional-services`
- `/services/beauty`
- `/services/photography`
- `/services/videography`
- `/services/music`

**Each page includes:**
- Query-shaped `<h1>`: *"Hire verified [category] in South Africa"*
- Intro paragraph ~120 words answering the top-of-funnel question
- Subcategory grid (Plumbers, Electricians, etc.) with per-subcategory blurbs
- "How it works in 3 steps" (search → book → pay)
- Verification, pricing, and escrow summary (short)
- 5–8 FAQ accordion items with category-specific `FAQPage` JSON-LD
- `BreadcrumbList` JSON-LD: Home → Services → Category
- `Service` JSON-LD (already defined in `@graph`) linked by `mainEntity`
- CTA: "Browse [category] near me" + App Store / Play Store badges
- Internal links: to siblings (3–4) and to top city pages (below)

### C.2 Subcategory pages (spoke)

**Route pattern:** `/services/<category>/<subcategory>`
- `/services/handyman/plumbers`
- `/services/handyman/electricians`
- `/services/handyman/painters`
- `/services/tutors/maths` (Mathematics tutors — highest query volume in SA)
- `/services/tutors/physical-sciences`
- `/services/tutors/english`
- `/services/tutors/afrikaans`
- `/services/cleaning/deep-cleaning`
- `/services/cleaning/office-cleaning`
- `/services/pet-care/dog-walking`
- `/services/automotive/mobile-mechanic`
- `/services/photography/wedding`
- ...

Same template as category pages but more specific: copy, FAQs, and examples are subcategory-specific.

### C.3 City landing pages

**Route pattern:** `/in/<city-slug>`
- `/in/johannesburg`
- `/in/pretoria`
- `/in/cape-town`
- `/in/durban`
- `/in/gqeberha` (+ redirect from `/in/port-elizabeth`)
- `/in/bloemfontein`
- `/in/east-london`
- `/in/pietermaritzburg`
- `/in/centurion`
- `/in/stellenbosch`

Each is a "verified freelancers in [City]" hub that cross-links all categories available there. `LocalBusiness` JSON-LD per city with `address` (service area, not a physical address).

### C.4 (Category × City) pages — the big GEO unlock

**Route pattern:** `/services/<category>/in/<city>`
Or flipped: `/in/<city>/<category>`

These are the pages that rank for the exact query users type:
- "plumber in Johannesburg" → `/services/handyman/plumbers/in/johannesburg`
- "Maths tutor in Cape Town" → `/services/tutors/maths/in/cape-town`
- "dog walker in Pretoria"
- "deep cleaning in Durban"
- "wedding photographer in Stellenbosch"

**Priority matrix (build in this order):**

| Priority | Category | Cities |
|---|---|---|
| P0 | Tutors (Maths, Science, English) | Johannesburg, Pretoria, Cape Town, Durban |
| P0 | Handyman (Plumbers, Electricians) | Johannesburg, Pretoria, Cape Town, Durban |
| P1 | Cleaning | Johannesburg, Pretoria, Cape Town, Durban |
| P1 | Pet Care (Dog walking) | Johannesburg, Pretoria, Cape Town |
| P1 | Automotive (Mobile mechanic) | Johannesburg, Pretoria, Cape Town |
| P2 | Wedding photographers | Cape Town, Stellenbosch, Johannesburg |
| P2 | Personal trainers | Johannesburg, Cape Town, Durban |

Generate with a templating layer — never hand-author each one.

### C.5 FAQ hub + article blog

- `/help/how-to-hire-a-plumber-in-south-africa`
- `/help/how-to-choose-a-tutor-for-matric-maths`
- `/help/how-much-does-a-deep-clean-cost-in-south-africa`
- `/help/questions-to-ask-a-wedding-photographer`

These are the pages Perplexity and Claude quote verbatim. Each 900–1,400 words, H2/H3 structure, `Article` + `FAQPage` JSON-LD.

### C.6 Reviews surfacing for `AggregateRating`

Once there are public customer reviews (or platform ratings), expose them on category pages and add `AggregateRating` to the relevant `Service` node in the JSON-LD `@graph`. This is a very high-signal field for Google / LLM retrieval.

---

## Technical enablers

### T.1 SSR / prerender

The site is a pure Vite SPA. AI crawlers (GPTBot, PerplexityBot, ClaudeBot) mostly **do not execute JavaScript**. The JSON-LD in `index.html` is fine because it's in the static HTML, but per-page content (category descriptions, FAQs, breadcrumbs) currently doesn't render for them.

**Options (pick one):**

1. **`vite-plugin-ssr` / Vike** — add SSR with static generation for content pages, client-side render for app/admin routes.
2. **`react-snap` or `@prerenderer/prerenderer`** — generate static HTML for a list of routes at build time. Simplest and cheapest.
3. **Migrate to Next.js** — biggest lift, long-term cleanest (ISR, Route Handlers, OG image generation).

Recommendation: start with **`@prerenderer/prerenderer` on Vite** for speed, migrate to Next.js when headcount allows.

### T.2 `BreadcrumbList` per route

Add a small React component `<BreadcrumbJsonLd items={...} />` that renders `<script type="application/ld+json">` with a `BreadcrumbList`. Mount it on every content route. Only useful once SSR/prerender is in place.

### T.3 Sitemap generation

Move `sitemap.xml` from a static file to a build step that reads the category / subcategory / city matrix and emits one URL per page. Include `<lastmod>` from the build timestamp.

### T.4 Dynamic OG images

Each content page wants a unique `og:image` (e.g. "Verified plumbers in Johannesburg · Skillance"). Can be generated with `@vercel/og` during ISR / build.

### T.5 Canonical discipline

Every programmatically-generated page (C.4) needs a strict `<link rel="canonical">` to avoid duplicate-content penalties, and a well-behaved 301 redirect map for alias slugs (`port-elizabeth` → `gqeberha`, `pe` → `gqeberha`, `joburg` → `johannesburg`, etc.).

### T.6 Regenerate `llms.txt` from real data

Once category / subcategory / city pages exist, auto-regenerate `public/llms.txt` during `vite build` so its "Service categories" section lists **real** page URLs (not just `/services`). Keep the hand-curated `llms-full.txt` as-is, but refresh it quarterly.

### T.7 Schema for mobile apps

Add `MobileApplication` JSON-LD once the app has public App Store / Play Store URLs so LLMs can cite the app listings directly when a user asks "is there a Skillance app?".

---

## Off-site GEO signals (outside codebase but critical)

These are what make the difference between "we have great structured data" and "ChatGPT actually mentions us":

1. **Wikipedia / Wikidata** — create a Wikidata entity for Skillance (company type, country, founded date, founder, official site) and, once you pass notability, a Wikipedia stub. LLMs lean heavily on Wikidata for entity resolution.
2. **High-authority SA directories** — list on Yoco, Bizcommunity, Creamer Media, African Business directories, JSE Small Cap watch, Disrupt Africa. LLMs quote these when asked about South African marketplaces.
3. **Press coverage** — even one TechCabal, Ventureburn, or Business Insider SA article moves the needle.
4. **Comparison content on third-party sites** — blog posts like "Top 5 South African freelancer platforms in 2026" where Skillance is #1. Pitch these to SA tech bloggers.
5. **Reddit / X / community presence** — answer in `r/southafrica`, `r/askSouthAfrica`, LinkedIn SA tech groups when people ask "where do I find a tutor". Don't spam; be helpful and link once.
6. **Direct submission to AI indexes** — submit the site to Perplexity's business listing, Bing Webmaster Tools (feeds ChatGPT Search), IndexNow, and Yandex Webmaster.
7. **Brand consistency** — every mention of Skillance across the web should spell it the same, carry the same tagline ("South African on-demand marketplace for verified freelancers"), and point to `skillance.co.za`.

---

## Milestones

### Milestone 1 — Prerender + category pages (2–3 weeks)
- [ ] Add `@prerenderer/prerenderer` to Vite build.
- [ ] Build `/services/<category>` template and static page for all 13 top-level categories.
- [ ] `BreadcrumbList` + category-specific `FAQPage` JSON-LD on each.
- [ ] Regenerate `sitemap.xml` from a categories list.
- [ ] Update `llms.txt` "Service categories" block to point at real URLs.
- [ ] Submit to Google Search Console, Bing Webmaster, IndexNow.

### Milestone 2 — City hubs + subcategory pages (2–3 weeks)
- [ ] `/in/<city>` for the 10 priority cities.
- [ ] `/services/<category>/<subcategory>` for top subcategories (Plumbers, Electricians, Maths tutors, Science tutors, Deep cleaning, Dog walking, Mobile mechanic, Wedding photographer).
- [ ] Internal linking audit (each hub links to top children and siblings).

### Milestone 3 — Programmatic (Category × City) pages (2 weeks)
- [ ] Template + generator for `/services/<category>/<subcategory>/in/<city>`.
- [ ] Launch P0 matrix first (Tutors × 4 cities, Plumbers × 4 cities, Electricians × 4 cities).
- [ ] Monitor GSC Coverage + CTR; expand to P1 after 6 weeks of ranking data.

### Milestone 4 — Help Center articles (ongoing)
- [ ] 2 long-form articles per week for 8 weeks (so 16 quotable articles).
- [ ] Each article targets a specific "how to hire X" / "how much does X cost" intent.
- [ ] `Article` + `FAQPage` JSON-LD on each.

### Milestone 5 — Off-site (parallel track, ongoing)
- [ ] Wikidata entry.
- [ ] SA directory listings (aim for 20 in 4 weeks).
- [ ] 2 pitched press placements.
- [ ] Active community presence in 3 SA subreddits / LinkedIn groups.

---

## Measuring success

- **Google Search Console:** impressions + clicks for "tutor in [city]", "plumber in [city]" queries.
- **Bing Webmaster:** same queries (feeds ChatGPT Search).
- **Manual LLM tests (run weekly):** ask ChatGPT, Perplexity, Claude, Gemini the target questions from this doc's intro; record whether Skillance is mentioned and whether it is cited (linked).
- **Perplexity "visited sources":** a direct proxy for whether our site is retrieved.
- **Referral traffic** from `chat.openai.com`, `perplexity.ai`, `gemini.google.com` (Vercel / GTM).

---

## Authors & review

Draft by: Kyle + AI pair (2026-04-20).
Review: update quarterly. Refresh `llms-full.txt` at the same cadence.
