import { createStorage } from './storage.js'

export const CART_COUNT_KEY = 'itx:cart-count:v1'

export function createCartCountStorage(storage = createStorage()) {
  const valid = count => Number.isSafeInteger(count) && count >= 0
  return {
    read() {
      const entry = storage.read(CART_COUNT_KEY)
      if (entry?.version === 1 && valid(entry.count)) return entry.count
      storage.remove(CART_COUNT_KEY)
      return 0
    },
    write(count) {
      if (!valid(count)) return false
      storage.write(CART_COUNT_KEY, { version: 1, count })
      return true
    },
  }
}
