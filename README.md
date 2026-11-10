# ITX Frontend Challenge

A two-view React SPA for browsing mobile devices, inspecting specifications and adding a color/storage configuration through the assignment API. The application interface is **Spanish**. Development follows Spec-Driven Development (SDD) with independently verified milestones.

The frontend is implemented. M07 and the M08 clean checkout passed **222 unit/integration tests and 60 mocked Chromium E2E cases**, lint and build. [M08 verification](docs/qa/m08.md) records final reproducibility and delivery limits. The project has not been deployed or submitted. No GitHub CI checks are configured; local results are not a CI pass.

## Setup and execution

Verified environment: **Node 24.19.0** (`.nvmrc`), **npm 11.17.0**. Manifest ranges are Node `>=24.15.0 <25` and npm `>=11 <12`; other versions in those ranges have not been tested here.

```sh
git clone https://github.com/j0ssGZ/itx-fe-challenge.git
cd itx-fe-challenge
npm ci
npx playwright install chromium
npm run start
```

Vite normally serves `http://localhost:5173`; use its printed URL. No environment file, API credentials or secrets are required. The live application needs the remote service unless product data is cached. Automated tests intercept requests and never mutate the live cart.

Playwright browsers are separate from npm packages. On Linux, system dependencies may require `npx playwright install --with-deps chromium`; that OS setup was not verified on macOS.

- `npm run start`: development server.
- `npm test`: finite Vitest/React Testing Library suite.
- `npm run test:watch`: interactive Vitest.
- `npm run lint`: ESLint; warnings fail the command.
- `npm run build`: production assets in ignored `dist/`.
- `npm run preview`: local build preview, normally `http://localhost:4173`.
- `npm run test:e2e`: Chromium journeys against the production build. **Build first.** Playwright manages preview on `127.0.0.1:4173`; keep that port free.

```sh
npm run lint
npm test
npm run build
npm run test:e2e
```

Routes are `/` (catalogue) and `/products/:id` (detail). Both support direct entry and refresh locally. A future static host must return `index.html` for frontend deep links; Vite development/preview fallback is verified, not public hosting. Unmatched paths return to the catalogue with a Spanish notice. Preview is not a production server.

## Stack and architecture

React/React DOM **19.3.1**, React Router **8.5.1** (declarative), Vite **8.3.7**, JavaScript/JSX and CSS Modules. Testing uses Vitest **5.1.0**, React Testing Library **16.3.3**, jsdom **31.0.0**, Playwright **1.65.0** and ESLint **9.39.5**. ESLint 9 is deprecated/unsupported upstream but fits the installed accessibility plugin's peer range; no forced peers hide this maintenance limitation.

```text
src/
  app/          shell, routes and shared confirmed-count Context
  pages/        catalogue/search and detail request lifecycle
  components/   Header, ProductCard/Image/Description/Actions
  api/          fetch/JSON errors, product reads and cart POST
  storage/      guarded JSON storage, product cache and cart count
  styles/       global typography, reset and focus
  test/         setup and M01-based fixtures
e2e/            intercepted journeys and responsive/accessibility checks
docs/           SDD, decisions, dated API evidence and QA
```

Pages own request/search state; ProductActions owns selections/submission feedback; CartProvider shares only confirmed count and mutation-order bookkeeping. Native fetch/storage keep boundaries explicit without Redux, query frameworks or generic resource hooks. [The Astryx evaluation](docs/decisions/ui-library-evaluation.md) retains native controls/CSS Modules. Dependencies are pinned in one lockfile.

## API, cache and errors

Base URL: `https://itx-frontend-test.onrender.com`.

- `GET /api/product`: full catalogue. Search is local, immediate, partial and case-insensitive by brand/model; no request per keystroke.
- `GET /api/product/:id`: matching string ID and eleven labeled specifications. Resolution uses observed `displaySize`; typo keys `secondaryCmera` and `dimentions` are preserved. String arrays become readable text; currency/units are not invented.
- `POST /api/cart`: exactly `{ id, colorCode, storageCode }`, with string ID and finite numeric codes. JSON transport uses **`credentials: 'omit'`**.

