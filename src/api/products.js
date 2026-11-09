import { API_BASE_URL, ApiError, assertNotAborted, requestJson } from './client.js'
import { createProductCache } from '../storage/productCache.js'

const cache = createProductCache()
const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value)
const hasId = value => isRecord(value) && typeof value.id === 'string' && value.id.trim() !== ''
const text = value => typeof value === 'string' && value.trim() !== '' && value.trim() !== '-'
  ? value : null
const description = value => Array.isArray(value)
  ? value.every(item => typeof item === 'string') ? text(value.filter(text).join(', ')) : null
  : text(value)

function normalizeProduct(product) {
  if (!hasId(product)) throw new ApiError('invalid-response')
  return {
    ...product,
    id: product.id,
    brand: text(product.brand),
    model: text(product.model),
    price: text(product.price),
    imgUrl: text(product.imgUrl),
  }
}

function validateList(data) {
  if (!Array.isArray(data)) throw new ApiError('invalid-response')
  const products = data.map(normalizeProduct)
  if (new Set(products.map(product => product.id)).size !== products.length) {
    throw new ApiError('invalid-response')
  }
  return products
}

function normalizeOptions(options) {
  if (!Array.isArray(options)) return []
  return options.filter(option => isRecord(option) &&
    typeof option.code === 'number' && Number.isFinite(option.code) && text(option.name))
    .map(({ code, name }) => ({ code, name }))
}

function validateDetail(data, id) {
  const product = normalizeProduct(data)
  if (product.id !== id) throw new ApiError('invalid-response')
  const result = { ...product }
  for (const field of ['ram', 'os', 'displaySize', 'displayResolution', 'battery', 'dimentions', 'weight']) {
    result[field] = text(product[field])
  }
  for (const field of ['cpu', 'primaryCamera', 'secondaryCmera']) {
    result[field] = description(product[field])
  }
  result.options = {
    colors: normalizeOptions(product.options?.colors),
    storages: normalizeOptions(product.options?.storages),
  }
  return result
}

async function readProduct(path, validate, signal) {
  assertNotAborted(signal)
  const resource = `${API_BASE_URL}${path}`
  const cached = cache.read(resource, validate)
  if (cached !== null) return cached
  const data = await requestJson(path, { signal })
  const fetchedAt = Date.now()
  const result = validate(data)
  assertNotAborted(signal)
  cache.write(resource, data, fetchedAt)
  return result
}

export function getProducts({ signal } = {}) {
  return readProduct('/api/product', validateList, signal)
}

export async function getProduct(id, { signal } = {}) {
  // Bare dot segments cannot identify a resource safely: URL parsing removes them.
  if (typeof id !== 'string' || id.trim() === '' || id === '.' || id === '..') {
    throw new ApiError('invalid-argument')
  }
  let encodedId
  try {
    encodedId = encodeURIComponent(id)
  } catch (cause) {
    throw new ApiError('invalid-argument', { cause })
  }
  return readProduct(`/api/product/${encodedId}`, data => validateDetail(data, id), signal)
}
