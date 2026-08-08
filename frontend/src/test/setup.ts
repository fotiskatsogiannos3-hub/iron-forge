import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { server, resetFakeDb } from './mockServer'

// jsdom doesn't implement matchMedia or scrollIntoView, and a couple of our
// components/libraries touch these indirectly.
if (!window.matchMedia) {
  window.matchMedia = () =>
    ({
      matches: false,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
    }) as unknown as MediaQueryList
}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  resetFakeDb()
  localStorage.clear()
})
afterAll(() => server.close())
