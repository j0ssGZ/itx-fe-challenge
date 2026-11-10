# Requirements specification

M07 checkpoint: [QA evidence](../qa/m07.md) covers the full two-view journeys, semantic/keyboard checks, six responsive widths, native 200% zoom and two focused repairs. Actual gates: lint, 222 unit/integration tests, build and 60 mocked E2E cases passed. M07 publication and M08 are explicitly authorized together, subject to independent gates and the single CI check. M08 will record final R-01–R-29 classifications; B-01 remains open/accepted.

Status: M00–M06 published; M07 QA passed. M08 is explicitly authorized after M07 publication/CI gate. M01 evidence/approved decisions are preserved. A bounded M06 live detail pre-read failed and no POST was sent; current POST and cumulative integration are not verified. B-01 remains open/accepted.

## Sources and interpretation

- **A**: [1. ITX - Front End Test 1.pdf](<../../1. ITX - Front End Test 1.pdf>), eight pages, including the cover. References below use PDF page numbers, not inferred section numbers. All pages were read and both wireframes were inspected visually.
- **U**: the user's Phase 1 brief: specification only, preferred stack, maintainability, accessibility, responsive design, resilient states, pragmatic tests, and incremental delivery.
- **D**: the user's Phase 1.1 approved decisions: one-hour product cache with revalidation; cart count persisted independently; singleton selectors visibly preselected; multiple-option groups initially unselected; real-time, partial, case-insensitive brand/model matching; Spanish UI; response-authoritative cart count.
- **W**: the user's supplied AGENTS.md instructions governing CI, approval gates, merges, and deployments.
- **O**: Phase 1's list GET timed out after 30 seconds. Phase 1.1 probes on 2026-11-06, 10:57–11:02 UTC, succeeded for the list, four real product details, and valid cart POSTs. An unknown-ID GET and cart OPTIONS request were also inspected. A separate installed-Chrome diagnostic checked actual cross-origin fetch behavior. Requests were bounded; there were no automatic POST retries. Detailed evidence and limits are recorded below. No cookie values are included in these specs.
- **M**: [M01 evidence, 2026-11-09](../evidence/m01/2026-11-09/README.md), with versioned [request metadata](../evidence/m01/2026-11-09/verification.json) and [response snapshots](../evidence/m01/2026-11-09/responses.json). Fresh curl and Chrome observations are separate from O. M includes exactly one cart POST; same-session cart accumulation was not replayed. B-01 remains an accepted open integration risk.
- **S**: the user's M02 authorization: install/configure the approved stack, implement only shell/placeholders, unit/browser smoke checks, and a focused commit plus normal push to existing origin. Its permanent workflow is recorded in README/tasks; the one-check CI stop rule W still applies. The requested 404 fallback follows the approved unknown-route policy: replace-navigation to PLP with a notice, not a third business view.
- **T**: the user's M03 authorization: native-fetch read boundary, product list/detail validation, one-hour versioned client cache, deterministic mocked tests and a verified normal push. No page integration, hooks, search, cart operations, new views or M04.
- **V**: the user's M04 authorization: complete PLP/live search over M03, responsive/accessibility/state checks, PDF comparison, a brief Astryx evaluation without installation, documentation, verified commit/push and one CI inspection. M05/cart/deployment remain excluded.
- **P**: the user's M05 authorization: real read-only PDP over M03, all eleven attributes, cancellation/stale-response protection, deterministic unit/browser and local visual checks, documentation/commit/push/one CI inspection. Options/cart/persistence and M06 remain excluded.
- **C**: the user's M06 authorization: product options, exact POST with omit credentials, independent server-confirmed count persistence, deterministic tests, local browser review and focused commit/push. No M07, proxy/backend, new page, UI library or deployment. [M06 integration evidence](../evidence/m06/2026-11-10/README.md) records a bounded failed prerequisite GET, zero POSTs and no new cumulative claim.

Evidence labels: **explicit** means stated in the assignment or user instructions; **approved decision** means agreed in D; **observed** means demonstrated in O, not guaranteed by the PDF; **preference** means encouraged rather than mandatory; **proposal** means an architectural recommendation; **unknown** means not established. Approved design decisions do not become quoted PDF requirements.

