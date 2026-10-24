import { describe, expect, it } from 'vitest'
import { jaro, jaroWinkler } from '../src/jaroWinkler.js'

describe('jaro', () => {
  it('is 1 for identical and 0 for disjoint strings', () => {
    expect(jaro('abc', 'abc')).toBe(1)
    expect(jaro('abc', 'xyz')).toBe(0)
  })

  it('matches the canonical reference values', () => {
    expect(jaro('MARTHA', 'MARHTA')).toBeCloseTo(0.944, 3)
    expect(jaro('DIXON', 'DICKSONX')).toBeCloseTo(0.767, 3)
    expect(jaro('CRATE', 'TRACE')).toBeCloseTo(0.733, 3)
  })
})

describe('jaroWinkler', () => {
  it('boosts a shared prefix above plain Jaro', () => {
    expect(jaroWinkler('MARTHA', 'MARHTA')).toBeCloseTo(0.961, 3)
    expect(jaroWinkler('DWAYNE', 'DUANE')).toBeGreaterThan(jaro('DWAYNE', 'DUANE'))
  })

  it('equals Jaro when there is no shared prefix', () => {
    expect(jaroWinkler('abc', 'xbc')).toBeCloseTo(jaro('abc', 'xbc'), 10)
  })

  it('stays within 0 and 1', () => {
    const score = jaroWinkler('prefixmatch', 'prefixmatcx')
    expect(score).toBeGreaterThan(0)
    expect(score).toBeLessThanOrEqual(1)
  })
})
