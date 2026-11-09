export const API_BASE_URL = 'https://itx-frontend-test.onrender.com'

const messages = {
  http: 'No se pudieron obtener los datos del servicio.',
  network: 'No se pudo conectar con el servicio.',
  'invalid-json': 'El servicio devolvió una respuesta JSON no válida.',
  'invalid-response': 'El servicio devolvió datos de producto no válidos.',
  'invalid-argument': 'La referencia del producto no es válida.',
  aborted: 'La solicitud se ha cancelado.',
}

export class ApiError extends Error {
  constructor(type, { status = null, cause } = {}) {
    super(messages[type], { cause })
    this.name = 'ApiError'
    this.type = type
    this.status = status
  }
}

export function assertNotAborted(signal) {
  if (signal?.aborted) throw new ApiError('aborted', { cause: signal.reason })
}

// Read-only boundary for M03. No retries, credentials or server error text.
export async function requestJson(path, { signal } = {}) {
  assertNotAborted(signal)
  const url = new URL(path.replace(/^\/+/, ''), `${API_BASE_URL}/`)
  let response
  try {
    response = await fetch(url.href, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      credentials: 'omit',
      signal,
    })
  } catch (cause) {
    const type = signal?.aborted || cause?.name === 'AbortError' ? 'aborted' : 'network'
    throw new ApiError(type, { cause })
  }
  assertNotAborted(signal)
  if (!response.ok) throw new ApiError('http', { status: response.status })

  let data
  try {
    data = await response.json()
  } catch (cause) {
    const type = signal?.aborted || cause?.name === 'AbortError'
      ? 'aborted'
      : cause?.name === 'SyntaxError' ? 'invalid-json' : 'network'
    throw new ApiError(type, { status: response.status, cause })
  }
  assertNotAborted(signal)
  return data
}
