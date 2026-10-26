# Surface brief: Beyond home (`/beyond`)

**Target:** `src/beyond/pages/HomePage.tsx` (hero + proof band in scope)  
**Mode:** Persuade  
**Visual authority:** Incumbent Beyond system — refine, do not replace (`beyond.css`, `BeyondHero`, existing tokens and fonts).  
**Product:** `PRODUCT.md` (whole site; studio enquiry primary, marketplace secondary steer).

## Job and audience

South African business owners and operators evaluating whether Skillance can build **custom software** for them. They arrive skeptical of generic agencies, need clarity on **studio vs marketplace**, and decide whether to email `services@skillance.co.za`.

## Outcome and proof

- **Primary success:** Qualified **Start a project** enquiry (mailto / enquiry flow).
- **Secondary success:** One explicit path for visitors who need to **book a provider** on the marketplace — without diluting the studio offer.
- **Proof on page:** Real Skillance marketplace story and **existing product imagery** (`public/beyond/*`, platform devices). No invented clients, stats, or testimonials.

## Selected direction (structural / interaction thesis)

1. **Hero (incumbent cinematic):** Keep full-bleed atmospheric hero with pine scrim and rotating “We build [web apps | mobile apps | business systems]…” line. Improve craft (type scale, contrast, motion restraint) — not a new layout world or AI-mockup card grid.
2. **Proof band (first narrative scroll):** Story-led block (“We built Skillance for ourselves first”) paired with **credible product evidence** (devices / marketplace), flowing into **compact case-study proof** (Skillance marketplace) so the visitor understands *the same team ships and operates the product*.
3. **Marketplace steer:** **One** secondary text link (not a second primary button in the hero), placed where the studio/marketplace distinction is explained — e.g. after story copy or adjacent to case study: clear label that booking a provider is the marketplace, custom build is Beyond.

**Focal moment:** Visitor reads hero offer, scrolls once, and believes “these people run real software in SA” before scanning services/FAQ lower on the page.

## Scope and boundaries

**In scope**

- `BeyondHero` and hero-adjacent chrome behavior on home only.
- Story section (`HOME_STORY`) and proof sequencing through `SkillanceCaseStudy` / `OwnPlatform` on home — hierarchy and cross-links, not full rewrites of lower-page modules unless needed for the proof band.
- Insert/configure **one** marketplace secondary link per brief.

**Out of scope (leave structurally intact for this brief)**

- Services index (“Four ways…”), how-we-work steps, full FAQ accordion content, closing CTA section pattern, Beyond nav/footer shell.
- Marketplace app, auth, marketing `/` site.
- New visual identity or replacement world (no DESIGN.md rewrite in this shape).

**Anti-goals**

- Generic Dribbble/agency hero (four service cards, stock team photos, fake metrics).
- Dual competing primary CTAs in the hero.
- Conflating “hire the studio” and “book a freelancer” in one headline.
- Comp-led builds that ignore pixel reference of live `/beyond` (prefer screenshot-anchored comps or code-led refinement against incumbent).

## States and ranges

- Hero: rotating words (3), reduced-motion fallback, high-priority hero image.
- Proof: 2 story paragraphs, one product figure, case study compact variant; FAQ count unchanged below fold.
- Content ranges fixed in `src/beyond/content.ts` — do not invent new claims.

## Interaction and layout (intent)

- Reading order: offer → credibility → optional marketplace exit → (existing) services/work/FAQ for depth.
- Hero actions remain **Start a project** (primary) + **See how we work** (secondary studio path).
- Marketplace link: `by-textlink` or equivalent — visually subordinate to enquiry CTAs.
- Responsive: preserve cinematic hero behavior; proof band stacks story above media on narrow viewports.

## Constraints and open decisions

- **Platform:** web, lazy Beyond chunk, scoped `.by-scope` CSS.
- **Accessibility:** legible scrim/contrast on hero; focus states on new link.
- **Open:** Exact placement of marketplace link (story vs case study) — implementer picks the clearest reading-order option unless user specifies.
- **Comps:** No approved comp yet; next implementation pass should use **incumbent screenshot reference** or code-led polish per this brief, not rejected mockup directions.

**Shaped:** 2026-10-20. Confirmed via user answers (hero + proof scope, refine incumbent, one secondary marketplace link).
