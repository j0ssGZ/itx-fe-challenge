# ITX Frontend Challenge

A Spanish-language, two-view smartphone storefront implementing the ITX Front-End Test: browse the catalogue, inspect specifications and add a selected color/storage configuration through the assignment API.

**Delivery status: READY WITH DOCUMENTED LIMITATIONS.** The [final technical audit](docs/qa/final-delivery-audit.md) maps the original assignment to code and test evidence. A fresh GitHub clone passed **232 unit/integration tests and 72 Chromium E2E cases**, lint and build on 11 November 2026. The external cart-session limitation remains open; this repository has not been deployed or submitted.

## Features

- Complete catalogue with immediate, case-insensitive partial search by brand or model.
- Product details with eleven labeled attributes and direct URL/refresh support.
- Real color/storage options, visible singleton preselection and validated Add requests.
- Success-only cart confirmation: desktop drawer, mobile bottom sheet, close and continue-shopping actions.
- Shared Header count taken exactly from the API response and persisted independently.
- Responsive grid capped at four columns; mobile purchasing controls precede technical specifications.
- Loading, error/retry, empty-result and unavailable-image/value states.

Routes: `/` and `/products/:id`. Unknown paths return to the catalogue with a notice; there is no cart or checkout route.

## Tech stack and decisions

React/React DOM **19.3.1**, Vite **8.3.7**, React Router **8.5.1**, JavaScript/JSX and CSS Modules. Quality tooling: Vitest, React Testing Library, jsdom, Playwright and ESLint. Exact versions are pinned in [package.json](package.json) and [package-lock.json](package-lock.json).

React + Vite provide a small client-rendered SPA without SSR. React Router handles navigation/history; CSS Modules keep styling local. Native fetch and guarded browser storage make API/cache behavior explicit. Local state handles pages and selections; Context shares only the confirmed cart count and mutation ordering. No Redux, query framework or UI component library is needed for two views. See the [design](docs/specs/design.md) and [UI library decision](docs/decisions/ui-library-evaluation.md).

## Getting started

Verified on macOS arm64 with **Node 24.19.0** ([.nvmrc](.nvmrc)) and **npm 11.17.0**. Supported manifest ranges are Node `>=24.15.0 <25` and npm `>=11 <12`; use the verified versions for reproduction.

```sh
git clone https://github.com/j0ssGZ/itx-fe-challenge.git
cd itx-fe-challenge
npm ci
npm run start
```

Open the URL printed by Vite, normally `http://localhost:5173`. No environment file, API key or local secret is required. Live browsing requires access to the external API unless fresh product data is cached.

```sh
npm run build
npm run preview
```

Preview normally runs at `http://localhost:4173`; it is a local build check, not a production server. A future host must serve `index.html` for frontend deep links. Development and preview routing/refresh were independently verified; no public hosting configuration is claimed.

## Available scripts

- `npm run start` — Vite development server.
- `npm run build` — production compilation into ignored `dist/`.
- `npm test` — finite unit/integration suite.
- `npm run test:watch` — interactive Vitest.
- `npm run lint` — ESLint; warnings fail the command.
- `npm run preview` — serve the built application locally.
- `npm run test:e2e` — Chromium E2E suite against the production build; build first.

## Architecture

```text
src/app/         routes, shell and shared CartProvider
src/pages/       catalogue/search and detail request lifecycles
src/components/  Header, product presentation/actions and confirmation
src/api/         HTTP/JSON errors, product contracts and cart POST
src/storage/     guarded storage, one-hour product cache and cart count
src/styles/      global tokens, focus and reduced-motion rules
src/test/        setup and sanitized contract fixtures
e2e/             intercepted browser journeys
docs/            specifications, decisions, API evidence and QA
```

Pages abort obsolete reads and ignore late responses. Product ID changes reset selections. Mutations are not automatically retried or cancelled on navigation: a server may already have processed them. Late valid responses can update the shared count; older replies cannot overwrite newer confirmations.

## API integration

Base URL: `https://itx-frontend-test.onrender.com`.

- `GET /api/product` — full catalogue; search runs locally with no request per keystroke.
- `GET /api/product/:id` — product detail with string IDs.
- `POST /api/cart` — exactly `{ id, colorCode, storageCode }`, with a string ID and numeric option codes; accepts only a nonnegative safe integer `count`.

Each valid count **replaces** the Header value, including repeated `1`, decreases or zero. There is no local increment, optimistic update, cart-read endpoint or manufactured total. Confirmation shows only the submitted product/configuration; the count remains in the Header. HTTP transport uses `credentials: 'omit'` under the documented B-01 policy.

Successful validated product reads use separate versioned list/detail keys in localStorage, with a fixed **3,600,000ms TTL** from receipt. At exactly one hour or later, the next read revalidates; reads do not extend expiry. Invalid/corrupt/future-dated entries miss. Failed or aborted responses are not cached. Cart mutations are never cached; the last confirmed count persists separately without product TTL.

