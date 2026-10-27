import { describe, expect, it } from 'vitest'
import { diceCoefficient } from '../src/dice.js'

describe('diceCoefficient', () => {
  it('is 1 for identical and 0 for disjoint strings', () => {
    expect(diceCoefficient('night', 'night')).toBe(1)
    expect(diceCoefficient('abc', 'xyz')).toBe(0)
  })

  it('matches the classic night/nacht example', () => {
    // bigrams(night) = {ni, ig, gh, ht}, bigrams(nacht) = {na, ac, ch, ht}; one shared (ht).
    expect(diceCoefficient('night', 'nacht')).toBeCloseTo(0.25, 5)
  })

  it('is forgiving of order and repetition', () => {
    expect(diceCoefficient('healed', 'sealed')).toBeGreaterThan(0.6)
    // Repeated bigrams are matched by multiplicity, not just presence.
    expect(diceCoefficient('aa', 'aaaa')).toBeCloseTo((2 * 1) / (1 + 3), 5)
  })

  it('returns 0 for strings shorter than a bigram', () => {
    expect(diceCoefficient('a', 'a')).toBe(1) // identical short-circuit
    expect(diceCoefficient('a', 'b')).toBe(0)
  })
})
