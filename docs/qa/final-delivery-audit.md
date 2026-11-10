# Final delivery audit

Date: **2026-11-11**. Reviewed implementation: **`7affed6e8e26401e7a63a5b1262f19b2fa97e926`**, cloned independently from the public GitHub repository. This audit changes documentation only; no application/dependency fixes were justified. No deployment or submission was performed.

## Verdict

**READY WITH DOCUMENTED LIMITATIONS.** No application blocker was found within the approved two-view scope. Mandatory frontend behavior is implemented and reproducible; live cumulative cart-session behavior remains limited by **B-01**, rather than repaired or simulated. Submission should explicitly disclose that limitation. Human assistive-technology/device checks remain advisable; unrestricted cross-browser/accessibility compliance is not claimed.

## Sources and evidence boundaries

- The original local `1. ITX - Front End Test 1.pdf` was read in full (eight pages), and its PLP/PDP wireframes on pp.3–4 were rendered and visually inspected during this audit. It remains ignored, with no redistribution permission established. Styling is free; structural relationships are required.
- Code/configuration, the [R-01–R-29 specification](../specs/requirements.md), existing tests and independently executed checks support the matrix below. The README alone is not compliance evidence.
- **U** below: freshly run Vitest/RTL tests with mocked fetch. **E**: freshly run Chromium E2E with intercepted M01-based responses. **B**: fresh browser serving/deep-link checks with mocked API. **H**: dated manual/live evidence reused without presenting it as a fresh probe.
- [M01 contracts](../evidence/m01/2026-11-09/README.md), [M06](../evidence/m06/2026-11-10/README.md), [M08 reads](../evidence/m08/2026-11-10/README.md), [Stage A](visual-redesign-stage-a.md), [Stage B/copy cleanup](cart-confirmation-stage-b.md) and the [session investigation](cart-session-investigation.md#later-session-follow-up-2026-11-10) remain intact. This audit sent **zero live API requests and zero live cart POSTs**.

## Requirement-to-implementation matrix

**Verified** means implemented and verified within the stated evidence scope; it does not mean every browser or live service outcome is proven. **External** means implementation is verified with an external integration limitation. **Partial** marks the remaining human verification boundary.

| ID | Source / obligation | Implementation and evidence | Result |
| --- | --- | --- | --- |
| R-01 | PDF p.2: two-view client SPA; no SSR/MPA | [main](../../src/main.jsx), [routes](../../src/app/App.jsx); U [App tests](../../src/app/App.test.jsx), E [history/direct entry](../../e2e/shell.spec.js), B | Verified |
| R-02 | PDF p.2: React/Preact; ES6 allowed, no TypeScript preferred | React + JS/JSX in [manifest](../../package.json) and src; no TS application files; build | Verified; language preference met |
| R-03 | PDF p.3: show all returned products | [PLP](../../src/pages/ProductListPage.jsx) maps the full filtered list; U [catalogue tests](../../src/pages/ProductListPage.test.jsx), E [catalogue](../../e2e/catalogue.spec.js) verify all 100 M01 sample items, not a hardcoded limit | Verified |
| R-04 | PDF pp.3,5: input filters brand/model in real time | PLP derives results from query/data; U/E cover partial/mixed-case brand/model, clear/no matches and no per-keystroke requests. Partial/case-insensitive matching is an approved decision | Verified |
| R-05 | PDF p.3: selecting an item opens its detail | [ProductCard](../../src/components/ProductCard.jsx) encodes string ID in Router Link; U/E navigation | Verified |
| R-06 | PDF p.3: adaptive maximum four items per row | [PLP CSS](../../src/pages/ProductListPage.module.css), E catalogue checks 320/768/1280/1920px; H eight-width Stage A/B reviews | Verified |
| R-07 | PDF p.5: image, brand, model, price in item | ProductCard + [ProductImage](../../src/components/ProductImage.jsx); U/E catalogue include missing prices/images and real-data normalization | Verified |
| R-08 | PDF p.5: title/icon links home | [Header](../../src/components/Header.jsx); E shell navigation and B | Verified |
| R-09 | PDF p.5: current-page breadcrumbs/navigation | Header uses Router link and `aria-current`; U [detail tests](../../src/pages/ProductDetailsPage.test.jsx), E [detail](../../e2e/details.spec.js) | Verified |
| R-10 | PDF pp.5–6: Header count across both views | Header + [CartProvider](../../src/app/CartProvider.jsx); U [actions](../../src/components/ProductActions.test.jsx), E [cart](../../e2e/cart.spec.js) verify exact returned count across routes/reload; see R-18/B-01 | Verified frontend display |
| R-11 | PDF pp.3–4: image left, description/actions right | [PDP](../../src/pages/ProductDetailsPage.jsx), [CSS](../../src/pages/ProductDetailsPage.module.css); E verifies desktop columns/mobile stack. Desktop description remains before actions; explicitly approved Stage B prioritizes actions before specifications on mobile | Verified; approved responsive adaptation |
| R-12 | PDF p.3: explicit link back to list | PDP back link remains in loading/error/direct-entry states; U/E/B | Verified |
| R-13 | PDF p.5: eleven detail attributes | [ProductDescription](../../src/components/ProductDescription.jsx) and [normalizer](../../src/api/products.js); U detail tests/E detail check eleven terms, string/array handling and empty values | Verified |
| R-14 | PDF p.6: color/storage selectors | [ProductActions](../../src/components/ProductActions.jsx) consumes actual numeric option codes; U actions, E cart | Verified |
| R-15 | PDF p.6: singleton visible/preselected | Native fieldsets/radios; U all observed singleton/multiple combinations, E defaults. Multiple groups initially unselected follows user approval, not an extra PDF rule | Verified |
| R-16 | PDF p.6: Add selected configuration | ProductActions validates membership, blocks incomplete/pending/duplicate submission and preserves choices on failure; U/E cart | Verified |
| R-17 | PDF pp.6–8: exact cart POST payload | [cart API](../../src/api/cart.js), [HTTP client](../../src/api/client.js); U [contract tests](../../src/api/cart.test.js), E cart assert `{ id, colorCode, storageCode }`, string ID/numeric codes. H live-session limits remain | External: B-01 |
| R-18 | PDF pp.6,8: returned count persisted and shown | Provider + [count storage](../../src/storage/cartCount.js); U actions/[storage](../../src/storage/cartCount.test.js), E cart cover exact replacement, repeated `1`, reload, failure preservation and ordering | External: B-01; no cumulative claim |
| R-19 | PDF p.7: real list/detail endpoints and base URL | Product API/client use assignment origin and GET paths; U [products](../../src/api/products.test.js)/[client](../../src/api/client.test.js), H M01/M08 real reads. No fixture data enters production | Verified; live availability remains external |
| R-20 | PDF p.8: client storage avoids repeated reads | [product cache](../../src/storage/productCache.js), [guarded storage](../../src/storage/storage.js); U products/[storage](../../src/storage/storage.test.js) cover persistent and memory paths; POSTs never cached | Verified |
| R-21 | PDF p.8: one-hour expiry/revalidation | Fixed TTL `3_600_000`; U fake-clock cases at 3,599,999 / 3,600,000 / 3,600,001ms, no sliding expiry, corrupted/version/future timestamps, aborted/failed revalidation | Verified |
| R-22 | PDF p.2: start/build/test/lint commands | [package.json](../../package.json), fresh install and every required command, B start/preview. Lowercase npm names implement the document's conceptual START/BUILD/TEST/LINT labels | Verified |
| R-23 | PDF p.2: public repository/progressive history | GitHub API confirms PUBLIC/default main; clone succeeded. Conventional milestone commits preserved from `e08a674` through reviewed HEAD | Verified |
| R-24 | PDF p.2: execution README; first commit preferred | [README](../../README.md), independently reproduced commands; `git show e08a674:README.md` confirms initial inclusion | Verified; preference met |
| R-25 | PDF pp.2–4: reference structure/detail valued | Direct wireframe review + source CSS + E layout; H Stage A/B visual reviews. Original styling is permitted; no extra commerce view added | Verified within recorded review |
| R-26 | User baseline: accessible, resilient UI | Native controls/dialog, labels, landmarks, semantic specs, focus/reduced motion; U/E [accessibility](../../e2e/accessibility.spec.js)/[confirmation](../../e2e/confirmation.spec.js), H zoom/contrast. Real AT/device checks not performed | Partial: human verification |
| R-27 | User baseline: simple maintainable boundaries | Code review below; only React, React DOM and Router at runtime; no state/query/UI framework | Verified |
| R-28 | User workflow: scope, quality, incremental history/CI stop | This change is documentation-only; independent full gate precedes focused commit/normal push. Check CI once after push; stop without deploy/PR/submission | Verified locally; publication gate follows |
| R-29 | Approved Spanish interface | Visible/accessibility copy in components and U/E assertions; original product/spec strings retained | Verified |

The eleven attributes map to `brand`, `model`, `price`, `cpu`, `ram`, `os`, `displaySize` (observed pixels), `battery`, `primaryCamera` + `secondaryCmera`, `dimentions`, and `weight`. No currency/units or missing values are invented.

Summary: **26 verified within scope, 2 implemented with external limitation, 1 not fully verified; none wholly unmet.** Mandatory cart integration must still be presented with B-01, not as unrestricted live accumulation. Native confirmation, reduced-motion page transitions, extensive E2E, accessibility/resilient states and independent count persistence are approved enhancements/engineering decisions; the PDF does not prescribe their frameworks or coverage percentage. Boilerplate is permitted, not required. TypeScript avoidance and README-in-first-commit are preferences.

## Independent setup and quality results

A new clone from `https://github.com/j0ssGZ/itx-fe-challenge.git` matched reviewed HEAD. Before installation it had no node_modules, environment file, local PDF, build output or copied workspace dependencies. Environment: **macOS arm64, Node 24.19.0, npm 11.17.0**, matching `.nvmrc`/packageManager and engines (Node `>=24.15.0 <25`, npm `>=11 <12`). Other supported-range versions/OSes were not retested.

| Check | Fresh result |
| --- | --- |
| `npm ci` | Exit 0; 326 packages added from committed lockfile, no lockfile changes |
| `npx playwright install chromium` | Exit 0; available machine browser cache reused, no workspace node_modules reused |
| `npm run lint` | Exit 0, zero ESLint warnings |
| `npm test` | Exit 0; **232 tests / 11 files** |
| `npm run build` | Exit 0; 117 modules, JS 279.81kB / 88.63kB gzip; CSS 16.73kB / 4.11kB gzip |
| `npm run test:e2e` | Exit 0; **72 Chromium 158.0.8127.18 cases**, four viewport projects, 19.9 seconds, no configured retries |
| `npm run start` | Independently installed Vite served on isolated port 5187 |
| `npm run preview` | Independent production build served on isolated port 4187 |
| Browser on both servers | Full 100-item fixture catalogue, SPA link navigation, eleven detail attributes, direct detail entry, refresh HTTP 200 and explicit return; no page errors |
| `npm ls --depth=0` | Exit 0; installed direct dependencies match manifest, no invalid peer tree |
| `npm audit --json` | Exit 0; **zero known vulnerabilities** at audit time; not a complete security guarantee |
| Clean-copy Git status after checks | Clean; generated install/build/test artifacts ignored |

Development/preview browser checks used intercepted API data/images, not live responses. No secrets or undocumented local setup were required. Temporary verification servers were stopped; the user's existing local server and global configuration were preserved. Chromium binaries live outside repositories by Playwright design.

Installation emitted an ESLint deprecation notice and an optional `fsevents` install-script policy warning. No global approval setting was changed; all commands and both servers still passed. Browser tests printed the existing NO_COLOR/FORCE_COLOR warning. These are recorded warnings, not concealed failures. No redundant full gate is necessary for the final documentation-only diff.

## Architecture and asynchronous review

- **Responsibilities:** two page components own reads/query/retry; presentation components own cards/images/specifications; ProductActions owns selections/submission snapshot. Native modal confirmation uses a portal and native browser inertness rather than another route or UI framework. Shared Context owns only count/persistence/ordering. Current abstractions are proportionate; no cosmetic refactor is warranted.
- **Reads/cache:** one HTTP boundary normalizes HTTP/network/JSON/abort errors. Encoded string IDs prevent path-segment confusion. Detail validates returned identity; list validates IDs/duplicates. Effects abort on cleanup and ignore late data; keyed detail resets per ID. Cache validates persisted payloads and fixed receipt timestamps, separates resources and rejects invalid/future/version-mismatched entries. Failed/aborted revalidation does not renew or return stale data as fresh.
- **Mutations:** exact wire fields and numeric codes, no optimistic count, replay, POST cache or automatic retries. A synchronous pending guard blocks duplicate events. Response counts are safe nonnegative integers. Unmounted forms cannot open stale confirmation; late valid replies may update the provider. M07 ordering rejects older replies only after a newer valid confirmation; a newer failure does not discard an older success. Header and storage track the validated value, never fabricated accumulation.
- **Storage/errors:** guarded storage falls back to memory after access/quota failure; it cannot guarantee reload durability in that state. Invalid count/storage data does not replace a valid confirmation. Safe UI errors hide raw server diagnostics; missing prices/specs/options have honest handling. There is no production fetch deadline or image retry; pending external requests may remain loading until browser completion/error. This is documented behavior, not a new change.
- **Accessibility/layout:** native fieldsets, labels, description lists, skip navigation, route focus, visible focus and modal keyboard cleanup have real Chromium tests. Route-only animation preserves the shell, uses opacity/transform without overlapping old content, and respects reduced motion. Grid is capped at four; mobile prioritizes the single purchase form. Existing image loading/fallback/lazy policy is preserved.
- **Security/dependencies:** React text rendering is used; no raw HTML injection or private API credential is present. No evaluated input becomes a proxy target. Only React/React DOM/Router are runtime dependencies; pinned development packages have actual consumers/configuration. No unused dependency, dead placeholder or unnecessary infrastructure was identified. No guarantee beyond the performed static/history-pattern/advisory checks is implied.

## Findings by severity

| Severity | Finding | Disposition |
| --- | --- | --- |
| BLOCKER | None found in the approved frontend scope | No application rewrite or fix required |
| IMPORTANT | No additional application defect established | Cumulative live-cart readiness remains conditional on B-01 disclosure/acceptance |
| ACCEPTED EXTERNAL LIMITATION | **B-01: browser session continuity** | User reports Postman retained session `1 → 2`, Chrome `1 → 1`. Recorded credentialed Chromium GET failed with wildcard-origin CORS and rejected cross-site cookie; `omit` cannot preserve cookie continuity. Frontend renders actual responses. Still open/unfixed; see [investigation](cart-session-investigation.md#later-session-follow-up-2026-11-10) |
| MINOR | ESLint 9 deprecation/maintenance | npm's warning is real. Installed jsx-a11y peer range ends at ESLint 9; current lint passes. Track a compatible future tooling upgrade separately; no forced peer/dependency churn here |
| MINOR | Human/engine verification boundary | Real screen reader, physical safe areas and non-Chromium engines remain unverified. Automated semantics/keyboard tests are not certification |
| MINOR | No configured GitHub CI workflow | Not required by the PDF. Local clean gates are reproducible; do not describe absent CI as passing |

External image/API latency and low-resolution photos are service/data constraints; slow first loads or incomplete lazy-image screenshots do not independently establish a frontend defect. Browser storage durability under denial is also a documented platform limitation. No extra live probing or image changes were needed.

## Delivery hygiene and handover

- Public repository/default main and progressive history verified. README existed in the initial commit. Repository visibility is not a claim about an unspecified license; the PDF supplies no licensing requirement.
- No tracked PDF, node_modules, dist, screenshots, archives or test reports were found. Ignore rules preserve the original assignment restriction. No debug logging, unresolved conflict markers or raw-HTML rendering appeared in source/browser tests.
- Tracked-text scans found no common private-key/GitHub-token/AWS-access-key patterns; history searches for private-key/GitHub-token introductions found no matches. This is scoped scanning, not an assertion that exhaustive secret detection was performed.
- **196 relative documentation links** were checked with no missing targets; the one expected reference to the deliberately unversioned original PDF and historical `/tmp` screenshots are distinguished from distributable links. The rewritten README contains no personal filesystem paths and links to this current audit. Older test totals are historical checkpoint evidence, not current totals.
- README now supplies real scripts, prerequisites, setup, API/cache/count boundaries, testing, design/accessibility decisions and a concise B-01 disclosure. SDD current-checkpoint pointers distinguish this audit from M08/Stage A historical stops. No application files or lockfile changed.

Before manual submission, review the final commit/README, disclose B-01 to the evaluator, and decide whether additional assistive-technology/device review is needed. A future public host would need SPA fallback verification; no deployment is required by this assignment or performed here. Closing B-01 requires an API-owner correction/approved integration plan and actual browser evidence, not a local increment or a mocked journey.

Publication procedure: review documentation diff, commit normally, push existing origin/main, verify clean synchronized history and inspect GitHub checks once. Pending/running checks require stopping without polling. The final user report records the resulting commit/check state; no self-referential audit commit hash is fabricated here. **STOP after publication; no deployment, submission, PR or backend challenge.**