Priorities: **P0 / Must** for explicit mandatory behavior and delivery constraints; **P1 / Should** for stated preferences and the proposed quality baseline; **P2 / Optional** for justified enhancements. IDs are stable references for tasks and future tests. The numbered records below form the requirements matrix: each record contains source, priority, acceptance criteria, and verification/milestone traceability.

## Numbered requirements matrix

1. **R-01 — Two-view client-rendered SPA**
   - Source/classification: A p.2, “Resumen”; explicit technical and functional constraint. Priority: P0.
   - Acceptance: exactly two business views, product list (PLP) and product details (PDP); route transitions execute in the client. No MPA or SSR. Cart and error states do not introduce additional business views.
   - Verification: routing integration tests and browser navigation checks. Milestones: M02, M07.

2. **R-02 — Framework and language**
   - Source/classification: A p.2; React or Preact is explicit; ES6 is allowed and avoiding TypeScript is a preference. U prefers React and JavaScript. Priority: P0 for framework, P1 for language preference.
   - Acceptance: proposed implementation uses React and JavaScript/JSX with ES modules; no TypeScript. Additional dependencies have a documented purpose.
   - Verification: dependency/configuration review. Milestone: M02.

3. **R-03 — Complete product listing**
   - Source/classification: A p.3, PLP; explicit functional requirement. Priority: P0.
   - Acceptance: with an empty search, render every product returned by the list endpoint. Do not silently truncate the list or introduce pagination that hides products.
   - Verification: M04 RTL and browser tests render every item of the full M01 list (100 in that sample, not a runtime constant), without truncation. Milestone: M04.

4. **R-04 — Immediate brand/model search**
   - Source/classification: A pp.3,5, SEARCH; explicit functional requirement; partial/case-insensitive matching is an approved decision in D. Priority: P0.
   - Acceptance: a text input filters products against brand and model on every input change, using partial, case-insensitive matching without requiring submission. Clearing it restores the complete list. The implementation default is a substring match in either field; see closed decision Q-03 for remaining nonessential matching details.
   - Verification: M04 passed partial brand/model and mixed-case/alcatel queries, each input change, clear/whitespace/no matches and no extra requests; keyboard/focus and polite result feedback checked. Milestone: M04.

5. **R-05 — List-to-detail navigation**
   - Source/classification: A p.3, PLP; explicit functional requirement. Priority: P0.
   - Acceptance: selecting a product navigates to that product's detail view with its identifier, using client routing.
   - Verification: M04 established accessible real-ID links; M05 retains those routes/keyboard/history/focus checks with actual detail fixture content instead of a placeholder. Milestones: M04, M07.

6. **R-06 — Responsive grid capped at four columns**
   - Source/classification: A p.3 text and PLP wireframe; explicit layout requirement. Priority: P0.
   - Acceptance: no row contains more than four cards at any width; fewer columns fit narrower resolutions. Preserve the header, search-above-grid, and grid hierarchy in the reference. The two rows illustrated are not an eight-product limit.
   - Verification: M04 Chromium confirmed 1/3/4/4 columns at 320/768/1280/1920 px, an extra 480 px two-column check, no horizontal overflow and desktop search above/right of the grid. Local screenshots inspected against A p.3. Milestones: M04, M07.

7. **R-07 — Product card content**
   - Source/classification: A p.5, ITEM; explicit functional requirement. Priority: P0.
   - Acceptance: each item displays image, brand, model, and price. O includes six empty price strings; retain those products and display an honest Spanish unavailable-price label instead of zero or an invented currency. Fallback wording is a project quality choice, not a PDF prescription.
   - Verification: M04 passed complete image/brand/model/raw-price assertions, actual empty-price samples, missing/failed image fallback and absent optional data. No currency is added. Remote photos remain availability-limited; screenshots use synthetic image bytes. Milestone: M04.

8. **R-08 — Header home link**
   - Source/classification: A p.5, HEADER; explicit functional requirement. Priority: P0.
   - Acceptance: application title or icon links to the PLP and is available on both views.
   - Verification: header interaction from the PDP. Milestone: M02.

9. **R-09 — Breadcrumb navigation**
   - Source/classification: A p.5, HEADER; explicit functional requirement. Priority: P0.
   - Acceptance: breadcrumbs identify the current page and provide navigation to its parent where applicable. The current page need not link to itself.
   - Verification: M05 passed direct-entry breadcrumb parent navigation/current-page semantics and preserved the M02 shell tests. Milestones: M02, M05.

