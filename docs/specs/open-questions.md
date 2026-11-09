# Decision register, open questions, and risks

Status: Phase 1.1 review, 2026-11-06. Approved design decisions are closed and must not be requested again. Implementation still requires explicit approval. R-IDs and the complete API observations are in [requirements.md](requirements.md); architecture and milestones are in [design.md](design.md) and [tasks.md](tasks.md).

## Review evidence and outcome

- The original eight-page PDF was reread and both wireframes were visually compared with the specs. No explicit PDF requirement was missing from R-01–R-28. R-29 records the user's newly approved Spanish interface, not another requirement inferred from the PDF.
- Phase 1's API timeout was superseded by successful Phase 1.1 discovery: the 100-record list, four real detail records, three controlled shell cart additions, one browser addition, an unknown-ID error, and cart preflight headers. Probes were bounded and POSTs were not automatically retried.
- Real data exposes six empty list prices, missing detail values, misspelled keys, string/array variation, numeric option codes, apparently reversed screen keys, an unknown-ID 500, and cookie-dependent count accumulation. Exact samples, methods, types, and bounds are centralized in requirements.md.
- Installed Chrome with normal web security verified readable GET/JSON POST responses without credentials and a failed credentialed GET. This was a temporary diagnostic, not a React app or application E2E suite. Browser diagnostics required no dependency installation or application files.
- Only the four existing specification files are modified in this phase. No Git repository, application source, package manifest, test suite, README, or build has been created. No application checks are claimed as passing.

## Decision register

### Q-01 — API availability and representative product contract

- **Status:** prior discovery blocker resolved for representative list/detail/payload structure; not an exhaustive permanent schema. Cart transport is tracked separately in B-01.
- **Established:** list records contain string `id`, `brand`, `model`, `price`, and `imgUrl`. Four real detail responses expose the required display data, option codes, missing values, and type variations. A valid cart body uses a string ID and numeric codes from `options.colors` / `options.storages`; a successful response has numeric `count`.
- **Remaining limits:** all 100 detail variants, nullability, every error type, image loading, currency/weight units, inventory/combination rules, and session lifetime were not exhaustively established. A snapshot does not guarantee future server behavior.
- **Action:** use the observed baseline for small boundary validators and representative fixtures after approval; handle honest absent-value and generic HTTP failure states. Do not repeatedly probe the service without a new reason or invent production data. Images are verified with the UI later.
- **Gate:** sufficient product evidence exists for local implementation after approval. No blanket API-unavailable blocker remains. Related: R-07, R-13–R-19.

### Q-02 — Product TTL and independent count persistence

- **Status:** approved by the user in Phase 1.1; closed.
- **Approved decision:** product data has a one-hour TTL and expired data is revalidated. Persist the API-returned cart count independently from product-cache expiration. Product expiry must not reset it.
- **Implementation defaults:** successful list/detail GETs have distinct keys, each detail is keyed by ID, expiry is measured from successful receipt at `>= 3,600,000 ms`, and the next read revalidates. Reading does not renew TTL. Use guarded localStorage with memory fallback. POST actions are never cached or replayed. There is no product-TTL-driven cart reset.
- **Source distinction:** one-hour client caching is explicit in A p.8; the separate count policy is the user's approved interpretation of A pp.6,8. Exact boundary/storage/on-demand details are engineering defaults rather than additional PDF claims.
- **Gate:** no further permission is needed for these decisions; implementation itself still awaits approval. Related: R-18, R-20, R-21.

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
- **Evidence/test implication:** requests without retained cookies returned `1`; the same payload with the first response's session cookie returned `2`. A persisted client count does not itself restore that server session. Never auto-retry an uncertain POST or treat a transport failure as proof the server did not add.
- **Gate:** do not reopen count ownership/persistence approval. B-01 requires a transport/limitation decision before claiming cumulative live cross-origin behavior. Related: R-10, R-17, R-18, R-20.

### Q-06 — Spanish UI, price/spec formatting

- **Status:** Spanish interface approved; language question closed. A does not prescribe another final UI language. Currency and unprovided units remain nonblocking data limits.
- **Approved behavior:** Spanish navigation, labels, buttons, feedback, and accessible names. Product/model names and supplied technical descriptions remain source data rather than invented translations.
- **Implementation defaults:** show `Precio no disponible` for absent price and `No disponible` for absent specs; preserve all required detail labels. Render a supplied price/weight without an unverified currency/unit suffix. Never coerce empty price to zero or interpret missing price as out of stock.
- **Observed mapping:** `displaySize` contains pixels while `displayResolution` contains inches in all four samples; use the pixel-bearing field for the required resolution. Honor actual `dimentions` and `secondaryCmera` keys. Join CPU/camera string arrays. The dimensions placeholder `-` is unavailable data. These are explicit architectural mappings from observed values, not corrected server contracts.
- **Gate:** no language decision or wholesale data blocker remains. Revisit currency/units only if official evidence appears; do not invent them to complete presentation. Related: R-07, R-13, R-25, R-26, R-29.

