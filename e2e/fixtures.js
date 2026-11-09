import { readFileSync } from 'node:fs'

// Actual, unchanged M01 response data, consumed only by browser tests.
export const catalogue = JSON.parse(readFileSync(new URL('../docs/evidence/m01/2026-11-09/responses.json', import.meta.url), 'utf8')).productList
export const apiBase = 'https://itx-frontend-test.onrender.com'
export const firstProduct = catalogue[0]
export const firstProductLink = `Ver detalle de ${firstProduct.brand} ${firstProduct.model}`

// Deliberately synthetic image bytes: tests must not fetch remote photos.
export const imageFixture = '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240"><rect x="68" y="16" width="104" height="208" rx="14" fill="#293548"/><rect x="74" y="35" width="92" height="164" rx="3" fill="#cbdcf5"/><path d="M106 26h28M114 212h12" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>'

export async function mockCatalogue(page, products = catalogue) {
  const requests = []
  // Match API paths, not Vite's /src/api/*.js development modules.
  await page.route(url => url.pathname.startsWith('/api/'), route => {
    const request = route.request()
    requests.push({ url: request.url(), method: request.method() })
    if (request.url() === `${apiBase}/api/product` && request.method() === 'GET') {
      return route.fulfill({ json: products })
    }
    return route.abort()
  })
  await page.route('**/images/**', route => route.fulfill({ contentType: 'image/svg+xml', body: imageFixture }))
  return requests
}
