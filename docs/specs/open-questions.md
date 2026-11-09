# Decision register, open questions, and risks

Status: M03 API/cache completed under explicit authorization. Approved design decisions remain closed; B-01 stays accepted and open. M00–M02 history and [dated API evidence](../evidence/m01/2026-11-09/README.md) are preserved. M04 onward remain unauthorized. R-IDs are in [requirements.md](requirements.md); architecture/milestones in [design.md](design.md) and [tasks.md](tasks.md).

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
- **M03 action/result:** unchanged M01 samples are now imported through test-only fixtures. Minimum ID/list/detail checks, optional-field normalization, generic HTTP failures and invalid JSON/network/abort behavior passed deterministic tests. Synthetic malformed inputs are labeled as robustness cases. No fresh live probe, blanket wire-requiredness or nullability promise follows. Images remain for later UI verification.
- **Gate:** sufficient product evidence exists for local implementation after approval. No blanket API-unavailable blocker remains. Related: R-07, R-13–R-19.

### Q-02 — Product TTL and independent count persistence

- **Status:** approved by the user in Phase 1.1; closed.
- **Approved decision:** product data has a one-hour TTL and expired data is revalidated. Persist the API-returned cart count independently from product-cache expiration. Product expiry must not reset it.
- **Implementation defaults:** successful list/detail GETs have distinct keys, each detail is keyed by ID, expiry is measured from successful receipt at `>= 3,600,000 ms`, and the next read revalidates. Reading does not renew TTL. Use guarded localStorage with memory fallback. POST actions are never cached or replayed. There is no product-TTL-driven cart reset.
- **Source distinction:** one-hour client caching is explicit in A p.8; the separate count policy is the user's approved interpretation of A pp.6,8. Exact boundary/storage/on-demand details are engineering defaults rather than additional PDF claims.
- **M03 result:** product cache implemented with versioned absolute-URL keys, exact TTL tests, receipt timestamps, validation/eviction, reload reuse and memory fallback after storage errors. Fallback is volatile and lasts for that storage instance; it does not extend expiry or guarantee reload persistence. Cart/count persistence remains M06.
- **Gate:** this product-cache decision has been implemented under M03 approval. M04 still requires authorization; count policy remains approved. Related: R-18, R-20, R-21.

### Q-03 — Search behavior

- **Status:** real-time, partial, case-insensitive brand/model matching approved; closed.
- **Approved behavior:** reevaluate results on every input change; compare brand and model without case sensitivity. No submit step or invented search endpoint.
- **Implementation default:** trimmed substring match in either field; empty query shows all. No debounce, tokenization, accent folding, or cross-field phrase matching is added. These unspecified matching refinements do not require a new approval gate or extra features.
- **Evidence/test implication:** the list contains lowercase `alcatel`, so preserve the supplied brand while matching queries such as `ALCATEL` case-insensitively. Snapshot brand counts are not hardcoded business rules.
- **Gate:** no blocker. Related: R-03, R-04.

### Q-04 — Option visibility and defaults

- **Status:** singleton and multi-option defaults approved; closed. A p.6 contains no contrary multi-option rule.
- **Approved behavior:** visibly render and preselect a singleton group; initially leave a multiple-option group unselected. Require valid selections in both groups before Add can submit.
- **Implementation defaults:** native labeled radio groups styled as compact choices; selections reset per product. Missing options disable adding with an explanation, rather than generating codes. Read options/codes from `options.colors` / `options.storages`, not label-only arrays. Preserve numeric types when handling DOM values.
- **Evidence/test implication:** real samples cover one color/two storages, two colors/one storage, and one option in both groups. No valid-combination or stock matrix was established; do not invent one.
- **Gate:** no decision blocker for control behavior. Live session transport remains B-01. Related: R-14–R-17.

### Q-05 — Count authority versus session continuity

- **Status:** API response as source of truth and independent persistence approved; closed for those decisions. Browser session continuity remains unresolved in B-01.
- **Approved behavior:** replace the displayed/persisted count with response `count`, even if the response is again `1` or differs from previous count plus one. No local increment or optimistic reconciliation.
- **Implementation defaults:** show `0` only when no valid stored count exists; retain the confirmed value after failure. Reject malformed/negative/non-integer counts. Storage failure keeps in-memory state but cannot promise reload persistence. No cart-read endpoint or backend reconciliation is documented.
- **Evidence/test implication:** historical 2026-11-06 additions returned `1` without cookies and `2` when reusing the session cookie. M01 freshly confirmed only one browser POST returning `1`; it did not repeat remote additions to test accumulation. A nonmutating GET with a manually reused cookie returned 200 without another Set-Cookie, which does not prove persistent cart state. Client count persistence does not restore that session. Never auto-retry an uncertain POST.
- **Gate:** count ownership/persistence and acceptance of B-01 as a risk are already settled. Do not claim a fully cumulative live browser cart without additional evidence or an explicit final limitation; this does not reopen permission for routine local tooling. Related: R-10, R-17, R-18, R-20.