### Q-07 — Responsive layout, frontend paths, and hosting

- **Status:** nonblocking architectural defaults proposed for the overall implementation approval; not unresolved product requirements.
- **Source:** A pp.3–4 requires adaptive list columns, at most four cards per row, and a two-column detail reference; mobile stacking, breakpoints, frontend paths, and unknown-route policy are not prescribed.
- **Default:** preserve desktop hierarchy, stack PDP image/description/actions on narrow screens, and use one-to-four list columns. BrowserRouter with `/` and `/products/:id`; unknown-detail errors stay within PDP; unmatched frontend routes replace-navigate to PLP. Do not assume the API's unknown-ID error is a 404.
- **Later verification:** eventual hosting must support SPA deep-link rewrites. Choose HashRouter only if a real hosting constraint requires it. Hosting is not a reason to introduce SSR or another business page.
- **Gate:** no separate clarification is needed to plan local code; actual host compatibility is checked before delivery. Related: R-01, R-06, R-11, R-12, R-25.

### Q-08 — Script names and dependency choices

- **Status:** nonblocking engineering defaults proposed; literal uppercase script keys are not established by A's START/BUILD/TEST/LINT operation labels.
- **Default:** lowercase `start`, `build`, `test`, `lint`, with a finite `vitest run` for `test`; optional watch/E2E/preview scripts. Use the preferred React/Vite/JavaScript/Router/CSS Modules/Vitest/RTL/Playwright/ESLint stack, npm, one lockfile, and a compatible Node LTS chosen during setup.
- **Boundary:** no exact version, arbitrary coverage target, CI vendor, formatter, state library, or API/schema package is mandated by the PDF. Add uppercase aliases only if a real evaluator requirement emerges.
- **Gate:** overall implementation approval, not an additional question about routine defaults. Related: R-02, R-22, R-27.

### Q-09 — Repository destination and first commit

- **Status:** deferred delivery choice; no current local implementation blocker after approval.
- **Source:** A p.2 requests an open-code repository and prefers a README in the first commit. No Git repository was detected. Phases 1/1.1 do not authorize repository initialization, publication, or a PR.
- **Plan:** after explicit implementation approval, include approved specs and an honest initial README in the first local commit before scaffolding. Decide host/owner/visibility and inclusion of the source PDF before publication. No need to publish during local implementation.
- **Gate:** explicit implementation approval before local setup; repository destination before later authorized publication. Never merge or deploy automatically. Related: R-23, R-24, R-28.

## B-01 — Unresolved direct cross-origin cumulative-cart integration

**Status: unresolved material integration blocker for a fully cumulative live browser cart; not a blocker for approved local shell/product work or isolated cart UI development.** No workaround has been implemented or approved.

**Evidence:**

1. The valid payload used a real string product ID and numeric color/storage codes. The initial shell POST returned `{count: 1}`; a deliberate independent POST without retained cookies also returned `1`; reusing the initial response's HttpOnly `session_id` cookie returned `2`.
2. Inspected list/detail/cart responses expose `Access-Control-Allow-Origin: *` and no `Access-Control-Allow-Credentials`. The cookie has `Path=/` and `HttpOnly`, without observed SameSite/Secure attributes. No cookie values are stored in these documents.
3. Chrome from `http://localhost:61264` could read a product GET and JSON cart POST with credentials omitted. The browser POST returned `1`. A product GET with `credentials: include` failed with `TypeError: Failed to fetch`.
4. Browser credentialed CORS responses cannot use wildcard origin; see [MDN's browser error explanation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS/Errors/CORSNotSupportingCredentials). A curl request that manually reuses a cookie is not proof of a valid browser session flow. The specific credentialed POST was not sent in Chrome, so distinguish the observed GET failure from the inferred transport incompatibility.

**Implication:** direct calls can return valid counts while losing session accumulation between calls. Persisting the latest response is correct under the approved decision, but must not be described as restoring the server cart. Simply enabling credentials is not a demonstrated fix. Cookie policy may also need attention if the API transport is changed.

**Decision needed before claiming final live-cart completeness:**

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

The next user decision is the scope/limitation disposition for B-01 and explicit approval to start implementation. Approved cache/search/selector/language/count decisions are not reopened. No other discovered issue requires inventing requirements or blocking all local frontend work.
