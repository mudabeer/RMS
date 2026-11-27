import { describe, expect, it } from 'vitest'

const { isValidOAuthState } = require('../oauth-helper')

describe('OAuth helper state validation', () => {
  it('accepts a matching state', () => {
    expect(isValidOAuthState('expected-state', 'expected-state')).toBe(true)
  })

  it('rejects a mismatched state', () => {
    expect(isValidOAuthState('other-state', 'expected-state')).toBe(false)
  })

  it('rejects missing or empty state values', () => {
    expect(isValidOAuthState(null, 'expected-state')).toBe(false)
    expect(isValidOAuthState(undefined, 'expected-state')).toBe(false)
    expect(isValidOAuthState('', 'expected-state')).toBe(false)
  })
})
