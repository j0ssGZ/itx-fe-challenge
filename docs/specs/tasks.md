# Implementation milestones

Status: M00 completed in `e08a674`; M01 completed in `8a0f325`; M02 shell/tooling implemented and locally verified under explicit M02 authorization. B-01 remains an accepted open risk. M03 and later functionality are not authorized. R-IDs refer to [requirements.md](requirements.md); Q-IDs/B-01 refer to [open-questions.md](open-questions.md). Historical M01 evidence is preserved unchanged.

## Working agreement and commit checkpoints

- Phases 1/1.1 originally had no Git repository. M00 initialized local `main`, added README/.gitignore and the four specs in `e08a674`, and excluded the PDF. M01 retains evidence and updates documentation only. No configured application scripts or passing application checks exist.
- The first-commit README preference is satisfied by M00's actual commit, `docs: initialize ITX frontend challenge and SDD specifications`; do not fabricate earlier commits or initialize the repository again. M01's focused documentation commit follows that baseline.
- Keep commits tied to working increments. Include relevant tests in the same milestone as the behavior. Commit messages below are suggestions; split further if needed, but do not fabricate historical progress or backdate commits.
- Run the narrow checks relevant to a change, then the required lint/test/build gates before a delivery checkpoint. Do not report tests as passed before running them.
- Publishing a repository, opening a PR, merging, and deploying are separate actions. Phases 1/1.1 authorize none of them. Never merge/deploy automatically. Preserve all security and approval gates.
- After any later push or PR update, inspect CI status once. If pending/running, report the actual statuses, ask the user to return when CI finishes/fails, and end the turn immediately. No polling, watch commands, sleep loops, or agents solely waiting for CI. When the user returns, inspect results, fix actual failures, and apply the same rule after triggering new CI.
- **Permanent workflow from M02:** Implement -> Test -> Lint -> Build -> Review diff -> Commit -> Push -> Verify -> STOP. Run relevant E2E checks too. Each approved milestone gets a coherent conventional commit unless independently valuable increments justify a split. Preserve history; never force-push, publish failing/unverified work, commit secrets/local environments/the PDF, or start the next milestone without explicit approval. Keep docs current. The single-check CI stop rule above applies after every push; no automatic merge/deploy.

## M00 — Specification approval and first repository checkpoint

- **Status:** completed and verified in `e08a6744ed1e0b1f26cb63293daef25905e9d5d4`. B-01 was accepted as an open risk, not resolved; no later milestone was executed under M00.

- **Objective:** agree on scope, source interpretation, and delivery defaults before implementation.
- **Scope:** review the Phase 1.1 updates and B-01; confirm the simplified architecture and implementation scope. Do not reopen approved cache/count/search/selector/Spanish decisions. Repository destination is deferred until publication, not a gate for local setup. After explicit implementation approval, initialize local Git if still absent and create the initial README described in design.md. Avoid publishing the source PDF without authorization.
- **Acceptance criteria:** two-view boundary and source/observation/decision distinctions are accepted; B-01 has a disposition or a clear scope limit for work that may proceed. README says what is planned and how execution documentation will be added; no implemented/tested claims. Phase 1.1 ends before these later actions.
- **Required tests/checks:** documentation/source-reference and file-inventory review only; no application tests exist yet.
- **Dependencies:** Phase 1.1 deliverables; explicit user approval before any repository setup, README creation, dependency installation, or implementation.
- **Expected deliverable:** approved baseline, decision updates, first local documentation commit after approval.
- **Actual commit:** `docs: initialize ITX frontend challenge and SDD specifications`.
- **Traceability/checkpoint:** R-23, R-24, R-28. Human approval before implementation; approved Phase 1.1 live discovery is already recorded under M01.

## M01 — Baseline the observed API and resolve integration limits

- **Status:** verification/documentary baseline completed on 2026-11-09. Retained current responses and sanitized metadata demonstrate the verified scope; exhaustive contracts, current cart accumulation, and B-01 resolution are not claimed. Only one remote add occurred in this run. See the [evidence record](../evidence/m01/2026-11-09/README.md).

