# Cart counter and session investigation

Date: 2026-11-10. Baseline: published M08 `2fe7dbe7c744652d895384e90eebb9a2ee9b19b2`; clean `main` before investigation. Scope: diagnose the reported counter staying at `1`, without fabricating totals or introducing deployment infrastructure.

## Result of the original bounded investigation

**No justified frontend fix was found; the live symptom could not be freshly reproduced.** The bounded browser attempt failed at the prerequisite product read and sent **zero POSTs**. Current consecutive live responses, POST headers and session continuity therefore remain unverified. B-01 stays open. A frontend displaying repeated server responses of `1` is behaving according to the approved contract; that does not establish a working cumulative backend cart.

The best-supported explanation remains an incompatible cross-origin session integration: the client intentionally omits credentials; historical responses use wildcard CORS without credential permission and a session cookie unsuitable for ordinary cross-site fetch continuity. This mechanism is supported by earlier observations and browser standards, **not a fresh proof of the reported two-addition sequence**. No current server-side implementation or session lifetime was established.

## Later session follow-up (2026-11-10)

This supplements the original run below; it does not replace its failed-read/zero-POST record. Sources are the user's manual results and the subsequent diagnostic recorded in this project conversation, not new probes during the final UI cleanup. No raw session values or diagnostic traces are committed.

- **User-reported manual observations:** two POSTs with the same Postman session returned `{"count":1}` then `{"count":2}`; consecutive Chrome additions returned `{"count":1}` then `{"count":1}`. The Postman observation establishes cumulative behavior with session continuity in that environment; it is not browser CORS evidence or a frontend fix.
- **Recorded Chromium diagnostic, 21:12 UTC:** from `http://127.0.0.1:5173` to `https://itx-frontend-test.onrender.com`, a credentialed product GET showed HTTP 200 in network diagnostics, but frontend JavaScript received `TypeError: Failed to fetch`. CDP reported `WildcardOriginNotAllowed`: `Access-Control-Allow-Origin: *` and no `Access-Control-Allow-Credentials`. Relevant preflight responses had the same incompatible policy. A network-visible 200 was not a readable fetch response.
- **Cookie rejection:** the observed `session_id` cookie had `Path=/`, `HttpOnly`, and no observed `SameSite` or `Secure`. Chromium reported `SchemefulSameSiteUnspecifiedTreatedAsLax` and accepted no API cookie. The diagnostic sent no live POSTs. HttpOnly alone is not the cause; it prevents JavaScript access, not permitted HTTP cookie transport.
- **Frontend policy:** `credentials: 'omit'` excludes outgoing credentials and ignores response cookies, so it cannot maintain this cookie-based browser session. Switching to `include` alone is not a solution under the observed CORS/cookie policy. The frontend continues replacing the Header/persisted value with each validated server count, with no local increment.

**B-01 stays open and unfixed.** A direct credentialed browser solution requires an explicit allowed frontend origin plus credential permission, compatible preflight responses, and an appropriately secured cross-site cookie policy (subject to browser third-party-cookie restrictions). Alternatively, an explicitly approved production-compatible same-origin plan could be evaluated. Neither is implemented. The final copy cleanup removes technical explanations from the confirmation and leaves the response count only in the Header; it does not repair session continuity. No fresh API requests were made for that cleanup.

## Contract and state ownership

