import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CART_COUNT_KEY, createCartCountStorage } from './cartCount.js'
import { createStorage } from './storage.js'
import { createProductCache } from './productCache.js'

beforeEach(() => localStorage.clear())

describe('independent confirmed cart count storage', () => {
  it('defaults to zero without writing a fabricated confirmation', () => {
    expect(createCartCountStorage().read()).toBe(0)
    expect(localStorage.getItem(CART_COUNT_KEY)).toBeNull()
  })

  it('persists/restores exact counts without timestamps, TTL or local increments', () => {
    const store = createCartCountStorage()
    for (const count of [8, 1, 1, 0]) {
      expect(store.write(count)).toBe(true)
      expect(createCartCountStorage().read()).toBe(count)
      expect(JSON.parse(localStorage.getItem(CART_COUNT_KEY))).toEqual({ version: 1, count })
    }
  })

  it.each(['{', 'null', '[]', '4', '{"version":2,"count":8}', '{"version":1,"count":-1}', '{"version":1,"count":"8"}', '{"version":1,"count":1.5}'])(
    'safely discards corrupted/incompatible data %s', raw => {
      localStorage.setItem(CART_COUNT_KEY, raw)
      expect(createCartCountStorage().read()).toBe(0)
      expect(localStorage.getItem(CART_COUNT_KEY)).toBeNull()
    },
  )

  it.each([-1, 1.5, '1', NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, null])('rejects invalid confirmation %s preserving the last value', count => {
    const store = createCartCountStorage()
    store.write(6)
    expect(store.write(count)).toBe(false)
    expect(store.read()).toBe(6)
  })

  it('keeps confirmations in memory when access is denied without promising reload persistence', () => {
    const getStorage = () => { throw new Error('denied') }
    const store = createCartCountStorage(createStorage({ getStorage }))
    expect(store.read()).toBe(0)
    store.write(5)
    expect(store.read()).toBe(5)
    expect(createCartCountStorage(createStorage({ getStorage })).read()).toBe(0)
  })

  it('retains a new value after a write/quota failure rather than restoring old persisted data', () => {
    localStorage.setItem(CART_COUNT_KEY, '{"version":1,"count":2}')
    const store = createCartCountStorage()
    expect(store.read()).toBe(2)
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota') })
    expect(store.write(9)).toBe(true)
    expect(store.read()).toBe(9)
    expect(createCartCountStorage().read()).toBe(2)
  })

  it('product expiry/eviction cannot remove a confirmed count', () => {
    vi.useFakeTimers()
    try {
      vi.setSystemTime(1000)
      const store = createCartCountStorage()
      store.write(7)
      const cache = createProductCache()
      const url = 'https://itx-frontend-test.onrender.com/api/product'
      cache.write(url, [], Date.now())
      vi.advanceTimersByTime(3_600_000)
      expect(cache.read(url, data => data)).toBeNull()
      expect(createCartCountStorage().read()).toBe(7)
    } finally { vi.useRealTimers() }
  })
})
