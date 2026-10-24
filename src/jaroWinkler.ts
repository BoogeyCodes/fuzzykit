/**
 * Jaro and Jaro–Winkler similarity. Jaro counts matching characters (within a sliding window) and
 * transpositions; Jaro–Winkler then boosts the score for strings that share a common prefix, which
 * makes it well suited to short strings like names.
 */

export function jaro(a: string, b: string): number {
  if (a === b) return 1
  if (a.length === 0 || b.length === 0) return 0

  const matchWindow = Math.max(0, Math.floor(Math.max(a.length, b.length) / 2) - 1)
  const aMatches = new Array<boolean>(a.length).fill(false)
  const bMatches = new Array<boolean>(b.length).fill(false)

  let matches = 0
  for (let i = 0; i < a.length; i++) {
    const start = Math.max(0, i - matchWindow)
    const end = Math.min(i + matchWindow + 1, b.length)
    for (let j = start; j < end; j++) {
      if (!bMatches[j] && a[i] === b[j]) {
        aMatches[i] = true
        bMatches[j] = true
        matches++
        break
      }
    }
  }

  if (matches === 0) return 0

  // Count transpositions: matched characters that appear in a different order.
  let transpositions = 0
  let k = 0
  for (let i = 0; i < a.length; i++) {
    if (!aMatches[i]) continue
    while (!bMatches[k]) k++
    if (a[i] !== b[k]) transpositions++
    k++
  }
  transpositions /= 2

  return (matches / a.length + matches / b.length + (matches - transpositions) / matches) / 3
}

/**
 * Jaro–Winkler similarity. `prefixScale` (default 0.1, max 0.25) controls how much a shared prefix
 * of up to four characters boosts the Jaro score.
 */
export function jaroWinkler(a: string, b: string, prefixScale = 0.1): number {
  const score = jaro(a, b)
  let prefix = 0
  const maxPrefix = Math.min(4, a.length, b.length)
  while (prefix < maxPrefix && a[prefix] === b[prefix]) prefix++
  return score + prefix * prefixScale * (1 - score)
}