Successful validated product responses use versioned, URL-specific localStorage entries with fixed **3,600,000 ms** TTL from receipt. Reads do not extend expiry. At exactly one hour or later the next read revalidates. List/detail/IDs are independent; malformed, incompatible or future-dated entries miss. Failed/aborted reads never become fresh entries. There is no background refresh or stale-as-fresh fallback.

Read effects abort on cleanup and ignore stale results; changing detail ID resets data/selections. HTTP/network/JSON/contract failures produce safe Spanish feedback and deliberate read retry. Unknown IDs historically returned 500, not an established 404 contract. There are no automatic retries or production request timeouts. Missing prices/specifications and broken images have honest accessible fallbacks; no substitute product photos are bundled.

## Options and confirmed cart count

Native Color/Almacenamiento radio groups use actual API options. Singletons remain visible/preselected; multiple groups start unselected. Add requires valid option membership, is disabled while incomplete/pending and blocks duplicate events. Missing/invalid groups are explained. Numeric zero codes remain numbers; empty price does not invent a stock rule.

Only a nonnegative safe integer response `count` is accepted. It **replaces** the prior count, including decreases/repeated `1`; there is no local increment, optimistic update, POST cache or automatic replay. Errors preserve selections/count. Navigation does not cancel a possibly received POST; late confirmations can update Header. A small ordering guard prevents older replies replacing newer valid confirmations, while a failed newer add does not discard an older valid reply.

The confirmed value persists separately under `itx:cart-count:v1`, without product TTL. Corrupt/invalid data defaults to initial `0`. Guarded storage falls back to memory on denial/quota errors; reload recovers only successfully persisted values and can restore an older count after failed writes. Storage failure does not turn server success into an API failure. Count persistence does not restore remote cart items or session continuity.

## Accessibility, responsive design and evidence

Landmarks, skip navigation, breadcrumbs, route title/focus updates, visible focus, labeled search, native fieldsets/legends, semantic `dl/dt/dd`, polite result/cart announcements and error alerts are included. The grid caps at four columns. PDP is image-left/details-right on desktop and image-first stacked on mobile, with actions below the description.

[M07 QA](docs/qa/m07.md) covers 320/375/480/768/1280/1920 px, native 200% zoom, palette contrast and reproduced race/image-containment repairs. Tests reuse sanitized M01 samples plus labeled synthetic failures. Mocked count sequences never prove backend accumulation. Screenshots stay outside Git. Human screen-reader testing and engines beyond Chromium remain unverified; no accessibility certification is claimed.

## Known external limitations and delivery

**B-01 remains open/accepted.** M01 browser evidence showed credential-free success and one POST returning `1`; credentialed GET failed under the observed wildcard CORS policy. M06's bounded browser pre-read failed and sent zero POSTs. M08 HTTP diagnostics returned 200 for list/detail and two JPEGs; a separate Chromium production-preview read rendered one real remote detail/photo with both GETs returning 200. Zero live POSTs were sent. These do not establish current browser POST compatibility or cumulative server counting. See [dated integration findings](docs/evidence/m08/2026-11-10/README.md).

The app respects returned counts even if they repeatedly stay at `1`. The [post-M08 cart investigation](docs/qa/cart-session-investigation.md) stopped after a bounded product-read timeout and sent zero POSTs; the reported consecutive live counts could not be reproduced. An intercepted UI check followed `1 → 2 → 1 → 1` exactly and the original 222/60 test baseline passed again. No frontend defect or code fix was established. The report distinguishes historical session/CORS evidence from current unknowns and proposes API-owner or production-compatible hosting changes for verification.

No proxy, backend, cookie manipulation, compensating local total or disabled browser security was introduced. B-01 remains open. Final live cart behavior, assistive technology and a future host's SPA rewrite require separate human verification before claiming unrestricted delivery readiness.

[Requirements/traceability](docs/specs/requirements.md), [design](docs/specs/design.md), [milestones](docs/specs/tasks.md) and [risks](docs/specs/open-questions.md) preserve source/evidence distinctions. The PDF stays ignored because redistribution permission is unestablished; historical source links require the local copy.

Milestones follow **Implement → Test → Lint → Build → Review → Commit → Push → Verify → STOP**. CI is checked once per push; pending/running checks require stopping until the user returns. No force-push, automatic merge, deployment or submission. M08 ends at manual review.
