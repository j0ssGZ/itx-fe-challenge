import { createStorage } from './storage.js'

export const PRODUCT_CACHE_VERSION = 1
export const PRODUCT_CACHE_TTL = 3_600_000

export function productCacheKey(resource) {
  return `itx:products:v${PRODUCT_CACHE_VERSION}:${resource}`
}

export function createProductCache({ storage = createStorage() } = {}) {
  return {
    read(resource, validate) {
      const key = productCacheKey(resource)
      const entry = storage.read(key)
      if (entry === null) return null
      const now = Date.now()
      if (entry.version === PRODUCT_CACHE_VERSION &&
          Number.isSafeInteger(entry.fetchedAt) && entry.fetchedAt >= 0 &&
          entry.fetchedAt <= now && now - entry.fetchedAt < PRODUCT_CACHE_TTL) {
        try {
          return validate(entry.data)
        } catch {
          // Stored data is untrusted too; invalid data must be fetched again.
        }
      }
      storage.remove(key)
      return null
    },
    write(resource, data, fetchedAt) {
      storage.write(productCacheKey(resource), { version: PRODUCT_CACHE_VERSION, fetchedAt, data })
    },
  }
}
