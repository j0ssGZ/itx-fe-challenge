# Decision register, open questions, and risks

Final checkpoint: [M07 QA](../qa/m07.md) and [M08 verification](../qa/m08.md), 222 unit/integration and 60 E2E cases passing with lint/build, including a fresh isolated install. Reproduced cart-response ordering and image containment defects are repaired. No approved functional decision was reopened. M07 is published and M08 ends at manual review. B-01 remains open/accepted; assistive-technology review and live cart/session compatibility remain limitations.

Status: M07 published; M08 passed locally, ready for authorized documentation publication. Approved decisions remain closed and B-01 stays accepted/open. M00–M07 history and [M01 evidence](../evidence/m01/2026-11-09/README.md) are preserved. The [M06 failed read](../evidence/m06/2026-11-10/README.md) remains historical; [M08 reads](../evidence/m08/2026-11-10/README.md) now verify HTTP resources and one live browser detail/photo, with zero POSTs. R-IDs are in [requirements.md](requirements.md); architecture/milestones in [design.md](design.md) and [tasks.md](tasks.md).

## Historical Phase 1.1 review and subsequent checkpoints

- The original eight-page PDF was reread and both wireframes were visually compared with the specs. No explicit PDF requirement was missing from R-01–R-28. R-29 records the user's newly approved Spanish interface, not another requirement inferred from the PDF.
- Phase 1's API timeout was superseded by successful Phase 1.1 discovery: the 100-record list, four real detail records, three controlled shell cart additions, one browser addition, an unknown-ID error, and cart preflight headers. Probes were bounded and POSTs were not automatically retried.
- Real data exposes six empty list prices, missing detail values, misspelled keys, string/array variation, numeric option codes, apparently reversed screen keys, an unknown-ID 500, and cookie-dependent count accumulation. Exact samples, methods, types, and bounds are centralized in requirements.md.
- Installed Chrome with normal web security verified readable GET/JSON POST responses without credentials and a failed credentialed GET. This was a temporary diagnostic, not a React app or application E2E suite. Browser diagnostics required no dependency installation or application files.
- Only the four existing specification files are modified in this phase. No Git repository, application source, package manifest, test suite, README, or build has been created. No application checks are claimed as passing.

The bullets above describe **historical Phase 1.1**, not the present repository state. M00 subsequently initialized Git and the README in `e08a674`, without adding application code. Fresh M01 probes reproduced list/detail shapes, the unknown-ID 500 and credentialed-browser failure; exactly one current browser POST returned `1`. A first 45-second list timeout and successful second request are both retained. The old `count: 2` session-accumulation result was not replayed or promoted to fresh evidence. No new application infrastructure was created.

## Decision register

### Q-01 — API availability and representative product contract

- **Status:** representative list/detail/payload structure freshly verified and versioned in M01; not an exhaustive permanent schema. Cart transport remains B-01. The first current GET timed out; its sole retry and the subsequent probes succeeded, without establishing the timeout's cause.
- **Established:** list records contain string `id`, `brand`, `model`, `price`, and `imgUrl`. Four real detail responses expose the required display data, option codes, missing values, and type variations. A valid cart body uses a string ID and numeric codes from `options.colors` / `options.storages`; a successful response has numeric `count`.
- **Remaining limits:** all 100 detail variants, nullability, every error type, image loading, currency/weight units, inventory/combination rules, and session lifetime were not exhaustively established. A snapshot does not guarantee future server behavior.
- **M03 action/result:** unchanged M01 samples are now imported through test-only fixtures. Minimum ID/list/detail checks, optional-field normalization, generic HTTP failures and invalid JSON/network/abort behavior passed deterministic tests. Synthetic malformed inputs are labeled as robustness cases. No fresh live probe, blanket wire-requiredness or nullability promise follows. M05 now verifies detail rendering/image fallback with mocks; current remote photos still need a separate live check.
- **Gate:** sufficient product evidence exists for local implementation after approval. No blanket API-unavailable blocker remains. Related: R-07, R-13–R-19.

### Q-02 — Product TTL and independent count persistence

