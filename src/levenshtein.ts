/**
 * Levenshtein edit distance: the minimum number of single-character insertions, deletions or
 * substitutions to turn one string into another. Computed with the standard dynamic-programming
 * recurrence, kept to two rows so memory is O(min(a, b)) rather than O(a × b).
 */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  // Iterate over the longer string outwards; keep the shorter one as the row.
  if (a.length < b.length) [a, b] = [b, a]

  let previous = Array.from({ length: b.length + 1 }, (_, i) => i)
  const current = new Array<number>(b.length + 1)

  for (let i = 1; i <= a.length; i++) {
    current[0] = i
    const ai = a.charCodeAt(i - 1)
    for (let j = 1; j <= b.length; j++) {
      const cost = ai === b.charCodeAt(j - 1) ? 0 : 1
      current[j] = Math.min(
        current[j - 1] + 1, // insertion
        previous[j] + 1, // deletion
        previous[j - 1] + cost, // substitution
      )
    }
    previous = current.slice()
  }

  return previous[b.length]
}

/** Edit distance mapped to a 0–1 similarity: 1 is identical, 0 is maximally different. */
export function levenshteinSimilarity(a: string, b: string): number {
  const longest = Math.max(a.length, b.length)
  if (longest === 0) return 1
  return 1 - levenshtein(a, b) / longest
}
