import { diceCoefficient } from './dice.js'
import { jaroWinkler } from './jaroWinkler.js'
import { levenshteinSimilarity } from './levenshtein.js'

export type Algorithm = 'jaro-winkler' | 'dice' | 'levenshtein'

const ALGORITHMS: Record<Algorithm, (a: string, b: string) => number> = {
  'jaro-winkler': jaroWinkler,
  dice: diceCoefficient,
  levenshtein: levenshteinSimilarity,
}

export interface SearchOptions<T> {
  /** For objects, which field to match against. Omit when searching an array of strings. */
  key?: (item: T) => string
  /** Which similarity measure to rank by. Default: jaro-winkler. */
  algorithm?: Algorithm
  /** Drop results scoring below this (0–1). Default: 0.3. */
  threshold?: number
  /** Return at most this many results. Default: all above the threshold. */
  limit?: number
  /** Lower-case both sides before comparing. Default: true. */
  caseInsensitive?: boolean
}

export interface SearchResult<T> {
  item: T
  score: number
}

/**
 * Rank `items` by fuzzy similarity to `query`, best first. A case-insensitive substring match is
 * treated as a perfect score, so exact and prefix matches always sort above approximate ones.
 */
export function search<T>(query: string, items: readonly T[], options: SearchOptions<T> = {}): Array<SearchResult<T>> {
  const { key, algorithm = 'jaro-winkler', threshold = 0.3, limit, caseInsensitive = true } = options
  const score = ALGORITHMS[algorithm]
  const normalise = (s: string) => (caseInsensitive ? s.toLowerCase() : s)
  const q = normalise(query)

  const results: Array<SearchResult<T>> = []
  for (const item of items) {
    const text = normalise(key ? key(item) : (item as unknown as string))
    const value = text.includes(q) && q.length > 0 ? 1 : score(q, text)
    if (value >= threshold) {
      results.push({ item, score: value })
    }
  }

  results.sort((a, b) => b.score - a.score)
  return limit === undefined ? results : results.slice(0, limit)
}

/** The closest single match to `query`, or null if nothing clears the threshold. */
export function bestMatch<T>(query: string, items: readonly T[], options: SearchOptions<T> = {}): SearchResult<T> | null {
  return search(query, items, { ...options, limit: 1 })[0] ?? null
}