The local original PDF, pp.6–8, requires the selected product/color/storage to be sent and the response count to update the shared Header. Its example response is `{"count":1}`; it does not define session transport, a cart-read endpoint or permission to add locally. Approved [R-17/R-18 and Q-05](../specs/open-questions.md#q-05--count-authority-versus-session-continuity) require exact replacement and independent persistence.

Four separate things must not be conflated:

1. Backend cart contents belong to the remote service and are not readable through a documented cart GET.
2. Response `count` is the only confirmed value the frontend accepts.
3. Local storage holds the last valid confirmation, not cart contents or a restored backend session.
4. Browser cookies identify a session only when transport, CORS and cookie policy allow them. Persisting the number does not supply that identity.

The exact request remains `POST https://itx-frontend-test.onrender.com/api/cart`, JSON `{ id, colorCode, storageCode }`, string ID and numeric option codes. The historical M01 example is `{"id":"ZmGrkLRPXOTpxsU4jjAcv","colorCode":1000,"storageCode":2000}`. It was **not sent during this investigation**.

## Bounded live reproduction

Environment: Node 24.19.0/npm 11.17.0, Playwright 1.65.0, Chromium **158.0.8127.18**, normal browser security, fresh context, no stored count/products/cookies. The existing Vite app at `http://127.0.0.1:5173` was available and preserved. No credentials, API URL, production source or browser security setting was changed.

Reproduction procedure:

1. Open `/products/ZmGrkLRPXOTpxsU4jjAcv` using the real application.
2. Require a fresh successful detail response and validate its actual options before selecting anything. Historical fixtures must not substitute for that prerequisite.
3. If successful, select real options, submit once, wait for its response and compare Header/storage. Only then permit a second deliberate addition. A diagnostic guard limits outgoing cart POST attempts to two; no retries.
4. Stop live probing if the prerequisite fails or an addition cannot be safely confirmed.

Actual UTC window: **04:03:12.364–04:03:27.640**. A temporary in-page wrapper bounded API fetches to 12 seconds while preserving cancellation; a 15-second response wait then expired. These are diagnostic limits, not a new production timeout. Two detail GET events were recorded during development mounting with StrictMode. The source cancels reads on cleanup; exact failure reasons for these two individual events were not captured. No HTTP response, JSON or response headers became available. A timeout does not identify CORS, service downtime or cold start as its cause.

Sanitized observations:

```json
{
  "detailMethod": "GET",
  "detailPath": "/api/product/ZmGrkLRPXOTpxsU4jjAcv",
  "detailRequestEvents": 2,
  "readableHttpStatus": null,
  "capturedRequestExtraInfoEvents": 1,
  "requestCookieHeaderPresentInCapturedExtraInfo": false,
  "associatedCookiesInCapturedExtraInfo": [],
  "capturedCookieIssues": [],
  "apiCookiesAtEnd": [],
  "cartPostAttempts": 0
}
```

First addition: **not performed**. Second addition: **not performed**. There are no new POST payloads, statuses or consecutive response JSON values to report. CDP listened for cookie inclusion/exclusion and response-header diagnostics, but no response supplied cookie attributes or blocking reasons. Empty diagnostics are not proof that SameSite caused the timeout. No raw cookie/session value, HAR, trace or screenshot is versioned. Live probing stopped after this attempt; no shell POST or credentialed retry followed.

## Earlier evidence, kept historical

- [M01, 2026-11-09](../evidence/m01/2026-11-09/README.md): one credential-free browser POST returned HTTP 200 and `{"count":1}`. A credentialed GET failed in Chrome; the credential-free GET worked. Captured GET/OPTIONS headers included `Access-Control-Allow-Origin: *`, no `Access-Control-Allow-Credentials`, and allowed headers `Origin, X-Requested-With, Content-Type, Accept`. The full POST CORS headers were not captured. Do not present GET/OPTIONS headers as new POST observations.
- M01 captured the cookie **name** `session_id`, `Path=/`, `HttpOnly`, with no observed `SameSite` or `Secure` attributes. Values were removed. A cookie-reusing GET returned 200 without a replacement cookie; this is not cart-state verification.
- Historical 2026-11-06 shell additions returned `1` without cookies and `2` when reusing a cookie. Original temporary traces are unavailable. This suggests session-dependent accumulation, but does not establish today's backend behavior or browser compatibility.
- [M06](../evidence/m06/2026-11-10/README.md) failed its product-read prerequisite and sent zero POSTs. [M08](../evidence/m08/2026-11-10/README.md) successfully read products/photos, including one real Chromium-rendered detail/photo, with zero POSTs. Intermittent observations do not establish a universal outage or current cart success.

## Cause analysis

- **A — Backend creates a new session for every request:** plausible for requests without session identity; not established for every request or current authenticated-session reuse. No fresh Set-Cookie was available for comparison.
- **B — `credentials: 'omit'` prevents cookie continuity:** confirmed client configuration in [client.js](../../src/api/client.js). The Fetch standard excludes credentials and cookie acceptance in that mode. This explains why cookie-based continuity cannot be supplied by the current fetch boundary; it does not prove current backend count semantics.
- **C — CORS prevents credentialed integration:** historical captured policy and failed credentialed browser GET support this restriction. Switching to `include` without verified server changes is unjustified. Current POST headers remain unknown.
- **D — SameSite/Secure restrictions:** the historical missing attributes are an additional compatibility concern. Today's cookie policy and browser exclusion reason were not observed. HttpOnly prevents JavaScript access; it does not itself prevent browser transmission.
- **E — Count intentionally non-cumulative:** not established. The PDF's `1` example is not proof of that policy, and the historical cookie-reuse result argues against assuming universally non-cumulative behavior. Clarification or a successful session-preserving reproduction is needed.
- **F — Frontend overwrites/mishandles valid responses:** no defect found. [cart.js](../../src/api/cart.js) validates count; [CartProvider](../../src/app/CartProvider.jsx) replaces it and [cartCount storage](../../src/storage/cartCount.js) persists the same value. Deterministic UI verification below follows increasing and repeated counts exactly.
- **G — Stale response/race resets count:** no new defect found. M07 already guards older additions after a newer valid confirmation; tests cover newer success and newer failure. [ProductActions](../../src/components/ProductActions.jsx) blocks duplicate pending submits synchronously, does not replay POSTs and permits confirmations after navigation. Ordering IDs track requests, not invented item totals.

**Ownership:** the verified frontend follows the required count contract. The likely accumulation obstacle lies in API/session and deployment compatibility, but current backend root cause remains unconfirmed because the live sequence could not run. Neither an outage diagnosis nor a completed bug fix is claimed.

## Solutions evaluated and decision

**A — Direct browser API:** keep the existing behavior until the API owner provides a compatible policy. A proposed credentialed setup needs an explicit allowlisted application origin, `Access-Control-Allow-Credentials: true`, and `Vary: Origin` when origin responses vary. Preflight must permit JSON POST and the required request headers. The proposed cross-site session cookie needs `HttpOnly; Secure; SameSite=None; Path=/` over HTTPS with a suitable lifetime. `include` must be enabled only after verification. Browser third-party-cookie restrictions can still prevent continuity; these changes alone cannot guarantee it. Backend session retention/count semantics must also be demonstrated. See the [Fetch CORS/credentials rules](https://fetch.spec.whatwg.org/#cors-protocol-and-credentials) and the [HTTPWG cookie draft, a work in progress](https://httpwg.org/http-extensions/draft-ietf-httpbis-rfc6265bis.html#name-the-samesite-attribute).

**B — Same-origin integration:** a narrowly scoped reverse proxy could be legitimate if a production host with HTTPS/server routing is explicitly chosen. No such deployment/runtime plan exists here. A future design would restrict the upstream to the fixed assignment API and allowlist the required product/cart routes and methods, validate body/size/time bounds, preserve the payload and upstream count, and never retry uncertain mutations. It would forward only the required session cookie server-side, safely adapt its host/path attributes to the application origin, preserve HttpOnly/Secure protections, and protect cart POSTs against cross-origin abuse. Tokens must stay out of JavaScript, storage and logs; arbitrary targets/cookies must not be forwarded. It requires deployment-specific review and testing in development **and production**. A Vite development proxy alone is insufficient. This is a proposal, not an implemented or verified fix.

**C — Frontend-only correction:** not supported by a reproduced frontend defect. Changing response handling to local `count + 1`, summing repeated `1`s, forcing credentials, exposing cookies or replaying POSTs would violate the approved contract or browser behavior.

**Decision:** retain source/dependencies/configuration unchanged and publish useful investigation documentation only. No proxy, backend, credential switch, local total, session secret handling or new UI was added. B-01 cannot close. Before claiming cumulative-cart readiness, obtain an API-owner change/clarification or an approved production-compatible same-origin plan, then verify two deliberate sequential additions and session identity under normal browser security. Human acceptance of the documented limitation is an alternative delivery decision, not a fix.

## Verification and regression coverage

No additional committed tests: the requested failure/order/persistence regressions are already covered. Avoid duplicating M07 cases merely to increase totals.

- [Actions integration tests](../../src/components/ProductActions.test.jsx): exact response replacement over `6, 1, 1, 0, 9` (including an increase from `0` to `9`), repeated `1`, error preservation, duplicate submit, navigation/remount restore, late mutation success and both newer success/failure ordering outcomes.
- [Cart API tests](../../src/api/cart.test.js): exact string/numeric payload, omit credentials, count validation, HTTP/JSON/network errors and no retries. [Storage tests](../../src/storage/cartCount.test.js): reload-equivalent restoration, corruption/denial/quota behavior and independence from product TTL.
- [Cart browser tests](../../e2e/cart.spec.js): intercepted `5, 1, 1`, exact payload, actual reload/routes, pending double-click/repeated-submit protection, failed POST/retry and a delayed older response after a newer confirmation. Automated API fixtures prevent live mutations. These tests verify frontend behavior, not remote sessions; no fake cookie test is promoted into live continuity evidence.

An additional **ad hoc intercepted browser check**, separate from the committed suite, ran at **04:04:32 UTC**, using M01's singleton product fixture and normal Chromium on the actual development UI. Four mocked responses `1 → 2 → 1 → 1` produced Header **and persisted values** `1 → 2 → 1 → 1`, exactly four intercepted POSTs with `{ "id": "pMZMhe_ZaAPZoaCCtlDrg", "colorCode": 1000, "storageCode": 2000 }`, and reload restored `1`. A representative desktop screenshot showing count `2` was visually inspected outside Git; the phone image was a test fixture. This directly demonstrates increasing and repeated-count handling, **not live accumulation**. The local development server remains available.

Actual gates on the unchanged application:

- `npm run lint`: exit 0, no ESLint warnings.
- `npm test`: exit 0, **222/222** tests, **10/10** files.
- `npm run build`: exit 0, 115 modules; JS 274.04 kB / 87.06 kB gzip, CSS 8.17 kB / 2.25 kB gzip.
- `npm run test:e2e`: exit 0, **60/60** Chromium cases across 320/768/1280/1920 px, **6.8 seconds**, zero configured retries. The environment printed its existing NO_COLOR/FORCE_COLOR warning; there were no test failures.

The full original 222/60 baseline is preserved. Historical M01/M06/M08 evidence remains unchanged. Only this report, README linkage and the B-01 follow-up are intended for the documentation commit; PDF, temporary captures/diagnostics and generated build/test files remain outside version control. No deployment or submission is authorized by this work.
