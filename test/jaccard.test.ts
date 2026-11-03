import { describe, expect, it } from 'vitest'
import { jaccardSimilarity } from '../src/jaccard.js'

describe('jaccardSimilarity', () => {
  it('is 1 for identical strings and 0 for no shared bigrams', () => {
    expect(jaccardSimilarity('night', 'night')).toBe(1)
    expect(jaccardSimilarity('abc', 'xyz')).toBe(0)
  })

  it('measures overlap of distinct bigram sets', () => {
    // "night" -> {ni,ig,gh,ht}; "nacht" -> {na,ac,ch,ht}; shared {ht} -> 1/7
    expect(jaccardSimilarity('night', 'nacht')).toBeCloseTo(1 / 7, 10)
  })

  it('returns 0 when either string is too short for a bigram', () => {
    expect(jaccardSimilarity('a', 'ab')).toBe(0)
  })

  it('is symmetric', () => {
    expect(jaccardSimilarity('kitten', 'sitting')).toBeCloseTo(jaccardSimilarity('sitting', 'kitten'), 12)
  })
})
