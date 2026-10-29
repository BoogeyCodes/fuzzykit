import { describe, expect, it } from 'vitest'
import { bestMatch, search } from '../src/search.js'

const FRUITS = ['apple', 'apricot', 'banana', 'blackberry', 'blueberry', 'grape', 'grapefruit']

describe('search', () => {
  it('ranks a typo close to the intended word', () => {
    const results = search('aple', FRUITS)
    expect(results[0].item).toBe('apple')
  })

  it('treats a substring match as a perfect score', () => {
    const results = search('berry', FRUITS, { threshold: 0.1 })
    const top = results.filter((r) => r.score === 1).map((r) => r.item)
    expect(top).toContain('blackberry')
    expect(top).toContain('blueberry')
  })

  it('respects the threshold and limit', () => {
    const results = search('grp', FRUITS, { threshold: 0.4, limit: 2 })
    expect(results.length).toBeLessThanOrEqual(2)
    expect(results.every((r) => r.score >= 0.4)).toBe(true)
  })

  it('searches objects by a key', () => {
    const users = [
      { id: 1, name: 'Alice Johnson' },
      { id: 2, name: 'Bob Smith' },
      { id: 3, name: 'Alicia Jones' },
    ]
    const results = search('alice', users, { key: (u) => u.name })
    expect(results[0].item.name).toBe('Alice Johnson')
  })

  it('is case-insensitive by default', () => {
    expect(search('APPLE', FRUITS)[0].item).toBe('apple')
  })

  it('can rank by a chosen algorithm', () => {
    const byDice = search('aplpe', FRUITS, { algorithm: 'dice' })
    expect(byDice[0].item).toBe('apple')
    const byLev = search('aplpe', FRUITS, { algorithm: 'levenshtein' })
    expect(byLev[0].item).toBe('apple')
  })

  it('returns an empty array when nothing clears the threshold', () => {
    expect(search('zzzzzz', FRUITS, { threshold: 0.6 })).toEqual([])
  })
})

describe('bestMatch', () => {
  it('returns the single closest match or null', () => {
    expect(bestMatch('bananna', FRUITS)?.item).toBe('banana')
    expect(bestMatch('zzzzzz', FRUITS, { threshold: 0.6 })).toBeNull()
  })
})
