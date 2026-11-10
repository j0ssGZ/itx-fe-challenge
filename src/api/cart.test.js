import { describe, expect, it } from 'vitest'
import { addToCart } from './cart.js'
import { productDetails } from '../test/fixtures.js'

const product = productDetails[0]
const payload = { id: product.id, colorCode: product.options.colors[0].code, storageCode: product.options.storages[0].code }

describe('cart POST boundary', () => {
  it.each([0, 1, 7])('returns confirmed count %i and sends exactly the real string/numeric payload', async count => {
    fetch.mockResolvedValue(new Response(JSON.stringify({ count })))
    expect(await addToCart({ ...payload, quantity: 9 })).toEqual({ count })
    expect(fetch).toHaveBeenCalledExactlyOnceWith('https://itx-frontend-test.onrender.com/api/cart', {
      method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(payload), credentials: 'omit', signal: undefined,
    })
  })

  it('preserves a leading-zero ID and numeric zero codes without coercion', async () => {
    fetch.mockResolvedValue(new Response('{"count":1}'))
    await addToCart({ id: '0001', colorCode: 0, storageCode: 0 })
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ id: '0001', colorCode: 0, storageCode: 0 })
  })

  it.each([{ id: 1 }, { id: ' ' }, { colorCode: '1000' }, { storageCode: '2000' }, { colorCode: null }, { storageCode: NaN }, { colorCode: Infinity }])(
    'rejects invalid input %j before fetch', async variation => {
      await expect(addToCart({ ...payload, ...variation })).rejects.toMatchObject({ type: 'invalid-argument' })
      expect(fetch).not.toHaveBeenCalled()
    },
  )

  it.each([null, [], {}, { count: '1' }, { count: -1 }, { count: 1.5 }, { count: null }, { count: Number.MAX_SAFE_INTEGER + 1 }])(
    'rejects malformed count response %j', async data => {
      fetch.mockResolvedValue(new Response(JSON.stringify(data)))
      await expect(addToCart(payload)).rejects.toMatchObject({ type: 'invalid-response' })
      expect(fetch).toHaveBeenCalledTimes(1)
    },
  )

  it.each([400, 500, 503])('normalizes HTTP %i without retry', async status => {
    fetch.mockResolvedValue(new Response('private error', { status }))
    await expect(addToCart(payload)).rejects.toMatchObject({ type: 'http', status })
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('normalizes malformed JSON without retry', async () => {
    fetch.mockResolvedValue(new Response('invalid json'))
    await expect(addToCart(payload)).rejects.toMatchObject({ type: 'invalid-json' })
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('normalizes an uncertain network failure without replay', async () => {
    fetch.mockRejectedValue(new TypeError('connection lost'))
    await expect(addToCart(payload)).rejects.toMatchObject({ type: 'network' })
    expect(fetch).toHaveBeenCalledTimes(1)
  })
})
