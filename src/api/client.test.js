import { describe, expect, it, vi } from 'vitest'
import { API_BASE_URL, ApiError, requestJson } from './client.js'
import { productList, unknownProductError } from '../test/fixtures.js'

describe('HTTP JSON boundary', () => {
  it.each(['/api/product', 'api/product', '///api/product'])(
    'joins the base and %s with GET, JSON accept, omit credentials and the caller signal', async path => {
      const { signal } = new AbortController()
      fetch.mockResolvedValue(new Response(JSON.stringify(productList)))

      expect(await requestJson(path, { signal })).toEqual(productList)
      expect(fetch).toHaveBeenCalledExactlyOnceWith(`${API_BASE_URL}/api/product`, {
        method: 'GET', headers: { Accept: 'application/json' }, credentials: 'omit', signal,
      })
    },
  )

  it.each([400, 404, 500, 503])('normalizes HTTP %i without assuming an error body contract or retrying', async status => {
    fetch.mockResolvedValue(new Response(JSON.stringify(unknownProductError), { status }))

    await expect(requestJson('/api/product/missing')).rejects.toMatchObject({
      name: 'ApiError', type: 'http', status, message: 'No se pudieron obtener los datos del servicio.',
    })
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('handles a non-JSON HTTP error without masking its status', async () => {
    fetch.mockResolvedValue(new Response('<html>error</html>', { status: 502 }))
    await expect(requestJson('/api/product')).rejects.toMatchObject({ type: 'http', status: 502 })
  })

  it.each(['<html>not JSON</html>', ''])('rejects invalid JSON: %j', async body => {
    fetch.mockResolvedValue(new Response(body))
    await expect(requestJson('/api/product')).rejects.toMatchObject({ type: 'invalid-json', status: 200 })
  })

  it.each([new TypeError('Failed to fetch'), new Error('Offline')])('normalizes network failures (%s)', async cause => {
    fetch.mockRejectedValue(cause)
    await expect(requestJson('/api/product')).rejects.toMatchObject({
      type: 'network', status: null, cause, message: 'No se pudo conectar con el servicio.',
    })
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('normalizes a body-stream network failure separately from malformed JSON', async () => {
    fetch.mockResolvedValue({ ok: true, status: 200, json: vi.fn().mockRejectedValue(new TypeError('Stream failed')) })
    await expect(requestJson('/api/product')).rejects.toMatchObject({ type: 'network', status: 200 })
  })

  it('does not fetch with an already-aborted signal, even with a custom reason', async () => {
    const controller = new AbortController()
    controller.abort('route changed')
    await expect(requestJson('/api/product', { signal: controller.signal })).rejects.toMatchObject({
      type: 'aborted', status: null, cause: 'route changed',
    })
    expect(fetch).not.toHaveBeenCalled()
  })

  it('honors AbortController while fetch is pending', async () => {
    const controller = new AbortController()
    fetch.mockImplementation((_url, { signal }) => new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(signal.reason), { once: true })
    }))
    const result = requestJson('/api/product', { signal: controller.signal })
    controller.abort(new Error('custom reason'))
    await expect(result).rejects.toMatchObject({ type: 'aborted' })
  })

  it('recognizes AbortError without a supplied signal', async () => {
    fetch.mockRejectedValue(new DOMException('cancelled', 'AbortError'))
    await expect(requestJson('/api/product')).rejects.toMatchObject({ type: 'aborted' })
  })

  it('does not parse a response delivered after cancellation', async () => {
    const controller = new AbortController()
    const json = vi.fn()
    fetch.mockImplementation(async () => {
      controller.abort()
      return { ok: true, status: 200, json }
    })
    await expect(requestJson('/api/product', { signal: controller.signal })).rejects.toMatchObject({ type: 'aborted' })
    expect(json).not.toHaveBeenCalled()
  })

  it('normalizes cancellation while reading the body', async () => {
    const controller = new AbortController()
    fetch.mockResolvedValue({
      ok: true, status: 200, json: async () => {
        controller.abort()
        throw controller.signal.reason
      },
    })
    await expect(requestJson('/api/product', { signal: controller.signal })).rejects.toMatchObject({ type: 'aborted' })
  })

  it('rejects a parsed result if cancellation happened during body parsing', async () => {
    const controller = new AbortController()
    fetch.mockResolvedValue({
      ok: true, status: 200, json: async () => {
        controller.abort()
        return productList
      },
    })
    await expect(requestJson('/api/product', { signal: controller.signal })).rejects.toMatchObject({ type: 'aborted' })
  })

  it('uses Error instances with a stable error type and optional status', () => {
    const error = new ApiError('invalid-response')
    expect(error).toBeInstanceOf(Error)
    expect(error).toMatchObject({ name: 'ApiError', type: 'invalid-response', status: null })
  })
})
