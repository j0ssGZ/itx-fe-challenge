import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'

beforeEach(() => {
  // No Vitest case may accidentally reach the real service, including future tests.
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Unexpected request: mock fetch first.')))
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})