- **Status:** approved by the user in Phase 1.1; closed.
- **Approved decision:** product data has a one-hour TTL and expired data is revalidated. Persist the API-returned cart count independently from product-cache expiration. Product expiry must not reset it.
- **Implementation defaults:** successful list/detail GETs have distinct keys, each detail is keyed by ID, expiry is measured from successful receipt at `>= 3,600,000 ms`, and the next read revalidates. Reading does not renew TTL. Use guarded localStorage with memory fallback. POST actions are never cached or replayed. There is no product-TTL-driven cart reset.
- **Source distinction:** one-hour client caching is explicit in A p.8; the separate count policy is the user's approved interpretation of A pp.6,8. Exact boundary/storage/on-demand details are engineering defaults rather than additional PDF claims.
- **M03 result:** product cache implemented with versioned absolute-URL keys, exact TTL tests, receipt timestamps, validation/eviction, reload reuse and memory fallback after storage errors. Fallback is volatile and lasts for that storage instance; it does not extend expiry or guarantee reload persistence. M06 now adds independent confirmed-count storage without changing product TTL.
- **Gate:** M03 implemented product caching and M04 now consumes it without changing its policy. M05 now consumes detail caching too. M06 now persists the confirmed count under its own versioned key without TTL, with corruption/denial/quota tests. No persistence decision was reopened; M07/M08 are complete within their joint authorization. Related: R-18, R-20, R-21.

### Q-03 — Search behavior

- **Status:** real-time, partial, case-insensitive brand/model matching approved; closed.
- **Approved behavior:** reevaluate results on every input change; compare brand and model without case sensitivity. No submit step or invented search endpoint.
- **Implementation default:** trimmed substring match in either field; empty query shows all. No debounce, tokenization, accent folding, or cross-field phrase matching is added. These unspecified matching refinements do not require a new approval gate or extra features.
- **Evidence/test implication:** the list contains lowercase `alcatel`, so preserve the supplied brand while matching queries such as `ALCATEL` case-insensitively. Snapshot brand counts are not hardcoded business rules.
- **M04 result/gate:** implemented local derived filtering with trimmed case-insensitive partial brand/model matches; no search requests or duplicate result state. M01-based RTL/keyboard/E2E checks passed. No blocker or reopened search decision. Related: R-03, R-04.

### Q-04 — Option visibility and defaults

- **Status:** singleton and multi-option defaults approved; closed. A p.6 contains no contrary multi-option rule.
- **Approved behavior:** visibly render and preselect a singleton group; initially leave a multiple-option group unselected. Require valid selections in both groups before Add can submit.
- **Implementation defaults:** native labeled radio groups styled as compact choices; selections reset per product. Missing options disable adding with an explanation, rather than generating codes. Read options/codes from `options.colors` / `options.storages`, not label-only arrays. Preserve numeric types when handling DOM values.
- **Evidence/test implication:** real samples cover one color/two storages, two colors/one storage, and one option in both groups. No valid-combination or stock matrix was established; do not invent one.
- **M06 result/gate:** native labeled fieldsets/radios, visible singleton preselection, initially unselected multiple groups, numeric code membership/zero handling, disabled incomplete/pending submission and per-ID reset passed. Missing/invalid groups do not invent codes. No control decision remains open; live session transport remains B-01. Related: R-14–R-17.

### Q-05 — Count authority versus session continuity

- **Status:** API response as source of truth and independent persistence approved; closed for those decisions. Browser session continuity remains unresolved in B-01.
- **Approved behavior:** replace the displayed/persisted count with response `count`, even if the response is again `1` or differs from previous count plus one. No local increment or optimistic reconciliation.
- **Implementation defaults:** show `0` only when no valid stored count exists; retain the confirmed value after failure. Reject malformed/negative/non-integer counts. Storage failure keeps in-memory state but cannot promise reload persistence. No cart-read endpoint or backend reconciliation is documented.
- **Evidence/test implication:** historical 2026-11-06 additions returned `1` without cookies and `2` when reusing the session cookie. M01 freshly confirmed only one browser POST returning `1`; it did not repeat remote additions to test accumulation. A nonmutating GET with a manually reused cookie returned 200 without another Set-Cookie, which does not prove persistent cart state. Client count persistence does not restore that session. Never auto-retry an uncertain POST.
- **M06 result:** count responses replace rather than increment, including repeated `1`/decreases/zero. Exact JSON payload/validation, error preservation, double-submit guard, storage restore/corruption/denial/quota and product-expiry independence passed with mocks. Safe integers/nonnegative values are frontend validation defaults; no exhaustive server guarantee is inferred.
- **Gate:** count ownership/persistence and acceptance of B-01 as a risk are already settled. Do not claim a fully cumulative live browser cart without additional evidence or an explicit final limitation; this does not reopen permission for routine local tooling. Related: R-10, R-17, R-18, R-20.