10. **R-10 — Header cart count**
    - Source/classification: A pp.5,6, HEADER and ACTIONS; explicit functional/layout requirement. Priority: P0.
    - Acceptance: the number of added items appears on the right side of the header in both views. It is a count indicator; no cart page is required.
    - Verification: M06 passed response-driven Header updates on both routes and reload, preserving the previous value on failed/invalid POSTs; no cart page was added. Milestones: M02, M06.

11. **R-11 — Detail layout and image**
    - Source/classification: A pp.3–5, PDP, IMAGE, and PDP wireframe; explicit layout/content requirement. Priority: P0.
    - Acceptance: at a suitable desktop width, the image occupies the left column and description/actions the right column, with description above actions. Show the product image. Stacking on small screens is a responsive proposal, subject to Q-07.
    - Verification: M05 reused ProductImage and passed image-left/details-right at desktop, image-first mobile stack, missing-image fallback, no overflow at 320/768/1280/1920 px and local capture review against A p.4. M06 verifies actions below the description at all four widths. Milestones: M05–M07.

12. **R-12 — Explicit return-to-list link**
    - Source/classification: A p.3, PDP; explicit functional requirement. Priority: P0.
    - Acceptance: PDP provides a clear link to the PLP that works after direct entry, without depending on browser history. Do not rely solely on the logo or browser Back.
    - Verification: M05 passed direct URL/reload and explicit return by keyboard without history dependence; the link remains available during loading/errors. Milestones: M05, M07.

13. **R-13 — Required detail attributes**
    - Source/classification: A p.5, DESCRIPTION; explicit functional requirement. Priority: P0.
    - Acceptance: display at least brand, model, price, CPU, RAM, operating system, screen resolution, battery, cameras, dimensions, and weight. Retain labels and an honest unavailable-value fallback if a field is absent. Use the observed mappings below, including misspelled keys and string/array variations. Units and currency not established by the data must not be invented.
    - Verification: M05 asserted eleven semantic label/value pairs for all four M01 samples, joined string arrays, primary/secondary camera values, typo/screen mappings, empty/dash/absent values and raw price/weight without invented units. Invalid structure/identity yields safe feedback, with 500 retained as a generic HTTP error. Milestone: M05.

14. **R-14 — Color and storage controls**
    - Source/classification: A p.6, ACTIONS; explicit functional requirement. Priority: P0.
    - Acceptance: show controls for selecting storage capacity and color using options supplied for the current product. Do not hardcode selectable codes from the PDF's examples.
    - Verification: M06 passed native-radio rendering/keyboard and actual M01 options, with absent/invalid groups disabled and explained; codes are checked against the current product. Milestone: M06.

15. **R-15 — Visible, selected singleton options**
    - Source/classification: A p.6, ACTIONS; singleton behavior is explicit. D approves initially unselected groups with multiple options. Priority: P0.
    - Acceptance: each singleton group remains visible with its option preselected. Each group with multiple options is initially unselected and requires a user choice. The PDF contains no contrary multi-option default. Q-04 is closed.
    - Verification: M06 passed all three observed mixed/singleton patterns, plus a synthetic multiple/multiple case, both initially unselected; navigation resets selections. Milestone: M06.

16. **R-16 — Add selected product**
    - Source/classification: A p.6, ACTIONS; explicit functional requirement. Priority: P0.
    - Acceptance: provide an “Añadir” button that submits the current product and selected color/storage after both selections are valid. Spanish copy follows D, rather than the English labels used to identify wireframe regions.
    - Verification: M06 passed form validity, disabled incomplete/pending state, immediate double-submit guard and selection retention on HTTP/network/JSON/count errors. Missing price does not fabricate stock restrictions. Milestone: M06.

17. **R-17 — Cart request contract**
    - Source/classification: A pp.6–8, ACTIONS and API; explicit API requirement. Priority: P0.
    - Acceptance: send `POST /api/cart` with fields `id`, `colorCode`, and `storageCode`, using actual product/option values. O and M confirm a string ID and numeric codes from `options.colors` and `options.storages`. Do not send display labels, stringify codes accidentally through DOM input values, or add unsupported quantity fields.
    - Verification: M06 inspected exact string/numeric JSON payload in unit/integration/browser mocks, including numeric zero; no extra quantity, POST caching or retry. The one live browser attempt failed at prerequisite GET, so no current POST was verified/sent. Milestones: M01, M06.

