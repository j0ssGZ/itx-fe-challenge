# Stage B — Responsive cart confirmation

Date: 2026-11-10. Explicitly authorized after Stage A review. Baseline main: `722da9730e3c35c1500b317164ef9da3de1e3cad` (Stage A plus two requested focus refinements). No new dependency, route, proxy, deployment or live cart mutation.

## Behavior and boundaries

ProductActions retains exact numeric selections and POST validation/duplicate protection. Only a validated successful response updates the existing provider and creates a confirmation snapshot of that submitted product and option names. Unmounted forms do not open stale dialogs; late valid mutations still update the shared provider under M07 ordering protections. Failure preserves selections/count and the existing inline alert; no modal opens. There is no local increment or invented cart total/content.

CartConfirmation renders via a React portal so the dark purchase panel's descendant styles do not affect modal controls. Native `showModal()` supplies the top layer and background inertness. An explicitly labeled/described dialog receives focus on its close control. Boundary Tab/Shift+Tab cycling keeps focus in the dialog; Escape and both close buttons dismiss and restore Add focus. Continue closes and navigates to `/`, where existing route focus takes over. Saved body overflow/padding styles are restored during cleanup, including history navigation and rapid remount. Pending status remains inline; successful confirmation has no additional live success region. The Header remains the shared count indicator.

CSS Modules provide a 480px right drawer at widths ≥768px and a full-width rounded bottom sheet below that width. Both use one implementation, restrained entrance/backdrop animations, bounded viewport height, internal overflow, overscroll containment and safe-area padding. Existing reduced-motion CSS disables animations. No close animation delays focus restoration or cleanup.

Mobile PDP now follows image → identity/price → one options/Add form → eleven specifications. Desktop retains image-left and specifications/actions-right with specifications first. This intentionally supersedes the earlier mobile-order proposal under the user's Stage B authorization; no duplicate form or disconnected sticky Add control is used.

## Image investigation and refinement

Before Stage B, missing/error URLs used a fallback, but pending lazy images had no visible loading indication and could look empty. Earlier dated evidence distinguishes remote timeouts from observed reachable, low-resolution JPEGs. No new remote probes were necessary for this UI change.

Now pending images display quiet, decorative loading text; missing URLs immediately show an accessible unavailable-photo graphic/message; browser error events select that same fallback without retry. Native image error events do not reliably distinguish timeout, DNS failure or broken URL, so the UI does not invent a cause. A pending request is not falsely classified as unavailable after an arbitrary timer. Frame sizing remains stable; successful images keep their aspect ratio and are capped at 1.5× their natural dimensions to limit excess enlargement. No photo provider, fabricated device representation or bundled product photo was introduced.

## Verification evidence

Unit/integration tests exercise product/options/count presentation, close/cancel, focus boundaries/restoration, route/unmount scroll cleanup, pending/error/missing/loaded image states and natural-size caps. Existing tests retain exact payload, repeated/decreasing count authority, persistence, failed response preservation, duplicate submission and mutation ordering assertions. Tests affected by the new modal explicitly close it rather than bypassing its behavior.

Chromium E2E verifies native inertness, keyboard boundaries, Escape, repeated `1`, responsive geometry/animations, reduced motion, catalogue continuation, history cleanup, missing/error/pending sources and low-resolution image caps. jsdom only emulates dialog's imperative open/close API; it is not evidence for native modal behavior. All automated requests are intercepted M01-based samples or explicitly synthetic robustness fixtures; they never mutate the live API.

Manual browser diagnostics measured both views/confirmation at **320, 375, 390, 480, 768, 1280, 1440 and 1920px**, with no horizontal overflow or page errors. Screenshots were inspected in Chromium. Native **200%** browser zoom was also exercised in an isolated temporary profile, producing a 640 CSS-pixel layout from a 1280px window; overflowing sheet content remains internally scrollable. Actual safe-area inset values on a physical notched device were not measured.

Representative screenshots are outside Git:

- `/tmp/itx-stage-b-detail-{320,375,390,480,768,1280,1440,1920}.png`.
- `/tmp/itx-stage-b-confirmation-{320,375,390,480,768,1280,1440,1920}.png`.
- `/tmp/itx-stage-b-zoom-confirmation.png` and `/tmp/itx-stage-b-zoom-actions.png`.
- `/tmp/itx-stage-b-responsive.json` contains measured geometry.
- `/tmp/itx-stage-b-images-{390,1440}.png` and `/tmp/itx-stage-b-confirmation-fallback.png` show unavailable-photo treatments.

Visual captures use mocked M01 JSON/counts and the previously downloaded actual first-product JPEG where available. They demonstrate layout, not live accumulation. B-01 remains accepted/open; credentials, session behavior, API/cache TTL, persistence and ordering policy are unchanged. Real screen-reader/physical-device testing and engines beyond Chromium remain human verification items.

Final gates passed: **232 Vitest tests in 11 files** (+10 cases), **72 Chromium E2E cases** (+12), ESLint with zero warnings and production build (117 modules; JS 279.99kB / 88.69kB gzip, CSS 16.90kB / 4.12kB gzip). Initial browser tests exposed the native Tab-boundary behavior, which was repaired with explicit cycling; locator strictness and CSS Module animation-name assertions were also corrected before the final full gate. Playwright's existing NO_COLOR/FORCE_COLOR environment warning remains non-fatal. No meaningful baseline cases were removed.