### Q-06 — Spanish UI, price/spec formatting

- **Status:** Spanish interface approved; language question closed. A does not prescribe another final UI language. Currency and unprovided units remain nonblocking data limits.
- **Approved behavior:** Spanish navigation, labels, buttons, feedback, and accessible names. Product/model names and supplied technical descriptions remain source data rather than invented translations.
- **Implementation defaults:** show `Precio no disponible` for absent price and `No disponible` for absent specs; preserve all required detail labels. Render a supplied price/weight without an unverified currency/unit suffix. Never coerce empty price to zero or interpret missing price as out of stock.
- **Observed mapping:** `displaySize` contains pixels while `displayResolution` contains inches in all four samples; use the pixel-bearing field for the required resolution. Honor actual `dimentions` and `secondaryCmera` keys. Join CPU/camera string arrays. The dimensions placeholder `-` is unavailable data. These are explicit architectural mappings from observed values, not corrected server contracts.
- **M05 result/gate:** all eleven Spanish attribute mappings and honest fallbacks passed against four M01 details, including array/string CPU/cameras, pixel-bearing displaySize and typo keys. No currency/weight suffixes were added. Revisit units only if official evidence appears; no new formatting decision blocks M06. Related: R-07, R-13, R-25, R-26, R-29.

### Q-07 — Responsive layout, frontend paths, and hosting

- **Status:** M02 routes/shell, M04 catalogue and M05 detail layout are implemented. PDP image-left/information-right switches to an image-first stack below 768 px; browser overflow checks passed at all four configured widths. Browser checks confirm a four-column maximum and no overflow at 320/768/1280/1920 px, plus two columns at 480 px.
- **Source:** A pp.3–4 requires adaptive list columns, at most four cards per row, and a two-column detail reference; mobile stacking, breakpoints, frontend paths, and unknown-route policy are not prescribed.
- **Default:** preserve desktop hierarchy, stack future PDP image/description/actions on narrow screens, and use one-to-four list columns in PLP. M02 uses BrowserRouter with `/` and `/products/:id`; unmatched paths replace-navigate to PLP with a Spanish not-found notice. This reconciles the requested simple 404 fallback with the approved two-view design. M05 implements detail read/error/layout states without assuming the unknown-ID error is 404.
- **Later verification:** eventual hosting must support SPA deep-link rewrites. Choose HashRouter only if a real hosting constraint requires it. Hosting is not a reason to introduce SSR or another business page.
- **Gate:** no separate clarification is needed to plan local code; actual host compatibility is checked before delivery. Related: R-01, R-06, R-11, R-12, R-25.

### Q-08 — Script names and dependency choices

- **Status:** conventional scripts and compatible pinned tooling selected/verified in M02. Literal uppercase script keys are not established by A's operation labels.
- **Default:** lowercase `start`, `build`, `test`, `lint`, with a finite `vitest run` for `test`; optional watch/E2E/preview scripts. Use the preferred React/Vite/JavaScript/Router/CSS Modules/Vitest/RTL/Playwright/ESLint stack, npm, one lockfile, and a compatible Node LTS chosen during setup.
- **Boundary:** no exact version, arbitrary coverage target, CI vendor, formatter, state library, or API/schema package is mandated by the PDF. Add uppercase aliases only if a real evaluator requirement emerges.
- **Verified choice/limit:** Node 24.19.0/npm 11.17.0; exact direct dependencies and one lockfile are committed. Lint, 3 unit/integration tests, build and 2 Chromium smokes passed. ESLint 9.39.5 is deprecated upstream but satisfies stable jsx-a11y 6.10.2's peer range (which excludes ESLint 10); this maintenance limit is documented, with no forced peers or new architecture. M02 `npm audit` reported zero vulnerabilities, not a permanent guarantee. Related: R-02, R-22, R-27.

### Q-09 — Repository destination and first commit

- **Status:** M00 repository/README in `e08a674`; M01 in `8a0f325`. M02 verified existing `origin` is the public `j0ssGZ/itx-fe-challenge` repository and remote main already contained M00/M01 before changes. Normal push of verified M02 is explicitly authorized; no remote was created/replaced.
- **Source:** A p.2 requests an open-code repository and prefers a README in the first commit. That preference is satisfied locally; no remote/publication is authorized by M01. The PDF is ignored and no redistribution permission has been established.
- **Plan:** preserve progressive conventional history; from M02 follow implement/test/lint/build/review/commit/push/verify/STOP for each approved milestone. PDF stays excluded and no force-push is permitted.
- **Gate:** M03 received explicit approval for its focused commit/normal push; preserve previous history and the existing origin. M04 subsequently received approval for PLP/evaluation/commit/push; M05 received approval for its read-only implementation/commit/push; M06 received approval for options/cart/count and focused commit/normal push. M07/M08 received joint approval and have independent verified checkpoints; delivery/deployment remain separately gated. No PR/merge/deploy. Preserve the one-check CI stop rule. Related: R-23, R-24, R-28.

