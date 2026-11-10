# M08 — Read-only integration findings

Date: 2026-11-10, 01:42:44 UTC. [Sanitized HTTP observations](http-check.json). These are fresh observations, separate from unchanged M01/M06 evidence.

Four GETs were issued once each: list, the first M01 product's detail, and two representative M01 JPEG URLs. Each had a 5-second connection limit, 15-second total limit, zero retries, no cookie reuse and an Origin header identifying the local application. No POST, OPTIONS or credentialed request was necessary. No session value, raw cookie header, product image binary or temporary diagnostic is versioned.

- List: HTTP 200, JSON array of 100 records, 0.164 s, 16,627 bytes.
- Detail `ZmGrkLRPXOTpxsU4jjAcv`: HTTP 200, matching ID and colors/storages groups, 0.214 s, 1,397 bytes.
- Its JPEG: HTTP 200, image/jpeg, 0.163 s, 8,403 bytes.
- JPEG for `pMZMhe_ZaAPZoaCCtlDrg`: HTTP 200, image/jpeg, 0.164 s, 14,701 bytes.

Selected headers included wildcard Access-Control-Allow-Origin; no Access-Control-Allow-Credentials appeared in the captured selected read headers. Curl does not enforce browser CORS and does not prove browser POST compatibility. Two available JPEGs neither guarantee every product image nor establish future uptime. The M04 image timeouts remain dated historical observations, not a current universal outage claim.

Separately, at 01:49:06–01:49:09 UTC, Chromium 158.0.8127.18 opened the clean production preview with normal security, a fresh context, omit credentials and a temporary 10-second API fetch bound. The actual remote detail and its actual JPEG both returned 200 and rendered, with no recorded request failures. Neither response was mocked. The screenshot stays outside Git. [Browser record](browser-check.json) distinguishes this live context from two earlier mocked start/preview route checks. This narrows the M06 read-availability uncertainty without rewriting that historical failed attempt.

Final limitations are recorded in [M08 QA](../../../qa/m08.md). No live cart mutation is part of M07/M08. M01's browser POST returning `1` remains historical evidence; current POST, accumulation and session recovery are unverified. B-01 remains open/accepted, with unchanged `credentials: 'omit'`, no proxy/backend, local increment or cookie workaround. A successful detail GET/photo is not proof of cart-session behavior or all-image availability.