18. **R-18 — Authoritative, persistent cart count**
    - Source/classification: A p.6 and p.8 response example; explicit requirement. D approves response authority and persistence independent from product TTL. Priority: P0.
    - Acceptance: replace the shared header count with successful response `count` and persist it independently of product-cache expiration. Do not increment locally or treat the response as a delta. Reload must restore the last confirmed count when browser storage is available. Cookie-dependent accumulation is historical evidence in O; M freshly confirms one count-bearing POST and the credentialed-browser constraint, without replaying accumulation. B-01 remains open despite acceptance of its risk.
    - Verification: M06 passed exact replacement with decreases/repeated `1`, persistence/remount/browser reload/routes, invalid count preservation, storage corruption/denial/quota and independent expiry. These are mocked frontend checks, not proof of live accumulation or session restoration. Milestone: M06.

19. **R-19 — Product API integration**
    - Source/classification: A p.7, Integración API; explicit API requirement. Priority: P0.
    - Acceptance: use base URL `https://itx-frontend-test.onrender.com/`, `GET /api/product` for the list, and `GET /api/product/:id` for detail. Production behavior must use the service rather than bundled sample data. M freshly verifies and preserves the full list plus four representative detail responses; these do not guarantee an exhaustive permanent schema. Evidence snapshots may later support isolated tests, never replace production integration.
    - Verification: M03 mocked URL/method/credentials/abort assertions and contract tests against M01 samples passed; no live requests were repeated. M01 remains the dated live baseline, not proof of completed page integration. Milestones: M01, M03.

20. **R-20 — Client-side response cache**
    - Source/classification: A p.8, Persistencia de datos; explicit technical requirement. Priority: P0.
    - Acceptance: retain API data on the client and reuse it to avoid unnecessary requests. Both browser storage and memory are permitted by A. D approves product-data caching separately from cart-count persistence. Cache successful list/detail GETs; never suppress or replay a POST from a read cache. Q-02 is closed.
    - Verification: M03 passed repeated list/detail hits, per-ID/base isolation, reload reuse, corrupt/invalid payload/version checks and storage-failure memory fallback. An independent count test key stays untouched; M06 additionally verifies the real separate count key/persistence during expiry. Milestone: M03.

21. **R-21 — One-hour cache expiration**
    - Source/classification: A p.8, Persistencia de datos; explicit technical requirement, confirmed by D. Priority: P0.
    - Acceptance: product data expires after one hour and expired data is revalidated. Implementation default: expire at elapsed time `>= 3,600,000 ms` from successful receipt; the next read fetches fresh data. Reads do not extend expiry. Timer-driven revalidation and conditional HTTP requests are not specified or needed.
    - Verification: M03 fake-clock tests passed at 3,599,999 / 3,600,000 / 3,600,001 ms, receipt-time stamping, no sliding expiry, future/invalid timestamps, failed/aborted revalidation and memory fallback with the same TTL. Milestone: M03.

22. **R-22 — Development, production, test, and lint scripts**
    - Source/classification: A p.2, START/BUILD/TEST/LINT; explicit tooling requirement. Priority: P0.
    - Acceptance: project exposes scripts for development mode, production compilation, running tests, and checking code. Proposal: conventional names `start`, `build`, `test`, `lint`; capitalization interpretation is Q-08. No framework, coverage percentage, E2E suite, or CI provider is prescribed by the PDF.
    - Verification: M02 actually passed `npm run lint`, finite `npm test` (3 RTL integration tests), `npm run build` and `npm run test:e2e` (2 Chromium viewport smokes). These verify only shell/tooling; M08 must still check the final application. Milestones: M02, M08.

23. **R-23 — Repository and progressive history**
    - Source/classification: A p.2; explicit submission requirement and stated expectation of incremental milestones. Priority: P0.
    - Acceptance: final solution is delivered in an open-code repository on a suitable service, with small, reviewable commits that correspond to verified milestones. No repository publication or PR is part of Phase 1.
    - Verification: inspect final repository visibility, history, and milestone evidence before delivery. Milestones: M00–M08.

