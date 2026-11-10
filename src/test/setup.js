import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'

// jsdom has no dialog top layer. Only emulate its imperative API here;
// native focus trapping, inertness, Escape and scrolling are verified in Chromium.
Object.defineProperties(HTMLDialogElement.prototype, {
  showModal: { configurable: true, value() {
    this.setAttribute('open', '')
    this.querySelector('button')?.focus()
  } },
  close: { configurable: true, value() { this.removeAttribute('open') } },
})

beforeEach(() => {
  // No Vitest case may accidentally reach the real service, including future tests.
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Unexpected request: mock fetch first.')))
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})