- **Objective:** use the verified Phase 1.1 observations instead of guessed product/session contracts.
- **Scope:** verify contracts and B-01 using bounded requests, preserve previous observations separately, and retain representative responses plus minimal field mappings as documentary test-data candidates. M01 includes no package manifest, dependency installation, Vite, test runner, API client implementation, PLP/PDP, or cart code. M02 tooling is unnecessary for these diagnostics and remains a separate authorization.
- **Acceptance criteria:** satisfied for the verified baseline: current mappings support the required labels; valid POST codes derive from real options; HTTP errors, timeout, headers, cookie attributes and browser behavior are recorded; source guarantees/observations/unknowns are separate; B-01 is explicitly accepted and still open. Current repeated-add accumulation, universal nullability/error contracts, currency/units, and session lifetime remain unverified, with no fabricated workaround or data.
- **Required tests/checks:** performed source/PDF review; nine bounded curl operations, two Chrome GET modes and one browser JSON POST; response/statistic checks; JSON/hash/reference verification; staged-content and Git checks. Future component tests will reuse the samples for missing values, type variants, screen/typo mappings and option patterns once tools exist. No application tests, lint or build were run.
- **Dependencies:** M00 complete and explicit authorization of M01 obtained. B-01 is already accepted as a risk for local progress; evidence of a complete cumulative live cart remains a later integration gate, not another permission request for M02 tooling.
- **Expected deliverable:** updated specs/README, versioned `docs/evidence/m01/2026-11-09/` metadata and real response samples, one focused local commit, and a clean tree. Samples are documentary data, not a production fallback dataset or configured application fixtures.
- **Suggested commit:** `docs: verify API contracts and document integration constraints`.
- **Traceability/checkpoint:** R-07, R-13–R-21, R-23/R-24/R-28; Q-01/Q-05; B-01. M02 is ready to be proposed, not started; the current browser/session limitation remains visible.

## M02 — Minimal tooling, routing, and shared shell

- **Status:** completed after actual checks passed: lint exit 0; 3 Vitest/RTL integration tests passed; production build exit 0; 2 Playwright Chromium smokes passed at desktop/mobile widths. Development server, keyboard links/skip focus and 320 px layout were also verified. The implementation has no API requests, cache/search, real product data or cart operations; the header count is a static placeholder.
- **Delivered:** React 19.3.1, Vite 8.3.7, React Router 8.5.1, CSS Modules, Vitest 5.1.0/RTL 16.3.3/jsdom 31.0.0, Playwright 1.65.0 and ESLint 9.39.5; exact direct versions and one npm lockfile. Runtime tested: Node 24.19.0/npm 11.17.0. ESLint 9 is deprecated upstream but retained for the stable accessibility plugin's ESLint-9 peer compatibility; no forced peers. This maintenance limit is documented in README.
- **SDD clarification:** the requested simple 404 fallback follows the approved unknown-route policy: replace-navigation to `/` with a Spanish not-found notice in PLP, not a third business page. CartProvider/persistence stay in M06; M02 provides only the documented static count indicator. Playwright setup/smoke was explicitly authorized in M02; M07 will extend it for product journeys.

- **Objective:** establish runnable development and validation commands with the two-view structure.
- **Scope:** proposed React/Vite JavaScript setup after approval; compatible versions and Node/npm prerequisite; committed lockfile; required start/build/test/lint scripts; Vitest/RTL setup; ESLint; two route placeholders; App's persistent shell and Header with Spanish home/breadcrumb/count markup. Add CSS Modules/global tokens only as needed. Do not pre-create separate layout/search/request-state component files.
- **Acceptance criteria:** all four required operations are documented and executable; test command has a finite mode; routing is client-side; shell appears in both routes; home links work; no SSR, TypeScript, or third business view. README describes only this actual state.
- **Required tests/checks:** meaningful route/header navigation integration checks; initial lint, finite test, and production build; manual development-server start check. A route/header test replaces a trivial mount-only smoke test.
- **Dependencies:** M00/M01 complete; explicit M02 approval obtained. The existing `origin` was verified as `j0ssGZ/itx-fe-challenge`, with M00/M01 already at remote main before M02. Existing history/remote are preserved; push of this verified increment is authorized. M03 still requires separate approval.
- **Expected deliverable:** small runnable skeleton, documented scripts/runtime, shared layout, initial tests.
- **Suggested commit:** `chore: establish React tooling and two-view application shell`.
- **Traceability/checkpoint:** R-01, R-02, R-08–R-10, R-22, R-24, R-26–R-29. Review dependency necessity before domain code.

## M03 — API boundary and one-hour read cache

- **Objective:** make data access and expiry reliable before wiring views.
- **Scope:** fetch client; product list/detail operations; minimal response checks using M01's observed baseline; guarded storage; versioned per-endpoint cache; successful-response timestamps; approved one-hour TTL and on-demand revalidation; read abort/error behavior. Keep cart mutations and persisted count outside the read cache.
- **Acceptance criteria:** correct URLs/methods; fresh list/detail cache hits avoid requests; different IDs cannot share detail entries; no sliding expiration; expired/corrupt entries fetch again; errors/aborts never become fresh entries; storage denial falls back predictably. No made-up schema or HTTP cache support.
- **Required tests/checks:** request/HTTP/JSON failure assertions; cache miss and fresh hit; just-before/at/after TTL; per-ID isolation; future/invalid timestamps; malformed storage; quota/access errors; failed revalidation. Use fake time, reset storage between cases, and prevent real network calls.
- **Dependencies:** M01 baseline/fixtures and M02 tooling. Q-02 is approved and must not become another permission gate.
- **Expected deliverable:** tested API and persistence modules without page-specific rendering logic.
- **Suggested commit:** `feat: add product API access with one-hour client cache`.
- **Traceability/checkpoint:** R-19–R-21, R-26, R-27. Review cache against the exact one-hour rule.