24. **R-24 — Execution README**
    - Source/classification: A p.2; README and execution explanation are explicit; inclusion in the first commit is a preference. Priority: P0 for README, P1 for first-commit placement.
    - Acceptance: README explains prerequisites, setup, execution, and relevant notes; claims reflect actual implementation and verification. M00 included the first README; M01 recorded contracts; M02 documents the actual runtime, lockfile installation, browser setup, available scripts and shell-check results. M04 now documents the implemented catalogue/search, actual results, fixtures/image limits and the Astryx decision; M05 now records the real read-only detail, its maps/lifecycle and actual tests/visual limits; M06 documents actual options/POST/confirmed count, memory fallback and the failed live pre-read; M07 remains pending.
    - Verification: clean-checkout instructions checked in M08. Milestones: M00, M02, M08.

25. **R-25 — Visual structure and attention to detail**
    - Source/classification: A p.2 and wireframes pp.3–4; structure is explicit and detail is positively valued. Priority: P0 for structure, P1 for polish.
    - Acceptance: retain the documented visual hierarchy, card cap, search placement, image/detail relationship, and persistent header. Styling, fonts, spacing, colors, and exact pixel measurements are free choices, not specified assets or design tokens.
    - Verification: side-by-side review against PDF pp.3–4 at desktop and responsive widths. Milestones: M04, M05, M07.

26. **R-26 — Accessible, resilient UI baseline**
    - Source/classification: U; explicit Phase 1 design goals; details are architectural proposals rather than PDF mandates. Priority: P1.
    - Acceptance: semantic links and forms, named controls, keyboard access, visible focus, readable contrast, and meaningful image alternatives. Specify loading/error/empty states and mutation feedback without introducing new business views. No false price, option, or successful-add data.
    - Verification: behavior tests, keyboard review, narrow-screen/zoom review, and failure fixtures. Milestones: M03–M07.

27. **R-27 — Focused, defensible implementation**
    - Source/classification: U; explicit engineering direction. Priority: P1.
    - Acceptance: separate rendering, routing, remote-data access, persistence, and cart count ownership. Use local state for local concerns; justify shared state and dependencies. Avoid Redux, generic frameworks, and speculative optimizations for this scope.
    - Verification: architecture review against design.md. Milestones: M02–M08.

28. **R-28 — Phase and CI approval gates**
    - Source/classification: U and W; explicit process constraints. Priority: P0.
    - Acceptance: honor each milestone's explicit scope. M02 authorized shell/tooling; M03 authorized API/cache; M04 authorized PLP/search/evaluation; M05 authorized read-only PDP; M06 authorizes options/cart/count frontend and a verified normal push to existing `j0ssGZ/itx-fe-challenge` origin, preserving M00–M05 ancestry. From M02: implement -> test -> lint -> build -> review diff -> commit -> push -> verify -> STOP. No force-push, secrets/local environments/PDF in commits, failing/unverified pushes, PR, automatic merge/deploy, or next milestone without approval. After each push/PR update, inspect CI once; if pending/running, report and immediately stop, asking the user to return on completion/failure. No polling/watch/waiting agents. Preserve all security/approval gates.
    - Verification: working-tree/file inventory in Phase 1; workflow review at subsequent checkpoints. Milestones: M00–M08.

29. **R-29 — Spanish interface**
    - Source/classification: D; approved design constraint, not a language requirement in A. Priority: P0 for this project.
    - Acceptance: navigation, search labels, required attribute labels, actions, loading/empty/error messages, and accessible names are Spanish. Preserve supplied product names/specification text without inventing translations. The PDF does not require a different UI language.
    - Verification: component/browser checks of visible and accessible copy. Milestones: M02, M04–M07.

## API contracts: exactly what the PDF establishes

Base URL: `https://itx-frontend-test.onrender.com/` (A p.7).

- **List:** `GET /api/product` returns an array of product objects; examples include `id` and omitted fields.
- **Detail:** `GET /api/product/:id` returns one product object; example includes `id` and omitted fields.
- **Add:** `POST /api/cart` takes an object containing `id`, `colorCode`, and `storageCode`; response contains `count` (A pp.7–8).
- Display obligations also establish that the UI needs the named card/detail attributes and product options (A pp.5–6). They do not establish JSON field names for those values.

The PDF's unquoted keys, leading-zero IDs (`0001`), and ellipses are illustrative pseudo-JSON, not a schema or copyable JSON fixture. Types, mappings, status/error behavior, and session details below are observations that supplement the PDF; they are not retroactively PDF guarantees. Exhaustive nullability, currency/weight units, stock/combination rules, and a general error schema remain unspecified.

