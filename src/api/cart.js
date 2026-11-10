import { ApiError, requestJson } from './client.js'

export async function addToCart({ id, colorCode, storageCode }) {
  if (typeof id !== 'string' || !id.trim() ||
      typeof colorCode !== 'number' || !Number.isFinite(colorCode) ||
      typeof storageCode !== 'number' || !Number.isFinite(storageCode)) {
    throw new ApiError('invalid-argument')
  }
  const data = await requestJson('/api/cart', {
    method: 'POST', body: { id, colorCode, storageCode },
  })
  if (!data || Array.isArray(data) || !Number.isSafeInteger(data.count) || data.count < 0) {
    throw new ApiError('invalid-response')
  }
  return { count: data.count }
}