Storage denial/quota failures fall back to memory for the instance lifetime; reload restores only successfully persisted values. HTTP, network, JSON and contract errors produce safe UI feedback. There are no automatic retries or production request deadlines. Missing prices never become zero; unknown IDs historically returned HTTP 500, so a 404 contract is not assumed.

The observed API mappings retain `displaySize` for pixel resolution and the misspelled `secondaryCmera`/`dimentions` keys. String arrays become readable text; currency and measurement units are not invented.

## Testing and quality

```sh
npx playwright install chromium
npm run lint
npm test
npm run build
npm run test:e2e
```

Playwright browser binaries are a separate installation. Linux may need `npx playwright install --with-deps chromium`; that OS setup was not verified here. E2E manages its own preview on `127.0.0.1:4173`, so keep that port free.

Latest independent results: **232 tests in 11 Vitest files; 72 E2E cases** across 320/768/1280/1920px. Tests mock fetch/browser requests using sanitized M01 data and explicit robustness fixtures; they never mutate the live cart. Coverage includes TTL boundaries, cancellation, stale/mutation ordering, persistence failures, search, option validation and native dialog keyboard/cleanup behavior. Mocked cumulative counts do not prove live session continuity.

Lint and production build passed. `npm audit` reported zero known vulnerabilities at audit time; this is not a security certification. Local results do not establish a GitHub-hosted CI pass. [Audit details](docs/qa/final-delivery-audit.md).

## Continuous integration

[Frontend CI](.github/workflows/ci.yml) runs on pushes to `main`, pull requests targeting `main` and manual dispatch. Two independent `ubuntu-latest` jobs use Node 24 from `.nvmrc`, lockfile-based npm download caching and `npm ci`:

- **Code quality:** lint, the finite Vitest suite and production build.
- **Chromium E2E:** `npx playwright install --with-deps chromium`, production build and `npm run test:e2e`. Playwright starts its configured Vite preview; no additional development server is started. A separate small build keeps jobs independent without transferring build artifacts.

The workflow uses official SHA-pinned actions, read-only repository permissions, disabled checkout credential persistence, timeouts and cancellation of superseded runs. Existing failure traces/screenshots/context files (and reports, if present) are uploaded only on failure, retained for seven days; generated outputs stay ignored. The existing list reporter provides readable logs without adding a reporting framework.

Reproduce checks with `npm ci` followed by the commands in **Testing and quality** above. On Linux, the browser job installs Chromium's system dependencies as shown above. Tests intercept API/images using sanitized fixtures and fresh browser contexts, so they require no remote API availability, saved cookies or local server process. They verify frontend response handling, **not live session continuity or B-01 resolution**.

See [GitHub Actions executions](https://github.com/j0ssGZ/itx-fe-challenge/actions/workflows/ci.yml) for actual hosted results. This configuration's local validation is not a claim that its first hosted run has succeeded.

## Design and accessibility

The visual system uses warm neutrals, ink typography and violet accents, inspired by Specter without copying its branding/assets. Native controls, semantic specifications, labeled search, breadcrumbs, skip navigation, route focus, visible focus and status/error announcements support keyboard use.

The native modal blocks background interaction, contains keyboard focus, supports Escape/close, restores focus and releases scroll lock on cleanup. Continue shopping returns to the catalogue. Route content has a 200ms fade/8px entrance; Header and confirmation remain independent. Reduced-motion preferences disable animations. Human screen-reader and physical-device testing remain unverified; no accessibility certification is claimed.

## Known limitations

- **B-01 — accepted external limitation, not fixed:** user-reported session reuse produced **1 → 2 in Postman** and **1 → 1 in Chrome**. Recorded credentialed Chromium access failed under wildcard-origin CORS, and the cross-site session cookie was rejected. `omit` prevents cookie continuity; changing to `include` alone does not solve the observed policy. The frontend displays the actual validated response. See the [investigation and evidence distinctions](docs/qa/cart-session-investigation.md#later-session-follow-up-2026-11-10). No proxy or fake count is implemented.
- Remote API/photos can be slow on a first load; browser caches can improve later visits. Fresh contexts and full-page captures can precede lazy-image completion. Low-resolution assets remain low-resolution. Existing loading/fallback behavior does not infer a network-error cause or retry images.
- ESLint 9 is deprecated upstream but fits the installed accessibility plugin's peer range. The clean install and lint pass; a future tooling upgrade requires compatibility review.

## Assignment, specifications and delivery

The supplied eight-page assignment PDF was inspected directly, including both wireframes. It is intentionally excluded from Git because redistribution permission is unestablished; obtain the original from the challenge provider. [Requirements](docs/specs/requirements.md), [design](docs/specs/design.md), [milestones](docs/specs/tasks.md) and [risks](docs/specs/open-questions.md) retain the SDD history. The [final audit](docs/qa/final-delivery-audit.md) is the current delivery checkpoint; older test totals are dated milestone evidence.

Progressive conventional commits preserve implementation history. Changes follow implement → test → lint → build → review → commit → push → verify → stop. CI is checked once after a push; pending/running checks require stopping without polling. Deployment, submission and further work require explicit authorization.