## Historical Phase 1.1 API observations — 2026-11-06

The following subsection preserves O as dated historical evidence. Original temporary traces are no longer available. The fresh M01 record below and its committed artifacts must be used when describing the 2026-11-09 verification; do not relabel historical repeated-add/session results as freshly reproduced.

Scope: one full list snapshot, four selected details, one intentionally unknown ID, one OPTIONS request, three shell cart POSTs, and one additional browser cart POST. Shell requests used a 10-second connection timeout and 45-second total limit; all completed in under one second. Chrome diagnostics used a 12-second timeout per fetch and a 45-second process bound. No automatic POST retries occurred. This is live contract exploration, not a passing application test suite.

### Product list

`GET /api/product` returned HTTP 200 and a JSON array of 100 records. Each record had exactly `id`, `brand`, `model`, `price`, and `imgUrl`, all strings in this snapshot. IDs were nonempty and unique. Brand/model/image URL were nonempty; six prices were `""`. There were 99 Acer records and one lowercase `alcatel` record. These counts describe the snapshot and must not be hardcoded as acceptance requirements.

Representative returned item:

```json
{
  "id": "ZmGrkLRPXOTpxsU4jjAcv",
  "brand": "Acer",
  "model": "Iconia Talk S",
  "price": "170",
  "imgUrl": "https://itx-frontend-test.onrender.com/images/ZmGrkLRPXOTpxsU4jjAcv.jpg"
}
```

The response supplies neither currency nor currency symbols. Prices are not JSON numbers. An empty string must not become numeric zero, and an empty-price product must remain in the list.

### Product details and display mappings

All four real detail requests returned HTTP 200 and JSON objects:

- `ZmGrkLRPXOTpxsU4jjAcv`, Acer Iconia Talk S: one color and two storage options.
- `cGjFJlmqNPIwU59AOcY8H`, Acer Liquid Z6 Plus: two colors and one storage option.
- `pMZMhe_ZaAPZoaCCtlDrg`, Acer Liquid Jade 2: one option in each group, empty price/weight/battery, and `dimentions: "-"`.
- `AasKFs5EGbyAEIKkcHQcF`, alcatel Flash (2017): one option in each group, empty price, and an array-valued CPU.

The required display attributes map as follows; formatting is an architectural recommendation based on these samples:

- Marca/modelo/precio/imagen: `brand`, `model`, `price`, `imgUrl`, all strings in the samples.
- CPU: `cpu`, a string in three samples and an array of strings in the alcatel sample. RAM and operating system: `ram`, `os`, strings.
- Resolución de pantalla: the pixel-bearing value is in **`displaySize`**, for example `"720 x 1280 pixels (~210 ppi pixel density)"`. **`displayResolution` contains inches**, for example `"7.0 inches (~69.8% screen-to-body ratio)"`. The names appear reversed relative to their values. Proposed mapping uses `displaySize` for the required resolution label; do not show inches as pixel resolution just because of the key name.
- Batería: `battery`, a possibly empty string in the sample.
- Cámaras: `primaryCamera` is an array of strings in all four; **`secondaryCmera`** (actual spelling) is a string or string array. Preserve both camera descriptions, joining string arrays for display.
- Dimensiones: **`dimentions`** (actual spelling), a string that can be `"-"`. No `dimensions` key was observed.
- Peso: `weight`, a string such as `"260"` or `""`, with no unit in the field. Do not append an inferred unit.

Other observed top-level keys were `networkTechnology`, `networkSpeed`, `gprs`, `edge`, `announced`, `status`, `sim`, `displayType`, `chipset`, `gpu`, `externalMemory`, `internalMemory`, `speaker`, `audioJack`, `wlan`, `bluetooth`, `gps`, `nfc`, `radio`, `usb`, `sensors`, `colors`, and `options`. Some optional fields also vary between strings and string arrays. They do not need to become additional UI features.

Selectable codes come from **`options.colors` and `options.storages`**, arrays of objects with numeric `code` and string `name` in these samples. Top-level `colors` and `internalMemory` contain labels only and must not generate the cart codes. For the first product, the returned options are:

```json
{
  "colors": [{ "code": 1000, "name": "Black" }],
  "storages": [
    { "code": 2000, "name": "16 GB" },
    { "code": 2001, "name": "32 GB" }
  ]
}
```