## M04 — Product list, search, and responsive cards

- **Objective:** complete the first business view as an end-to-end vertical increment.
- **Scope:** list read state; complete grid; card image/brand/model/price; local every-change filtering against brand/model; product links; loading, empty API, no matches, error/retry, and missing-image presentation. Style search above the grid on the right at desktop width; cap at four columns.
- **Acceptance criteria:** empty search shows all returned products; input updates partial matches immediately and case-insensitively; clear restores list; cards navigate using real string IDs; empty-price records remain visible with “Precio no disponible”; no invented currency. Spanish controls/feedback and desktop structure match the approved design/PDF p.3; narrow widths fit and ultrawide never exceeds four columns. No sorting or pagination.
- **Required tests/checks:** RTL tests for complete listing, independent partial brand/model matching, mixed case (including `alcatel`), clear/no results, Spanish labels, loading/error/retry, observed empty price, missing images, and link destination. Browser visual check at 320, intermediate, desktop, and wide widths; DOM tests alone are insufficient for column counts. Dataset counts are fixture facts, not hardcoded runtime requirements.
- **Dependencies:** M02, M03. Q-03 search and Q-06 language are settled; raw price rendering avoids a speculative currency decision.
- **Expected deliverable:** functional, styled PLP and focused behavior tests; README milestone update.
- **Suggested commit:** `feat: build responsive product listing and live search`.
- **Traceability/checkpoint:** R-03–R-07, R-25–R-27, R-29. Compare directly with PDF p.3 before continuing.

## M05 — Product details and required navigation/content

- **Objective:** complete the read-only detail view while preserving the reference structure.
- **Scope:** detail fetch by route ID; image-left/details-right desktop layout; mobile stack; all eleven required attributes; breadcrumb label; explicit return link; direct entry; error/unavailable/loading states; abort/late-response protection when IDs change. Do not add cart behavior in this increment.
- **Acceptance criteria:** each of the eleven required Spanish label/value mappings is correct; “Resolución de pantalla” uses the observed pixel-bearing `displaySize`; cameras use actual `secondaryCmera` and dimensions use `dimentions`; CPU/camera arrays are readable. Empty/dash fields show “No disponible”, and raw weight has no invented unit. Image proportions, description-above-actions structure, direct entry/return, and obsolete-response protection hold.
- **Required tests/checks:** all eleven attributes; typo/reversed-field mappings; mixed string/array CPU/cameras; empty price/battery/weight and dash dimensions; Spanish back/breadcrumb links; direct route; non-OK responses including the observed unknown-ID 500 without assuming 404; route A-to-B late response. Browser comparison with PDF p.4 at desktop plus narrow-screen reading order/overflow check.
- **Dependencies:** M02–M04; observed detail baseline. Q-06 Spanish is approved; Q-07 mobile stacking is a nonblocking engineering proposal reviewed with the architecture.
- **Expected deliverable:** styled read-only PDP, route-state tests, and documented field mappings.
- **Suggested commit:** `feat: add product details and return navigation`.
- **Traceability/checkpoint:** R-09, R-11–R-13, R-19, R-25–R-27, R-29. Check all eleven attributes explicitly.

## M06 — Options, add-to-cart, and shared persistent count

- **Objective:** complete the buying interaction with exact API payloads and response-driven state.
- **Scope:** labeled color/storage controls from `options.colors`/`options.storages`; approved singleton/multiple defaults; form validity; exact POST; pending/duplicate-submission protection; shared count provider/storage; Spanish inline feedback; preservation on failure. Apply B-01's approved disposition; do not silently add credentials or a development-only proxy.
- **Acceptance criteria:** codes belong to the displayed product; singletons are visible and selected; incomplete options cannot submit; Add sends only required wire fields with correct types. Returned `count` replaces the previous value in both headers and survives reload under the approved policy. Failed/invalid responses do not change confirmed count; no optimistic increment, POST caching, or automatic retry. Product switches reset selections.
- **Required tests/checks:** the observed one-color/two-storage, two-color/one-storage, and singleton/singleton cases; multiple groups initially unselected; exact string ID/numeric codes and DOM-to-option type preservation; missing/zero/invalid codes through explicit robustness fixtures; repeated returned `1` and a different returned count, without local increment; TTL expiry leaving count untouched; reload; double-click guard; server/parse failure; storage denial/corruption; changing IDs. Use isolated mocks normally; one chosen live browser integration check must reflect B-01's disposition rather than prove only curl works.
- **Dependencies:** M03, M05, observed POST contract. Q-02/Q-04 and count source/persistence decisions are already approved. B-01 blocks claiming cumulative live cross-origin completion; it does not block isolated cart UI development if implementation is explicitly authorized with that scope.
- **Expected deliverable:** complete PDP actions, shared persistent header count, mutation tests, and integration findings.
- **Suggested commit:** `feat: add product options and persist API cart count`.
- **Traceability/checkpoint:** R-10, R-14–R-18, R-20, R-26, R-27, R-29, B-01. Review mutation/persistence policy against PDF pp.6–8; record accepted backend limitations separately from implemented behavior.

