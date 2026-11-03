/**
 * Jaccard similarity over the SET of character bigrams: the size of the intersection divided by the
 * size of the union of distinct adjacent-letter pairs. Like Dice it is order-insensitive, but it
 * treats each bigram as present-or-absent rather than counting repeats, which makes it stricter about
 * shared structure and cheaper to reason about.
 */
export function jaccardSimilarity(a: string, b: string): number {
  if (a === b) return 1
  if (a.length < 2 || b.length < 2) return 0

  const setA = bigramSet(a)
  const setB = bigramSet(b)

  let intersection = 0
  for (const bigram of setA) {
    if (setB.has(bigram)) intersection++
  }
  const union = setA.size + setB.size - intersection
  return union === 0 ? 0 : intersection / union
}

function bigramSet(s: string): Set<string> {
  const out = new Set<string>()
  for (let i = 0; i < s.length - 1; i++) out.add(s.slice(i, i + 2))
  return out
}
