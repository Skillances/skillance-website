# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Visitors to skillance.co.za (marketing)** — People evaluating what Skillance is: customers, freelancers, partners, or press. They need a clear picture of the marketplace and how to get started.

**Marketplace users (signed-in or browsing)** — **Customers** book ID-verified local providers for jobs. **Freelancers** run their business (profile, jobs, messages, payouts) on web and mobile. **Admins** operate the platform behind protected routes.

**Beyond the App prospects** — South African business owners and operators who need **custom software** (SaaS, web/mobile apps, internal systems, integrations), not a marketplace booking. They compare studio credibility, approach, and fit before contacting the team.

## Product Purpose

Skillance operates a **marketplace** for booking verified service providers and a **studio practice (Beyond the App)** that designs and builds custom software for clients. The website is the public face for discovery, trust, marketplace entry, studio enquiries, legal/policy information, and authenticated product use.

Success for the public site means visitors understand which path fits them (book on the marketplace vs hire the studio), can act on that path, and trust claims backed by real evidence. Success for signed-in users means completing marketplace workflows safely and reliably.

## Positioning

- **Marketplace:** Customers book **independent, ID-verified providers** for jobs; freelancers operate as businesses on the same product (web + Flutter iOS/Android), backed by Skillance’s own APIs, identity, and payouts infrastructure.
- **Beyond the App:** The **same team** that builds and operates Skillance takes **custom software engagements** for other businesses—product discipline proven on a live platform, not a generic dev shop brochure.

A generic agency cannot truthfully claim both a live multi-surface marketplace product and the same builders on client work without hand-off theater.

## Operating Context

- **Primary domain:** `https://skillance.co.za` (see `src/beyond/content.ts` `SITE`).
- **Regions:** South Africa–focused copy and operations; registered entity **Rimitso Management Services (Pty) Ltd** (address in Beyond FAQs).
- **Studio contact:** `services@skillance.co.za` for Beyond enquiries (`BEYOND_EMAIL`, `ENQUIRY_MAILTO` in `src/beyond/content.ts`).
- **Routes (high level):** Public marketing (`/`, `/services`, `/contact`, policies, FAQ); **Beyond the App** at `/beyond/*`; **marketplace app** under paths such as `/home`, `/search`, bookings, chats, account; **auth** (`/login`, `/register`, `/forgot-password`); **admin** under `/admin`.
- **Implementation:** React, TypeScript, Vite, Tailwind, Radix UI; Beyond lazy-loaded with scoped styling (`src/beyond/`). Backend API and mobile apps are separate repositories; web talks to the Skillance API for marketplace features.
- **Beyond conversion (confirmed):** Primary goal is a **qualified project enquiry** via `services@skillance.co.za`. Secondary goal is to **steer appropriate visitors toward the Skillance marketplace** when booking a provider is the right fit—not conflating the two offers.

## Capabilities and Constraints

**Marketplace (product)**

- Browse/search, freelancer profiles, booking flows, messaging, documents, favorites, recurring bookings, account management (role-dependent).
- Auth-required areas use protected routes; admin is segregated.

**Beyond the App (studio marketing)**

- Persuade surfaces: overview, services, approach, work, contact (`src/beyond/content.ts`, `PAGES`, `NAV`).
- Services: web apps, mobile apps, business systems, integrations—scope agreed per project; **no published prices or standard timelines** in copy.
- Work: leads with **Skillance marketplace** as the flagship case study; additional client pieces only when approved for public listing.

**Content constraints (confirmed)**

- Do **not** invent clients, case studies, testimonials, statistics, prices, team rosters, or certifications (`src/beyond/content.ts` TODO).
- **Public evidence:** Skillance marketplace case study always allowed; **named client work only when explicitly approved** per piece.
- Placeholder or TODO copy must be replaced with owner-supplied facts, not fabricated marketing.

**Undecided / open**

- Full enquiry form vs mailto-only on Beyond contact (implementation may evolve).
- Portfolio entries beyond Skillance until approved and published.

## Brand Commitments

- **Names:** Skillance; studio line **Beyond the App**; legal entity Rimitso Management Services (Pty) Ltd where required.
- **Voice:** Direct, South African business context, no hype pricing or fake social proof; separate marketplace booking from custom build engagements clearly (see `FAQS` in `src/beyond/content.ts`).
- **Social (published):** Instagram, Facebook, LinkedIn URLs in `SOCIAL` (`src/beyond/content.ts`).
- **Visual:** Incumbent Beyond system (paper/pine, Fraunces/Outfit, studio chrome) and separate marketplace/marketing styling coexist in one repo; Impeccable `document` may record Beyond tokens without replacing product truth here.

## Evidence on Hand

| Evidence | Location / notes |
|----------|------------------|
| Skillance marketplace (flagship case study) | `SKILLANCE_CASE_STUDY`, `OWN_PLATFORM`, Work page; Flutter + React stack described in `content.ts` |
| Beyond copy, FAQs, services, approach steps | `src/beyond/content.ts` |
| Beyond imagery | `public/beyond/*` (hero, platform devices, etc.) |
| Marketplace UI | Implemented routes under `src/` (customer/freelancer flows) |
| Client case studies (named) | **None committed** until owner approves per piece |
| Testimonials, metrics, logos of clients | **Do not fabricate** |

## Product Principles

1. **Two front doors, one team** — Marketplace and Beyond stay distinct in language, CTAs, and FAQs; cross-steer only when it helps the visitor’s job.
2. **Proof over posture** — Lead with what Skillance actually ships and operates (marketplace), not generic agency claims.
3. **Honest scope** — No published studio pricing or timelines; discovery before commitment.
4. **No invented social proof** — Case studies, stats, and endorsements require real, approved sources.
5. **Production discipline** — Accessibility, performance, and policy pages (privacy, cookies, terms) are part of trust, not optional chrome.

## Accessibility & Inclusion

- Target WCAG-minded implementation on public and app surfaces (focus states, semantic structure, reduced-motion patterns where implemented).
- South African users: plain language, local context, POPIA-aligned privacy posture on policy routes (detail in legal pages, not restated here).
