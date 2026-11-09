import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createStorage } from './storage.js'

beforeEach(() => localStorage.clear())

describe('guarded JSON storage and memory fallback', () => {
  it('persists JSON across instances without sharing mutable references', () => {
    const store = createStorage()
    const value = { data: [{ id: 'reference' }] }
    store.write('test:product', value)
    value.data[0].id = 'changed'
    const read = store.read('test:product')
    expect(read.data[0].id).toBe('reference')
    read.data[0].id = 'also changed'
    expect(createStorage().read('test:product').data[0].id).toBe('reference')
  })

  it('preserves the last known value in memory if access becomes denied after a successful read', () => {
    localStorage.setItem('test:product', '{"data":"confirmed"}')
    const store = createStorage()
    expect(store.read('test:product')).toEqual({ data: 'confirmed' })
    const getter = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('Denied') })
    expect(store.read('test:product')).toEqual({ data: 'confirmed' })
    store.write('test:product', { data: 'newer' })
    expect(store.read('test:product')).toEqual({ data: 'newer' })
    expect(getter).toHaveBeenCalledTimes(1)
  })

  it('uses the new memory value after a quota failure, instead of reading an older persisted value', () => {
    localStorage.setItem('test:product', '{"data":"old"}')
    const store = createStorage()
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Quota') })
    store.write('test:product', { data: 'new' })
    expect(store.read('test:product')).toEqual({ data: 'new' })
    // Fallback is deliberately volatile; a fresh instance can only see disk.
    expect(createStorage().read('test:product')).toEqual({ data: 'old' })
  })

  it('evicts malformed JSON and only removes the requested key', () => {
    localStorage.setItem('test:product', '{broken')
    localStorage.setItem('test:independent', '7')
    expect(createStorage().read('test:product')).toBeNull()
    expect(localStorage.getItem('test:product')).toBeNull()
    expect(localStorage.getItem('test:independent')).toBe('7')
  })

  it('removes a memory entry when persistent removal fails, without resurrecting it in this instance', () => {
    const store = createStorage()
    store.write('test:product', { data: 'confirmed' })
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => { throw new Error('Denied') })
    store.remove('test:product')
    expect(store.read('test:product')).toBeNull()
  })

  it('does not resurrect its memory mirror when the persistent key has been removed', () => {
    const store = createStorage()
    store.write('test:product', { data: 'confirmed' })
    localStorage.removeItem('test:product')
    expect(store.read('test:product')).toBeNull()
  })
})