### Q-10 — UI library evaluation and image availability at M04

- **Decision recommendation:** keep React/CSS Modules for M05; [Astryx evaluation](../decisions/ui-library-evaluation.md) records React 19/Vite/JS compatibility, customization/accessibility, dependencies and estimated bundle costs. No Astryx installation or architectural change occurred. This is not a new prerequisite for using the existing approved stack.
- **Observed limitation:** eight bounded manual reads of the first eight M01 image URLs timed out with a configured 15-second timeout per resource, without retry. This does not establish a catalogue endpoint outage or a permanent image failure. Automated tests/captures use intercepted fixture images and prove layout/fallback, not current remote photography. No list/detail/cart endpoint or session behavior was re-probed.
- **Gate:** M04 has no remaining local implementation blocker; later live availability/images must be checked separately before final delivery. B-01 below remains unchanged and open. M05 has since completed isolated read-only PDP checks without new remote probes or image assets. M06 has since verified controls/count with mocks and a bounded failed API pre-read; M07/M08 subsequently passed QA/clean verification; M08's read-only HTTP/browser detail/photo checks succeeded without POST.

## B-01 — Unresolved direct cross-origin cumulative-cart integration

**Status: open, accepted integration risk; unresolved for a fully cumulative live browser cart, but not a blocker for separately authorized local tooling.** M00/M01 explicitly accept the risk without declaring it resolved. No proxy, credential change, client session substitute or counter workaround has been implemented.

**Evidence:**

