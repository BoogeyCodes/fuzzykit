import { describe, expect, it } from 'vitest'
import { levenshtein, levenshteinSimilarity } from '../src/levenshtein.js'

describe('levenshtein', () => {
  it('is 0 for identical strings', () => {
    expect(levenshtein('kitten', 'kitten')).toBe(0)
  })

  it('counts single edits', () => {
    expect(levenshtein('kitten', 'sitten')).toBe(1) // substitution
    expect(levenshtein('kitten', 'kittens')).toBe(1) // insertion
    expect(levenshtein('kitten', 'kiten')).toBe(1) // deletion
  })

  it('matches the classic example', () => {
    expect(levenshtein('kitten', 'sitting')).toBe(3)
    expect(levenshtein('flaw', 'lawn')).toBe(2)
  })

  it('handles empty strings', () => {
    expect(levenshtein('', '')).toBe(0)
    expect(levenshtein('abc', '')).toBe(3)
    expect(levenshtein('', 'abc')).toBe(3)
  })

  it('is symmetric', () => {
    expect(levenshtein('abcdef', 'azced')).toBe(levenshtein('azced', 'abcdef'))
  })

  it('maps to a 0-1 similarity', () => {
    expect(levenshteinSimilarity('abc', 'abc')).toBe(1)
    expect(levenshteinSimilarity('abc', 'xyz')).toBe(0)
    expect(levenshteinSimilarity('', '')).toBe(1)
    expect(levenshteinSimilarity('kitten', 'sitting')).toBeCloseTo(1 - 3 / 7, 5)
  })
})