## M07 — Critical browser journeys and visual/accessibility review

- **Objective:** verify that the two views work together in a real browser and respect the wireframes.
- **Scope:** extend M02's existing Playwright setup/smoke with contract-based network interception, isolated storage, product browse/search/detail/back and direct refresh, add/count/navigation/reload, read retry and mutation error, responsive and keyboard checks. Resolve defects without expanding product scope.
- **Acceptance criteria:** journeys are deterministic, issue no accidental live POSTs, and exercise real routes/components with Spanish visible/accessibility copy. The maximum four-column rule holds at ultrawide width; PDP columns/mobile stack follow the reviewed design; count remains visible; focus, contrast, zoom, and long content are usable. Deep-link serving works locally. A mock returning accumulated counts is not described as proof that B-01 is resolved.
- **Required tests/checks:** focused E2E suite in desktop/narrow Chromium; layout checks at representative widths; manual keyboard/focus, image/error states, 200% zoom, and visual comparison against both PDF wireframes. Existing lint/unit/build checks after any fixes. Add broader browsers only if evaluation/support needs justify them.
- **Dependencies:** M04–M06; installed browser tooling only in the approved implementation phase.
- **Expected deliverable:** small reliable E2E suite, resolved usability defects, and honest review evidence; no generated architecture app or extra business features.
- **Suggested commits:** `test: cover critical browsing and cart journeys`; defect-specific `fix:` commits only as needed.
- **Traceability/checkpoint:** R-01, R-04–R-06, R-08–R-18, R-25–R-27, R-29. Review structure and behavior together.

## M08 — Clean-checkout validation and delivery documentation

- **Objective:** make the final submission reproducible and defensible.
- **Scope:** finish README from design.md's outline; update decisions/limitations and R-ID evidence; verify actual Node/npm versions, lockfile install, four required scripts, optional E2E/preview commands, and deep-link behavior. Inspect milestone history. If CI/repository publication is later authorized, document only the actual setup and honor the one-check policy.
- **Acceptance criteria:** a reviewer can follow a clean checkout to development, lint, finite tests, E2E, build, and preview. Docs distinguish observed/live evidence from mocks; remaining API or environment limits are explicit. No unverified coverage badges/features; no automatic merge/deploy or unrequested PR.
- **Required tests/checks:** one complete clean-environment install/validation pass; review all R-01–R-29 acceptance evidence; browser production-preview smoke; separately recorded live API compatibility evidence and B-01 disposition. Fix actual failures and rerun affected checks; do not keep repeating already successful checks without reason.
- **Dependencies:** M00–M07 and user decisions on unresolved delivery limitations. Hosting/visibility choice is needed before final publication, not before local implementation.
- **Expected deliverable:** verified submission-ready repository, final README, traceability and known-limitations record, and a concise handover. Publication/deployment/PR remain separate authorized steps.
- **Suggested commit:** `docs: finalize execution guide and requirement verification`.
- **Traceability/checkpoint:** R-01–R-29. Obtain authorization before publication or opening a PR; an explicit later request supplies that authorization. Never merge or deploy automatically.

## Recommended order and stopping conditions

Completed: M00 initialization, M01 contract/evidence baseline, and M02 shell/tooling with local checks. Next, only after explicit approval: M03 boundary/cache -> M04 PLP -> M05 PDP -> M06 cart -> M07 browser/UX review -> M08 final verification. Do not rerun contract probes merely to wait or repeatedly mutate the cart. B-01 remains accepted and open; it gates the cumulative live-cart claim, not local tooling.

Stop for a decision when a material source conflict, unresolved integration policy, or unavailable contract prevents the dependent work. Empty values with the documented honest fallback do not independently block implementation. Do not reopen approved decisions or ask the user to decide routine engineering defaults. After a push/PR update with pending CI, follow the mandatory CI stop rule even if further monitoring would be convenient.

Current checkpoint: M02 shell/tooling verified; one focused commit and normal push to existing origin are authorized. Verify remote ancestry/synchronization, inspect CI once and apply the stop rule. No M03 work, API calls, PR, force-push, merge or deployment. Stop after M02 and wait for explicit M03 approval.
