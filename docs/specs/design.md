# Proposed design

Status: Phase 1.1 reviewed proposal. The user's approved cache, cart-count, selector, search, and Spanish-language decisions are incorporated. Implementation is still unauthorized. Requirements and live API evidence refer to [requirements.md](requirements.md); unresolved integration blocker B-01 is in [open-questions.md](open-questions.md). Folder trees and script plans remain prospective.

## Architecture overview

Use a small React SPA with two route-level pages and a persistent application shell in App. Pages coordinate remote data and local interactions; presentational components render props; a dedicated API boundary handles HTTP; storage modules own persistence and product-cache expiration. One small Context owns the shared cart count. Product data is not duplicated into that Context. Spanish is the approved UI language.

The dependency direction is `pages -> API functions -> HTTP client` for network access, and `product API functions -> cache -> browser storage` for cache access. Cart mutations use the HTTP client directly. Components never construct URLs or read localStorage directly. The cart provider reads/writes its own count through the storage boundary.

This is sufficient for the two-view scope without repositories/interfaces per entity, a generic service container, event bus, schema framework, or a global state library. Create shared helpers only when they serve actual repeated behavior. Keep search markup within PLP and breadcrumb markup within Header initially; do not force a component or directory for every named wireframe region.

## Proposed stack and rationale

