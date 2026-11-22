import { describe, expect, it } from 'vitest'
import { buildViewModel, highlightIndices, toSegments } from '../web/model.js'
import { DATASET } from '../web/data.js'

const DEFAULTS = {
  algorithm: 'jaro-winkler' as const,
  threshold: 0.3,
  limit: 25,
  caseInsensitive: true,
}

describe('highlightIndices', () => {
  it('returns the indices of a contiguous match', () => {
    expect(highlightIndices('type', 'TypeScript')).toEqual([0, 1, 2, 3])
  })

  it('returns scattered indices for a subsequence, skipping gaps', () => {
    // t-p-e-s-c-r-i-p-t is a subsequence of TypeScript, with the 'y' at index 1 skipped.
    expect(highlightIndices('tpescript', 'TypeScript')).toEqual([0, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('is case-insensitive in both directions', () => {
    expect(highlightIndices('REACT', 'react')).toEqual([0, 1, 2, 3, 4])
    expect(highlightIndices('react', 'REACT')).toEqual([0, 1, 2, 3, 4])
  })

  it('returns an empty array when the query is not a subsequence', () => {
    expect(highlightIndices('xyz', 'TypeScript')).toEqual([])
    expect(highlightIndices('tfirst', 'TypeScript')).toEqual([]) // chars present but wrong order
  })

  it('is greedy: it takes the earliest possible position for each character', () => {
    // Earliest 'a' is index 1, earliest following 'a' is index 3.
    expect(highlightIndices('aa', 'banana')).toEqual([1, 3])
  })

  it('returns an empty array for an empty query or empty target', () => {
    expect(highlightIndices('', 'TypeScript')).toEqual([])
    expect(highlightIndices('type', '')).toEqual([])
  })
})

describe('toSegments', () => {
  it('returns a single unmatched segment when there is no highlight', () => {
    expect(toSegments('React', [])).toEqual([{ text: 'React', matched: false }])
  })

  it('splits into alternating matched / unmatched runs', () => {
    expect(toSegments('TypeScript', [0, 2, 3])).toEqual([
      { text: 'T', matched: true },
      { text: 'y', matched: false },
      { text: 'pe', matched: true },
      { text: 'Script', matched: false },
    ])
  })

  it('reconstructs the original text exactly', () => {
    const text = 'PostgreSQL'
    const indices = highlightIndices('postgres', text)
    const joined = toSegments(text, indices)
      .map((segment) => segment.text)
      .join('')
    expect(joined).toBe(text)
  })

  it('returns an empty array for empty text', () => {
    expect(toSegments('', [])).toEqual([])
  })
})

describe('buildViewModel', () => {
  it('previews a capped slice of the dataset for an empty query', () => {
    const model = buildViewModel('   ', DATASET, { ...DEFAULTS, limit: 10 })
    expect(model.preview).toBe(true)
    expect(model.query).toBe('')
    expect(model.rows).toHaveLength(10)
    expect(model.total).toBe(DATASET.length)
    expect(model.rows.every((row) => row.highlight.length === 0 && row.percent === 0)).toBe(true)
  })

  it('ranks matches best-first and maps score to a percentage', () => {
    const model = buildViewModel('tpescript', DATASET, DEFAULTS)
    expect(model.preview).toBe(false)
    expect(model.rows.length).toBeGreaterThan(0)
    expect(model.rows[0].text).toBe('TypeScript')
    expect(model.rows[0].percent).toBe(Math.round(model.rows[0].score * 100))
    // Scores are sorted descending.
    for (let i = 1; i < model.rows.length; i++) {
      expect(model.rows[i - 1].score).toBeGreaterThanOrEqual(model.rows[i].score)
    }
  })

  it('attaches subsequence highlight indices to each row', () => {
    const model = buildViewModel('type', DATASET, DEFAULTS)
    const row = model.rows.find((r) => r.text === 'TypeScript')
    expect(row).toBeDefined()
    expect(row?.highlight).toEqual([0, 1, 2, 3])
  })

  it('honours the limit', () => {
    const model = buildViewModel('a', DATASET, { ...DEFAULTS, threshold: 0, limit: 5 })
    expect(model.rows.length).toBeLessThanOrEqual(5)
  })

  it('treats a case-insensitive substring as a perfect score', () => {
    const model = buildViewModel('react', DATASET, DEFAULTS)
    expect(model.rows[0].text).toBe('React')
    expect(model.rows[0].score).toBe(1)
    expect(model.rows[0].percent).toBe(100)
  })

  it('drops everything below a high threshold', () => {
    const model = buildViewModel('zzqqxx', DATASET, { ...DEFAULTS, threshold: 0.95 })
    expect(model.rows).toHaveLength(0)
  })
})