1. **Historical, 2026-11-06:** independent shell additions returned `1`; reusing the initial response's session cookie returned `2`. Original temporary traces are unavailable. This result remains dated historical evidence; M01 did not repeat that mutation sequence.
2. **Fresh M01, 2026-11-09:** captured GET/OPTIONS headers show wildcard origin and no credential permission; Set-Cookie shows `session_id`, Path `/`, HttpOnly, without SameSite/Secure attributes. A curl GET that reused the list cookie returned 200 and no replacement cookie. Values are redacted; read success is not proof of cart-state continuity or session duration.
3. **Fresh Chrome, normal security:** at `http://localhost:49788`, the product GET with `omit` returned 200 and the GET with `include` failed with no readable HTTP status. At `http://localhost:49823`, the sole current POST used real string/numeric identifiers and `omit`, returning 200 and `{count: 1}`. No credentialed POST was sent, and no fresh accumulated count was demonstrated. Full POST headers were not exposed/captured; GET/OPTIONS headers and browser outcomes are recorded separately.
4. **Standards-based interpretation:** credentialed CORS cannot use wildcard origin; see [MDN's explanation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS/Errors/CORSNotSupportingCredentials). `include` does not override cookie/browser restrictions, and HttpOnly is a JavaScript-read restriction, not the cause of CORS failure. Manual curl reuse does not demonstrate browser compatibility. The GET failure is observed; the analogous credentialed POST constraint is inferred, not claimed as a fresh POST result.

**M06, 2026-11-10 (separate from historical evidence):** [the bounded Chromium attempt](../evidence/m06/2026-11-10/README.md) used the real development app with `omit`, normal security and a temporary 12-second diagnostic abort bound. It recorded two detail GET events during StrictMode mounting but no readable HTTP response; exact per-event failure causes were not captured. The page presented a safe read error. **No POST was sent** because current options could not be read. No `include`/cookie/proxy change or new accumulation test occurred. This limits present integration verification; it neither proves a universal outage nor resolves B-01. M01 is preserved as historical POST evidence.

**M08, 2026-11-10:** bounded read-only HTTP checks returned 200 for list/detail/two JPEGs. A fresh normal-security Chromium production-preview context rendered one actual remote detail/photo, both GETs 200. Zero POSTs were sent; no cookie/credential policy changed. This narrows read/photo availability uncertainty, not the unresolved cumulative-cart claim. [Dated evidence](../evidence/m08/2026-11-10/README.md).

**Post-M08 cart investigation, 2026-11-10, 04:03 UTC:** [focused investigation](../qa/cart-session-investigation.md) attempted the authorized two-addition journey in fresh normal-security Chromium, but the prerequisite detail read produced no readable HTTP response within its bounded wait. **Zero POSTs were sent**, and live probing stopped. No fresh consecutive counts, POST headers or cookie exclusion cause were obtained. The unchanged frontend passed 222 unit/integration and 60 E2E cases; a separate intercepted UI check followed `1 → 2 → 1 → 1` exactly in Header/storage and restored `1` on reload. No new frontend defect or justified code fix was found. Direct credentialed transport still requires verified API/CORS/cookie changes; a proxy still requires an explicitly approved production-compatible hosting plan. B-01 stays open; neither mocked accumulation nor this failed live read resolves it.

**Implication:** direct calls can return valid counts while losing session accumulation between calls. Persisting the latest response is correct under the approved decision, but must not be described as restoring the server cart. Simply enabling credentials is not a demonstrated fix. Cookie policy may also need attention if the API transport is changed.

**Accepted scope and remaining gate:** risk acceptance already permits M02 tooling after explicit authorization. It does not prove cumulative-cart correctness. Before claiming final live-cart completeness, consider:

- Prefer clarification or a browser-compatible API/session policy from the assignment owner. Recheck the chosen origin and session behavior once a change is available.
- Alternatively, explicitly accept the direct-API limitation: show each actual returned count, which may repeatedly be `1`, and document the backend/session constraint. This accepts a limitation; it does not prove cumulative behavior required by the basket description.
- If a proxy is proposed, review it as a scope/hosting trade-off first. It must solve cookie/session forwarding in both development and production without requiring the evaluator to run an undocumented backend. A Vite-only development proxy is not a production solution. No proxy is part of the current simple-SPA baseline.

**Do not:** increment locally, read the HttpOnly cookie in JavaScript, move the session secret into localStorage, invent a cart-read endpoint, use `no-cors`, disable browser security, or auto-retry POSTs. None resolves the assignment contract honestly.

## Architecture review outcome

The core design is appropriately small after reducing file boundaries: two pages; App's persistent shell; Header with breadcrumbs; inline list search; meaningful ProductCard/Image/Description/Actions components; three focused API modules; small storage/cache functions; one count Context. No Redux, query framework, generic resource-hook system, schema framework, reducer, service container, variant engine, or new backend is justified by the present scope.

Keep API/persistence boundaries because the required TTL and response-authoritative count have real independent behavior. Keep browser tests focused on critical journeys/layout; do not duplicate every DOM test or install an additional mocking system without a demonstrated need. The folder outline is a guide, not an instruction to generate every empty file.

## Remaining risk controls and next gate

- Use observed field mappings and honest missing-value fallbacks; do not silently rename the external contract or assume all detail values are strings.
- Isolate GET cache keys, validate timestamps, test expiry boundaries with fake time, and never reset count when product data expires. Storage fallback cannot guarantee reload persistence if browser storage is blocked.
- Prevent late product reads from overwriting the current route and reset selections by ID. Use actual numeric codes, guard double submission, retain confirmed count on failure, and never auto-replay a possibly completed add.
- Treat non-OK responses generically enough to handle the observed unknown-ID 500; raw backend messages need not be exposed as untranslated UI text.
- Compare desktop structure directly with both wireframes, then check narrow screens, long content, zoom, focus, and image failure. Mocked tests cannot resolve B-01 or prove production deep-link/session behavior.
- Record progressive commits only after implementation authorization. After a later push/PR update, check CI once; if pending/running, report and stop until the user returns. No polling/watching/waiting agents, automatic merge, or automatic deployment.

M06 has verified option defaults/membership, exact numeric POST payload, confirmed-count replacement/persistence and error/duplicate protection, preserving M03 product cache and M01 evidence. All 220 unit/integration tests and 52 browser cases passed, with lint/build successful. One bounded manual real-browser pre-read failed; no POST was sent. The current POST and cumulative session integration remain unverified, with B-01 accepted/open. M07 and M08 have since completed QA/clean verification at 222 unit/integration and 60 E2E cases, with successful read-only HTTP/browser detail/photo checks. Stop at manual review; this authorizes no further remote mutations. Unsampled schema/error variants, currency/units, session lifetime and tool-maintenance limits remain documented rather than fabricated or solved through scope expansion.
