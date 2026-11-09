import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { API_BASE_URL } from './client.js'
import { PRODUCT_CACHE_TTL, PRODUCT_CACHE_VERSION, productCacheKey } from '../storage/productCache.js'
import { productList, productDetails } from '../test/fixtures.js'

const NOW = new Date('2026-11-09T12:00:00Z').getTime()
const listResource = `${API_BASE_URL}/api/product`
const detailResource = id => `${listResource}/${encodeURIComponent(id)}`
const respond = data => fetch.mockImplementation(async () => new Response(JSON.stringify(data)))
let getProducts
let getProduct

beforeEach(async () => {
  vi.useFakeTimers()
  vi.setSystemTime(NOW)
  localStorage.clear()
  vi.resetModules()
  const api = await import('./products.js')
  getProducts = api.getProducts
  getProduct = api.getProduct
})

afterEach(() => vi.useRealTimers())

describe('product contracts from M01 (no live calls)', () => {
  it('gets the full real list at the correct endpoint, preserving string identities and empty prices as null', async () => {
    respond(productList)
    const result = await getProducts({})
    expect(fetch).toHaveBeenCalledWith(listResource, expect.objectContaining({ method: 'GET', credentials: 'omit' }))
    expect(result).toHaveLength(productList.length)
    expect(result.map(({ id }) => id)).toEqual(productList.map(({ id }) => id))
    for (const item of productList.filter(({ price }) => price === '')) {
      expect(result.find(({ id }) => id === item.id).price).toBeNull()
    }
  })

  it.each(productDetails)('accepts observed detail $id, numeric options, typo keys and string/array fields', async detail => {
    respond(detail)
    const result = await getProduct(detail.id)
    expect(fetch).toHaveBeenCalledWith(detailResource(detail.id), expect.objectContaining({ method: 'GET' }))
    expect(result.id).toBe(detail.id)
    expect(result.cpu).toBe(Array.isArray(detail.cpu) ? detail.cpu.join(', ') : detail.cpu)
    expect(result.primaryCamera).toBe(detail.primaryCamera.join(', '))
    expect(result.secondaryCmera).toBe(Array.isArray(detail.secondaryCmera) ? detail.secondaryCmera.join(', ') : detail.secondaryCmera)
    expect(result.displaySize).toBe(detail.displaySize)
    expect(result.displayResolution).toBe(detail.displayResolution)
    expect(result.dimentions).toBe(detail.dimentions === '-' ? null : detail.dimentions)
    expect(result.options).toEqual(detail.options)
  })

  it('accepts an empty list as a successful response', async () => {
    respond([])
    expect(await getProducts()).toEqual([])
    expect(await getProducts()).toEqual([])
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  // Deliberate robustness inputs below are not additional observed API contracts.
  it('preserves leading-zero string IDs and encodes route metacharacters as a single segment', async () => {
    const id = '0001/a ?#%'
    respond({ ...productDetails[0], id })
    expect((await getProduct(id)).id).toBe(id)
    expect(fetch.mock.calls[0][0]).toBe(`${listResource}/0001%2Fa%20%3F%23%25`)
  })

  it.each([undefined, null, 1, '', '   ', {}, [], '.', '..', '\uD800'])('rejects invalid input ID %j before requesting', async id => {
    await expect(getProduct(id)).rejects.toMatchObject({ type: 'invalid-argument' })
    expect(fetch).not.toHaveBeenCalled()
  })

  it.each([null, {}, { products: productList }, [null], [{ id: 1 }], [{ id: '' }], [{ id: '   ' }]])(
    'rejects malformed list structure %j without caching it', async data => {
      respond(data)
      await expect(getProducts()).rejects.toMatchObject({ type: 'invalid-response' })
      expect(localStorage.getItem(productCacheKey(listResource))).toBeNull()
      respond(productList)
      await getProducts()
      expect(fetch).toHaveBeenCalledTimes(2)
    },
  )

  it('rejects duplicate list IDs instead of collapsing records into one identity', async () => {
    respond([productList[0], productList[0]])
    await expect(getProducts()).rejects.toMatchObject({ type: 'invalid-response' })
  })

  it.each([null, [], {}, { id: 1 }, { id: '' }, { id: 'another-product' }])(
    'rejects malformed or mismatched detail %j without caching it', async data => {
      const id = productDetails[0].id
      respond(data)
      await expect(getProduct(id)).rejects.toMatchObject({ type: 'invalid-response' })
      expect(localStorage.getItem(productCacheKey(detailResource(id)))).toBeNull()
    },
  )

  it('handles all absent optional detail fields without inventing prices, specs or options', async () => {
    const { id } = productDetails[0]
    respond({ id })
    expect(await getProduct(id)).toEqual({
      id, brand: null, model: null, price: null, imgUrl: null, cpu: null, ram: null,
      os: null, displaySize: null, displayResolution: null, battery: null,
      primaryCamera: null, secondaryCmera: null, dimentions: null, weight: null,
      options: { colors: [], storages: [] },
    })
  })

  it.each(['', ' ', null, undefined, 0, false, {}, []])('does not coerce optional price %j to zero', async price => {
    respond([{ ...productList[0], price }])
    expect((await getProducts())[0].price).toBeNull()
  })

  it('preserves the valid text price "0"', async () => {
    respond([{ ...productList[0], price: '0' }])
    expect((await getProducts())[0].price).toBe('0')
  })

  it('handles inconsistent display/option fields and preserves only actual numeric option codes', async () => {
    const detail = {
      ...productDetails[0], brand: {}, model: false, imgUrl: [], ram: 4, battery: null,
      cpu: [1, 'not a string array'], primaryCamera: {}, secondaryCmera: [],
      options: {
        colors: [null, {}, { code: '1000', name: 'Black' }, { code: 1000, name: '' }, { code: 0, name: 'Zero code' }],
        storages: 'not an array',
      },
    }
    respond(detail)
    const result = await getProduct(detail.id)
    expect(result).toMatchObject({
      brand: null, model: null, imgUrl: null, ram: null, battery: null,
      cpu: null, primaryCamera: null, secondaryCmera: null,
      options: { colors: [{ code: 0, name: 'Zero code' }], storages: [] },
    })
  })
})

describe('one-hour product cache integrated with mocked fetch', () => {
  it('misses initially, timestamps successful receipt rather than request start, then avoids network on a fresh hit', async () => {
    fetch.mockImplementation(async () => {
      vi.setSystemTime(NOW + 5_000)
      return new Response(JSON.stringify(productList))
    })
    const result = await getProducts()
    const saved = JSON.parse(localStorage.getItem(productCacheKey(listResource)))
    expect(saved).toMatchObject({ version: PRODUCT_CACHE_VERSION, fetchedAt: NOW + 5_000, data: productList })
    fetch.mockRejectedValue(new Error('No network allowed for a fresh hit'))
    expect(await getProducts()).toEqual(result)
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it.each([
    { age: PRODUCT_CACHE_TTL - 1, requests: 1 },
    { age: PRODUCT_CACHE_TTL, requests: 2 },
    { age: PRODUCT_CACHE_TTL + 1, requests: 2 },
  ])('at age $age ms uses $requests request(s), without sliding expiry', async ({ age, requests }) => {
    respond(productList)
    await getProducts()
    vi.setSystemTime(NOW + 30 * 60 * 1000)
    await getProducts()
    expect(JSON.parse(localStorage.getItem(productCacheKey(listResource))).fetchedAt).toBe(NOW)
    vi.setSystemTime(NOW + age)
    await getProducts()
    expect(fetch).toHaveBeenCalledTimes(requests)
    expect(JSON.parse(localStorage.getItem(productCacheKey(listResource))).fetchedAt)
      .toBe(requests === 1 ? NOW : NOW + age)
  })

  it('keeps list and different detail IDs independent, and a summary never satisfies a detail read', async () => {
    const [first, second] = productDetails
    fetch.mockResolvedValueOnce(new Response(JSON.stringify(productList)))
      .mockResolvedValueOnce(new Response(JSON.stringify(first)))
      .mockResolvedValueOnce(new Response(JSON.stringify(second)))
    await getProducts()
    expect((await getProduct(first.id)).id).toBe(first.id)
    expect((await getProduct(second.id)).id).toBe(second.id)
    await getProducts()
    await getProduct(first.id)
    await getProduct(second.id)
    expect(fetch.mock.calls.map(([url]) => url)).toEqual([listResource, detailResource(first.id), detailResource(second.id)])
    expect(localStorage.length).toBe(3)
  })

  it('reuses a valid persisted entry through a new module/storage instance (reload)', async () => {
    respond(productList)
    const result = await getProducts()
    vi.resetModules()
    const reloaded = await import('./products.js')
    expect(await reloaded.getProducts()).toEqual(result)
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('does not let caller object mutations change cached data', async () => {
    respond(productDetails[0])
    const detail = await getProduct(productDetails[0].id)
    detail.options.colors[0].name = 'mutated'
    expect((await getProduct(detail.id)).options).toEqual(productDetails[0].options)
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it.each(['{malformed', 'null', '42', '[]', '"text"'])('recovers from unusable persisted JSON %s', async raw => {
    localStorage.setItem(productCacheKey(listResource), raw)
    respond(productList)
    expect(await getProducts()).toHaveLength(productList.length)
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(JSON.parse(localStorage.getItem(productCacheKey(listResource))).data).toEqual(productList)
  })

  it.each([undefined, null, '123', -1, 1.5, NOW + 1, NaN, Infinity])('invalid/future timestamp %s causes a fetch', async fetchedAt => {
    localStorage.setItem(productCacheKey(listResource), JSON.stringify({
      version: PRODUCT_CACHE_VERSION, fetchedAt, data: productList,
    }))
    respond(productList)
    await getProducts()
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it.each([undefined, 0, PRODUCT_CACHE_VERSION + 1, '1'])('revalidates entry version %s', async version => {
    localStorage.setItem(productCacheKey(listResource), JSON.stringify({ version, fetchedAt: NOW, data: productList }))
    respond(productList)
    await getProducts()
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('does not read an old-version key or another API base identity', async () => {
    localStorage.setItem(`itx:products:v0:${listResource}`, JSON.stringify({ version: 0, fetchedAt: NOW, data: productList }))
    localStorage.setItem(productCacheKey('https://other.invalid/api/product'), JSON.stringify({
      version: PRODUCT_CACHE_VERSION, fetchedAt: NOW, data: productList,
    }))
    respond(productList)
    await getProducts()
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('validates persisted payloads instead of trusting a fresh timestamp', async () => {
    localStorage.setItem(productCacheKey(listResource), JSON.stringify({
      version: PRODUCT_CACHE_VERSION, fetchedAt: NOW, data: [{ id: 123 }],
    }))
    respond(productList)
    await getProducts()
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('rejects a detail cached under a different ID even with a fresh timestamp', async () => {
    const [first, second] = productDetails
    localStorage.setItem(productCacheKey(detailResource(first.id)), JSON.stringify({
      version: PRODUCT_CACHE_VERSION, fetchedAt: NOW, data: second,
    }))
    respond(first)
    expect((await getProduct(first.id)).id).toBe(first.id)
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it.each(['getter', 'getItem', 'setItem', 'removeItem'])('falls back to memory when storage fails at %s', async failure => {
    const key = productCacheKey(listResource)
    if (failure === 'removeItem') localStorage.setItem(key, '{broken')
    if (failure === 'getter') {
      vi.spyOn(globalThis, 'localStorage', 'get').mockImplementation(() => { throw new DOMException('Denied', 'SecurityError') })
    } else {
      vi.spyOn(Storage.prototype, failure).mockImplementation(() => { throw new DOMException('Denied or full', 'QuotaExceededError') })
    }
    respond(productList)
    const result = await getProducts()
    expect(await getProducts()).toEqual(result)
    expect(fetch).toHaveBeenCalledTimes(1)
    vi.setSystemTime(NOW + PRODUCT_CACHE_TTL)
    await getProducts()
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('also works when browser storage is absent', async () => {
    vi.stubGlobal('localStorage', undefined)
    respond(productList)
    await getProducts()
    await getProducts()
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it.each(['http', 'network', 'invalid-json', 'invalid-response'])('failed %s revalidation never returns stale data or renews its timestamp', async type => {
    respond(productList)
    await getProducts()
    vi.setSystemTime(NOW + PRODUCT_CACHE_TTL)
    if (type === 'http') fetch.mockResolvedValue(new Response('error', { status: 500 }))
    if (type === 'network') fetch.mockRejectedValue(new TypeError('Offline'))
    if (type === 'invalid-json') fetch.mockResolvedValue(new Response('not JSON'))
    if (type === 'invalid-response') respond({ wrong: 'shape' })
    await expect(getProducts()).rejects.toMatchObject({ type })
    expect(localStorage.getItem(productCacheKey(listResource))).toBeNull()
    respond(productList)
    await getProducts()
    expect(fetch).toHaveBeenCalledTimes(3)
    expect(JSON.parse(localStorage.getItem(productCacheKey(listResource))).fetchedAt).toBe(NOW + PRODUCT_CACHE_TTL)
  })

  it('rejects an already-aborted read even when its entry is fresh, without removing the entry', async () => {
    respond(productList)
    await getProducts()
    const controller = new AbortController()
    controller.abort()
    await expect(getProducts({ signal: controller.signal })).rejects.toMatchObject({ type: 'aborted' })
    await getProducts()
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('does not cache a late result after a pending read was aborted; the next read fetches again', async () => {
    const controller = new AbortController()
    let deliverResponse
    fetch.mockImplementationOnce(() => new Promise(resolve => { deliverResponse = resolve }))
    const pending = getProducts({ signal: controller.signal })
    controller.abort('route changed')
    deliverResponse(new Response(JSON.stringify(productList)))
    await expect(pending).rejects.toMatchObject({ type: 'aborted' })
    expect(localStorage.getItem(productCacheKey(listResource))).toBeNull()
    respond(productList)
    await getProducts()
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('does not cache a detail aborted during body parsing', async () => {
    const controller = new AbortController()
    fetch.mockResolvedValue({ ok: true, status: 200, json: async () => {
      controller.abort()
      return productDetails[0]
    } })
    await expect(getProduct(productDetails[0].id, { signal: controller.signal })).rejects.toMatchObject({ type: 'aborted' })
    expect(localStorage.length).toBe(0)
  })

  it('does not revive an expired entry when its revalidation is aborted', async () => {
    respond(productList)
    await getProducts()
    vi.setSystemTime(NOW + PRODUCT_CACHE_TTL)
    const controller = new AbortController()
    fetch.mockImplementation(async () => {
      controller.abort()
      throw controller.signal.reason
    })
    await expect(getProducts({ signal: controller.signal })).rejects.toMatchObject({ type: 'aborted' })
    expect(localStorage.getItem(productCacheKey(listResource))).toBeNull()
    respond(productList)
    await getProducts()
    expect(fetch).toHaveBeenCalledTimes(3)
  })

  it('expires/revalidates products without touching any independent cart-count key', async () => {
    const cartKey = 'test-only:independent-cart-count'
    localStorage.setItem(cartKey, '7')
    respond(productList)
    await getProducts()
    vi.setSystemTime(NOW + PRODUCT_CACHE_TTL)
    await getProducts()
    expect(localStorage.getItem(cartKey)).toBe('7')
    expect(fetch.mock.calls.every(([url, options]) => url === listResource && options.method === 'GET')).toBe(true)
  })
})