No observed per-variant price, stock flag, or color/storage compatibility matrix establishes extra purchasing rules. Missing price alone must not be turned into an invented out-of-stock rule.

### Cart, error, session, and CORS observations

A valid `POST /api/cart` with JSON body `{"id":"ZmGrkLRPXOTpxsU4jjAcv","colorCode":1000,"storageCode":2000}` returned HTTP 200 and `{"count":1}`. A deliberate second request without retaining cookies also returned `1`; reusing the first request's `session_id` cookie returned `2`. These are separate exploratory additions, not automatic retries. The single browser POST without credentials returned `1` as well. Replace the UI count with each returned value; do not compensate by local arithmetic.

Responses set a `session_id` cookie with `Path=/` and `HttpOnly`; no `SameSite` or `Secure` attributes appeared in the inspected headers. Cookie values are intentionally omitted. Observed cart accumulation depends on retaining that session; expiry/recovery semantics remain undocumented.

With an `Origin: http://localhost:5173` header, inspected responses included `Access-Control-Allow-Origin: *`, allowed headers `Origin, X-Requested-With, Content-Type, Accept`, and no `Access-Control-Allow-Credentials`. The cart OPTIONS probe returned HTTP 200, body `POST`, and `Allow: POST`; no `Access-Control-Allow-Methods` header appeared. Do not diagnose the JSON POST as broken solely from the latter omission: actual Chrome POST without credentials succeeded.

Installed Chrome with default web security, from an ephemeral `http://localhost:61264` diagnostic origin, demonstrated:

- Product GET with credentials omitted: HTTP 200, 100 records.
- JSON cart POST with credentials omitted: HTTP 200, `{"count":1}`.
- Product GET with `credentials: "include"`: `TypeError: Failed to fetch`; no readable response.