### Q-06 — Spanish UI, price/spec formatting

- **Status:** Spanish interface approved; language question closed. A does not prescribe another final UI language. Currency and unprovided units remain nonblocking data limits.
- **Approved behavior:** Spanish navigation, labels, buttons, feedback, and accessible names. Product/model names and supplied technical descriptions remain source data rather than invented translations.
- **Implementation defaults:** show `Precio no disponible` for absent price and `No disponible` for absent specs; preserve all required detail labels. Render a supplied price/weight without an unverified currency/unit suffix. Never coerce empty price to zero or interpret missing price as out of stock.
- **Observed mapping:** `displaySize` contains pixels while `displayResolution` contains inches in all four samples; use the pixel-bearing field for the required resolution. Honor actual `dimentions` and `secondaryCmera` keys. Join CPU/camera string arrays. The dimensions placeholder `-` is unavailable data. These are explicit architectural mappings from observed values, not corrected server contracts.
- **Gate:** no language decision or wholesale data blocker remains. Revisit currency/units only if official evidence appears; do not invent them to complete presentation. Related: R-07, R-13, R-25, R-26, R-29.

### Q-07 — Responsive layout, frontend paths, and hosting

- **Status:** the two routes/mobile shell and unknown-route default are implemented in M02; product layouts remain for M04/M05, not unresolved new requirements.
- **Source:** A pp.3–4 requires adaptive list columns, at most four cards per row, and a two-column detail reference; mobile stacking, breakpoints, frontend paths, and unknown-route policy are not prescribed.
- **Default:** preserve desktop hierarchy, stack future PDP image/description/actions on narrow screens, and use one-to-four list columns later. M02 uses BrowserRouter with `/` and `/products/:id`; unmatched paths replace-navigate to PLP with a Spanish not-found notice. This reconciles the requested simple 404 fallback with the approved two-view design. Real product errors/layouts are not implemented, and the API unknown-ID error is not assumed to be 404.
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
- **Gate:** M03 received explicit approval for its focused commit/normal push; preserve previous history and the existing origin. M04 needs separate approval; no PR/merge/deploy. Preserve the one-check CI stop rule. Related: R-23, R-24, R-28.

## B-01 — Unresolved direct cross-origin cumulative-cart integration

**Status: open, accepted integration risk; unresolved for a fully cumulative live browser cart, but not a blocker for separately authorized local tooling.** M00/M01 explicitly accept the risk without declaring it resolved. No proxy, credential change, client session substitute or counter workaround has been implemented.

**Evidence:**

1. **Historical, 2026-11-06:** independent shell additions returned `1`; reusing the initial response's session cookie returned `2`. Original temporary traces are unavailable. This result remains dated historical evidence; M01 did not repeat that mutation sequence.
2. **Fresh M01, 2026-11-09:** captured GET/OPTIONS headers show wildcard origin and no credential permission; Set-Cookie shows `session_id`, Path `/`, HttpOnly, without SameSite/Secure attributes. A curl GET that reused the list cookie returned 200 and no replacement cookie. Values are redacted; read success is not proof of cart-state continuity or session duration.
3. **Fresh Chrome, normal security:** at `http://localhost:49788`, the product GET with `omit` returned 200 and the GET with `include` failed with no readable HTTP status. At `http://localhost:49823`, the sole current POST used real string/numeric identifiers and `omit`, returning 200 and `{count: 1}`. No credentialed POST was sent, and no fresh accumulated count was demonstrated. Full POST headers were not exposed/captured; GET/OPTIONS headers and browser outcomes are recorded separately.
4. **Standards-based interpretation:** credentialed CORS cannot use wildcard origin; see [MDN's explanation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS/Errors/CORSNotSupportingCredentials). `include` does not override cookie/browser restrictions, and HttpOnly is a JavaScript-read restriction, not the cause of CORS failure. Manual curl reuse does not demonstrate browser compatibility. The GET failure is observed; the analogous credentialed POST constraint is inferred, not claimed as a fresh POST result.

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

M03 has verified the isolated API/cache modules while preserving the M02 shell, M01 evidence and B-01 as accepted/open. It added 109 tests (112 total passing), and lint/build plus both existing E2E smokes passed. No live API calls or new integration facts are claimed. The next gate is explicit **M04** approval; there is no remaining blocker to proposing the isolated PLP milestone under the accepted risk. Final cumulative integration, unverified currency/units, unsampled schema/error variants and session lifetime remain limitations, not grounds to fabricate a contract or expand architecture. Development-tool maintenance limits are recorded in Q-08; no product decision was reopened.