- **React + React DOM, JavaScript/JSX, ES modules:** satisfies the assignment's framework requirement and language preference. Use function components and standard hooks; no TypeScript or additional application framework.
- **Vite + its React integration:** development server and static production build for a client SPA. Use a minimal template only after approval. It supplies the two build-time responsibilities described in its [official guide](https://vite.dev/guide/).
- **React Router in declarative mode:** two client routes, ordinary links, URL parameters, and browser history. Avoid its framework/SSR mode and avoid mixing route loaders with a second data-fetch mechanism. See [declarative setup](https://reactrouter.com/start/declarative/installation).
- **CSS Modules + a small global stylesheet:** component-local styles, with global reset, typography, and CSS custom properties for spacing/colors. [Vite supports CSS Modules](https://vite.dev/guide/features#css-modules); no CSS-in-JS runtime or component library is needed.
- **Browser fetch, AbortController, localStorage, and Date:** cover HTTP, obsolete read cancellation, persisted count, and one-hour cache without Axios or a cache package. Product TTL and count independence are approved; guarded browser storage and the exact expiry implementation are engineering defaults.
- **Vitest:** unit/integration runner aligned with Vite's module tooling. See the [official guide](https://vitest.dev/guide/). Use fake time for cache boundaries rather than waiting in real time.
- **React Testing Library + DOM Testing Library, user-event, jest-dom, and jsdom:** component/route integration testing through visible behavior, keyboard interaction, and accessible roles. The [React Testing Library introduction](https://testing-library.com/docs/react-testing-library/intro/) describes its DOM-based approach. These are development dependencies and test support, not application dependencies.
- **Playwright Test:** a few critical journeys and real-browser layout checks, initially in Chromium with narrow and desktop viewports. [Network interception](https://playwright.dev/docs/network) makes the core E2E suite deterministic without mutating the shared live cart.
- **ESLint with recommended JavaScript, React Hooks, and JSX accessibility rules:** catches code, hook, and common semantic errors; manual accessibility review remains necessary. Choose compatible plugin versions during setup. See [ESLint setup](https://eslint.org/docs/latest/use/getting-started).
- **npm and a committed lockfile:** proposed conventional package management and reproducible installs; no second lockfile. Select and document a supported Node LTS compatible with the chosen releases during M02. No exact tool versions or Node minimum are asserted in Phase 1.

React Context distributes the count to distant consumers without routing it through every intermediate component; this is the use case described in the [React Context documentation](https://react.dev/learn/passing-data-deeply-with-context). Its scope here is one scalar and an update operation. Redux and a reducer are unnecessary. TanStack Query would add configuration and persistence work for only two read endpoints; a small explicitly tested cache is more direct for this challenge's fixed TTL.

## Proposed folder structure

```text
docs/specs/                 requirements, design, tasks, open questions
README.md                   actual setup and delivery evidence, added later
src/
  main.jsx                  mount React and the router
  app/
    App.jsx                 two routes, persistent header/main shell
    CartProvider.jsx        shared count and server-count update operation
  pages/
    ProductListPage.jsx      list request state, query, derived filtering
    ProductDetailsPage.jsx   detail request state, options, add coordination
  components/
    Header.jsx              home link, breadcrumb markup, cart count
    ProductCard.jsx          accessible product link and summary
    ProductImage.jsx         shared image/fallback behavior
    ProductDescription.jsx   labeled detail attributes
    ProductActions.jsx       color/storage controls and Add feedback
  api/
    client.js               base URL, fetch, JSON/error handling
    products.js             list/detail reads and their cache integration
    cart.js                 add-to-cart POST, never response-cached
  storage/
    storage.js              guarded JSON reads/writes with memory fallback
    productCache.js         successful-read entries and fixed TTL
  styles/
    globals.css             reset and design tokens
  test/
    setup.js                DOM matchers and test cleanup
    fixtures.js             contract-validated representative data
e2e/                        critical browser journeys
```

Colocate each component's `.module.css` and meaningful tests with its implementation. Configuration files are JavaScript. Keep search and request-state markup in their pages initially; extract repeated loading/error presentation only when it is actually repeated. Keep read effects in their pages; extract a focused hook only if duplication warrants it. No separate AppLayout, SearchInput, Breadcrumbs, or generic RequestState file is required. Do not create empty placeholder files or all folders in advance.

## Component hierarchy and responsibilities

```text
BrowserRouter
  CartProvider
    App (persistent shell and two routes)
      Header
        Home link
        Breadcrumb navigation
        Cart count
      Main route content
        ProductListPage (/)
          Labeled search input (page markup)
          Loading/error/empty state OR grid -> ProductCard -> ProductImage
        ProductDetailsPage (/products/:id)
          Back-to-products link
          Loading/error state OR detail layout
            ProductImage (left column)
            Description/actions column
              ProductDescription
              ProductActions
```

The page owns requests and user interaction state; child components receive values and callbacks. ProductImage is genuinely reused by both views; ProductCard and ProductActions each have distinct interaction behavior; ProductDescription keeps eleven labels/mappings readable. Header owns its breadcrumb markup and may use the route to display “Productos” / “Detalle del producto”; a model-specific breadcrumb is optional and must not trigger another detail request. Avoid wrapping every native element in a custom design-system component.

## Routing strategy

- `/` renders PLP; `/products/:id` renders PDP. These paths are project choices; the PDF does not specify frontend paths.
- Put the shell and provider above the route switch so the header/count survive navigation. Breadcrumbs show “Productos” on the list and a “Productos” link plus “Detalle del producto” on detail. A model-specific current label is optional, not another shared-state requirement.
- Product cards use real links. Observed IDs are strings; encode them for URLs and preserve that string value in POST payloads. Do not parse them as integers.
- PDP's explicit return link targets `/`, rather than calling history back. Direct PDP entry, refresh, and browser Back/Forward must work.
- Unknown product is an error state inside PDP; the actual API returned 500 for the invalid-ID probe, so do not assume a 404 or mislabel every 500 as a confirmed missing product. Unmatched frontend paths use replace-navigation to `/` rather than adding a third page. Q-07 records this architectural default.
- BrowserRouter requires static hosting to return `index.html` for frontend deep links. Document that requirement; verify it against the eventual host. Choose HashRouter only if the host cannot provide a rewrite, documenting the trade-off. No deployment occurs in these phases without explicit authorization.
- Search is local PLP state initially; preserving it across route remounts is optional. Do not add URL-state synchronization solely for this small scope.

## API integration strategy

### Observed baseline and remaining integration gate

The PDF defines three paths and the cart field names. The initial timeout was superseded by successful Phase 1.1 live checks: 100 list records, four representative details, real-code POSTs, session reuse, unknown-ID behavior, OPTIONS headers, and a real Chrome cross-origin diagnostic. The exact observations, sample IDs, key names/types, and limitations are centralized in requirements.md instead of duplicated as a second schema.

There is enough current evidence to prepare list/detail boundary code and representative fixtures after approval. O is not an exhaustive permanent schema: nullable/type variants not sampled must still be handled defensively. Missing specs/prices are data-quality cases with honest fallbacks, not a reason to invent data or block all local development. Image URLs were observed, but image rendering/failure still needs UI verification.

**B-01: direct cross-origin cart accumulation is unresolved.** Shell calls returned `1` without retaining a session and `2` when reusing the server's HttpOnly `session_id` cookie. Chrome from localhost could read the list and JSON cart POST without credentials, but a credentialed GET failed. Inspected responses use wildcard origin and omit credential permission. A credentialed cross-origin browser mode cannot simply be enabled against that policy; see the [Fetch credential/CORS rules](https://fetch.spec.whatwg.org/#cors-protocol-and-credentials).

Do not add a local counter, read the HttpOnly cookie in JavaScript, put a session ID in localStorage, use `no-cors`, disable browser security, or silently introduce a proxy/backend. Resolve B-01 by obtaining a browser-compatible API/session policy, or explicitly accepting and documenting the direct-API limitation that independent calls may return `1`. A same-origin proxy would be a separately justified architecture/hosting change and would need to work in production, not only Vite development. Product work and isolated mutation tests can proceed after implementation approval; an end-to-end cumulative live-cart claim cannot.

### Boundary contract

- `getProducts({ signal })`: returns the validated list through the product cache.
- `getProduct(id, { signal })`: returns the matching detail through an ID-specific cache entry.
- `addToCart({ id, colorCode, storageCode })`: POSTs JSON and returns a validated count-bearing response. IDs remain strings and option codes remain numbers. Map a selected DOM value back to its actual option before submitting, rather than passing a stringified numeric code. No invented auth headers, quantity, or session identifier. Direct cross-origin calls omit credentials pending B-01 disposition; do not change transport silently.
- The HTTP client owns URL joining, HTTP success checking, JSON parsing, and a small normalized error shape. One observed 500 body is not a universal error contract. Show Spanish client messages instead of surfacing raw English server text. Distinguish an intentional read abort from a user-visible failure.
- Validate the minimum response shape needed to render and submit safely using small functions/JSDoc. Treat malformed payloads as boundary errors. Avoid an extra runtime-schema library for two resources.
- Keep field mapping/formatting in products.js or a small nearby helper, without another adapter layer. Map `dimentions` and `secondaryCmera` exactly as received; use the observed pixel value in `displaySize` for “Resolución de pantalla”, since `displayResolution` contains inches in all four samples. Join string arrays for CPU/cameras. Treat empty strings and the dimensions placeholder `"-"` as unavailable while retaining labels. Distinguish valid zero from missing; never turn empty price into zero. No currency/weight unit is established, so show supplied nonempty values without invented EUR/g suffixes. This is a documented mapping recommendation, not a claim that the PDF specifies these keys.
- Abort obsolete product reads or ignore their results when the route changes/unmounts. New product IDs reset old data and selections so a late response for A cannot overwrite B. Keep mutation requests deliberate: do not automatically retry POSTs or assume cancellation undoes a server-side add.

### One-hour cache algorithm

Approved scope: product data cached with a one-hour TTL; cart count persists independently. Successful list/detail GETs use the following minimal implementation defaults. Q-02 is closed; it does not require renewed permission.

1. Use versioned, endpoint-specific keys for list and each detail, including the API base identity to avoid mixing environments. A list summary never satisfies a detail read.
2. Persist an entry with validated `data` and `fetchedAt` after a successful response. Use localStorage for reload reuse, with an in-memory fallback when storage is unavailable. The assignment allows memory-only storage, but reload reuse is useful and simple for this small dataset.
3. On read, reject malformed entries, incompatible versions, invalid/non-finite timestamps, and future timestamps. Treat them as misses. A valid age below `3,600,000 ms` returns cached data without fetching. Reading does not refresh `fetchedAt`.
4. At or after the TTL boundary, treat the entry as expired and fetch when the data is next requested. Replace it only on success. Do not start hourly timers or refetch on every keystroke or route change while fresh.
5. Never store errors or aborted reads as successful data. If an expired entry cannot be revalidated, show the error/retry state instead of silently presenting it as fresh. Serving explicitly marked stale data is not proposed for the initial scope.
6. Route retry deliberately calls the failed read again; it must not turn a stale cache entry into a hit. Expired/malformed entries can be removed when encountered. No LRU, background sync, cache dashboard, or bulk prefetch is needed.

The TTL measures time since receipt, rather than since the most recent read. One hour and client-side caching are explicit requirements; persistent storage choice, exact boundary behavior, and revalidation on demand are proposed details. Conditional requests/ETags are not assumed. React development-mode effects may start and cancel reads; ensure correctness first and add in-flight sharing only if duplicate completed requests are demonstrated.

## State and mutation decisions

- **PLP local state:** fetched list, read status/error, and input query. Compute results from list/query instead of maintaining another synchronized results array. Approved behavior: immediate, partial, case-insensitive brand/model matching. Simple default: trim the query and compare substrings in either field; empty input matches all. No debounce or network request per keystroke. Token/accent expansion and combined-field phrases are not additional scope; Q-03 is closed.
- **PDP local state:** current detail, read status/error, selected color/storage codes, and mutation pending/error/success. Approved defaults: singleton groups are visible/preselected; multiple-option groups are initially unselected. Selections reset when the product ID changes. Read actual options from `options.colors` / `options.storages`, preserve numeric codes, and validate membership before submitting. Q-04 is closed.
- **Shared state:** CartProvider hydrates one count from guarded, versioned storage, provides it to the header, and accepts validated counts after successful POSTs. Initial fallback `0` is a presentation proposal when no valid persisted value exists, not a server assertion. Context is needed for the header/PDP relationship, not for all page state.
- **Persisted count:** approved independent persistence under a separate key, without product-cache expiration resetting it. Restore the last confirmed value across reloads/browser sessions when storage is available. Reject malformed, negative, non-integer, or non-finite values; keep confirmed count on failed POST. There is no documented cart-read endpoint for reconciliation. Response authority and independent persistence are settled; B-01 concerns transport/server continuity, not a reason to reopen those decisions.
- **Add flow:** validate options -> set pending -> submit exact payload once -> validate response -> replace shared count with response `count` -> persist -> show inline success. Do not optimistically increment. Disable Add while pending and prevent duplicate event submission. Repeated deliberate additions after completion are allowed by the described action; server deduplication is unknown.
- **Mutation failures:** keep selections and previous count; show an actionable inline error. An interrupted connection after POST has an uncertain outcome, so never automatically replay it. Storage write failure must not turn a successful server add into a fake API failure; keep the in-memory value and indicate persistence degradation when useful.

## UI and UX approach

Keep the visual hierarchy of A pp.3–4, with generous but restrained spacing, consistent type, neutral surfaces, visible controls, and product images given stable, contained space. No new logo, external font download, stock photography, hero area, carousel, or unrelated commerce feature is required.

- **PLP:** content container under the header; labeled search above and right-aligned with the grid on desktop; full available width on narrow screens. CSS Grid uses explicitly capped tracks: one column initially, then two, optionally three, and at most four. Proposed content-driven starting breakpoints are approximately 480/768/1024 CSS px; validate card width instead of treating those numbers as assignment requirements. Keep the cap at ultrawide widths.
- **PDP:** single-column mobile flow image -> description -> actions; switch to the required two-column relationship when content fits (initially around 768 CSS px, subject to review). Keep description above controls in the right column. Place an explicit back link before the detail content.
- **Options:** prefer native radios in labeled fieldsets, styled as compact choices like the wireframe. Show textual color names; a swatch can supplement but cannot replace the name. Singletons remain visible and selected. No inferred option-combination or stock restrictions.
- **Price/specs:** Spanish interface and labels are approved. Use “Precio no disponible” for absent price and “No disponible” for absent specs; keep supplied product names and spec strings. Preserve required labels. No invented currency, unit, translation, price computation, or out-of-stock rule. Required screen resolution uses the pixel-bearing observed field. Q-06's language decision is closed; currency/units remain documented nonblocking data limits.
- **Loading:** retain shell and count; show an accessible loading message and reserve sensible image/card space. Skeleton animations are unnecessary.
- **Empty/error:** distinguish an empty API result from no search matches. Provide clearable search feedback, “Reintentar” for read errors, a generic Spanish load-error state inside PDP, and a “Volver a productos” link. Only identify a product as absent when supported by the response; the observed unknown-ID 500 is not a safe global not-found signal. A broken image uses a bounded fallback with useful alternative text.
- **Mutation:** show pending, success, and failure inline without a new route or modal. Disable Add with a nearby explanation when options are missing/invalid. Preserve inputs on errors.

## Accessibility considerations

Use `header`, a labeled breadcrumb `nav`, a single `main`, logical headings, and a skip link. Mark the current breadcrumb with `aria-current="page"`. Product links need meaningful names and focus styles; avoid nested interactive elements inside links.

Search has a persistent label rather than only a placeholder. Option fieldsets/legends express the two groups; keyboard behavior should remain native. Add is a real button. Announce asynchronous errors and add results appropriately; use a restrained polite status for cart-count updates without moving focus. Loading status must be discoverable without announcing every card.

Use descriptive image alternatives without redundantly repeating every nearby label. Do not convey selection, errors, or color names solely through color. Target WCAG AA contrast, comfortable touch targets, 200% zoom, reduced-motion preference where relevant, and no horizontal page overflow at a 320 CSS px viewport. These are proposed quality criteria, not an assignment certification requirement.

After route navigation, update the document title and move focus to the new page's main heading/content when appropriate; do not steal focus on search updates or count changes. A correct DOM test cannot establish contrast, focus visibility, or layout: review those in a browser.

## Testing strategy

Trace future cases to R-IDs rather than targeting an arbitrary coverage number. Add tests with the behavior they protect; avoid mount-only tests, implementation-detail snapshots, or a large generic test framework.

- **Boundary/unit:** HTTP URL/method/body and non-OK/invalid JSON handling; minimal shape checks; cache miss/fresh hit/per-ID isolation and TTL just before/at/after one hour; corrupt/future entries; storage denial; failed revalidation. Fake clocks and isolated storage keep these fast. Check search edge cases in page tests unless a separately useful pure function is extracted.
- **RTL integration:** PLP completeness and immediate partial/case-insensitive brand/model filtering; Spanish visible/accessibility labels; accessible product link; PDP's eleven required labels; observed `displaySize` resolution mapping, misspelled fields, string/array CPU/cameras, empty price/battery/weight, and dash dimensions. Cover visible singleton defaults, initially unselected multiple groups, exact numeric POST codes, invalid/no-option prevention, repeated returned count `1`, reload/count independence from TTL, failures, and duplicate-submit guard. Exercise a stale detail response after a route change. Use real components/router/provider with fetch mocked at the network boundary, not mocks of every internal module.
- **Critical Playwright journeys:** browse/filter/open/back and direct PDP refresh; choose/add and see returned count across both views and reload; GET error/retry and failed POST preserving prior count; narrow/desktop/wide layout and keyboard interaction. Intercept the three API endpoints with validated fixtures, inspect outgoing payloads, and isolate localStorage per test. Test TTL exhaustively in Vitest, with at most one browser cache-reuse smoke check.
- **Visual/manual:** compare desktop structure directly to PDF pp.3–4, verify four-column maximum and PDP columns, then mobile stacking, header count placement, long content, image failure, focus, contrast, and zoom. Avoid screenshot baselines against the colored wireframes; they define structure, not final pixels.
- **Live integration:** Phase 1.1 endpoint/Chrome findings are already documented, but no React UI has been tested. After B-01's disposition and implementation, verify actual page-to-service behavior under that transport policy. Do not repeat live cart additions on every test run, and do not treat a mock returning `2` as proof of real browser session accumulation.

MSW and an automated accessibility scanner can be added only if the initial boundary mocks/manual checks become inadequate. Start with Vitest fetch mocks and Playwright routing; prevent unexpected test requests from reaching the real cart.

## Scripts, README, and delivery plan

Proposed script mapping: `npm start` -> Vite development server; `npm run build` -> production build; `npm test` -> finite `vitest run`; `npm run lint` -> ESLint. Optional developer commands: `test:watch`, `test:e2e`, and `preview`. Exact script capitalization is Q-08. The four required operations remain explicit even if optional commands are omitted.

Create the actual README in the first future commit after approval, before scaffolding. Planned structure:

1. **Purpose and status:** assignment scope, two views, current milestone; clearly identify incomplete work.
2. **Prerequisites:** exact supported Node/npm versions chosen at setup and later Playwright browser prerequisites.
3. **Install and run:** clone/location, lockfile-based install once available, required environment configuration, `npm start`, expected local URL.
4. **Command reference:** actual development, build, finite test, and lint scripts; add E2E, watch, and preview only when implemented.
5. **Scope and behavior:** implemented requirements only, with links to specs and their source references; no speculative feature checklist.
6. **Architecture and decisions:** folder responsibilities, client routes, dependency rationale, API boundary, cart count ownership, and one-hour cache policy.
7. **API/configuration:** base URL, validated contract summary, optional base-URL environment override if introduced, browser CORS findings, and error/persistence limitations. Exposed frontend environment values are not secrets.
8. **Testing:** unit/integration/E2E commands, fixture isolation, browser setup, optional live smoke procedure, and actual recorded validation results.
9. **Production execution:** build output and local preview; static-host deep-link rewrite requirement. Include a hosted URL only if a deployment is later explicitly authorized and performed.
10. **Final delivery:** requirement/milestone traceability, screenshots if useful, tested environments, remaining limitations, decisions, and reproducible check evidence. Do not add unverified badges, coverage claims, or passing-test statements.

No README, package manifest, configuration, application source, test file, lockfile, generated map, or build output is created in Phases 1/1.1. Diagnostics used temporary HTTP/browser tooling outside the workspace and did not create application files. The architecture is described here because these phases authorize specification documents and endpoint review only.

After later pushes/PR updates, inspect CI once. If pending/running, report that state and stop until the user returns; do not watch/poll or delegate waiting. Never merge or deploy automatically.

## Trade-offs and review gates

LocalStorage plus guarded memory fallback is more work than memory alone, but gives reload reuse and explicit testable persistence. Its failure/size limits are acceptable for a small catalog; no large-data store is justified by the PDF. Cart persistence cannot establish server truth without a cart-read endpoint, so document the limitation rather than invent reconciliation.

The reviewed architecture remains appropriate for a two-page SPA after simplifying file boundaries: App contains the shell; Header contains breadcrumbs; PLP contains search; request-state markup stays local until reuse justifies extraction. Keep the meaningful ProductImage/Card/Description/Actions components and three small API modules. CartProvider owns a scalar, not cart items or a reducer. Do not create generic resource hooks, a variant engine, model classes, a service framework, or a second state store. Endpoint-specific functions and one read cache are enough.

Page-level reads and one Context keep data flow visible; they require deliberate cancellation, cache, and mutation tests. A query library would be reconsidered only if actual behavior expands beyond this scope. Native controls and CSS Modules preserve accessibility and styling freedom with few dependencies. A small E2E suite validates routing/layout that DOM tests cannot; it complements targeted component tests rather than duplicating them all. Session/CORS incompatibility is a backend/integration finding, not justification to enlarge the frontend by default.

Implementation awaits explicit approval. Do not ask again about the decisions already approved in D. Product contract discovery has sufficient representative evidence; B-01 still needs a disposition before claiming a fully cumulative cross-origin live cart. Other routine choices in Q-07/Q-08 are nonblocking architectural defaults. No application tests have been run in this phase.
