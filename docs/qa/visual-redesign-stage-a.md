# Premium visual redesign — Stage A

Date: 2026-11-10. Scope: presentation of the existing two views. Stage B's cart confirmation overlay has **not** been implemented and requires explicit approval.

## Reference and design decision

Inspected the actual [Specter website](https://www.tryspecter.com/) in Chromium at desktop and mobile widths, including scrolling and mobile navigation. Its large, tightly spaced sans-serif headings, generous whitespace, near-white surfaces, restrained lavender accents, fine borders and pill-shaped actions informed the direction. Its brand, assets, content and complete layout were not copied. No external font or UI dependency was added.

The previous interface had modest heading contrast, flat card presentation and little separation between product information and purchasing controls. The original direction is an editorial technology storefront: warm paper background, ink typography, a single violet accent, inset image stages, a compact ITX monogram and a dark options panel. Global CSS tokens and CSS Modules retain the existing component boundaries.

The locally reviewed assignment wireframes (pp. 3–4) remain the structural reference: desktop search above/right of the grid, at most four products per row, desktop PDP image left/information right, mobile stacking and actions after all eleven specifications. No ratings, currency, discounts, stock claims, new routes or checkout were introduced.

## Implementation

- Header: original monogram, restrained navigation and visible confirmed-count badge; existing accessible names and announcements remain.
- Catalogue: editorial introduction, labeled pill-shaped search, inset product imagery, stronger model/price hierarchy, subtle hover treatment and consistent card proportions. Static decorative loading skeletons are hidden from assistive technology; loading announcements remain. Empty/error states use the same panel language.
- Detail: softly tinted image stage, larger product heading, readable semantic specification rows and contrasting options panel. Native radios, existing validation, inline success/error feedback and duplicate-submit protection are preserved.
- Reduced-motion preferences disable transitions. Focus rings, contrast and touch-sized option/Add controls are retained. No fetch, cache, storage, mutation ordering or session policy changed.

## Browser and visual evidence

Actual Chromium rendering was captured and visually inspected on desktop and mobile. Both views were measured at **320, 375, 390, 480, 768, 1280, 1440 and 1920 px**: no horizontal overflow; catalogue columns respectively **1/1/1/2/3/4/4/4**. PDP preserved eleven description terms, desktop columns and mobile stacking. Reduced-motion computed transitions were zero; the diagnostic recorded no page errors. Native browser zoom was verified at **200%**, with a 1280px window producing a 640 CSS-pixel layout without horizontal overflow on either view.

Loading, empty catalogue, GET failure, missing image/price and failed cart submission were also inspected with isolated mocked responses. The cart failure preserved the existing inline error treatment. No live cart mutations were made.

Calculated palette contrast: muted text on paper **5.79:1**, white on primary violet **6.33:1**, secondary text on the dark options panel **11.88:1**, error text on that panel **10.96:1**, and the light focus accent against selected options **6.08:1**. These sampled pairs are not an accessibility certification. Option labels are at least 44px high and Add is at least 52px high.

Screenshots use sanitized M01 product JSON. Before captures use an explicitly synthetic test image; final representative captures use four actual API JPEGs downloaded once for inspection, with existing fallbacks for other images. These temporary files are not application assets. Screenshots prove presentation, **not live API/session integration**. The observed first product photo is only 160×212px; limiting enlargement reduces but cannot eliminate softness. No replacement image provider or invented photography was added.

Local, unversioned evidence:

- Before: `/tmp/itx-before-{plp,pdp}-{1440,390}.png`.
- After: `/tmp/itx-stage-a-{plp,pdp}-{320,375,390,480,768,1280,1440,1920}.png`.
- States: `/tmp/itx-stage-a-{loading,empty,error,post-error}.png`.
- Zoom: `/tmp/itx-stage-a-zoom-{plp,pdp}.png`.
- Measurements: `/tmp/itx-stage-a-responsive.json`.

## Verification and limits

The existing empty-catalogue unit test now also checks the new panel heading/copy; no meaningful assertions or test cases were removed. Final execution passed: ESLint with zero warnings, **222 Vitest tests / 10 files**, production build (115 modules; CSS 12.62kB / 3.26kB gzip), and **60 Chromium E2E cases**. Playwright emitted only the existing NO_COLOR/FORCE_COLOR environment warning. Existing deterministic cart journeys remain distinct from live accumulation evidence.

B-01 remains open. Server-returned counts, `credentials: 'omit'`, independent count persistence and mutation ordering are unchanged. Real screen-reader testing and browser engines beyond Chromium remain unverified. Stage A does not introduce a dialog; focus trapping, Escape dismissal and confirmation-overlay regression cases belong to separately authorized Stage B.