These results are consistent with the browser rule forbidding wildcard-origin sharing of credentialed responses. See the [Fetch standard](https://fetch.spec.whatwg.org/#cors-protocol-and-credentials). Shell cookie reuse bypasses browser enforcement and is not a browser workaround. The unresolved direct cross-origin cumulative-cart limitation is **B-01** in open-questions.md. Do not silently add `credentials: "include"`, a proxy/backend, or a local count increment.

An intentionally unknown detail ID, `/api/product/__phase11_missing_product__`, returned HTTP **500** with `{"message":"An Unexpected Error Occurred","code":0}`. This is observed behavior for that input, not a promised general error schema or a 404 contract. Show a Spanish load-error state; do not label every 500 as “product not found”. Invalid cart payloads and all possible error statuses were not exhaustively probed.

### PDF review outcome

No explicit PDF requirement was missing from the original matrix. Page-level coverage: p.2 -> R-01/R-02/R-22–R-24/R-25; p.3 -> R-03–R-06/R-11/R-12/R-25; p.4 -> R-11/R-25; p.5 -> R-04/R-07–R-10/R-13; p.6 -> R-14–R-18; p.7 -> R-17/R-19; p.8 -> R-17/R-18/R-20/R-21. Page 1 is the cover. R-26–R-29 come from project/process instructions, not extra PDF features.

Corrections in Phase 1.1: close the approved decisions; replace the obsolete “API unavailable/schema unknown” baseline with bounded live observations; record malformed/missing values, screen/key mappings, and session/CORS limits; remove unnecessary component/file boundaries in design.md. The source distinguishes mandatory structure from styling freedom and does not mandate TypeScript, exact breakpoints, a specific test framework, a cart page, or a coverage percentage.

## M01 verification — 2026-11-09

Source M contains timestamps, methods, paths, timeout budgets, selected headers, redacted cookie attributes, current responses, and integrity hashes. The original PDF was reread; its content remains local and ignored by Git. This increment changes no approved product or architectural decision.

- The first list GET timed out after 45.007 seconds with zero bytes and no HTTP response. The only second attempt returned HTTP 200 in 0.243 seconds. The cause of the first failure is unknown; a cold start is not established. Availability was verified during the successful probes, not guaranteed beyond them.
- The current list again contains 100 records with unique string IDs, five string fields per record, and six empty prices. Four real details returned HTTP 200; they reproduce the documented typo keys, screen-field mapping, string/array CPU/camera values, and three singleton/multiple option patterns. All required display-attribute keys occur in those four samples; some values are empty or `-`. Neither the sample nor the abbreviated PDF establishes universal wire-field requiredness/nullability.
- A fresh unknown-ID GET returned HTTP 500 with `{"message":"An Unexpected Error Occurred","code":0}`. Unsupported cart payloads were not fuzzed and no universal error contract is inferred.
- Captured GET/OPTIONS headers again show `session_id` with Path `/` and HttpOnly, wildcard origin, and no credential permission. A nonmutating curl detail GET that reused the list cookie returned 200 without issuing another Set-Cookie. That does not establish cart-state persistence or session lifetime.
- Actual Chrome GET with credentials omitted returned HTTP 200; GET with `include` failed without a JavaScript-readable HTTP status. Exactly one browser JSON POST using a freshly verified string ID and numeric option codes returned HTTP 200 and `{"count":1}`. No POST retry or fresh same-session accumulation test occurred; the historical returned `2` remains O only. Browser virtual-time readings are not real API-latency measurements.
- B-01 remains **open and accepted as an integration risk** for subsequent local tooling after explicit approval. It is not resolved by a valid independent POST, persisted client count, curl cookie reuse, or a mocked accumulated response. No proxy, credential change, client session substitute, or local increment was introduced.

The versioned snapshots are documentary samples, not production fallback data or app code. At the historical M01 checkpoint there was no configured test environment. M02 subsequently added shell-only tests. M03 now imports the snapshots exclusively through test fixtures and adds 109 deterministic tests; production modules and the shell do not import the fixtures, and no new live API calls were made. Full live cumulative-cart completeness still requires evidence beyond this baseline. Traceability: R-07, R-13–R-21, R-23/R-24/R-28; Q-01/Q-05; B-01.

## Visual reference interpretation

- **PLP, A p.3:** a full-width header above the list region; search aligned to the upper right within that region; four evenly spaced item columns at the illustrated width. Two sample rows illustrate repetition, not a result limit. No sidebar, sort control, carousel, or pagination is shown or required.
- **PDP, A p.4:** the same header; a left product image; a right column with description above actions. The actions drawing has two rows of compact option controls and an Add control below. It does not mandate a particular HTML widget or exact option count. Native radio groups can preserve this visual relationship accessibly.
- Wireframe colors and labels such as HEADER, LIST VIEW, and ACTIONS identify regions. They are not required final copy, colors, borders, or aspect ratios. The screenshot does not locate the back link precisely; it is still explicitly required by the text on p.3.
- Spanish UI is approved by D. Mobile stacking, breakpoints, typography, and frontend paths remain architectural defaults; currency must not be inferred. See design.md and open-questions.md.

## Optional improvements and boundaries

Permitted/encouraged by A: extra JS libraries when useful, a boilerplate template, free visual styling with attention to detail, and explanatory README notes. None requires extra product functionality.

Proposed P2 improvements only after core acceptance: preserve search during a PLP/PDP round trip (convenience), automate accessibility checks if existing checks miss defects, and expand browser coverage if the evaluation environment warrants it. Each must justify its maintenance cost. Loading feedback, empty/error handling, and keyboard usability belong to the proposed P1 baseline, not optional product features.

No cart view, checkout, authentication, quantity picker, product sorting, server-side search, wish list, inventory system, PWA/offline mode, SSR, analytics, or deployment automation is proposed. The endpoint list supplies no contract for them. A preview command and deterministic test mocks are development aids, not additional business behavior.

## Completion and traceability

Implementation completion requires evidence for R-01–R-29, explicit treatment of B-01 and other relevant limitations, and M08's clean-checkout checks. Acceptance of B-01 permits the agreed limited scope; it is not evidence of cumulative-cart correctness. A passing mocked test suite alone cannot prove live compatibility. Phase 1.1/M01 performed endpoint/browser diagnostics only. M02 supplied the shell, M03 API/cache, M04 catalogue/search, M05 read-only detail and M06 options/POST/confirmed count. Actual current results: 220 unit/integration tests, lint/build and 52 Chromium E2E cases passed. This verifies frontend behavior with M01 fixtures and labeled synthetic cases, not live accumulation. The bounded M06 real-browser detail attempt received no readable HTTP response and sent zero POSTs; M01 remains the historical POST baseline. M04 photo timeouts remain historical and M06 local mock/fallback captures do not establish photo availability. No approved functional decision was reopened.

Related documents: [design](design.md), [tasks](tasks.md), [open questions](open-questions.md).
